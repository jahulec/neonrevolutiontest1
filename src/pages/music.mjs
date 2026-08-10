import { escapeHtml, externalLinkAttributes } from '../lib/html.mjs';

export function renderMusic({ site, locale, releases }) {
  const cards = releases.map((release) => {
    const listenUrl = release.links.smartlink ?? release.links.spotify ?? release.links.youtube;
    const artwork = `<img src="${escapeHtml(release.cover)}" width="1600" height="1600" alt="${escapeHtml(`${site.brand} — ${release.title}`)}" loading="lazy" decoding="async"><span class="media-tile__shade" aria-hidden="true"></span>`;
    const tile = listenUrl
      ? `<a class="media-tile" data-track="music_click" data-track-label="${escapeHtml(release.title)}" aria-label="${escapeHtml(`${locale.listen}: ${release.title}`)}" ${externalLinkAttributes(listenUrl)}>${artwork}<span class="media-tile__cta">${escapeHtml(locale.listen)}</span></a>`
      : `<div class="media-tile is-unavailable" aria-label="${escapeHtml(`${release.title} — ${locale.unavailable}`)}">${artwork}</div>`;
    const year = release.year ? `<span>${escapeHtml(release.year)}</span>` : '';
    return `<article class="square-card">${tile}<div class="square-card__caption"><h2>${escapeHtml(release.title)}</h2>${year}</div></article>`;
  }).join('\n');

  return `<header class="page-masthead page-masthead--plain content"><h1>${escapeHtml(locale.pages.music.heading)}</h1></header><section class="page-section content" aria-label="${escapeHtml(locale.pages.music.heading)}"><div class="square-grid">${cards}</div></section>`;
}
