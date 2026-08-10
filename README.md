# Neon Revolution

Dwujęzyczna, statycznie generowana strona zespołu. Nie wymaga frameworka ani zależności produkcyjnych. Build tworzy gotowy katalog `dist/` przeznaczony do publikacji przez Cloudflare Pages.

## Praca lokalna

Wymagany jest Node.js 20 lub nowszy.

```powershell
npm.cmd run build
npm.cmd run dev
```

Podgląd uruchamia się pod `http://localhost:4173`. `npm run verify` wykonuje build, kontrolę wszystkich tras i kontrolę składni JavaScript.

## Gdzie edytować treść

- `src/data/shows.json` — koncerty; obecne trzy nadchodzące i trzy poprzednie wpisy są danymi przykładowymi. Dzień tygodnia oraz podział na przyszłe/archiwalne powstają automatycznie z pola `date`,
- `src/data/releases.json` — wydania i linki streamingowe,
- `src/data/videos.json` — wideo i miniatury,
- `src/data/news.json` — aktualności; obecnie zawiera trzy przykładowe wpisy PL/EN,
- `src/data/press.json` — bio, skład, osiągnięcia, zdjęcia, grafiki i pliki Press,
- `src/data/site.json` — profile, kontakty, domena i grafika udostępniania,
- `src/i18n/pl.json` oraz `src/i18n/en.json` — teksty interfejsu i bio.

Nie edytuj `dist/`; ten katalog jest odtwarzany przy każdym buildzie. Komponenty HTML są w `src/components/`, widoki w `src/pages/`, CSS w `src/styles/site.css`, a zachowanie przeglądarkowe w `src/client/site.js`.

Główna nawigacja prowadzi do osobnych stron: `/muzyka/`, `/koncerty/`, `/aktualnosci/`, `/press/` i `/kontakt/`. Podstrona `/wideo/` pozostaje dostępna z sekcji wideo na landing page’u, ale nie występuje w headerze. Informacja o prywatności jest dostępna pod `/prywatnosc/` oraz `/en/privacy/`.

Przykładowe pliki Press są generowane przez `scripts/generate_press_files.py` do `output/pdf/`; zbiorczy ZIP znajduje się w `output/press/`. Zwykły build tylko kopiuje gotowe pliki, dzięki czemu publikacja nie wymaga Pythona.

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

Plik `wrangler.jsonc` wskazuje ten sam katalog wyjściowy. Nagłówki bezpieczeństwa i cache znajdują się w `public/_headers` i są kopiowane do buildu.

Przed podpięciem domeny uzupełnij `siteUrl` w `src/data/site.json`. Grafika Open Graph jest już przygotowana. Po wpisaniu domeny generator doda canonicale, absolutne `hreflang`, mapę witryny i pełną kartę social.

Opcjonalna analityka jest bezpiecznie wyłączona, dopóki w `site.analytics.token` nie zostanie podany prawdziwy token Cloudflare Web Analytics. Po jego uzupełnieniu skrypt uruchomi analitykę dopiero po zgodzie użytkownika. Ustawienia prywatności są zawsze dostępne w footerze.

## Dalsza rozbudowa

Plan prostego panelu do koncertów i aktualności jest opisany w `docs/CONTENT-EDITOR-PLAN.md`. Plan analityki znajduje się w `docs/ANALYTICS-PLAN.md`, a końcowa lista publikacyjna w `docs/GO-LIVE-CHECKLIST.md`. Panel nie jest obecnie wdrożony; kod pozostaje statyczny, lekki i bez warstwy logowania.
