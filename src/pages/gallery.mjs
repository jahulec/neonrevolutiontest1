import { escapeHtml } from '../lib/html.mjs';

function localized(value, lang) {
  return typeof value === 'object' ? value[lang] : value;
}

function renderItem(item, index, locale, lang) {
  if (item.status === 'placeholder') {
    return `<div class="gallery-item gallery-item--placeholder" aria-hidden="true"></div>`;
  }

  const alt = localized(item.alt, lang);
  return `<button class="gallery-item gallery-item--photo" type="button" data-gallery-open data-gallery-image="${escapeHtml(item.image)}" data-gallery-alt="${escapeHtml(alt)}" aria-label="${escapeHtml(`${locale.gallery.open}: ${alt}`)}">
    <img src="${escapeHtml(item.image)}" width="${escapeHtml(item.width ?? 1600)}" height="${escapeHtml(item.height ?? 1200)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
  </button>`;
}

export function renderGallery({ locale, lang, gallery }) {
  const items = gallery.map((item, index) => renderItem(item, index, locale, lang)).join('\n');
  const initial = gallery.find((item) => item.status === 'real' && item.image);
  const initialAlt = initial ? localized(initial.alt, lang) : '';
  return `<header class="page-masthead page-masthead--plain content"><h1>${escapeHtml(locale.pages.gallery.heading)}</h1></header>
  <section class="page-section content gallery-page" aria-label="${escapeHtml(locale.pages.gallery.heading)}"><div class="gallery-grid">${items}</div></section>
  <dialog class="gallery-lightbox" data-gallery-modal aria-label="${escapeHtml(locale.pages.gallery.heading)}">
    <button class="modal-close gallery-lightbox__close" type="button" data-modal-close aria-label="${escapeHtml(locale.close)}">×</button>
    <button class="gallery-lightbox__nav gallery-lightbox__nav--prev" type="button" data-gallery-prev aria-label="${escapeHtml(locale.gallery.previous)}">←</button>
    <figure><img data-gallery-image src="${escapeHtml(initial?.image ?? '/assets/sygnet-neon.webp')}" alt="${escapeHtml(initialAlt)}" loading="lazy" decoding="async"></figure>
    <button class="gallery-lightbox__nav gallery-lightbox__nav--next" type="button" data-gallery-next aria-label="${escapeHtml(locale.gallery.next)}">→</button>
  </dialog>`;
}
