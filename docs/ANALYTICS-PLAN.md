# Plan analityki

## Stan obecny

Strona jest przygotowana pod Cloudflare Web Analytics, ale analityka pozostaje wyłączona do czasu wpisania prawdziwego tokenu w `src/data/site.json`. Po konfiguracji skrypt może zostać załadowany dopiero po wyborze „Akceptuję analitykę”. Odmowa nie ogranicza działania strony, a wybór można zmienić w footerze.

Interaktywne elementy mają przygotowane oznaczenia zdarzeń:

- `music_click` — przejścia do odtwarzania muzyki,
- `ticket_click` — przejścia do sprzedaży biletów,
- `press_download` — pobrania materiałów prasowych,
- `contact_click` — e-mail, telefon i Messenger.

Cloudflare Web Analytics służy do podstawowego ruchu i Core Web Vitals, ale obecnie nie obsługuje własnych zdarzeń ani parametrów UTM. Oznaczenia w HTML są więc gotowe na późniejsze podłączenie narzędzia obsługującego konwersje, jeśli zespół rzeczywiście będzie tego potrzebował.

## Raport miesięczny

Podstawowy raport powinien obejmować:

- odsłony i unikalne wizyty,
- najczęściej odwiedzane podstrony i aktualności,
- urządzenia i kraje,
- źródła wejść,
- Core Web Vitals,
- po wdrożeniu narzędzia zdarzeniowego: kliknięcia muzyki, biletów, kontaktu oraz pobrania Press.

## Zasady

- nie uruchamiać narzędzi marketingowych bez aktualizacji informacji o prywatności i mechanizmu zgód,
- nie dodawać Meta Pixel ani GA4 „na zapas”,
- nie przekazywać danych osobowych w nazwach zdarzeń, adresach URL ani parametrach,
- po każdej zmianie dostawcy wykonać ponowny audyt cookies, localStorage, requestów zewnętrznych i CSP.
