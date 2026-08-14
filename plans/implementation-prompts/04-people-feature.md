# Etap 04 — feature osób

Przeanalizuj aktualny model i istniejące feature’y. Zaimplementuj pełny CRUD osób w `src/features/people`.

## Zakres

- Lista i szczegóły osoby.
- Tworzenie, edycja i bezpieczne usuwanie/archiwizacja.
- Formularz z imieniem, nazwiskiem, preferowanym imieniem, biografią, zdjęciem, dniem/miesiącem urodzenia i opcjonalnym rokiem.
- Flagi `is_living`, `is_placeholder`, prywatność i widoczność roku.
- Panel szczegółów jako drawer desktop/bottom sheet mobile.

## Wymagania

Użyj Zod i obsłuż brak roku bez sztucznej daty. Waliduj dzień/miesiąc, konflikty edycji i brak nazwy dla osoby nie-placeholder. Nie implementuj relacji w tym etapie poza bezpiecznym miejscem na sekcje.

## Weryfikacja

Dodaj testy schematu i akcji. Sprawdź osobę żyjącą, zmarłą, placeholder, datę bez roku, błędną datę i brak uprawnień. Uruchom format, testy i build.
