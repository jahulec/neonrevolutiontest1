import { escapeHtml } from '../lib/html.mjs';

export function musicButtonAttributes(release) {
  return `data-music-open data-release-title="${escapeHtml(release.title)}" data-release-cover="${escapeHtml(release.cover)}" data-release-spotify="${escapeHtml(release.links.spotify ?? '')}" data-release-youtube="${escapeHtml(release.links.youtube ?? '')}" data-release-apple="${escapeHtml(release.links.appleMusic ?? '')}"`;
}

export function renderMusicModal(locale, initialRelease) {
  const spotify = initialRelease?.links.spotify ?? '';
  const youtube = initialRelease?.links.youtube ?? '';
  const apple = initialRelease?.links.appleMusic ?? '';
  return `<dialog class="music-modal" data-music-modal aria-labelledby="music-modal-title">
    <div class="music-modal__panel">
      <button class="modal-close" type="button" data-modal-close aria-label="${escapeHtml(locale.close)}">×</button>
      <img class="music-modal__cover" data-music-cover src="${escapeHtml(initialRelease?.cover ?? '/assets/sygnet-neon.webp')}" alt="${escapeHtml(initialRelease?.title ?? '')}" width="1600" height="1600" loading="lazy" decoding="async">
      <div class="music-modal__copy">
        <p>${escapeHtml(locale.musicModal.choose)}</p>
        <h2 id="music-modal-title" data-music-title>${escapeHtml(initialRelease?.title ?? locale.nav.music)}</h2>
        <div class="music-modal__links">
          <a class="platform-link platform-link--spotify" data-music-spotify href="${escapeHtml(spotify)}" target="_blank" rel="noopener noreferrer">Spotify <span aria-hidden="true">↗</span></a>
          <a class="platform-link platform-link--youtube" data-music-youtube href="${escapeHtml(youtube)}" target="_blank" rel="noopener noreferrer">YouTube <span aria-hidden="true">↗</span></a>
          <a class="platform-link platform-link--apple" data-music-apple href="${escapeHtml(apple)}" target="_blank" rel="noopener noreferrer">Apple Music <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </div>
  </dialog>`;
}
