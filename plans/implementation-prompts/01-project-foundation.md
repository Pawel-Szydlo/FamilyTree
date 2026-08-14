# Etap 01 — fundament projektu

W tym etapie zbuduj fundament aplikacji FamilyTree. Najpierw przeanalizuj aktualne repozytorium i `git status`; zachowaj niepowiązane zmiany.

## Zakres

- Skonfiguruj Next.js App Router, TypeScript i Bun.
- Dodaj Tailwind CSS, shadcn/ui oraz Biome.
- Utwórz feature-based strukturę `src/app`, `src/features`, `src/components`, `src/lib`, `src/hooks`, `src/types`, `src/config`.
- Dodaj podstawowy layout, responsywną nawigację i placeholdery tras auth/family.
- Skonfiguruj skrypty `dev`, `build`, `start`, `format`, `format:check`, `lint`.
- Nie instaluj Prettiera.

## Wymagania

Używaj wyłącznie `bun add`/`bunx`. Wprowadź alias `@/*`. Wspólne UI umieść w `components/ui` lub `components/shared`; logika domenowa ma pozostać w feature’ach. Dodaj README z komendami.

## Weryfikacja

Uruchom `bun format:check`, `bun lint` i `bun build`. Sprawdź desktop oraz mobile. Kryterium końca: aplikacja startuje, routing działa, Biome przechodzi, a struktura jest gotowa na kolejne feature’y. Raportuj zmienione pliki i ewentualne ostrzeżenia.
