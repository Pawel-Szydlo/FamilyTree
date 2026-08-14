# Etap 05 — feature relacji

Przeanalizuj model `people` i migracje. Zaimplementuj `src/features/relationships` jako niezależną domenę relacji genealogicznych.

## Zakres

- Tworzenie i edycja związków/małżeństw.
- Wielu partnerów jednej osoby.
- Statusy aktywny, zakończony, rozwiedziony, wdowieństwo i nieznany.
- Relacje rodzic–dziecko bezpośrednie oraz przez związek.
- Typy biologiczny, adopcyjny, opiekuńczy, przybrany i nieznany.
- Brakujący/placeholder rodzic.

## Wymagania

Nie modeluj małżeństwa jako zwykłej krawędzi osoby–osoba. Zapobiegaj cyklom rodzicielskim, duplikatom i relacji osoby z samą sobą. Zapewnij czytelny formularz, który nie wymaga znajomości bazy danych.

## Weryfikacja

Dodaj testy wielu partnerów, dzieci z różnych związków, rozwodu, adopcji, opieki, placeholdera i cyklu. Uruchom Biome, testy i build. Raportuj ograniczenia modelu.
