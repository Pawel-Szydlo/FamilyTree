# Etap 02 — baza danych i RLS

Najpierw przeanalizuj repozytorium i poprzedni etap. Zaimplementuj migracje Supabase dla FamilyTree, bez naruszania niepowiązanych zmian.

## Zakres

Utwórz tabele `families`, `family_members`, `people`, `partnerships`, `partnership_members`, `parent_links`, `invitations`, `memories`, `memory_people`, `photos`, `photo_people`, `notification_preferences` i `notification_logs`.

## Wymagania modelu

Rozdziel osoby, związki i relacje rodzic–dziecko. Obsłuż wiele partnerów, rozwody, dzieci z różnych związków, adopcję, opiekę i placeholdery. Rok urodzenia ma być opcjonalny. Dodaj enumy, klucze obce, indeksy, check constraints i unikalność logów powiadomień.

## Bezpieczeństwo

Włącz RLS na każdej tabeli rodzinnej. Polityki mają izolować rekordy przez aktywne `family_members`; role ograniczają zapis. Nie umieszczaj service role w kliencie. Dodaj migracje i dokumentację uruchomienia.

## Weryfikacja

Uruchom lint/format oraz testy SQL/RLS, jeśli projekt ma test harness. Sprawdź dostęp członka do własnej rodziny, brak dostępu do obcej rodziny, role i blokadę duplikatu logu. Raportuj migracje i ryzyka.
