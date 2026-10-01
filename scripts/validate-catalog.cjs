'use strict';
const { loadMaster } = require('./catalog-data.cjs');
const { createCatalog } = require('../src/catalog-core.js');
try {
  const data = loadMaster();
  const library = createCatalog(data);
  console.log(JSON.stringify({ valid: true, registered: data.products.length, published: library.products.length, categories: library.counts, chapters: library.products.reduce((count, product) => count + product.chapterCount, 0) }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
