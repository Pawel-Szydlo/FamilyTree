# Etap 03 — auth i onboarding

Przeanalizuj istniejący kod, konfigurację Supabase i RLS. Zaimplementuj bezpieczny auth oraz onboarding.

## Zakres

- Rejestracja, logowanie, wylogowanie i odzyskanie dostępu.
- Middleware/protection dla tras rodzinnych.
- Tworzenie rodziny przez zalogowanego użytkownika.
- Pobieranie rodzin użytkownika i wybór aktywnej rodziny.
- Stany loading, empty i error.

## Architektura

Umieść logikę w `features/auth` i `features/families`, a klienty Supabase w `lib/supabase`. Nie ujawniaj sekretów serwerowych. Uwzględnij wygasłą sesję, bezpośredni URL do obcej rodziny i konto bez rodziny.

## Weryfikacja

Uruchom `bun format:check`, testy i build. Sprawdź nowego użytkownika, istniejącego użytkownika, wylogowanie, odświeżenie sesji i odmowę dostępu. Raportuj pliki, testy i konfigurację env.
