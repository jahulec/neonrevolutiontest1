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
- zarządzać wydaniami, okładkami oraz linkami Spotify i YouTube,
- zarządzać filmami i wybierać materiał wyróżniony na stronie głównej,
- dodawać i usuwać zdjęcia galerii,
- edytować opis zespołu, skład, osiągnięcia i linki do materiałów prasowych,
- zmieniać dane kontaktowe oraz profile społecznościowe.

Wygląd, menu, kod, tłumaczenia interfejsu i ustawienia techniczne nie są dostępne w panelu. Chroni to stronę przed przypadkowym uszkodzeniem.

## Publikacja

Zapis w panelu tworzy commit na `main`. GitHub Actions automatycznie sprawdza kompletność strony i publikuje nową wersję w GitHub Pages. Zwykle trwa to około 1–3 minut. Jeśli kontrola wykryje błąd, dotychczasowa opublikowana wersja pozostaje dostępna.

Przy koncercie podaje się tylko datę `RRRR-MM-DD`; dzień tygodnia, format `DD.MM.RRRR` oraz podział na nadchodzące i poprzednie koncerty powstają automatycznie. Przy telefonie wystarczy czytelny zapis ze spacjami — poprawny link `tel:` również powstaje automatycznie.

## Zasady dla zdjęć

Nowe obrazy trafiają do `assets/uploads/`. Zalecany format to WebP albo JPG, a rozsądny rozmiar pojedynczego pliku to maksymalnie około 2 MB. Pełne materiały prasowe nadal należy przechowywać w Google Drive i podawać w Press jako link do folderu.
