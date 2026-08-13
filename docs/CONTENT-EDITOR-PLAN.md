# Plan przyszłego systemu edycji treści

Status: pierwszy etap wdrożony.

## Rekomendacja: Pages CMS

Najlepiej pasuje lekki panel Git-based CMS, bez bazy danych i własnego backendu. Rekomendowany Pages CMS edytuje pliki bezpośrednio w repozytorium GitHub, przechowuje konfigurację w jednym pliku `.pages.yml` i zachowuje pełną historię zmian. Zespół dostaje zwykłe formularze, a obecny generator i GitHub Pages pozostają bez zmian. Źródło: [oficjalna dokumentacja Pages CMS](https://pagescms.org/docs/configuration/).

Pierwszy etap jest skonfigurowany w `.pages.yml`. Panel działa pod `https://app.pagescms.org`, a zapis publikuje zmianę przez istniejący workflow GitHub Pages. Instrukcja dla zespołu znajduje się w `docs/CMS-INSTRUKCJA.md`.

## Docelowy zakres panelu

Pierwszy etap powinien udostępniać wyłącznie:

- koncerty: data, miasto PL/EN, miejsce PL/EN, godzina, link do biletów i status publikacji,
- aktualności: tytuł PL/EN, skrót, treść, data, grafika, slug i status publikacji,
- wydania: tytuł, rok, okładka oraz linki Spotify i YouTube,
- wideo: tytuł, data, miniatura, link YouTube i przełącznik „wyróżnione na stronie głównej”,
- galeria: zdjęcie, opis PL/EN, kolejność i status publikacji,
- press: skład, osiągnięcia, link do folderu Google Drive i rider,
- dane kontaktowe i profile społecznościowe.

Teksty interfejsu, układ strony i style powinny pozostać poza panelem, żeby przypadkowa edycja nie mogła uszkodzić projektu.

## Przygotowanie już wykonane

- Dane koncertów, aktualności, wydań, wideo i press są oddzielone od szablonów w `src/data/`.
- Dzień tygodnia i status koncertu jako nadchodzący/poprzedni wynikają z daty, więc przyszły panel nie powinien udostępniać ich jako ręcznych pól.
- Teksty językowe są oddzielone w `src/i18n/`.
- Build sprawdza brak pustych linków, duplikatów ID i brakujące assety.
- Cloudflare Pages może przebudować stronę automatycznie po zapisie zmiany w GitHub.

## Proponowany proces publikacji

1. Edytor loguje się kontem dopuszczonym do repozytorium.
2. Dodaje lub zmienia wpis w formularzu.
3. Zapis tworzy zmianę w Git.
4. Na początek wszystkie zmiany trafiają bezpośrednio do `main`; Git zawsze pozwala cofnąć pomyłkę.
5. GitHub Actions uruchamia `npm run build` i publikuje GitHub Pages; niespójna treść zatrzymuje publikację.

Pages CMS przechowuje konfigurację treści w `.pages.yml` i zapisuje zmiany do GitHub, więc nie zastępuje generatora ani hostingu. Każdy redaktor powinien mieć osobne konto GitHub i dostęp do repozytorium; nie należy udostępniać wspólnego hasła.

## Wdrożony pierwszy etap

1. Dodano `.pages.yml` z formularzami dla koncertów, aktualności, muzyki, wideo, galerii, Press i kontaktu.
2. Pola techniczne oraz kod są poza panelem; dzień tygodnia, format daty i link telefonu są generowane automatycznie.
3. Nowe obrazy trafiają do `assets/uploads/`; pliki prasowe w pełnej rozdzielczości pozostają w Google Drive.
4. Formularze sprawdzają wymagane pola, format slugów, dat, godzin i linków.
5. Do wykonania organizacyjnie pozostaje pierwsze logowanie właściciela, zaproszenie redaktorów i krótkie szkolenie.

## Alternatywy

- Decap CMS jest open source i daje panel pod `/admin/`, lecz z backendem GitHub wymaga konfiguracji OAuth lub pośrednika uwierzytelniającego. Na Cloudflare oznacza to dodatkowy Worker i sekret, czyli więcej utrzymania. Źródło: [Decap CMS — backends](https://decapcms.org/docs/backends-overview/).
- CloudCannon oferuje dopracowaną edycję wizualną i synchronizację Git, ale jest usługą płatną; ma sens, jeśli zespół będzie potrzebował bogatszego workflow i wsparcia. Źródła: [CloudCannon Git-based CMS](https://cloudcannon.com/git-cms/) i [aktualny cennik](https://cloudcannon.com/pricing/).

## Decyzje przed dalszą rozbudową

- prywatne czy publiczne repozytorium,
- jedna osoba publikująca czy workflow z akceptacją,
- osobne pola PL/EN czy możliwość publikacji tylko jednego języka,
- automatyczne ukrywanie minionych koncertów czy ręczne archiwum,
- limity i obróbka przesyłanych zdjęć,
- kto ma uprawnienia do usuwania treści.

Obecna wersja zapisuje bezpośrednio do `main`, zgodnie z prostym procesem publikacji. Workflow z akceptacją można dołożyć później, jeśli zespół będzie go rzeczywiście potrzebował.
