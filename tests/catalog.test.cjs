'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { ROOT, loadMaster, validateAndEnrich, renderOutputs } = require('../scripts/catalog-data.cjs');
const { createCatalog, libraryUrl, productUrl } = require('../src/catalog-core.js');
/** @typedef {import('../src/catalog-types').CatalogSource} CatalogSource */
/** @typedef {import('../src/catalog-types').RuntimeCatalog} RuntimeCatalog */
/** @typedef {import('../src/catalog-types').LegacyGuide} LegacyGuide */
const masterPath = path.join(ROOT, 'content/products.json');
/** @returns {CatalogSource} */
const rawMaster = () => JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const data = loadMaster();
const library = createCatalog(data);
const ids = library.products.map(product => product.id);

test('All original guides retain their number, title, HTML URL and valid chapters', () => {
  /** @type {{id:string,number:string,title:string,htmlPath:string}[]} */
  const original = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/fixtures/legacy-links.json'), 'utf8'));
  assert.equal(original.length, 80);
  for (const guide of original) {
    const detail = library.getProductDetail(guide.number);
    assert.ok(detail);
    assert.equal(detail.product.title, guide.title);
    assert.equal(detail.product.htmlPath, guide.htmlPath);
    assert.ok(detail.product.chapters.length > 0);
  }
  assert.equal(library.products.length, data.products.filter(product => product.status === 'published').length);
  assert.equal(new Set(ids).size, ids.length);
});

test('050 remains a microphone in the Classic series and belongs to the correct fixed bundles', () => {
  const detail = library.getProductDetail('audio-050');
  assert.ok(detail);
  assert.equal(detail.product.category, 'microphone');
  assert.equal(detail.product.series, 'classic-studio-gear');
  assert.deepEqual(detail.product.bundleIds, ['classic-50-v4-ko', 'complete-80-v4-ko']);
  assert.deepEqual(data.bundles.map(bundle => bundle.productIds.length), [50, 10, 20, 80]);
  assert.equal(new Set(data.bundles.slice(0, 3).flatMap(bundle => bundle.productIds)).size, 80);
});

test('Existing search behavior and all requested metadata search fields are supported', () => {
  for (const query of ['LA-2A', 'la2a', 'LA 2A']) {
    assert.deepEqual(library.search({ query }).map(product => product.number), ['002', '052']);
  }
  assert.ok(library.search({ query: 'Neve' }).some(product => product.number === '008'));
  assert.ok(library.search({ query: 'Chandler Limited' }).some(product => product.number === '018'));
  assert.equal(library.search({ query: 'microphone' }).length, library.counts.microphone);
  assert.ok(library.search({ query: 'Tube Condenser' }).some(product => product.number === '061'));
  assert.ok(library.search({ query: '진공관' }).some(product => product.number === '061'));
  assert.ok(library.search({ query: '니브 프리앰프' }).some(product => product.number === '008'));
  assert.ok(library.search({ query: 'Neumann 보컬 진공관' }).some(product => product.number === '050'));
  assert.equal(library.search({ query: '존재하지않는상품xyz' }).length, 0);
});

test('All/category filters and brand/equipment facets use the same products', () => {
  assert.deepEqual(library.search().map(product => product.id), ids);
  for (const category of data.categories) {
    assert.equal(library.search({ category: category.id }).length, library.counts[category.id]);
  }
  assert.ok(library.facets.brands.includes('Neve'));
  assert.ok(library.search({ brand: 'Neve', equipmentType: 'Preamp / EQ' }).every(product => product.brand === 'Neve' && product.equipmentType === 'Preamp / EQ'));
  assert.equal(library.getProductDetail('unknown-product'), null);
  const product = library.products[0];
  assert.equal(library.getProductDetail(product.slug)?.product.id, product.id);
});

test('Generated legacy adapter preserves all existing reader IDs and chapter configs', () => {
  /** @type {{window:{BLUEGEE_LIBRARY?:RuntimeCatalog,BLUEGEE_CATALOG?:LegacyGuide[]}}} */
  const sandbox = { window: {} };
  vm.runInNewContext(renderOutputs(data).get('catalog.js') ?? '', sandbox);
  assert.equal(sandbox.window.BLUEGEE_CATALOG?.length, data.products.filter(product => product.status === 'published' && product.htmlPath).length);
  for (const product of library.products) {
    if (!product.htmlPath) { continue; }
    /** @type {LegacyGuide | undefined} */
    const legacy = sandbox.window.BLUEGEE_CATALOG?.find(item => item.id === product.number);
    assert.equal(legacy?.url, product.htmlPath);
    assert.equal(legacy?.chapters.length, product.chapterCount);
  }
});

test('Invalid master changes fail before a build can alter outputs', () => {
  const badId = rawMaster(); badId.products[1].id = badId.products[0].id;
  assert.throws(() => validateAndEnrich(badId), /Duplicate product id/u);
  const broken = rawMaster(); broken.products[0].htmlPath = 'guides/not-present.html';
  assert.throws(() => validateAndEnrich(broken), /Missing asset/u);
  const invalidCategory = rawMaster(); invalidCategory.products[0].category = 'not-registered';
  assert.throws(() => validateAndEnrich(invalidCategory), /unknown category/u);
  const orphan = rawMaster(); orphan.products[0].relatedIds = ['audio-999'];
  assert.throws(() => validateAndEnrich(orphan), /relatedIds/u);
  const missingBundle = rawMaster(); missingBundle.products[0].bundleIds = [];
  assert.throws(() => validateAndEnrich(missingBundle), /membership mismatch/u);
  const missingPdf = rawMaster(); missingPdf.products[0].pdfPath = 'files/not-present.pdf';
  assert.throws(() => validateAndEnrich(missingPdf), /Missing asset/u);
  const escaped = rawMaster(); escaped.products[0].htmlPath = '../outside.html';
  assert.throws(() => validateAndEnrich(escaped), /escapes dist/u);
  const invalidDate = rawMaster(); invalidDate.products[0].createdAt = '2026-02-30';
  assert.throws(() => validateAndEnrich(invalidDate), /invalid calendar date/u);
});

