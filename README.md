# Neon Revolution

Dwujęzyczna, statycznie generowana strona zespołu. Nie wymaga frameworka ani zależności produkcyjnych. Build tworzy gotowy katalog `dist/`, obecnie publikowany automatycznie przez GitHub Pages.

## Praca lokalna

Wymagany jest Node.js 20 lub nowszy.

```powershell
npm.cmd run build
npm.cmd run dev
```

Podgląd uruchamia się pod `http://localhost:4173`. `npm run verify` wykonuje build, kontrolę wszystkich tras i kontrolę składni JavaScript.

Dodatkowe polecenia:

- `npm run content:check` — sprawdza dane redakcyjne,
- `npm run content:fix` — sortuje dane i uzupełnia możliwe metadane,
- `npm run config:check` — sprawdza konfigurację Pages CMS i workflow GitHub Actions,
- `npm run links:check` — na żądanie sprawdza zewnętrzne linki zapisane w danych strony.

Build automatycznie kompresuje obrazy w katalogu wynikowym i generuje responsywne warianty WebP. Źródła w `assets/` nie są nadpisywane.

Kontrola linków nie jest częścią buildu, aby chwilowa blokada po stronie serwisu społecznościowego lub streamingowego nie zatrzymywała publikacji.

## Panel CMS i edycja treści

Zespół może zarządzać treściami przez [Pages CMS](https://app.pagescms.org). Konfiguracja panelu znajduje się w `.pages.yml`, a krótka instrukcja uruchomienia i obsługi w `docs/CMS-INSTRUKCJA.md`. Zapisane zmiany trafiają do `main` i automatycznie uruchamiają kontrolę oraz publikację GitHub Pages.

Treści można również edytować bezpośrednio w plikach:

- `src/data/shows.json` — koncerty; obecne trzy nadchodzące i trzy poprzednie wpisy są danymi przykładowymi. Dzień tygodnia oraz podział na przyszłe/archiwalne powstają automatycznie z pola `date`,
- `src/data/releases.json` — wydania i linki streamingowe,
- `src/data/videos.json` — wideo i miniatury,
- `src/data/gallery.json` — zdjęcia galerii oraz miejsca na przyszłe materiały,
- `src/data/news.json` — aktualności; obecnie zawiera trzy przykładowe wpisy PL/EN,
- `src/data/press.json` — bio, skład, osiągnięcia oraz linki do materiałów Press,
- `src/data/site.json` — profile, kontakty, domena i grafika udostępniania,
- `src/i18n/pl.json` oraz `src/i18n/en.json` — teksty interfejsu i bio.

Nie edytuj `dist/`; ten katalog jest odtwarzany przy każdym buildzie. Komponenty HTML są w `src/components/`, widoki w `src/pages/`, CSS w `src/styles/site.css`, a zachowanie przeglądarkowe w `src/client/site.js`.

Główna nawigacja prowadzi do osobnych stron: `/muzyka/`, `/koncerty/`, `/aktualnosci/`, `/galeria/`, `/press/` i `/kontakt/`. Podstrona `/wideo/` pozostaje dostępna poza headerem. Informacja o prywatności jest dostępna pod `/prywatnosc/` oraz `/en/privacy/`.

Przykładowe pliki Press są generowane przez `scripts/generate_press_files.py` do `output/pdf/`; zbiorczy ZIP znajduje się w `output/press/`. Zwykły build tylko kopiuje gotowe pliki, dzięki czemu publikacja nie wymaga Pythona.

## Publikacja

Aktualny adres testowo-produkcyjny to `https://jahulec.github.io/neonrevolutiontest1/`. Push do `main` uruchamia workflow `.github/workflows/deploy-pages.yml`, który buduje, sprawdza i publikuje stronę na GitHub Pages.

## Opcjonalny Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

Plik `wrangler.jsonc` wskazuje ten sam katalog wyjściowy. Nagłówki bezpieczeństwa i cache znajdują się w `public/_headers` i są kopiowane do buildu.

Przy podpinaniu domeny zmień `siteUrl` w `src/data/site.json` z obecnego adresu GitHub Pages na adres docelowy. Generator zaktualizuje canonicale, absolutne `hreflang`, mapy witryny, robots, dane strukturalne i karty social.

Opcjonalna analityka jest bezpiecznie wyłączona, dopóki w `site.analytics.token` nie zostanie podany prawdziwy token Cloudflare Web Analytics. Po jego uzupełnieniu skrypt uruchomi analitykę dopiero po zgodzie użytkownika. Ustawienia prywatności są zawsze dostępne w footerze.

## Dokumentacja

Instrukcja CMS znajduje się w `docs/CMS-INSTRUKCJA.md`. Strategię widoczności opisuje `docs/SEO-AI-VISIBILITY.md`, plan analityki `docs/ANALYTICS-PLAN.md`, checklista końcowa jest w `docs/GO-LIVE-CHECKLIST.md`, a pełny stan gotowości w `docs/PRODUCTION-READINESS.md`. Strona pozostaje statyczna i lekka; logowanie oraz formularze redakcyjne obsługuje zewnętrzny Pages CMS.
