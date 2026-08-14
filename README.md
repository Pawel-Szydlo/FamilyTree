# FamilyTree

Prywatna aplikacja do rodzinnego drzewa genealogicznego, zdjęć i wspomnień.

## Status

Etap 03 — auth i onboarding. Aplikacja ma responsywny shell, Supabase SSR Auth, ochronę tras rodzinnych oraz tworzenie i wybór rodzin. Kolejne etapy podłączą dane osób i relacje do widoków.

## Supabase Auth lokalnie

Skopiuj `.env.example` do `.env.local` i ustaw lokalny publishable/anon key z `bunx supabase status`:

```bash
cp .env.example .env.local
bunx supabase start
bunx supabase status
```

W `.env.local` ustaw `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` oraz `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` na lokalny `PUBLISHABLE_KEY` albo `ANON_KEY`. Nie wpisuj `SERVICE_ROLE_KEY` do zmiennych z prefiksem `NEXT_PUBLIC_`.

## Uruchomienie

Wymagany jest Bun `1.3+`.

```bash
bun install
bun dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

## Skrypty

```bash
bun dev          # tryb developerski
bun run build    # build produkcyjny (Bun rezerwuje `bun build` dla własnego bundlera)
bun start        # uruchomienie builda
bun format       # formatowanie przez Biome
bun format:check # kontrola formatowania
bun lint         # Biome check
```

Prettier nie jest używany. Strukturę projektu organizują feature’y w `src/features`, a współdzielone elementy znajdują się w `src/components`, `src/lib`, `src/hooks`, `src/types` i `src/config`.

## Trasy fundamentu

- `/` — strona startowa,
- `/login` — placeholder logowania,
- `/invite` — placeholder zaproszenia,
- `/family/demo/tree` — widok drzewa,
- `/family/demo/calendar` — widok kalendarza,
- `/family/demo/memories` — widok wspomnień,
- `/family/demo/settings` — ustawienia rodziny.

Pełny plan i sekwencyjne prompty znajdują się w katalogu [`plans/`](./plans/).
