# Gotowość produkcyjna

Stan na 13 sierpnia 2026 r.

## Zrobione

- osobne, dwujęzyczne podstrony oraz działający Pages CMS,
- responsywny interfejs, menu mobilne, modale galerii i muzyki,
- canonicale, `hreflang`, kompletne metadane Open Graph i Twitter,
- `sitemap.xml`, sitemap obrazów oraz `robots.txt`,
- dane strukturalne Schema.org dla zespołu, witryny, muzyki, koncertów, galerii, wideo i artykułów,
- przykładowe koncerty i aktualności oznaczone jako demonstracyjne, wyłączone z indeksowania i danych rozszerzonych,
- semantyczny HTML, obsługa klawiatury, focus trap, reduced motion i alternatywne opisy zdjęć,
- automatyczne testy wszystkich tras, linków, metadanych, map witryny, JSON-LD i duplikatów,
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

Strona ma czytelną strukturę, opisowe tytuły, treść dostępną w HTML, spójne dane encji i wskazania źródeł zewnętrznych. To są właściwe podstawy zarówno dla klasycznego wyszukiwania, jak i funkcji AI w Google. Nie ma specjalnego znacznika gwarantującego obecność w podsumowaniu AI; ostateczna widoczność zależy od indeksacji, jakości treści, rozpoznawalności encji i zewnętrznych źródeł. Nie dodano `llms.txt`, ponieważ Google nie wskazuje go jako wymagania dla AI Overviews lub AI Mode.
