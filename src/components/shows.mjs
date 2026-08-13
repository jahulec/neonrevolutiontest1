import { escapeHtml, externalLinkAttributes } from '../lib/html.mjs';
import { displayDate } from '../lib/date.mjs';

export function sortedShows(shows) {
  return [...shows].sort((a, b) => a.date.localeCompare(b.date));
}

function localizedWeekday(date, lang) {
  const weekday = new Intl.DateTimeFormat(lang === 'pl' ? 'pl-PL' : 'en-GB', {
    weekday: 'long',
    timeZone: 'UTC'
  }).format(new Date(`${date}T12:00:00Z`));
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function renderShows({ shows, locale, lang, limit = null, period = 'all', showTickets = true }) {
  const today = new Date().toISOString().slice(0, 10);
  let selected = sortedShows(shows).filter((show) => {
    if (period === 'upcoming') return show.date >= today;
    if (period === 'past') return show.date < today;
    return true;
  });
  if (period === 'past') selected.reverse();
  if (limit) selected = selected.slice(0, limit);
  if (!selected.length) return `<p class="empty-state">${escapeHtml(locale.newDatesSoon)}</p>`;

  return selected.map((show) => {
    const copy = show[lang];
    const action = showTickets
      ? show.ticketUrl
        ? `<a class="show-btn primary" data-track="ticket_click" data-track-label="${escapeHtml(`${show.date}:${copy.city}`)}" ${externalLinkAttributes(show.ticketUrl)}>${escapeHtml(locale.tickets)}</a>`
        : `<span class="show-btn primary is-disabled" aria-disabled="true">${escapeHtml(locale.tickets)}</span>`
      : '';

    const dateTime = show.start ? `${show.date}T${show.start}` : show.date;

    return `<article class="show-row" data-content-status="${escapeHtml(show.status)}">
      <div class="show-date-block"><time class="show-date" datetime="${escapeHtml(show.date)}">${escapeHtml(displayDate(show.date))}</time><span class="show-weekday">${escapeHtml(localizedWeekday(show.date, lang))}</span></div>
      <div class="show-city">${escapeHtml(copy.city)}</div>
      <div class="show-venue">${escapeHtml(copy.venue)}</div>
      <time class="show-time" datetime="${escapeHtml(dateTime)}">${escapeHtml(copy.timeLabel)}</time>
      <div class="show-actions${showTickets ? '' : ' show-actions--empty'}">${action}</div>
    </article>`;
  }).join('\n');
}
