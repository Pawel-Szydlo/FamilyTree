# FamilyTree

Prywatna aplikacja do rodzinnego drzewa genealogicznego, zdjęć i wspomnień.

## Status

Etap 13 — komplet funkcji MVP, testy bezpieczeństwa i przegląd przedwdrożeniowy.

## Supabase Auth lokalnie

Skopiuj `.env.example` do `.env.local` i ustaw lokalny publishable/anon key z `bunx supabase status`:

```bash
cp .env.example .env.local
bunx supabase start
bunx supabase status
```

W `.env.local` ustaw `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` oraz `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` na lokalny `PUBLISHABLE_KEY` albo `ANON_KEY`. Nie wpisuj `SERVICE_ROLE_KEY` do zmiennych z prefiksem `NEXT_PUBLIC_`.

W środowisku produkcyjnym ustaw także `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL` oraz `CRON_SECRET`. Klucz service-role dodaj wyłącznie jako sekretną zmienną serwerową.

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

Pełną konfigurację env, migracji, wdrożenia, backupu i monitoringu opisuje [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Trasy fundamentu

- `/` — strona startowa,
- `/login` — placeholder logowania,
- `/invite` — placeholder zaproszenia,
- `/family/demo/tree` — widok drzewa,
- `/family/demo/calendar` — widok kalendarza,
- `/family/demo/memories` — widok wspomnień,
- `/family/demo/settings` — ustawienia rodziny.

## Bezpieczeństwo i ograniczenia lokalnej weryfikacji

Mutacje używają Next Server Actions, które sprawdzają metodę POST i origin; endpointy HTTP mają niezależne zabezpieczenia (`CRON_SECRET`, membership i rate limiting). Klucz `SUPABASE_SERVICE_ROLE_KEY` jest używany wyłącznie w kodzie serwerowym do zadań administracyjnych i nigdy nie trafia do komponentu klienta.

Rate limiting w aplikacji jest lokalnym, procesowym bezpiecznikiem. Na wdrożeniu wieloinstancyjnym należy zastąpić go limitem współdzielonym (np. Redis/Edge Config), a ochronę auth i RLS pozostawić w Supabase.

Testy RLS/Storage wymagają uruchomionej instancji Supabase z rolami `anon`/`authenticated`; lokalne testy Vitest mockują granicę klienta i nie potwierdzają polityk w prawdziwym Postgresie. Przed wdrożeniem uruchom migracje i scenariusze dla obcej rodziny, viewer/editor/admin/owner oraz prywatnych zdjęć.

Pełny plan i sekwencyjne prompty znajdują się w katalogu [`plans/`](./plans/).