test('One temporary next product automatically appears in list/search/filter/detail/count outputs, then is removed', () => {
  const beforeHash = crypto.createHash('sha256').update(fs.readFileSync(masterPath)).digest('hex');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'bluegee-catalog-test-'));
  try {
    const fixtureDist = path.join(temporary, 'dist');
    fs.cpSync(path.join(ROOT, 'dist'), fixtureDist, { recursive: true });
    const source = rawMaster();
    const number = String(Math.max(...source.products.map(product => Number(product.number))) + 1).padStart(3, '0');
    const htmlPath = `guides/outboard/${number}-temporary-test.html`;
    fs.writeFileSync(path.join(fixtureDist, htmlPath), '<!doctype html><html lang="ko"><title>Temporary test guide</title><body>Temporary test fixture only.</body></html>');
    source.products.push({
      id: `audio-${number}`, number, slug: `${number}-temporary-test`, title: 'Temporary test guide',
      brand: null, series: null, category: 'outboard', subcategory: null, equipmentType: null,
      description: 'Temporary test fixture only.', keywords: ['신규등록검증'], htmlPath,
      pdfPath: null, coverImage: null, status: 'published', featured: false,
      relatedIds: [], bundleIds: [], createdAt: null, updatedAt: null, keywordSources: [],
    });
    const fixtureData = validateAndEnrich(source, fixtureDist);
    const fixtureLibrary = createCatalog(fixtureData);
    assert.equal(fixtureLibrary.products.length, library.products.length + 1);
    assert.equal(fixtureLibrary.counts.outboard, library.counts.outboard + 1);
    assert.equal(fixtureLibrary.search({ query: '신규등록검증' })[0].number, number);
    assert.equal(fixtureLibrary.getProductDetail(`${number}-temporary-test`)?.product.htmlPath, htmlPath);
    assert.equal(fixtureLibrary.getProductDetail(`audio-${number}`)?.previousProduct?.number, library.products.at(-1)?.number);
    assert.equal(fixtureLibrary.getProductDetail(`audio-${number}`)?.nextProduct, null);
    assert.ok(renderOutputs(fixtureData).get('product.html')?.includes('id="product-view"'));
    assert.ok(renderOutputs(fixtureData).get('index.html')?.includes(`>${fixtureLibrary.products.length}</b>`));
    assert.equal(fixtureLibrary.getProductDetail('audio-050')?.product.bundleIds.includes('microphone-20-v4-ko'), false);
  } finally {
    const resolved = path.resolve(temporary);
    assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('bluegee-catalog-test-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  }
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(masterPath)).digest('hex'), beforeHash);
});

test('All published detail pages use real source topics, related IDs and ordered navigation without wrapping', () => {
  for (let index = 0; index < library.products.length; index++) {
    const product = library.products[index];
    const detail = library.getProductDetail(product.id);
    assert.ok(detail);
    assert.equal(detail.previousProduct?.id ?? null, library.products[index - 1]?.id ?? null);
    assert.equal(detail.nextProduct?.id ?? null, library.products[index + 1]?.id ?? null);
    assert.deepEqual(detail.relatedProducts.map(item => item.id), product.relatedIds);
    assert.ok(detail.highlights.every(title => product.chapters.some(chapter => chapter.title === title)));
    assert.ok(detail.whyItMatters.includes(product.title));
  }
  const future = rawMaster();
  future.products[0].highlights = ['검수한 소개 문장'];
  future.products[0].whyItMatters = '검수한 활용 이유';
  const detail = createCatalog(validateAndEnrich(future)).getProductDetail('001');
  assert.deepEqual(detail?.highlights, ['검수한 소개 문장']);
  assert.equal(detail?.whyItMatters, '검수한 활용 이유');
  assert.doesNotThrow(() => validateAndEnrich(future));
  const invalid = rawMaster();
  // @ts-expect-error Deliberately invalid external JSON is rejected by the schema.
  invalid.products[0].highlights = [42];
  assert.throws(() => validateAndEnrich(invalid), /Invalid product master/u);
});

test('Detail/list links preserve encoded search context and always stay on local catalogue pages', () => {
  const filters = { query: 'Neumann 보컬 & <tube>', category: 'microphone' };
  const base = 'https://example.test/';
  const detailUrl = new URL(productUrl('audio-050', filters), base);
  assert.equal(detailUrl.pathname, '/product.html');
  assert.equal(detailUrl.searchParams.get('id'), 'audio-050');
  assert.equal(detailUrl.searchParams.get('q'), filters.query);
  const back = new URL(libraryUrl(filters), base);
  assert.equal(back.pathname, '/index.html');
  assert.equal(back.searchParams.get('q'), filters.query);
  assert.equal(back.searchParams.get('category'), filters.category);
  assert.equal(libraryUrl(), 'index.html');
  assert.equal(new URL(productUrl('https://outside.example'), base).origin, new URL(base).origin);
});
