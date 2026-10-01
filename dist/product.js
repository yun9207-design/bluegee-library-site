'use strict';

(() => {
  const library = window.BluegeeCatalog.createCatalog(window.BLUEGEE_LIBRARY);
  window.BluegeeLibrary = library;
  const parameters = new URLSearchParams(location.search);
  const category = parameters.get('category') ?? '';
  const filters = { query: parameters.get('q') ?? '', category: library.categories.some(item => item.id === category) ? category : '' };
  const backUrl = window.BluegeeCatalog.libraryUrl(filters);
  /** @param {string} id */
  function element(id) {
    const node = document.getElementById(id);
    if (!node) { throw new Error(`Missing product element: ${id}`); }
    return node;
  }
  /** @param {string} id @param {string} text */
  function text(id, text) { element(id).textContent = text; }
  /** @param {string} id @param {string} href */
  function link(id, href) {
    const node = element(id);
    node.setAttribute('href', href); node.hidden = false;
  }
  for (const id of ['back-to-list', 'bottom-back', 'error-back']) { link(id, backUrl); }
  const detail = library.getProductDetail(parameters.get('id') ?? '');
  if (!detail) {
    document.title = '가이드를 찾을 수 없습니다 — BlueGEE Audio Library';
    element('product-error').hidden = false;
    return;
  }
  const { product } = detail;
  document.title = `${product.number} · ${product.title} — BlueGEE Audio Library`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', product.description ?? `${product.title} 가이드 소개와 목차`);
  element('product-view').setAttribute('data-product-id', product.id);
  text('product-number', product.number);
  text('product-series', detail.series?.label ?? '오디오 엔지니어링 가이드');
  text('product-title', product.title);
  text('product-description', product.description ?? '원본 가이드에서 장비에 관한 내용을 확인해 보세요.');
  text('product-brand', product.brand ?? '미확인');
  text('product-category', detail.category?.label ?? product.category);
  text('product-type', product.equipmentType ?? '미확인');
  text('product-category-link', detail.category?.label ?? product.category);
  link('product-category-link', window.BluegeeCatalog.libraryUrl({ category: product.category }));
  text('product-why', detail.whyItMatters);
  const highlights = detail.highlights.length ? detail.highlights : ['원본 가이드에서 주요 내용을 확인해 주세요.'];
  for (const value of highlights) {
    const item = document.createElement('li'); item.textContent = value;
    element('product-highlights').append(item);
  }
  const keywords = product.keywords.length ? product.keywords : ['등록된 키워드 없음'];
  for (const value of keywords) {
    const item = document.createElement('li'); item.textContent = value;
    element('product-keywords').append(item);
  }
  if (product.htmlPath) { link('original-read', product.htmlPath); }
  if (product.pdfPath) { link('pdf-read', product.pdfPath); }
  text('reading-summary', product.chapterCount ? `${product.chapterCount}개 장으로 구성된 웹 가이드입니다. 필요한 장을 골라 읽어보세요.` : '제공되는 원본 자료에서 전체 내용을 확인해 보세요.');
  text('contents-count', product.chapterCount ? `${product.chapterCount}장` : '목차 미등록');
  if (product.chapters.length && product.htmlPath) {
    link('toc-jump', '#contents-section');
    for (const chapter of product.chapters) {
      const item = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.href = `${product.htmlPath}#${encodeURIComponent(chapter.id)}`;
      anchor.textContent = chapter.title;
      item.append(anchor); element('product-contents').append(item);
    }
  } else {
    element('contents-details').hidden = true;
    element('contents-caption').hidden = true;
    element('contents-empty').hidden = false;
  }
  for (const related of detail.relatedProducts) {
    const anchor = document.createElement('a'); anchor.className = 'related-guide';
    anchor.href = window.BluegeeCatalog.productUrl(related.id, filters);
    const label = document.createElement('span'); label.textContent = `${related.number} · ${related.brand ?? '브랜드 미확인'}`;
    const name = document.createElement('strong'); name.textContent = related.title;
    anchor.append(label, name); element('product-related').append(anchor);
  }
  element('related-empty').hidden = detail.relatedProducts.length !== 0;
  /** @param {string} id @param {import('./catalog-types').RuntimeProduct | null} neighbor @param {string} label */
  function neighborLink(id, neighbor, label) {
    if (!neighbor) {
      const message = document.createElement('span'); message.className = 'pagination-edge';
      message.textContent = `${label}이 없습니다.`; element(id).append(message); return;
    }
    const anchor = document.createElement('a'); anchor.href = window.BluegeeCatalog.productUrl(neighbor.id, filters);
    const direction = document.createElement('small'); direction.textContent = label;
    const title = document.createElement('strong'); title.textContent = `${neighbor.number} · ${neighbor.title}`;
    anchor.append(direction, title); element(id).append(anchor);
  }
  neighborLink('previous-product', detail.previousProduct, '이전 상품');
  neighborLink('next-product', detail.nextProduct, '다음 상품');
  document.querySelectorAll('.main-nav a').forEach(anchor => {
    const activeCategory = new URL(anchor.getAttribute('href') ?? '', location.href).searchParams.get('category');
    if (activeCategory === product.category) { anchor.setAttribute('aria-current', 'page'); }
  });
  element('product-view').hidden = false;
})();
