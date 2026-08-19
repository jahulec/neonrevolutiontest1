# Plan analityki

## Stan obecny

Strona korzysta z Google Analytics 4 przez Google Tag Manager. Publiczne identyfikatory znajdują się w `src/data/site.json` i są dostępne w CMS. Kontener działa w podstawowym Consent Mode v2: przed wyborem „Akceptuję analitykę” skrypt GTM nie jest pobierany i żadne dane nie są wysyłane do Google. Odmowa nie ogranicza działania strony, a wybór można zmienić w footerze.

Interaktywne elementy mają przygotowane oznaczenia zdarzeń:

- `music_click` — przejścia do odtwarzania muzyki,
- `ticket_click` — przejścia do sprzedaży biletów,
- `press_download` — pobrania materiałów prasowych,
- `contact_click` — e-mail, telefon i Messenger.

GA4 mierzy podstawowy ruch i zaangażowanie, a pomiar zaawansowany obejmuje m.in. przewinięcia, kliknięcia wychodzące oraz interakcje z osadzonymi materiałami. Dalsze zdarzenia można dodawać w GTM bez zmiany kodu strony, ale każde nowe narzędzie lub cel pomiarowy trzeba uwzględnić w informacji o prywatności i konfiguracji zgód.

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
- nie dodawać Meta Pixel ani kolejnych narzędzi marketingowych „na zapas”,
- nie przekazywać danych osobowych w nazwach zdarzeń, adresach URL ani parametrach,
- po każdej zmianie dostawcy wykonać ponowny audyt cookies, localStorage, requestów zewnętrznych i CSP.
