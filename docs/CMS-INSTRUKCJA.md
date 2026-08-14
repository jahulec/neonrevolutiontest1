# Panel treści Neon Revolution

Panel działa w usłudze [Pages CMS](https://app.pagescms.org). Nie ma osobnego hasła zapisanego w stronie ani publicznego panelu administracyjnego. Treści są zapisywane bezpośrednio w repozytorium GitHub, a każda zmiana ma historię i może zostać cofnięta.

## Pierwsze uruchomienie

1. Właściciel repozytorium otwiera `https://app.pagescms.org` i wybiera logowanie przez GitHub.
2. Przy pierwszym użyciu zezwala aplikacji Pages CMS na dostęp wyłącznie do repozytorium `jahulec/neonrevolutiontest1`.
3. Z listy repozytoriów wybiera `neonrevolutiontest1` oraz gałąź `main`.
4. Panel automatycznie odczyta konfigurację z pliku `.pages.yml`.

Można też zaprosić redaktorów e-mailem z poziomu Pages CMS. Wtedy nie muszą mieć własnego konta GitHub. Każda osoba powinna korzystać z własnego konta — nie należy udostępniać wspólnego hasła.

## Co można zmieniać

- dodawać, edytować, usuwać i zmieniać kolejność koncertów,
- dodawać, edytować i usuwać aktualności wraz z wersją polską i angielską,
- zarządzać wydaniami, datami premier, okładkami oraz linkami Spotify, YouTube i Apple Music,
- zarządzać filmami i wybierać materiał wyróżniony na stronie głównej,
- dodawać i usuwać zdjęcia galerii,
- edytować opis zespołu, skład, osiągnięcia, niezależne publikacje i linki do materiałów prasowych,
- zmieniać dane kontaktowe oraz profile społecznościowe.
- wymieniać zdjęcie hero oraz tło strony osobno dla komputera i telefonu.

## Gdzie znaleźć poszczególne dane

- **Koncerty** — daty, miasta, miejsca, godziny, bilety i status prawdziwy/przykładowy.
- **Aktualności** — wpisy PL/EN, zdjęcia, daty oraz linki do muzyki lub koncertów.
- **Muzyka** — okładki, dokładne daty premier i linki Spotify, YouTube oraz Apple Music.
- **Wideo** — filmy, miniatury, daty i wybór filmu wyróżnionego na stronie głównej.
- **Galeria** — zdjęcia, niewidoczne opisy alternatywne, autor/fotograf i potwierdzenie prawa do publikacji.
- **Press** — opis zespołu, skład, osiągnięcia, publikacje zewnętrzne, folder zdjęć/grafik, opcjonalny Press Pack i rider.
- **Wygląd, kontakt i profile → Grafiki tła** — hero, tło desktop/mobile, grafika 1200 × 630 px do udostępniania, autorzy i prawa do grafik.
- **Wygląd, kontakt i profile → Dane kontaktowe / Profile społecznościowe** — telefon, e-mail, Messenger oraz oficjalne profile.
- **Wygląd, kontakt i profile → Informacja o prywatności** — administrator, adres, e-mail i status zatwierdzenia dokumentu.
- **Wygląd, kontakt i profile → Zatwierdzenia przed publikacją** — końcowa checklista akceptacji bio, składu, osiągnięć, kontaktów, wydawnictw, zdjęć i Press.

Wygląd, menu, kod, tłumaczenia interfejsu i ustawienia techniczne nie są dostępne w panelu. Chroni to stronę przed przypadkowym uszkodzeniem.

## Publikacja

Zapis w panelu tworzy commit na `main`. GitHub Actions automatycznie sprawdza kompletność strony i publikuje nową wersję w GitHub Pages. Zwykle trwa to około 1–3 minut. Jeśli kontrola wykryje błąd, dotychczasowa opublikowana wersja pozostaje dostępna.

Przy koncercie podaje się datę `RRRR-MM-DD` oraz osobno godzinę bram i startu. Dzień tygodnia, format `DD.MM.RRRR`, etykieta godzin oraz podział na nadchodzące i poprzednie koncerty powstają automatycznie. Przy telefonie wystarczy czytelny zapis ze spacjami — poprawny link `tel:` również powstaje automatycznie.

W bocznym menu panelu znajduje się akcja „Sprawdź i uporządkuj treści”. Uruchamia ona bezpieczny workflow, który sortuje koncerty i aktualności, uzupełnia wymiary galerii, sprawdza identyfikatory, daty, linki, kompletność wersji PL/EN oraz wykonuje pełny build. Jeżeli dane nie wymagają korekty, nie powstaje pusty commit.

## Zasady dla zdjęć

Nowe obrazy trafiają do `assets/uploads/`; panel akceptuje JPG, PNG i WebP oraz bezpiecznie normalizuje nazwy. Przy każdym buildzie oryginały pozostają nienaruszone, natomiast wersja publikowana jest automatycznie kompresowana i otrzymuje warianty 480, 960 i 1440 px. Przeglądarka pobiera rozmiar dopasowany do ekranu. Nadal warto unikać źródeł większych niż około 8 MB. Pełne materiały prasowe należy przechowywać w Google Drive i podawać w Press jako link do folderu.

Grafiki dostarczone przez grafika zmienia się w sekcji „Wygląd, kontakt i profile” → „Grafiki tła”. Zalecenia widoczne są również bezpośrednio pod każdym polem w CMS: hero 2400 × 1600 px (minimum 1920 × 1080), długie tło desktop 1920 × 4500–5000 px, opcjonalne tło mobile 1080 × 3000–4000 px oraz grafika social 1200 × 630 px. Ważne elementy hero powinny pozostać w środkowych 60% kadru. Zmiana pliku automatycznie zmienia wersję arkusza CSS, więc przeglądarka nie pozostawi starego tła w pamięci podręcznej.

Po większej aktualizacji można lokalnie uruchomić `npm run links:check`, aby sprawdzić odnośniki do serwisów streamingowych, profili, biletów i źródeł zewnętrznych.
