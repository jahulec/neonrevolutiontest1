import { escapeHtml, externalLinkAttributes, phoneLink } from '../lib/html.mjs';

function profileLabel(name) {
  return name === 'youtube' ? 'YouTube' : name[0].toUpperCase() + name.slice(1);
}

export function renderContact({ site, locale }) {
  const { email, phone, messenger, status } = site.contact;
  const phoneHref = phoneLink(phone);
  const profiles = Object.entries(site.profiles).map(([name, url]) => `<a class="contact-social" ${externalLinkAttributes(url)}>${escapeHtml(profileLabel(name))}<span aria-hidden="true">↗</span></a>`).join('\n');

  return `<header class="page-masthead content"><h1>${escapeHtml(locale.pages.contact.heading)}</h1></header>
  <section class="page-section content contact-page" data-content-status="${escapeHtml(status)}">
    ${status === 'demo' ? `<p class="demo-notice">${escapeHtml(locale.demoNotice)}</p>` : ''}
    <p class="contact-intro">${escapeHtml(locale.contactSoon)}</p>
    <div class="contact-methods">
      <article class="contact-method"><h2>${escapeHtml(locale.contactDetails.email)}</h2><p>${escapeHtml(email)}</p><a class="action-link" data-track="contact_click" data-track-label="email" href="mailto:${escapeHtml(email)}">${escapeHtml(locale.copyEmail)}</a></article>
      <article class="contact-method"><h2>${escapeHtml(locale.contactDetails.phone)}</h2><p>${escapeHtml(phone)}</p><a class="action-link" data-track="contact_click" data-track-label="phone" href="tel:${escapeHtml(phoneHref)}">${escapeHtml(locale.call)}</a></article>
      <article class="contact-method"><h2>${escapeHtml(locale.contactDetails.messenger)}</h2><p>Neon Revolution</p><a class="action-link" data-track="contact_click" data-track-label="messenger" ${externalLinkAttributes(messenger)}>${escapeHtml(locale.openMessenger)}</a></article>
    </div>
    <section class="contact-profiles" aria-labelledby="contact-profiles-title"><h2 id="contact-profiles-title">${escapeHtml(locale.contactDetails.socials)}</h2><div class="contact-socials" role="group" aria-label="${escapeHtml(locale.socialLabel)}">${profiles}</div></section>
  </section>`;
}
