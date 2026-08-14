# Etap 12 — testy i bezpieczeństwo

Przeanalizuj całą aplikację i uzupełnij testy oraz zabezpieczenia bez zmiany wymagań produktu.

## Zakres

- Testy jednostkowe schematów, dat, relacji i buildera grafu.
- Testy integracyjne akcji Supabase.
- Testy RLS dla wszystkich ról i rodzin.
- Testy powiadomień, idempotencji i cron secret.
- Testy formularzy, uploadu i zaproszeń.
- Kontrola sekretów, walidacji inputu, CSRF, rate limitingu i logów.

## Wymagania

Użyj narzędzi już obecnych w projekcie albo dobierz lekkie rozwiązanie kompatybilne z Bun. Nie omijaj RLS przez service role w ścieżkach użytkownika. Dodaj testy regresyjne dla związków, adopcji, opieki, rozwodów i placeholderów.

## Weryfikacja

Uruchom pełny zestaw testów, `bun format:check`, lint i build. Zapisz listę znanych ograniczeń oraz zagrożeń, których nie można zweryfikować lokalnie.
