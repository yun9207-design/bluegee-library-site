'use strict';

/** @typedef {import('./catalog-types').RuntimeCatalog} RuntimeCatalog */
/** @typedef {import('./catalog-types').RuntimeProduct} RuntimeProduct */
/** @typedef {import('./catalog-types').Filters} Filters */
/** @typedef {import('./catalog-types').ProductDetail} ProductDetail */

/** @param {unknown} value */
function normalizeSearch(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

/** Only catalogue state is carried across pages; arbitrary return URLs are never accepted.
 * @param {Filters} [filters] */
function libraryUrl(filters = {}) {
  const parameters = new URLSearchParams();
  if (filters.category) { parameters.set('category', filters.category); }
  if (filters.query?.trim()) { parameters.set('q', filters.query.trim()); }
  return 'index.html' + (parameters.size ? '?' + parameters.toString() : '');
}

/** @param {string} id @param {Filters} [filters] */
function productUrl(id, filters = {}) {
  const parameters = new URLSearchParams(libraryUrl(filters).split('?')[1]);
  parameters.set('id', id);
  return 'product.html?' + parameters.toString();
}

/** Build all views and detail lookups from the same generated master. @param {RuntimeCatalog} data */
function createCatalog(data) {
  const products = data.products.filter(product => product.status === 'published').slice().sort((left, right) => left.number.localeCompare(right.number));
  const byId = new Map(products.map(product => [product.id, product]));
  const byNumber = new Map(products.map(product => [product.number, product]));
  const bySlug = new Map(products.map(product => [product.slug, product]));
  const categoryById = new Map(data.categories.map(category => [category.id, category]));
  const seriesById = new Map(data.series.map(series => [series.id, series]));
  const searchText = new Map(products.map(product => [product.id, normalizeSearch([
    product.number, product.title, product.brand, product.category,
    categoryById.get(product.category)?.label, product.series,
    product.series && seriesById.get(product.series)?.label, product.subcategory,
    product.equipmentType, product.description, ...product.keywords,
  ].filter(value => value != null).join(' '))]));

  /** @param {Filters} [filters] */
  function search(filters = {}) {
    const query = filters.query?.trim() ?? '';
    const fullQuery = normalizeSearch(query);
    const terms = query.split(/\s+/u).map(normalizeSearch).filter(Boolean);
    const compactModel = /^[a-z]+\s+\d[a-z0-9-]*$/iu.test(query);
    return products.filter(product => {
      if (filters.category && product.category !== filters.category) { return false; }
      if (filters.brand && product.brand !== filters.brand) { return false; }
      if (filters.equipmentType && product.equipmentType !== filters.equipmentType) { return false; }
      const text = searchText.get(product.id) ?? '';
      // Preserve the original punctuation/space-insensitive phrase search, then allow AND terms.
      return !fullQuery || text.includes(fullQuery) || (!compactModel && terms.every(term => text.includes(term)));
    });
  }

  /** @param {string} value */
  function getProduct(value) { return byId.get(value) ?? byNumber.get(value) ?? bySlug.get(value) ?? null; }

  /** Editorial fields and source headings share the same master; no second product dataset.
   * @param {string} value @returns {ProductDetail | null} */
  function getProductDetail(value) {
    const product = getProduct(value);
    if (!product) { return null; }
    const index = products.indexOf(product);
    const topics = product.chapters.filter(chapter => !/overview|v4-start|v4-original-notes|bg-verified|bg-listening|bg-workbench/iu.test(chapter.id) && !/시작.*정정|검토 이력|MASTER (?:MANUAL|REFERENCE)/iu.test(chapter.title));
    const highlights = product.highlights?.length ? product.highlights : topics.slice(0, 4).map(chapter => chapter.title);
    return {
      product,
      category: categoryById.get(product.category) ?? null,
      series: product.series ? seriesById.get(product.series) ?? null : null,
      relatedProducts: product.relatedIds.map(id => byId.get(id)).filter(
        /** @returns {item is RuntimeProduct} */ item => item !== undefined),
      sameBrandProducts: product.brand ? products.filter(item => item.id !== product.id && item.brand === product.brand) : [],
      bundles: data.bundles.filter(bundle => product.bundleIds.includes(bundle.id)),
      highlights,
      whyItMatters: product.whyItMatters || `${product.title}을 선택하거나 운용하기 전에 특성과 적용 범위를 확인하고, 작업에 필요한 판단의 근거를 찾아볼 수 있습니다.${product.description ? ` 이 가이드는 ‘${product.description}’에 초점을 둡니다.` : ''}`,
      previousProduct: products[index - 1] ?? null,
      nextProduct: products[index + 1] ?? null,
    };
  }

  return {
    products, categories: data.categories, series: data.series,
    counts: Object.fromEntries(data.categories.map(category => [category.id, products.filter(product => product.category === category.id).length])),
    facets: {
      brands: [...new Set(products.map(product => product.brand).filter(/** @returns {brand is string} */ brand => brand !== null))].sort(),
      equipmentTypes: [...new Set(products.map(product => product.equipmentType).filter(/** @returns {kind is string} */ kind => kind !== null))].sort(),
    },
    search, getProduct, getProductDetail,
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createCatalog, normalizeSearch, libraryUrl, productUrl };
}
if (typeof window !== 'undefined') {
  window.BluegeeCatalog = { createCatalog, normalizeSearch, libraryUrl, productUrl };
}
