'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Ajv } = require('ajv');
const { createCatalog } = require('../src/catalog-core.js');
/** @typedef {import('../src/catalog-types').CatalogSource} CatalogSource */
/** @typedef {import('../src/catalog-types').RuntimeCatalog} RuntimeCatalog */
/** @typedef {import('../src/catalog-types').Chapter} Chapter */
const ROOT = path.resolve(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/products.schema.json'), 'utf8'));
const validateSchema = new Ajv({ allErrors: true, strict: true }).compile(schema);

/** @param {unknown} value @param {string} label @returns {asserts value} */
function ensure(value, label) {
  if (!value) { throw new Error(label); }
}

/** @param {unknown} value @returns {Record<string, unknown> | null} */
function record(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? /** @type {Record<string,unknown>} */ (value) : null;
}

/** @param {string} relative @param {string} directory @returns {string} */
function resolveAsset(relative, directory) {
  ensure(relative === relative.trim() && !/[\\?#:%]/u.test(relative), `Use an unencoded relative asset path: ${relative}`);
  ensure(!path.posix.isAbsolute(relative) && !relative.split('/').includes('..'), `Asset path escapes dist: ${relative}`);
  const resolved = path.resolve(directory, relative);
  const inside = path.relative(path.resolve(directory), resolved);
  ensure(inside !== '' && !inside.startsWith('..') && !path.isAbsolute(inside), `Asset path escapes dist: ${relative}`);
  ensure(fs.existsSync(resolved) && fs.statSync(resolved).isFile(), `Missing asset: ${relative}`);
  return resolved;
}

/** Extract the actual document's chapter config; a standalone new HTML may have none. @param {string} source */
function documentConfig(source) {
  const match = source.match(/<script\b(?=[^>]*\bid=["']audio-guide-config["'])[^>]*>([\s\S]*?)<\/script>/iu);
  if (!match) { return null; }
  const config = record(JSON.parse(match[1]));
  ensure(config && typeof config.id === 'string' && typeof config.title === 'string' && Array.isArray(config.chapters), 'Invalid audio-guide-config');
  /** @type {Chapter[]} */
  const chapters = [];
  for (const value of config.chapters) {
    const chapter = record(value);
    ensure(chapter && typeof chapter.id === 'string' && typeof chapter.title === 'string', 'Invalid chapter config');
    chapters.push({ id: chapter.id, title: chapter.title });
  }
  return { id: config.id, title: config.title, category: config.category, chapters };
}

/** @param {string[]} values @param {string} label */
function unique(values, label) {
  ensure(new Set(values).size === values.length, `Duplicate ${label}`);
}

/** JSON schema + file, reference and legacy URL validation. @param {unknown} raw @param {string} [directory] @returns {RuntimeCatalog} */
function validateAndEnrich(raw, directory = path.join(ROOT, 'dist')) {
  ensure(validateSchema(raw), `Invalid product master: ${JSON.stringify(validateSchema.errors)}`);
  const data = /** @type {CatalogSource} */ (raw);
  unique(data.products.map(product => product.id), 'product id');
  unique(data.products.map(product => product.number), 'product number');
  unique(data.products.map(product => product.slug), 'product slug');
  unique(data.products.map(product => product.htmlPath).filter(/** @returns {item is string} */ item => item !== null), 'HTML path');
  unique(data.categories.map(item => item.id), 'category id');
  unique(data.series.map(item => item.id), 'series id');
  unique(data.bundles.map(item => item.id), 'bundle id');
  const productIds = new Set(data.products.map(item => item.id));
  const categoryIds = new Set(data.categories.map(item => item.id));
  const seriesIds = new Set(data.series.map(item => item.id));
  const bundleIds = new Set(data.bundles.map(item => item.id));
  for (const bundle of data.bundles) {
    ensure(bundle.productIds.every(id => productIds.has(id)), `${bundle.id}: unknown product`);
  }
  const products = data.products.map(product => {
    ensure(product.id === `audio-${product.number}`, `${product.id}: id/number mismatch`);
    ensure(categoryIds.has(product.category), `${product.id}: unknown category`);
    ensure(product.series === null || seriesIds.has(product.series), `${product.id}: unknown series`);
    ensure(product.relatedIds.every(id => productIds.has(id) && id !== product.id), `${product.id}: unknown/self relatedIds`);
    ensure(product.bundleIds.every(id => bundleIds.has(id)), `${product.id}: unknown bundleIds`);
    for (const bundle of data.bundles) {
      ensure(bundle.productIds.includes(product.id) === product.bundleIds.includes(bundle.id), `${product.id}: ${bundle.id} membership mismatch`);
    }
    for (const date of [product.createdAt, product.updatedAt]) {
      ensure(date === null || (Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date), `${product.id}: invalid calendar date`);
    }
    ensure(!product.createdAt || !product.updatedAt || product.createdAt <= product.updatedAt, `${product.id}: updatedAt before createdAt`);
    for (const asset of [product.htmlPath, product.pdfPath, product.coverImage]) {
      if (asset !== null) { resolveAsset(asset, directory); }
    }
    ensure(product.status !== 'published' || product.htmlPath || product.pdfPath, `${product.id}: published product needs an available HTML/PDF`);
    let config = null;
    if (product.htmlPath) {
      ensure(product.htmlPath.endsWith('.html'), `${product.id}: htmlPath must end in .html`);
      const source = fs.readFileSync(resolveAsset(product.htmlPath, directory), 'utf8');
      config = documentConfig(source);
      if (config) {
        ensure(config.id === product.number && config.title === product.title, `${product.id}: HTML config number/title mismatch`);
        ensure(config.category === product.category, `${product.id}: HTML category mismatch`);
        const ids = [...source.matchAll(/<[a-z][^>]*?\bid\s*=\s*["']([^"']+)["']/giu)].map(match => match[1]);
        const idSet = new Set(ids);
        unique(config.chapters.map(chapter => chapter.id), `${product.id} chapter id`);
        ensure(config.chapters.every(chapter => idSet.has(chapter.id)), `${product.id}: missing chapter anchor`);
      }
    }
    if (product.pdfPath) { ensure(product.pdfPath.endsWith('.pdf'), `${product.id}: pdfPath must end in .pdf`); }
    const chapters = config?.chapters ?? [];
    ensure(product.keywordSources.every(source => chapters.some(chapter => chapter.id === source.chapterId) && source.keywords.every(word => product.keywords.includes(word))), `${product.id}: keyword evidence mismatch`);
    return { ...product, chapters, chapterCount: chapters.length };
  }).sort((left, right) => left.number.localeCompare(right.number));
  /** @type {{id:string, number:string, title:string, htmlPath:string}[]} */
  const legacy = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/fixtures/legacy-links.json'), 'utf8'));
  for (const original of legacy) {
    const product = products.find(item => item.id === original.id);
    ensure(product && product.number === original.number && product.htmlPath === original.htmlPath && product.status === 'published', `Protected legacy URL missing/changed: ${original.id}`);
  }
  return { ...data, products };
}

/** @param {string} [filename] */
function loadMaster(filename = path.join(ROOT, 'content/products.json')) {
  return validateAndEnrich(JSON.parse(fs.readFileSync(filename, 'utf8')));
}

/** @param {unknown} value */
function escapeHTML(value) {
  /** @type {Record<string, string>} */
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/gu, character => entities[character]);
}

/** Produce outputs without rewriting or moving any guide. @param {RuntimeCatalog} data @returns {Map<string,string>} */
function renderOutputs(data) {
  const library = createCatalog(data);
  let home = fs.readFileSync(path.join(ROOT, 'src/index.template.html'), 'utf8');
  const categories = library.categories.map(category => `<a class="category-link" data-category="${escapeHTML(category.id)}" href="?category=${escapeHTML(category.id)}"><span><strong>${escapeHTML(category.label)}</strong><small>${escapeHTML(category.description)}</small></span><b>${library.counts[category.id]}</b></a>`).join('\n');
  home = home.replace('{{libraryTotal}}', String(library.products.length)).replace('{{categoryLinks}}', categories);
  ensure(!/\{\{[^}]+\}\}/u.test(home), 'Unresolved index template token');
  // Derived legacy adapter keeps reader.html?id=002 and integrations compatible.
  const safeJSON = JSON.stringify(data).replace(/</gu, '\\u003c').replace(/\u2028/gu, '\\u2028').replace(/\u2029/gu, '\\u2029');
  const catalogue = `/* Generated from content/products.json. Do not edit. */\nwindow.BLUEGEE_LIBRARY=${safeJSON};\nwindow.BLUEGEE_PRODUCTS=window.BLUEGEE_LIBRARY.products;\nwindow.BLUEGEE_CATALOG=window.BLUEGEE_PRODUCTS.filter(p=>p.status==='published'&&p.htmlPath).map(p=>({id:p.number,title:p.title,category:p.category,kind:p.equipmentType,description:p.description,filename:p.htmlPath.split('/').pop(),chapters:p.chapters,url:p.htmlPath}));\n`;
  return new Map([
    ['index.html', home], ['catalog.js', catalogue], ['products.json', JSON.stringify(data, null, 2) + '\n'],
    ['catalog-core.js', fs.readFileSync(path.join(ROOT, 'src/catalog-core.js'), 'utf8')],
    ['app.js', fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8')],
    ['product.html', fs.readFileSync(path.join(ROOT, 'src/product.template.html'), 'utf8')],
    ['product.js', fs.readFileSync(path.join(ROOT, 'src/product.js'), 'utf8')],
    ['product.css', fs.readFileSync(path.join(ROOT, 'src/product.css'), 'utf8')],
  ]);
}

module.exports = { ROOT, validateAndEnrich, loadMaster, renderOutputs, documentConfig, resolveAsset };
