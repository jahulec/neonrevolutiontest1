import { escapeHtml } from '../lib/html.mjs';
import { renderShows } from '../components/shows.mjs';

export function renderLive({ locale, lang, shows }) {
  return `<header class="page-masthead content"><h1>${escapeHtml(locale.pages.live.heading)}</h1></header><section class="page-section content shows-page" aria-label="${escapeHtml(locale.pages.live.heading)}"><div class="shows-list">${renderShows({ shows, locale, lang, period: 'upcoming' })}</div><div class="shows-divider" role="separator" aria-label="${escapeHtml(locale.pastShows)}"><span>${escapeHtml(locale.pastShows)}</span></div><div class="shows-list shows-list--past">${renderShows({ shows, locale, lang, period: 'past', showTickets: false })}</div></section>`;
}
