import { escapeHtml } from '../lib/html.mjs';
import { displayDate } from '../lib/date.mjs';

export function renderNews({ locale, lang, news }) {
  const newsBase = lang === 'pl' ? '/aktualnosci/' : '/en/news/';
  const cards = news.map((entry) => {
    const copy = entry[lang];
    const image = `<img src="${escapeHtml(entry.image)}" width="1200" height="1200" alt="" loading="lazy" decoding="async"><span class="media-tile__shade" aria-hidden="true"></span>`;
    const tile = `<a class="media-tile" aria-label="${escapeHtml(`${locale.read}: ${copy.title}`)}" href="${escapeHtml(`${newsBase}${entry.slug}/`)}">${image}<span class="media-tile__cta">${escapeHtml(locale.read)}</span></a>`;
    return `<article class="square-card">${tile}<div class="square-card__caption"><h2>${escapeHtml(copy.title)}</h2><time datetime="${escapeHtml(entry.date)}">${escapeHtml(displayDate(entry.date))}</time></div></article>`;
  }).join('\n');

  const content = cards || `<div class="square-card square-card--empty"><div class="empty-square"><span>${escapeHtml(locale.newsSoon)}</span></div></div>`;
  return `<header class="page-masthead page-masthead--plain content"><h1>${escapeHtml(locale.pages.news.heading)}</h1></header><section class="page-section content" aria-label="${escapeHtml(locale.pages.news.heading)}"><div class="square-grid">${content}</div></section>`;
}
