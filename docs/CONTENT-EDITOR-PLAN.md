# Plan przyszłego systemu edycji treści

Status: koncepcja, bez wdrożenia.

## Rekomendacja

Po uruchomieniu strony warto dodać lekki panel Git-based CMS, a nie bazę danych i własny backend. Najlepiej pasuje Pages CMS: edytuje pliki bezpośrednio w repozytorium GitHub, nie tworzy osobnej bazy i wymaga konfiguracji w jednym pliku `.pages.yml`. To odpowiada obecnej architekturze strony i utrzymuje historię zmian w Git. Źródło: [oficjalna dokumentacja Pages CMS](https://pagescms.org/docs/).

Nie wdrażamy go teraz. Najpierw zespół powinien używać strony i potwierdzić, kto będzie edytorem, jak często pojawiają się zmiany oraz czy publikacja ma następować od razu, czy po akceptacji.

## Docelowy zakres panelu

Pierwszy etap powinien udostępniać wyłącznie:

- koncerty: data, miasto PL/EN, miejsce PL/EN, godzina, link do biletów i status publikacji,
- aktualności: tytuł PL/EN, skrót, treść, data, grafika, slug i status publikacji,
- wydania i wideo: tytuł, okładka lub miniatura oraz linki,
- materiały press i adresy kontaktowe.

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
4. Przy treściach koncertowych można publikować bezpośrednio; przy aktualnościach lepiej użyć pull requestu i akceptacji.
5. Cloudflare Pages uruchamia `npm run build`; niespójna treść zatrzymuje publikację.

Pages CMS przechowuje konfigurację treści w `.pages.yml` i zapisuje zmiany do GitHub, więc nie zastępuje generatora ani hostingu. Szczegóły konfiguracji: [Pages CMS — configuration](https://pagescms.org/docs/configuration/).

## Alternatywy

- Decap CMS jest open source i daje panel pod `/admin/`, lecz z backendem GitHub wymaga konfiguracji OAuth lub pośrednika uwierzytelniającego. Na Cloudflare oznacza to dodatkowy Worker i sekret, czyli więcej utrzymania. Źródło: [Decap CMS — backends](https://decapcms.org/docs/backends-overview/).
- CloudCannon oferuje dopracowaną edycję wizualną i synchronizację Git, ale jest usługą płatną; ma sens, jeśli zespół będzie potrzebował bogatszego workflow i wsparcia. Źródła: [CloudCannon Git-based CMS](https://cloudcannon.com/git-cms/) i [aktualny cennik](https://cloudcannon.com/pricing/).

## Decyzje przed wdrożeniem

- prywatne czy publiczne repozytorium,
- jedna osoba publikująca czy workflow z akceptacją,
- osobne pola PL/EN czy możliwość publikacji tylko jednego języka,
- automatyczne ukrywanie minionych koncertów czy ręczne archiwum,
- limity i obróbka przesyłanych zdjęć,
- kto ma uprawnienia do usuwania treści.

Po tych decyzjach integracja powinna być małym, oddzielnym etapem: konfiguracja kolekcji, walidacja pól, test na branchu preview i krótkie szkolenie zespołu.
