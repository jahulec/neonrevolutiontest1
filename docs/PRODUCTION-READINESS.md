# Gotowość produkcyjna

Stan na 14 sierpnia 2026 r.

## Zrobione

- osobne, dwujęzyczne podstrony oraz działający Pages CMS,
- responsywny interfejs, menu mobilne, modale galerii i muzyki,
- canonicale, `hreflang`, kompletne metadane Open Graph i Twitter,
- `sitemap.xml` z obrazami i wideo, kanały Atom PL/EN oraz `robots.txt` z jawnymi regułami dla wyszukiwarek i botów AI,
- dane strukturalne Schema.org dla zespołu, witryny, muzyki, koncertów, galerii, wideo i artykułów,
- pliki pomocnicze `llms.txt`, `llms-full.txt`, `band.json`, manifest aplikacji, `humans.txt` i `security.txt`,
- spójna encja zespołu: gatunki, pochodzenie, profile oficjalne, skład, osiągnięcia i niezależne źródła prasowe,
- przykładowe koncerty i aktualności oznaczone jako demonstracyjne, wyłączone z indeksowania i danych rozszerzonych,
- semantyczny HTML, obsługa klawiatury, focus trap, reduced motion i alternatywne opisy zdjęć,
- automatyczne testy wszystkich tras, linków wewnętrznych, metadanych, map witryny, JSON-LD, konfiguracji CMS i duplikatów oraz osobna kontrola linków zewnętrznych,
- automatyczna kompresja obrazów i warianty responsywne 480/960/1440 px; build zmniejsza odpowiedniki źródeł z około 3271 KiB do 2235 KiB,
- automatyczne sortowanie treści, tworzenie identyfikatorów, walidacja dat i wersji językowych, wymiary galerii oraz dzień tygodnia i etykieta godzin koncertu wyliczane z danych,
- automatyczny audyt WCAG 2.2 AA podstawowych tras bez wykrytych błędów,
- rygorystyczna Content Security Policy w HTML, bezpieczne odnośniki zewnętrzne i nagłówki przygotowane dla hostingu, który je obsługuje,
- mechanizm zgody na analitykę, wycofanie zgody i respektowanie Global Privacy Control; analityka pozostaje wyłączona bez tokenu,
- informacja o prywatności rozszerzona o wymagane obszary i bezpiecznie oznaczona jako wersja robocza poza indeksem,
- automatyczny build, kontrola jakości i publikacja GitHub Pages po zmianach w `main`.

## Wymaga danych lub dostępu od właściciela

- domena docelowa, DNS, wariant `www` i przekierowania,
- pełna nazwa lub imię i nazwisko administratora danych oraz adres do informacji o prywatności,
- zatwierdzenie informacji o prywatności przez osobę odpowiedzialną za zgodność prawną,
- potwierdzenie albo podmiana demonstracyjnych koncertów i aktualności,
- ostateczne prawa, autorzy i zakres użycia zdjęć oraz materiałów Press,
- konto analityczne i token, jeśli zespół chce zbierać statystyki,
- dostęp do Google Search Console, Bing Webmaster Tools i profilu wiedzy Google,
- skrzynka w domenie wraz z rekordami SPF, DKIM i DMARC,
- monitoring dostępności oraz obserwacja rzeczywistych Core Web Vitals po uruchomieniu domeny.

Do czasu uzupełnienia danych prawnych `legal.status` pozostaje ustawione na `demo`, a strona Prywatność ma `noindex`. Po podaniu domeny trzeba zmienić `siteUrl`, ponownie zbudować stronę i zweryfikować publiczne adresy w narzędziach wyszukiwarek.

## SEO i wyniki generowane przez AI

Strona ma czytelną strukturę, opisowe tytuły, naturalne klastry tematyczne, treść dostępną w HTML, spójne dane encji i wskazania niezależnych źródeł. To są właściwe podstawy zarówno dla klasycznego wyszukiwania, jak i funkcji AI w Google. Dodane `llms.txt`, `llms-full.txt` i `band.json` są pomocniczym, maszynowo czytelnym opisem, ale nie stanowią sygnału rankingowego deklarowanego przez Google. Nie istnieje specjalny znacznik gwarantujący obecność w podsumowaniu AI; ostateczna widoczność zależy od indeksacji, aktualnych treści, rozpoznawalności encji i zgodnych zewnętrznych źródeł.
