'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const { ROOT, loadMaster, validateAndEnrich, renderOutputs } = require('../../scripts/catalog-data.cjs');
const { createCatalog, productUrl } = require('../../src/catalog-core.js');
const dist = path.join(ROOT, 'dist');
const output = path.join(ROOT, 'audit/product-detail');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

async function serve(directory) {
  const server = http.createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      const file = path.resolve(directory, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
      const relative = path.relative(directory, file);
      if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        response.writeHead(404); response.end('Not found'); return;
      }
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };
      response.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
      fs.createReadStream(file).pipe(response);
    } catch (_error) { response.writeHead(400); response.end('Bad request'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { base: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())) };
}

(async () => {
  const data = loadMaster();
  const library = createCatalog(data);
  for (const [name, content] of renderOutputs(data)) {
    assert.equal(fs.readFileSync(path.join(dist, name), 'utf8'), content, `Run npm run build first: ${name}`);
  }
  const beforeMaster = digest(fs.readFileSync(path.join(ROOT, 'content/products.json')));
  const guideHashes = new Map(library.products.map(product => [product.htmlPath, digest(fs.readFileSync(path.join(dist, product.htmlPath)))]));
  const report = { checkedAt: new Date().toISOString(), scope: 'Product introduction + existing catalogue/reader regression; local only, no deployment', count: library.products.length, categories: library.counts, search: [], guides: [], details: [], detailWidths: [], homeWidths: [], fixture081: null };
  fs.mkdirSync(output, { recursive: true });
  const server = await serve(dist);
  const executablePath = process.env.BROWSER_EXECUTABLE ?? (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : undefined);
  let browser;
  let temporary;
  let fixtureServer;
  try {
    browser = await chromium.launch({ headless: true, executablePath });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(server.base);
    await page.waitForSelector('.guide-entry');
    assert.equal(await page.locator('.guide-entry').count(), library.products.length);
    assert.equal(await page.locator('#library-total').textContent(), String(library.products.length));
    const listed = await page.locator('.guide-entry').evaluateAll(nodes => nodes.map(node => ({ id: node.dataset.productId, title: node.querySelector('.guide-title').textContent, href: node.querySelector('.guide-title').getAttribute('href'), readHref: node.querySelector('.read-link').getAttribute('href'), text: node.textContent })));
    for (const product of library.products) {
      const item = listed.find(row => row.id === product.id);
      assert.ok(item, product.id);
      assert.equal(item.title, product.title);
      assert.equal(item.href, productUrl(product.id));
      assert.equal(item.readHref, product.htmlPath);
      assert.ok(item.text.includes(product.number) && item.text.includes(product.description));
      assert.ok(!product.brand || item.text.includes(product.brand));
      assert.ok(!product.series || item.text.includes(data.series.find(series => series.id === product.series).label));
      const response = await context.request.get(new URL(product.htmlPath, server.base).href);
      assert.equal(response.status(), 200);
    }
    assert.deepEqual(await page.locator('.guide-title').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), library.products.map(product => productUrl(product.id)));
    const publicData = await context.request.get(new URL('products.json', server.base).href);
    assert.deepEqual((await publicData.json()).products.map(product => product.id), data.products.map(product => product.id));

    for (const query of ['LA-2A', 'la2a', 'LA 2A', 'Neve', 'Chandler Limited', 'microphone', 'Tube Condenser', '진공관', '니브 프리앰프', 'Neumann 보컬 진공관', '존재하지않는상품xyz']) {
      await page.locator('#catalog-search').fill(query);
      const resultIds = await page.locator('.guide-entry').evaluateAll(nodes => nodes.map(node => node.dataset.productId));
      assert.deepEqual(resultIds, library.search({ query }).map(product => product.id));
      report.search.push({ query, count: resultIds.length });
    }
    assert.equal(await page.locator('#empty-state').isVisible(), true);
    await page.locator('#reset-search').click();
    assert.equal(await page.locator('.guide-entry').count(), library.products.length);
    for (const category of data.categories) {
      await page.locator(`.category-link[data-category="${category.id}"]`).click();
      assert.equal(await page.locator('.guide-entry').count(), library.counts[category.id]);
      assert.equal(await page.locator(`.category-link[data-category="${category.id}"] b`).textContent(), String(library.counts[category.id]));
    }
    assert.equal(await page.locator('[data-product-id="audio-050"]').count(), 1);
    await page.locator('#all-guides').click();
    assert.equal(await page.locator('.guide-entry').count(), library.products.length);
    await page.locator('#catalog-search').fill('Neve');
    await page.reload();
    await page.waitForSelector('.guide-entry');
    assert.equal(await page.locator('#catalog-search').inputValue(), 'Neve');
    await page.locator('#catalog-search').fill('');
    const detail = await page.evaluate(() => window.BluegeeLibrary.getProductDetail('audio-050'));
    assert.equal(detail.product.category, 'microphone');
    assert.equal(detail.product.series, 'classic-studio-gear');
    assert.ok((await page.evaluate(() => window.BluegeeLibrary.facets.brands)).includes('Neve'));
    const structuredFilter = await page.evaluate(() => window.BluegeeLibrary.search({ brand: 'Neve', equipmentType: 'Preamp / EQ' }).map(product => product.id));
    assert.deepEqual(structuredFilter, library.search({ brand: 'Neve', equipmentType: 'Preamp / EQ' }).map(product => product.id));
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const measurement = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
      assert.ok(measurement.documentWidth <= width + 1, JSON.stringify(measurement));
      assert.equal(await page.locator('.guide-entry').count(), library.products.length);
      report.homeWidths.push(measurement);
      if (width === 390 || width === 1440) { await page.screenshot({ path: path.join(output, `home-${width}.png`), animations: 'disabled' }); }
    }
    assert.deepEqual(errors, []);
    // Search -> detail -> previous/next -> original -> back preserves the list context.
    await page.goto(new URL('index.html?category=outboard&q=LA-2A', server.base).href);
    await page.locator('[data-product-id="audio-002"] .guide-title').click();
    await page.waitForSelector('#product-view:not([hidden])');
    assert.equal(await page.locator('#product-title').textContent(), library.getProduct('002').title);
    await page.locator('#next-product a').click();
    assert.equal(await page.locator('#product-number').textContent(), '003');
    await page.locator('#previous-product a').click();
    assert.equal(await page.locator('#product-number').textContent(), '002');
    await page.locator('#back-to-list').click();
    await page.waitForSelector('.guide-entry');
    assert.equal(await page.locator('#catalog-search').inputValue(), 'LA-2A');
    assert.equal(new URL(page.url()).searchParams.get('category'), 'outboard');
    assert.equal(await page.locator('.guide-entry').count(), library.search({ query: 'LA-2A', category: 'outboard' }).length);
    await page.locator('.guide-title').click();
    await page.locator('#original-read').click();
    await page.waitForFunction(() => window.AudioGuide);
    assert.equal(new URL(page.url()).pathname, '/' + library.getProduct('002').htmlPath);
    report.listDetailNavigation = { searchContextRestored: true, previousNext: true, originalRead: true };
    await page.goto(new URL('product.html?id=missing&category=invalid&q=test&return=https://outside.example', server.base).href);
    assert.equal(await page.locator('#product-error').isVisible(), true);
    assert.equal(await page.locator('#product-view').isVisible(), false);
    assert.equal(await page.locator('#error-back').getAttribute('href'), 'index.html?q=test');
    report.invalidIdHandled = true;
    for (const number of ['001', '050', '060', '061', '080']) {
      await page.goto(new URL(productUrl(`audio-${number}`), server.base).href);
      await page.waitForSelector('#product-view:not([hidden])');
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${number} width ${width}`);
        await page.locator('#contents-details summary').click();
        assert.equal(await page.locator('#product-contents a').first().isVisible(), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${number} expanded width ${width}`);
        await page.locator('#contents-details summary').click();
        report.detailWidths.push({ number, width, collapsedAndExpanded: true });
        if ((width === 390 || width === 1440) && ['001', '050', '060'].includes(number)) {
          await page.screenshot({ path: path.join(output, `detail-${number}-${width}.png`), fullPage: true, animations: 'disabled' });
        }
      }
    }
    await page.goto(new URL('product.html?id=audio-050', server.base).href);
    await page.locator('#contents-details summary').click();
    const firstChapter = library.getProduct('050').chapters[0];
    await page.locator('#product-contents a').first().click();
    await page.waitForFunction(() => window.AudioGuide);
    assert.equal(new URL(page.url()).hash, '#' + firstChapter.id);
    assert.equal(await page.locator('.audio-guide-current').getAttribute('id'), firstChapter.id);
    report.tocReadLink = true;
    assert.deepEqual(errors, []);
    await page.close();

    let detailCursor = 0;
    async function detailWorker() {
      const detailPage = await context.newPage();
      const detailErrors = [];
      detailPage.on('pageerror', error => detailErrors.push(error.message));
      while (detailCursor < library.products.length) {
        const product = library.products[detailCursor++];
        const view = library.getProductDetail(product.id);
        const response = await detailPage.goto(new URL(productUrl(product.id), server.base).href);
        assert.equal(response.status(), 200);
        await detailPage.waitForSelector('#product-view:not([hidden])');
        assert.equal(await detailPage.locator('#product-view').getAttribute('data-product-id'), product.id);
        assert.equal(await detailPage.locator('#product-title').textContent(), product.title);
        assert.equal(await detailPage.locator('#product-number').textContent(), product.number);
        assert.equal(await detailPage.locator('#product-brand').textContent(), product.brand ?? '미확인');
        assert.equal(await detailPage.locator('#product-category').textContent(), view.category.label);
        assert.equal(await detailPage.locator('#product-type').textContent(), product.equipmentType ?? '미확인');
        assert.equal(await detailPage.locator('#product-description').textContent(), product.description);
        assert.equal(await detailPage.locator('#original-read').getAttribute('href'), product.htmlPath);
        assert.deepEqual(await detailPage.locator('#product-highlights li').allTextContents(), view.highlights);
        assert.deepEqual(await detailPage.locator('#product-keywords li').allTextContents(), product.keywords);
        assert.equal(await detailPage.locator('#product-why').textContent(), view.whyItMatters);
        assert.deepEqual(await detailPage.locator('#product-contents a').evaluateAll(nodes => nodes.map(node => ({ title: node.textContent, href: node.getAttribute('href') }))), product.chapters.map(chapter => ({ title: chapter.title, href: `${product.htmlPath}#${encodeURIComponent(chapter.id)}` })));
        for (const [selector, neighbor] of [['#previous-product', view.previousProduct], ['#next-product', view.nextProduct]]) {
          assert.equal(await detailPage.locator(selector + ' a').count(), neighbor ? 1 : 0);
          if (neighbor) { assert.equal(await detailPage.locator(selector + ' a').getAttribute('href'), productUrl(neighbor.id)); }
        }
        assert.deepEqual(await detailPage.locator('.related-guide').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), view.relatedProducts.map(related => productUrl(related.id)));
        assert.equal(await detailPage.locator('#related-empty').isVisible(), !view.relatedProducts.length);
        assert.equal(await detailPage.locator('#bottom-back').getAttribute('href'), 'index.html');
        report.details.push({ number: product.number, chapters: product.chapterCount, related: view.relatedProducts.length, previous: view.previousProduct?.number ?? null, next: view.nextProduct?.number ?? null });
      }
      assert.deepEqual(detailErrors, []);
      await detailPage.close();
    }
    await Promise.all(Array.from({ length: 4 }, detailWorker));

    let cursor = 0;
    async function guideWorker() {
      const guidePage = await context.newPage();
      while (cursor < library.products.length) {
        const product = library.products[cursor++];
        const jsErrors = [];
        const onError = error => jsErrors.push(error.message);
        guidePage.on('pageerror', onError);
        await guidePage.goto(new URL(product.htmlPath, server.base).href, { waitUntil: 'domcontentloaded' });
        await guidePage.waitForFunction(() => window.AudioGuide);
        const check = await guidePage.evaluate(() => {
          const failedChapters = [];
          for (let index = 0; index < window.AudioGuide.chapterCount; index++) {
            window.AudioGuide.selectChapter(index, undefined, false);
            const current = document.querySelector('.audio-guide-chapter.audio-guide-current');
            if (!current || !current.getBoundingClientRect().height) { failedChapters.push(index); }
          }
          return { chapters: window.AudioGuide.chapterCount, failedChapters, sidebars: document.querySelectorAll('#audio-guide-toc').length, iframes: document.querySelectorAll('iframe').length };
        });
        assert.equal(check.chapters, product.chapterCount);
        assert.deepEqual(check.failedChapters, []);
        assert.equal(check.sidebars, 1); assert.equal(check.iframes, 0); assert.deepEqual(jsErrors, []);
        report.guides.push({ number: product.number, ...check, jsErrors });
        guidePage.off('pageerror', onError);
      }
      await guidePage.close();
    }
    await Promise.all(Array.from({ length: 4 }, guideWorker));
    const reader = await context.newPage();
    await reader.goto(new URL('reader.html?id=002&chapter=tab-history', server.base).href);
    await reader.waitForFunction(() => window.AudioGuide);
    assert.ok(reader.url().endsWith(library.getProduct('002').htmlPath + '#tab-history'));
    await reader.locator('#audio-guide-next').click();
    assert.notEqual(new URL(reader.url()).hash, '#tab-history');
    await reader.locator('#audio-guide-search').fill('광학');
    assert.ok(await reader.locator('.audio-guide-link:visible').count() > 0);
    await reader.locator('#audio-guide-search').fill('');
    await reader.locator('#audio-guide-read').click();
    assert.equal(await reader.locator('#audio-guide-read').getAttribute('aria-pressed'), 'true');
    await reader.reload(); await reader.waitForFunction(() => window.AudioGuide);
    assert.equal(await reader.locator('#audio-guide-read').getAttribute('aria-pressed'), 'true');
    await reader.setViewportSize({ width: 390, height: 844 });
    await reader.locator('#audio-guide-toggle').click();
    await reader.locator('.audio-guide-link').nth(4).click();
    assert.equal(await reader.locator('#audio-guide-toggle').getAttribute('aria-expanded'), 'false');
    assert.equal(await reader.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await reader.screenshot({ path: path.join(output, 'reader-390.png'), animations: 'disabled' });
    await reader.close();

    // Real browser fixture: add one product only to an isolated master copy and build the same outputs.
    temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'bluegee-catalog-browser-'));
    const fixtureDist = path.join(temporary, 'dist');
    fs.cpSync(dist, fixtureDist, { recursive: true });
    const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/products.json'), 'utf8'));
    const number = String(Math.max(...source.products.map(product => Number(product.number))) + 1).padStart(3, '0');
    const htmlPath = `guides/outboard/${number}-temporary-test.html`;
    fs.writeFileSync(path.join(fixtureDist, htmlPath), '<!doctype html><html lang="ko"><title>Temporary test guide</title><body><h1>Temporary test guide</h1></body></html>');
    source.products.push({ id: `audio-${number}`, number, slug: `${number}-temporary-test`, title: 'Temporary test guide', brand: null, series: null, category: 'outboard', subcategory: null, equipmentType: null, description: null, keywords: ['신규등록검증'], htmlPath, pdfPath: null, coverImage: null, status: 'published', featured: false, relatedIds: [], bundleIds: [], createdAt: null, updatedAt: null, keywordSources: [], highlights: ['검수한 주제 <img src=x onerror="window.unsafeFixture=true">'], whyItMatters: '검수한 이유 <script>window.unsafeFixture=true</script>' });
    const fixtureData = validateAndEnrich(source, fixtureDist);
    for (const [name, content] of renderOutputs(fixtureData)) { fs.writeFileSync(path.join(fixtureDist, name), content); }
    fixtureServer = await serve(fixtureDist);
    const fixturePage = await context.newPage();
    await fixturePage.goto(fixtureServer.base); await fixturePage.waitForSelector('.guide-entry');
    assert.equal(await fixturePage.locator('.guide-entry').count(), library.products.length + 1);
    assert.equal(await fixturePage.locator('#library-total').textContent(), String(library.products.length + 1));
    await fixturePage.locator('.category-link[data-category="outboard"]').click();
    assert.equal(await fixturePage.locator('.guide-entry').count(), library.counts.outboard + 1);
    await fixturePage.locator('#catalog-search').fill('신규등록검증');
    assert.equal(await fixturePage.locator('.guide-entry').count(), 1);
    assert.equal(await fixturePage.evaluate(id => window.BluegeeLibrary.getProductDetail(id).product.number, `audio-${number}`), number);
    await fixturePage.locator('.guide-title').click();
    await fixturePage.waitForSelector('#product-view:not([hidden])');
    assert.equal(await fixturePage.locator('#product-number').textContent(), number);
    assert.equal(await fixturePage.locator('#product-brand').textContent(), '미확인');
    assert.equal(await fixturePage.locator('#contents-empty').isVisible(), true);
    assert.equal(await fixturePage.locator('#previous-product a').textContent(), '이전 상품' + library.products.at(-1).number + ' · ' + library.products.at(-1).title);
    assert.equal(await fixturePage.locator('#next-product a').count(), 0);
    assert.equal(await fixturePage.locator('#product-highlights img').count(), 0);
    assert.equal(await fixturePage.locator('#product-why script').count(), 0);
    assert.equal(await fixturePage.evaluate(() => window.unsafeFixture), undefined);
    assert.equal(await fixturePage.locator('#product-highlights li').textContent(), source.products.at(-1).highlights[0]);
    await fixturePage.locator('#bottom-back').click();
    await fixturePage.waitForSelector('.guide-title');
    assert.equal(await fixturePage.locator('.guide-entry').count(), 1);
    assert.equal(await fixturePage.locator('#catalog-search').inputValue(), '신규등록검증');
    await fixturePage.locator('.guide-title').click();
    await fixturePage.locator('#original-read').click();
    assert.equal(await fixturePage.locator('h1').textContent(), 'Temporary test guide');
    report.fixture081 = { number, total: library.products.length + 1, outboard: library.counts.outboard + 1, searchResults: 1, detailLookup: true, detailScreen: true, editorialFields: true, safelyRendered: true, missingMetadataHandled: true, navigation: true, readLink: true, isolatedFixture: true };
    await fixturePage.close();
    report.readerCompatibility = true;
    report.masterUnchangedAfterFixture = digest(fs.readFileSync(path.join(ROOT, 'content/products.json'))) === beforeMaster;
    report.guideFilesUnchanged = [...guideHashes].every(([name, hash]) => digest(fs.readFileSync(path.join(dist, name))) === hash);
    assert.ok(report.masterUnchangedAfterFixture && report.guideFilesUnchanged);
    report.guides.sort((left, right) => left.number.localeCompare(right.number));
    report.details.sort((left, right) => left.number.localeCompare(right.number));
    report.passed = true;
  } finally {
    if (browser) { await browser.close(); }
    if (fixtureServer) { await fixtureServer.close(); }
    await server.close();
    if (temporary) {
      const resolved = path.resolve(temporary);
      assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('bluegee-catalog-browser-'));
      fs.rmSync(resolved, { recursive: true, force: true });
      report.fixtureRemoved = !fs.existsSync(resolved);
    }
  }
  fs.writeFileSync(path.join(output, 'browser-verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, count: report.count, categories: report.categories, search: report.search, details: report.details.length, detailMobileChecks: report.detailWidths.length, listDetailNavigation: report.listDetailNavigation, tocReadLink: report.tocReadLink, invalidIdHandled: report.invalidIdHandled, guides: report.guides.length, chapters: report.guides.reduce((sum, guide) => sum + guide.chapters, 0), mobile: report.homeWidths, readerCompatibility: report.readerCompatibility, fixture081: report.fixture081, fixtureRemoved: report.fixtureRemoved, masterUnchanged: report.masterUnchangedAfterFixture, guidesUnchanged: report.guideFilesUnchanged }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
