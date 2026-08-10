import { escapeHtml, externalLinkAttributes } from '../lib/html.mjs';

export function renderVideo({ site, locale, videos }) {
  const cards = videos.map((video) => {
    const content = `<img src="${escapeHtml(video.thumbnail)}" width="2048" height="1365" alt="" loading="lazy" decoding="async"><span class="video-shade" aria-hidden="true"></span><span class="play" aria-hidden="true"></span><span class="video-title">${escapeHtml(video.title)}</span>`;
    return video.youtube ? `<a class="video-card" aria-label="${escapeHtml(`${locale.view}: ${video.title}`)}" ${externalLinkAttributes(video.youtube)}>${content}</a>` : `<div class="video-card is-unavailable" aria-label="${escapeHtml(`${video.title} — ${locale.unavailable}`)}">${content}<span class="availability">${escapeHtml(locale.unavailable)}</span></div>`;
  }).join('\n');
  return `<header class="page-masthead content"><h1>${escapeHtml(locale.pages.video.heading)}</h1></header><section class="page-section content" aria-label="${escapeHtml(locale.pages.video.heading)}"><div class="video-grid">${cards}</div></section>`;
}
