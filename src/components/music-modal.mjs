import { escapeHtml } from '../lib/html.mjs';

export function musicButtonAttributes(release) {
  return `data-music-open data-release-title="${escapeHtml(release.title)}" data-release-cover="${escapeHtml(release.cover)}" data-release-spotify="${escapeHtml(release.links.spotify ?? '')}" data-release-youtube="${escapeHtml(release.links.youtube ?? '')}"`;
}

export function renderMusicModal(locale) {
  return `<dialog class="music-modal" data-music-modal aria-labelledby="music-modal-title">
    <div class="music-modal__panel">
      <button class="modal-close" type="button" data-modal-close aria-label="${escapeHtml(locale.close)}">×</button>
      <img class="music-modal__cover" data-music-cover src="" alt="" width="1600" height="1600">
      <div class="music-modal__copy">
        <p>${escapeHtml(locale.musicModal.choose)}</p>
        <h2 id="music-modal-title" data-music-title></h2>
        <div class="music-modal__links">
          <a class="platform-link platform-link--spotify" data-music-spotify target="_blank" rel="noopener noreferrer">Spotify <span aria-hidden="true">↗</span></a>
          <a class="platform-link platform-link--youtube" data-music-youtube target="_blank" rel="noopener noreferrer">YouTube <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </div>
  </dialog>`;
}
