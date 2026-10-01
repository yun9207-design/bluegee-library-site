'use strict';

(() => {
  const library = window.BluegeeCatalog.createCatalog(window.BLUEGEE_LIBRARY);
  window.BluegeeLibrary = library;
  /** @template {HTMLElement} T @param {string} id @returns {T} */
  function element(id) {
    const node = document.getElementById(id);
    if (!node) { throw new Error(`Missing catalogue element: ${id}`); }
    return /** @type {T} */ (node);
  }
  const search = /** @type {HTMLInputElement} */ (element('catalog-search'));
  const categoryNames = new Map(library.categories.map(category => [category.id, category.label]));
  const seriesNames = new Map(library.series.map(series => [series.id, series.label]));
  /** @param {unknown} value */
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => {
    /** @type {Record<string,string>} */
    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return entities[character];
  });
  function readCategory() {
    const category = new URLSearchParams(location.search).get('category') ?? '';
    return categoryNames.has(category) ? category : '';
  }
  let currentCategory = readCategory();
  search.value = new URLSearchParams(location.search).get('q') ?? '';

  function renderCatalog() {
    const results = library.search({ query: search.value, category: currentCategory });
    element('catalog-title').textContent = categoryNames.get(currentCategory) ?? '전체 가이드';
    element('result-count').textContent = `${results.length}편`;
    element('all-guides').hidden = !currentCategory;
    element('library-total').textContent = String(library.products.length);
    document.querySelectorAll('[data-category].category-link').forEach(link => {
      const category = link.getAttribute('data-category') ?? '';
      const active = category === currentCategory;
      link.classList.toggle('selected', active);
      if (active) { link.setAttribute('aria-current', 'page'); }
      else { link.removeAttribute('aria-current'); }
      const count = link.querySelector('b');
      if (count) { count.textContent = String(library.counts[category] ?? 0); }
    });
    document.querySelectorAll('.main-nav a').forEach(link => {
      const category = new URL(link.getAttribute('href') ?? '', location.href).searchParams.get('category') ?? '';
      if (category === currentCategory) { link.setAttribute('aria-current', 'page'); }
      else { link.removeAttribute('aria-current'); }
    });
    element('guide-list').innerHTML = results.map(product => {
      const path = product.htmlPath ?? product.pdfPath;
      const metadata = [product.brand ?? '브랜드 미확인', product.series ? seriesNames.get(product.series) : null].filter(Boolean);
      const chapterLabel = product.chapterCount ? `<span>${product.chapterCount}장</span>` : '';
      const detailPath = window.BluegeeCatalog.productUrl(product.id, { query: search.value, category: currentCategory });
      const title = `<a class="guide-title" href="${escapeHTML(detailPath)}">${escapeHTML(product.title)}</a>`;
      const read = path ? `<a class="read-link" href="${escapeHTML(path)}" aria-label="${escapeHTML(product.title)} 가이드 읽기">읽기</a>` : '';
      return `<article class="guide-entry" data-product-id="${escapeHTML(product.id)}" data-category="${escapeHTML(product.category)}"><span class="guide-number">${escapeHTML(product.number)}</span><div class="guide-info">${title}<p class="guide-description">${escapeHTML(product.description)}</p><div class="guide-meta"><span class="kind-tag">${escapeHTML(product.equipmentType ?? '장비 종류 미확인')}</span><span>${escapeHTML(categoryNames.get(product.category))}</span>${chapterLabel}</div><div class="guide-meta">${metadata.map(value => `<span>${escapeHTML(value)}</span>`).join('')}</div></div>${read}</article>`;
    }).join('');
    element('empty-state').hidden = results.length !== 0;
  }

  /** @param {boolean} [push] */
  function saveState(push = false) {
    const url = new URL(location.href);
    if (currentCategory) { url.searchParams.set('category', currentCategory); }
    else { url.searchParams.delete('category'); }
    if (search.value.trim()) { url.searchParams.set('q', search.value.trim()); }
    else { url.searchParams.delete('q'); }
    if (push) { history.pushState({}, '', url); }
    else { history.replaceState({}, '', url); }
  }

  const form = document.querySelector('.search-form');
  if (!form) { throw new Error('Missing catalogue search form'); }
  form.addEventListener('submit', event => { event.preventDefault(); saveState(); renderCatalog(); });
  search.addEventListener('input', () => { saveState(); renderCatalog(); });
  element('reset-search').addEventListener('click', () => { search.value = ''; saveState(); renderCatalog(); search.focus(); });
  document.querySelectorAll('.category-link').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const category = link.getAttribute('data-category') ?? '';
    currentCategory = currentCategory === category ? '' : category;
    saveState(true); renderCatalog();
  }));
  element('all-guides').addEventListener('click', event => {
    event.preventDefault(); currentCategory = ''; saveState(true); renderCatalog();
  });
  addEventListener('popstate', () => {
    currentCategory = readCategory();
    search.value = new URLSearchParams(location.search).get('q') ?? '';
    renderCatalog();
  });
  renderCatalog();
})();
