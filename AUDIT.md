# Audyt strony Neon Revolution

Data: 2026-08-10

## Wynik

Warstwa wizualna została zachowana. Hero, typografia, ciemne tło velvet, układ sekcji i charakterystyczne efekty pozostały zgodne z zaakceptowanym kierunkiem. Projekt został uporządkowany tak, aby kolejne wydania, koncerty, wideo i materiały press nie wymagały kopiowania HTML między wersjami językowymi.

## Zrealizowane

- Jedno źródło danych i tłumaczeń dla całej strony PL/EN.
- Osobne trasy: `/muzyka/`, `/koncerty/`, `/aktualnosci/`, `/press/`, `/kontakt/` oraz odpowiedniki angielskie. `/wideo/` pozostaje trasą pomocniczą dostępną z landing page’a.
- Header landing page’a prowadzi wyłącznie do podstron; pozycja Wideo została z niego usunięta.
- Zachowane trzy przykładowe nadchodzące koncerty i dodane trzy przykładowe poprzednie; wszystkie są jawnie oznaczone jako `status: demo`.
- Koncerty automatycznie dzielą się według daty, a lokalizowany dzień tygodnia jest wyliczany podczas buildu.
- Dodane trzy przykładowe aktualności z kwadratowymi kartami oraz osobnymi stronami artykułów PL/EN.
- Tytuły wszystkich podstron są wycentrowane i nie zawierają eyebrow.
- Przywrócone zatwierdzone bio bez redakcyjnych zmian.
- Niedostępne akcje nie udają linków: brak pustych `href="#"` i obsługi `data-demo`.
- Pełnoekranowe menu mobilne z Escape, pułapką fokusu, blokadą przewijania, izolacją tła i minimalnymi polami dotykowymi.
- Przy 320 px: brak poziomego overflow, pełna szerokość przycisków koncertowych i menu obejmujące cały viewport.
- Nagłówek bez niechcianej cyjanowej linii; zachowane chowanie przy przewijaniu w dół i powrót przy przewijaniu w górę.
- Uporządkowany CSS: usunięta globalna warstwa scanlines i martwe reguły, CRT pozostał wyłącznie w hero.
- Meta description, Open Graph, własna grafika social, JSON-LD MusicGroup i komplet `hreflang`; canonical i sitemap aktywują się po wpisaniu domeny.
- Generowane strony 404 PL/EN, `robots.txt`, nagłówki bezpieczeństwa i cache pod Cloudflare Pages.
- Rozbudowany Press: bio, fakty, przykładowy skład, przykładowe osiągnięcia, trzy materiały graficzne i działające pliki PDF/ZIP.
- Kontakt z jednym prawdziwym adresem e-mail, telefonem i Messengerem.
- Podstrona Prywatność PL/EN oraz ustawienia zgód dostępne z każdej strony.
- Opcjonalna analityka przygotowana pod Cloudflare i blokowana do czasu konfiguracji tokenu oraz uzyskania zgody.
- Fonty przechowywane lokalnie; `Space Mono` zastąpił niepełny dla języka polskiego `Share Tech Mono`.
- Subtelny hover koncertów bez przesuwania kolumn, z odpowiednikiem dla klawiatury.
- Automatyczna kontrola 24 dokumentów HTML, assetów, plików Press, identyfikatorów, linków, bio i podstawowej semantyki.

## Otwarte przed publikacją

1. Uzupełnić właściwą domenę w `src/data/site.json`.
2. Zastąpić dane demonstracyjne: koncerty, aktualności, skład, osiągnięcia, kontakt i dokumenty Press.
3. Uzupełnić prawdziwy adres wideo i linki do biletów.
4. Potwierdzić administratora danych, dostawców oraz finalną treść informacji o prywatności.
5. Jeśli ma działać analityka, wpisać prawdziwy token Cloudflare i potwierdzić konfigurację zgód.
6. Po publikacji wykonać pomiar Core Web Vitals, audyt WCAG 2.2 AA i końcowy test urządzeń.
7. Skonfigurować Search Console, monitoring domeny oraz domenową pocztę z SPF, DKIM i DMARC.

## Weryfikacja

- `npm run build`: zaliczone,
- 24 strony PL/EN wraz z artykułami, prywatnością i 404: zaliczone,
- składnia JavaScript: zaliczona,
- desktop 1280×569: brak poziomego overflow,
- mobile 320×800: brak poziomego overflow, koncertowe CTA 281 px przy obszarze treści 281 px,
- pełnoekranowe menu: 320×800, blokada tła i docka social potwierdzone.
