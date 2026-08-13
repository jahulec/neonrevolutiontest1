import { escapeHtml } from '../lib/html.mjs';
import { musicButtonAttributes, renderMusicModal } from '../components/music-modal.mjs';

export function renderMusic({ site, locale, releases }) {
  const cards = releases.map((release) => {
    const artwork = `<img src="${escapeHtml(release.cover)}" width="1600" height="1600" alt="${escapeHtml(`${site.brand} — ${release.title}`)}" loading="lazy" decoding="async"><span class="media-tile__shade" aria-hidden="true"></span>`;
    const tile = `<button class="media-tile" type="button" ${musicButtonAttributes(release)} data-track="music_open" data-track-label="${escapeHtml(release.title)}" aria-label="${escapeHtml(`${locale.listen}: ${release.title}`)}">${artwork}<span class="media-tile__cta">${escapeHtml(locale.listen)}</span></button>`;
    const year = release.year ? `<span>${escapeHtml(release.year)}</span>` : '';
    return `<article class="square-card">${tile}<div class="square-card__caption"><h2>${escapeHtml(release.title)}</h2>${year}</div></article>`;
  }).join('\n');

  return `<header class="page-masthead page-masthead--plain content"><h1>${escapeHtml(locale.pages.music.heading)}</h1></header><section class="page-section content" aria-label="${escapeHtml(locale.pages.music.heading)}"><div class="square-grid">${cards}</div></section>${renderMusicModal(locale)}`;
}
