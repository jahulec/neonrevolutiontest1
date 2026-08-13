import { escapeHtml, externalLinkAttributes } from '../lib/html.mjs';
import { renderShows } from '../components/shows.mjs';
import { musicButtonAttributes, renderMusicModal } from '../components/music-modal.mjs';

function featured(items) {
  return items.find((item) => item.featured) ?? items[0];
}

export function renderHome({ site, routes, locale, lang, releases, videos, shows, press }) {
  const release = featured(releases);
  const video = featured(videos);
  const route = (id) => routes.find((item) => item.id === id)[lang];
  const releaseTitle = escapeHtml(release.title).replace(' ', '<br>');

  return {
    beforeHeader: `<section class="hero" id="top" aria-labelledby="page-title">
      <div class="hero-media"><div class="hero-bg" aria-hidden="true"><img class="hero-bg__image" src="/assets/hero-band.webp" width="2048" height="1365" alt="" fetchpriority="high"></div><div class="crt-frame" aria-hidden="true"></div></div>
      <div class="hero-content">
        <h1 class="visually-hidden" id="page-title">${escapeHtml(site.brand)}</h1>
        <img class="hero-logo" src="/assets/logo-neon.webp" width="1200" height="412" alt="${escapeHtml(site.brand)}" fetchpriority="high" decoding="async">
        <p class="hero-kicker">${escapeHtml(locale.kicker)}</p>
        <div class="hero-actions"><a class="hero-btn" href="#music">${escapeHtml(locale.listen)}</a><a class="hero-btn hero-btn--ghost" href="#shows">${escapeHtml(locale.nav.live)}</a></div>
      </div>
    </section>`,
    afterHeader: `<div class="post-hero">
      <section class="section music-section" id="music" aria-labelledby="music-title"><div class="content">
        <h2 class="section-title" id="music-title">${escapeHtml(locale.nav.music)}</h2>
        <div class="music-layout">
          <button class="release-art" type="button" ${musicButtonAttributes(release)} aria-label="${escapeHtml(`${locale.listen}: ${release.title}`)}"><img src="${escapeHtml(release.cover)}" width="1600" height="1600" alt="${escapeHtml(`${site.brand} — ${release.title}`)}" loading="lazy" decoding="async"></button>
          <div class="release-copy"><h3>${releaseTitle}</h3><div class="action-stack"><a class="action-link" data-track="music_click" data-track-label="${escapeHtml(release.title)}" ${externalLinkAttributes(release.links.spotify)}>${escapeHtml(locale.listen)}</a><a class="text-link" href="${escapeHtml(route('music'))}">${escapeHtml(locale.allMusic)} <span aria-hidden="true">→</span></a></div></div>
        </div>
      </div></section>

      <section class="section video-section" id="video" aria-labelledby="video-title-heading"><div class="content">
        <h2 class="section-title" id="video-title-heading">${escapeHtml(locale.nav.video)}</h2>
        <a class="video-card" data-track="video_click" data-track-label="${escapeHtml(video.title)}" ${externalLinkAttributes(video.youtube)} aria-label="${escapeHtml(`${locale.view}: ${video.title}`)}"><img src="${escapeHtml(video.thumbnail)}" width="1280" height="720" alt="" loading="lazy" decoding="async"><span class="video-shade" aria-hidden="true"></span><span class="play" aria-hidden="true"></span><span class="video-title">${escapeHtml(video.title)}</span></a>
      </div></section>

      <section class="section about-section" id="about" aria-labelledby="about-title"><div class="content">
        <h2 class="section-title" id="about-title">${escapeHtml(locale.about)}</h2>
        <div class="about-layout"><p class="about-copy">${escapeHtml(press.bio[lang])}</p><img class="about-mark" src="/assets/sygnet-neon.webp" width="1200" height="1200" alt="" aria-hidden="true" loading="lazy" decoding="async"></div>
      </div></section>

      <section class="section shows-section" id="shows" aria-labelledby="shows-title"><div class="content">
        <h2 class="section-title" id="shows-title">${escapeHtml(locale.nav.live)}</h2><div class="shows-list">${renderShows({ shows, locale, lang, limit: 3, period: 'upcoming' })}</div>
        <a class="text-link section-more" href="${escapeHtml(route('live'))}">${escapeHtml(locale.allShows)} <span aria-hidden="true">→</span></a>
      </div></section>

      <section class="section press-section" id="press" aria-labelledby="press-title"><div class="content">
        <h2 class="section-title" id="press-title">${escapeHtml(locale.nav.press)}</h2>
        <div class="press-layout"><ul class="press-assets" aria-label="${escapeHtml(locale.pressMaterials)}"><li>${escapeHtml(locale.press.bio)}</li><li>${escapeHtml(locale.press.members)}</li><li>${escapeHtml(locale.press.achievements)}</li><li>${escapeHtml(locale.press.photos)}</li><li>${escapeHtml(locale.press.pressPack)}</li><li>${escapeHtml(locale.press.rider)}</li></ul><a class="action-link" href="${escapeHtml(route('press'))}">${escapeHtml(locale.pressMaterials)}</a></div>
      </div></section>
    </div>${renderMusicModal(locale, release)}`
  };
}
