# Plan implementacji FamilyTree

Ten katalog zawiera specyfikację produktu oraz prompty do sekwencyjnego tworzenia aplikacji.

## Kolejność

Wklejaj prompty od `01` do `13`. Po każdym etapie wykonaj testy opisane w pliku i nie przechodź dalej, jeśli kryteria zakończenia nie są spełnione. Każdy prompt zakłada, że poprzednie etapy zostały ukończone, ale wymaga ponownego przeanalizowania repozytorium.

## Zasady wspólne

- Package managerem jest Bun: używaj `bun install`, `bun add`, `bun run`.
- Formatterem jest Biome; nie instaluj ani nie uruchamiaj Prettiera.
- Nie nadpisuj niepowiązanych zmian użytkownika.
- Przed implementacją sprawdź istniejące pliki, skrypty i stan git.
- Po implementacji uruchom `bun format:check`, właściwe testy i `bun build`, jeśli etap ich dotyczy.
- Raportuj zmienione pliki, wykonane testy i znane problemy.

## Zależności

`01` → `02` → `03` → `04` → `05` → `06` → `07` → `08` → `09` → `10` → `11` → `12` → `13`.

Etap `07` wymaga ukończenia `04` i `05`; etap `09` wymaga `08`; etap `11` może korzystać z `07` i `10`.

## Zmienne środowiskowe

Docelowo potrzebne będą:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
CRON_SECRET
NEXT_PUBLIC_APP_URL
```

Sekrety serwerowe nie mogą mieć prefiksu `NEXT_PUBLIC_` ani trafić do kodu klienta.

## Checklista po każdym etapie

- [ ] Repozytorium zostało sprawdzone przed zmianami.
- [ ] Zmiany są zgodne z feature-based architecture.
- [ ] Nie dodano Prettiera.
- [ ] `bun format:check` przechodzi.
- [ ] Testy etapu przechodzą.
- [ ] Zmienne i migracje są udokumentowane.
- [ ] Raport zawiera pliki, testy i pozostałe problemy.
