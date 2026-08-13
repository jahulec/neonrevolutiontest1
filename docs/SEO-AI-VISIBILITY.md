# Strategia widoczności SEO i AI

## Co robi strona automatycznie

- generuje unikalne tytuły i opisy PL/EN, canonicale oraz `hreflang`,
- publikuje sitemapę stron, obrazów i wideo,
- wystawia JSON-LD dla zespołu, członków, muzyki, wydarzeń, galerii, wideo i artykułów,
- łączy encję zespołu z oficjalnymi profilami Spotify, Apple Music, YouTube, Instagram i Facebook,
- publikuje niezależne materiały medialne jako widoczne źródła w Press,
- udostępnia Atom, `band.json`, `llms.txt` i `llms-full.txt`,
- zezwala crawlerom wyszukiwarek i najważniejszych usług AI na dostęp do publicznych treści,
- wyłącza z indeksu treści demonstracyjne i roboczy dokument Prywatność,
- kompresuje obrazy i tworzy responsywne warianty 480, 960 i 1440 px,
- sprawdza, czy dane strukturalne odpowiadają faktycznie opublikowanej treści.

`llms.txt` jest dodatkiem dla narzędzi, które dobrowolnie go czytają. Nie jest czynnikiem wymaganym przez Google i nie zastępuje indeksowalnych stron HTML.

## Klastry tematyczne

Treści należy pisać naturalnie wokół tematów, a nie powtarzać listę fraz:

- marka: Neon Revolution, Neon Revolution zespół, Neon Revolution band,
- tożsamość: polski zespół rockowy, zespół synth-popowy, zespół z Knurowa, śląski zespół muzyczny,
- styl: rock inspirowany latami 80., syntezatory i gitary, synth-pop Polska,
- intencje: koncerty Neon Revolution, bilety Neon Revolution, muzyka Neon Revolution, teledyski Neon Revolution,
- katalog: nazwa każdego singla połączona z nazwą zespołu,
- media: skład Neon Revolution, opis zespołu, rider techniczny, booking i materiały prasowe.

Nie dodajemy `meta keywords`, ponieważ współczesne Google nie wykorzystuje tego pola do rankingu. Frazy muszą wynikać z prawdziwej, widocznej i użytecznej treści.

## Standard nowej treści w CMS

### Koncert

- prawdziwa data, miasto, miejsce i — jeśli istnieje — pełny link do biletów,
- godziny w osobnych polach; dzień tygodnia i etykieta godzin powstają automatycznie,
- wpis `real` dopiero po potwierdzeniu wydarzenia.

### Wydanie

- dokładna nazwa, data premiery, okładka oraz linki prowadzące najlepiej do konkretnego wydania, nie tylko profilu artysty,
- Spotify, YouTube i Apple Music powinny wskazywać tę samą wersję utworu,
- tylko jedno wydanie może być wyróżnione.

### Aktualność

- własny tytuł, konkretna zajawka i przynajmniej jeden akapit oryginalnej informacji,
- pełna wersja PL i EN,
- grafika związana z tematem i sensowny tekst alternatywny,
- link do Muzyki lub Koncertów, jeśli artykuł dotyczy wydania albo wydarzenia,
- status `real` dopiero po zatwierdzeniu faktów.

### Galeria i Press

- opis alternatywny mówi krótko, kto/co jest na zdjęciu i w jakim kontekście,
- każda niezależna publikacja o zespole trafia do sekcji „Media o zespole” z prawdziwym linkiem, datą i nazwą redakcji,
- nazwę zespołu, miasto pochodzenia i oficjalny adres strony należy zapisywać konsekwentnie we wszystkich profilach zewnętrznych.

## Działania po podpięciu domeny

1. Ustawić domenę jako `siteUrl` i opublikować ponownie.
2. Zweryfikować domenę w Google Search Console i Bing Webmaster Tools; tokeny można wkleić przez CMS.
3. Wysłać sitemapę i sprawdzić kluczowe adresy narzędziem URL Inspection.
4. Uzupełnić oficjalny adres strony w Spotify for Artists, Apple Music for Artists, YouTube, Facebooku, Instagramie i katalogach koncertowych.
5. Prosić organizatorów i redakcje o link do oficjalnej domeny przy publikacjach o zespole.
6. Mierzyć zapytania markowe, zapytania o utwory, indeksację obrazów/wideo i wejścia na koncerty; nie oceniać efektu po kilku dniach.

Największym ograniczeniem nie jest już kod, lecz liczba prawdziwych, indeksowalnych aktualności oraz liczba niezależnych stron, które jednoznacznie łączą nazwę Neon Revolution z muzyką, Knurowem, składem, utworami i oficjalną domeną.
