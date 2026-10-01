'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { buildSync } = require('esbuild');
const ROOT = path.resolve(__dirname, '..');
/** @param {unknown} value */
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/gu, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch);
}
/** Public lock shell contains catalogue metadata only; never a private HTML body.
 * @param {import('../src/catalog-types').RuntimeProduct} product */
function renderProtectedShell(product) {
  const metadata = { id: product.number, productId: product.id, title: product.title, category: product.category, chapters: product.chapters };
  return fs.readFileSync(path.join(ROOT, 'src/protected-guide.template.html'), 'utf8')
    .replaceAll('{{title}}', escapeHTML(product.title))
    .replace('{{number}}', product.number)
    .replaceAll('{{productId}}', product.id)
    .replace('{{chapterCount}}', String(product.chapters.length))
    .replace('{{chapterAnchors}}', product.chapters.map(ch => `<li id="${escapeHTML(ch.id)}">${escapeHTML(ch.title)}</li>`).join('\n'))
    .replace('{{guideConfig}}', JSON.stringify(metadata).replace(/</gu, '\\u003c'));
}
/** @param {import('../src/catalog-types').RuntimeCatalog} data */
function renderProtectedOutputs(data) {
  const output = new Map();
  const protectedProducts = data.products.filter(product => product.access === 'entitlement');
  if (!protectedProducts.length) { return output; }
  const result = buildSync({ entryPoints: [path.join(ROOT, 'src/protected-guide.js')], bundle: true, write: false, platform: 'browser', format: 'iife', target: ['es2022'], minify: true, legalComments: 'inline', define: { 'process.env.NODE_ENV': '"production"' } });
  output.set('protected-guide.js', result.outputFiles[0].text);
  output.set('protected-guide.css', fs.readFileSync(path.join(ROOT, 'src/protected-guide.css'), 'utf8'));
  for (const product of protectedProducts) {
    if (!product.htmlPath) { throw new Error('Protected HTML path missing'); }
    const shell = renderProtectedShell(product);
    const legacySource = path.join(ROOT, product.htmlPath);
    if (fs.existsSync(legacySource) && fs.readFileSync(legacySource, 'utf8').replace(/\r\n/gu, '\n') !== shell) {
      throw new Error('The protected guide root copy must contain only the generated lock shell; never restore a private original there.');
    }
    output.set(product.htmlPath, shell);
  }
  return output;
}
module.exports = { renderProtectedShell, renderProtectedOutputs };
