import { escapeHtml, externalLinkAttributes } from '../lib/html.mjs';

function localized(value, lang) {
  return typeof value === 'object' ? value[lang] : value;
}

function renderMember(member, lang) {
  return `<li><strong>${escapeHtml(member.name)}</strong><span>${escapeHtml(localized(member.role, lang))}</span></li>`;
}

function renderAchievement(item, lang) {
  return `<article class="press-achievement"><time>${escapeHtml(item.year)}</time><div><h3>${escapeHtml(localized(item.title, lang))}</h3><p>${escapeHtml(localized(item.description, lang))}</p></div></article>`;
}

function renderMedia(item, locale, lang) {
  return `<article class="press-media-card press-media-card--${escapeHtml(item.type)}">
    <img src="${escapeHtml(item.image)}" width="${escapeHtml(item.width)}" height="${escapeHtml(item.height)}" alt="${escapeHtml(localized(item.title, lang))}" loading="lazy" decoding="async">
    <div class="press-media-card__copy"><h3>${escapeHtml(localized(item.title, lang))}</h3><p>${escapeHtml(item.meta)}</p><p>${escapeHtml(localized(item.credit, lang))}</p><a class="text-link" href="${escapeHtml(item.download)}" download>${escapeHtml(locale.download)} <span aria-hidden="true">↓</span></a></div>
  </article>`;
}

function renderDownload(item, locale) {
  const label = locale.press[item.id];
  return `<div class="press-resource" data-content-status="${escapeHtml(item.status)}"><div><h3>${escapeHtml(label)}</h3><span>${escapeHtml(item.format)} · ${escapeHtml(locale.demoContentLabel)}</span></div><a class="press-resource__action" data-track="press_download" data-track-label="${escapeHtml(item.id)}" href="${escapeHtml(item.url)}" download>${escapeHtml(locale.download)} <span aria-hidden="true">↓</span></a></div>`;
}

export function renderPress({ site, locale, lang, press }) {
  const email = site.contact.email;
  const phone = site.contact.phone;
  const phoneHref = site.contact.phoneHref;
  const messenger = site.contact.messenger;
  return `<header class="page-masthead content"><h1>${escapeHtml(locale.pages.press.heading)}</h1></header>
  <section class="page-section content press-page" data-content-status="${escapeHtml(press.status)}">
    <p class="demo-notice">${escapeHtml(locale.demoNotice)}</p>
    <div class="press-overview">
      <div class="press-bio"><h2>${escapeHtml(locale.officialBio)}</h2><p>${escapeHtml(locale.bio)}</p></div>
    </div>
    <section class="press-block" aria-labelledby="press-members"><h2 id="press-members">${escapeHtml(locale.press.members)}</h2><ul class="press-members">${press.members.map((item) => renderMember(item, lang)).join('')}</ul></section>
    <section class="press-block" aria-labelledby="press-achievements"><h2 id="press-achievements">${escapeHtml(locale.press.achievements)}</h2><div class="press-achievements">${press.achievements.map((item) => renderAchievement(item, lang)).join('')}</div></section>
    <section class="press-block" aria-labelledby="press-media"><h2 id="press-media">${escapeHtml(locale.press.photos)}</h2><div class="press-media-grid">${press.media.map((item) => renderMedia(item, locale, lang)).join('')}</div></section>
    <section class="press-block" aria-labelledby="press-downloads"><h2 id="press-downloads">${escapeHtml(locale.press.downloads)}</h2><div class="press-resources">${press.downloads.map((item) => renderDownload(item, locale)).join('')}</div></section>
    <section class="press-contact" id="contact" aria-labelledby="press-contact-title"><h2 id="press-contact-title">${escapeHtml(locale.contact)}</h2><div class="contact-row"><strong>${escapeHtml(locale.contactDetails.email)}</strong><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div><div class="contact-row"><strong>${escapeHtml(locale.contactDetails.phone)}</strong><a href="tel:${escapeHtml(phoneHref)}">${escapeHtml(phone)}</a></div><div class="contact-row"><strong>${escapeHtml(locale.contactDetails.messenger)}</strong><a ${externalLinkAttributes(messenger)}>Messenger <span aria-hidden="true">↗</span></a></div></section>
  </section>`;
}
