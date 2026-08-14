# Etap 08 — urodziny i kalendarz

Przeanalizuj model osób i preferencji. Zaimplementuj `features/birthdays` z funkcjami dat niezależnymi od strefy czasowej.

## Zakres

- Najbliższe urodziny.
- Widok miesięczny.
- Dzień/miesiąc bez wymogu roku.
- Oznaczenie osoby i relacji.
- Preferencje globalne oraz per osoba.
- Informacja o historii wysyłki.

## Wymagania

Zdefiniuj jedną strefę czasową rodziny lub aplikacji i używaj jej konsekwentnie. Nie obliczaj urodzin przez przypadkowe konwersje UTC. Obsłuż 29 lutego jako 28 lutego w roku nieprzestępnym, urodziny dzisiaj i przejście roku.

## Weryfikacja

Dodaj testy dla daty dzisiejszej, za 7 dni, końca roku, 29 lutego i braku roku. Sprawdź wyłączanie preferencji i mobile. Uruchom format, testy i build.
