# FamilyTree

Prywatna aplikacja do rodzinnego drzewa genealogicznego, zdjęć i wspomnień.

## Status

Etap 01 — fundament projektu. Obecnie dostępny jest responsywny shell aplikacji, routing placeholderów oraz wizualny punkt startowy przed podłączeniem Supabase.

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
