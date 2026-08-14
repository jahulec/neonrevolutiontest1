import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fix = process.argv.includes('--fix');
const readJson = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const writeJson = async (file, data) => writeFile(path.join(root, file), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
const slugify = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const errors = [];
const changed = [];
const site = await readJson('src/data/site.json');
const press = await readJson('src/data/press.json');

const datasets = {
  shows: ['src/data/shows.json', await readJson('src/data/shows.json')],
  news: ['src/data/news.json', await readJson('src/data/news.json')],
  releases: ['src/data/releases.json', await readJson('src/data/releases.json')],
  videos: ['src/data/videos.json', await readJson('src/data/videos.json')],
  gallery: ['src/data/gallery.json', await readJson('src/data/gallery.json')]
};

for (const [field, required] of [['heroBackground', true], ['pageBackgroundDesktop', true], ['pageBackgroundMobile', false], ['socialShareImage', false]]) {
  const value = site.visuals?.[field];
  if (!value && required) {
    errors.push(`Wygląd: pole ${field} jest wymagane.`);
    continue;
  }
  if (!value) continue;
  if (!/^\/assets\/.+\.(?:jpe?g|png|webp)$/i.test(value)) {
    errors.push(`Wygląd: ${field} musi wskazywać obraz JPG, PNG lub WebP w katalogu /assets/.`);
    continue;
  }
  try {
    const metadata = await sharp(path.join(root, value.slice(1))).metadata();
    if (!metadata.width || !metadata.height) errors.push(`Wygląd: nie można odczytać wymiarów ${field}.`);
    if (field === 'heroBackground' && metadata.width < 1200) errors.push('Wygląd: zdjęcie hero powinno mieć co najmniej 1200 px szerokości.');
    if (field === 'socialShareImage' && (metadata.width < 1200 || metadata.height < 630 || metadata.width / metadata.height < 1.8 || metadata.width / metadata.height > 2)) {
      errors.push('Wygląd: grafika udostępniania powinna mieć proporcje zbliżone do 1200 × 630 px i nie może być mniejsza.');
    }
  } catch {
    errors.push(`Wygląd: plik ${value} nie istnieje lub nie jest poprawnym obrazem.`);
  }
}

for (const show of datasets.shows[1]) {
  if (!show.id && fix) show.id = slugify(`${show.pl?.city}-${show.date}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(show.date ?? '')) errors.push(`Koncert ${show.id ?? '(bez ID)'}: niepoprawna data.`);
  if (!show.pl?.city || !show.en?.city || !show.pl?.venue || !show.en?.venue) errors.push(`Koncert ${show.id}: uzupełnij miasto i miejsce PL/EN.`);
}
datasets.shows[1].sort((a, b) => a.date.localeCompare(b.date));

for (const entry of datasets.news[1]) {
  if (!entry.id && fix) entry.id = slugify(entry.pl?.title);
  if (!entry.slug && fix) entry.slug = slugify(entry.pl?.title);
  if (!entry.pl?.title || !entry.en?.title || !entry.pl?.summary || !entry.en?.summary) errors.push(`Aktualność ${entry.id}: uzupełnij tytuł i zajawkę PL/EN.`);
}
datasets.news[1].sort((a, b) => b.date.localeCompare(a.date));

for (const release of datasets.releases[1]) {
  if (!release.id && fix) release.id = slugify(release.title);
  if (release.date && fix) release.year = release.date.slice(0, 4);
  if (!release.links?.spotify || !release.links?.youtube) errors.push(`Wydanie ${release.id}: brakuje Spotify lub YouTube.`);
}

for (const video of datasets.videos[1]) if (!video.id && fix) video.id = slugify(video.title);
datasets.videos[1].sort((a, b) => b.date.localeCompare(a.date));

for (const item of datasets.gallery[1]) {
  if (item.status !== 'real') continue;
  if (!item.image || !item.alt?.pl || !item.alt?.en) errors.push(`Galeria ${item.id}: zdjęcie i alt PL/EN są wymagane.`);
  if (fix && item.image?.startsWith('/assets/')) {
    const metadata = await sharp(path.join(root, item.image.slice(1))).metadata();
    if (metadata.width && metadata.height) { item.width = metadata.width; item.height = metadata.height; }
  }
}

if (site.legal?.status === 'real' && (!site.legal.controller || /przykładow/i.test(site.legal.controller) || !site.legal.address)) {
  errors.push('Prywatność: przed zatwierdzeniem dokumentu uzupełnij prawdziwego administratora i adres.');
}
if (site.finalApprovals?.releaseInfo && datasets.releases[1].some((release) => !release.date)) {
  errors.push('Zatwierdzenia: nie wszystkie wydawnictwa mają dokładną datę premiery.');
}
if (site.finalApprovals?.imageRights) {
  if (!site.visuals?.rightsConfirmed) errors.push('Zatwierdzenia: prawa do tła i hero nie są potwierdzone.');
  if (datasets.gallery[1].some((item) => item.status === 'real' && !item.rightsConfirmed)) errors.push('Zatwierdzenia: nie wszystkie zdjęcia galerii mają potwierdzone prawa.');
}
if (site.finalApprovals?.pressMaterials && press.downloads.some((item) => item.status !== 'real')) {
  errors.push('Zatwierdzenia: co najmniej jeden materiał Press nadal ma status roboczy.');
}

for (const [name, [file, data]] of Object.entries(datasets)) {
  const ids = data.map((item) => item.id).filter(Boolean);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) errors.push(`${name}: powtórzone ID: ${[...new Set(duplicates)].join(', ')}`);
  if (fix) { await writeJson(file, data); changed.push(file); }
}

if (datasets.releases[1].filter((item) => item.featured).length !== 1) errors.push('Muzyka: dokładnie jedno wydanie musi być wyróżnione.');
if (datasets.videos[1].filter((item) => item.featured).length !== 1) errors.push('Wideo: dokładnie jeden film musi być wyróżniony.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(fix ? `Treści uporządkowane: ${changed.join(', ')}` : 'Kontrola treści zakończona bez błędów.');
}
