# Supabase database

Migracja `migrations/20260814000000_initial_family_schema.sql` tworzy bazę MVP FamilyTree:

- rodziny i członków z rolami `owner`, `admin`, `editor`, `member`, `viewer`,
- osoby z opcjonalnym rokiem urodzenia i placeholderami,
- związki/małżeństwa i członków związku,
- relacje rodzic–dziecko z typami biologicznym, adopcyjnym, opiekuńczym, przybranym i nieznanym,
- zaproszenia, wspomnienia, zdjęcia i powiązania many-to-many,
- preferencje oraz idempotentne logi powiadomień,
- RLS dla każdej tabeli.

## Uruchomienie

Najpierw utwórz projekt Supabase. Migrację można uruchomić w SQL Editorze albo przez Supabase CLI:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

Jeżeli repozytorium nie ma jeszcze lokalnej konfiguracji CLI, można wykonać plik SQL bezpośrednio w Supabase Dashboard → SQL Editor. Przed zastosowaniem na istniejącej bazie wykonaj backup.

## Buckety Storage

Bucket zdjęć powinien zostać utworzony jako prywatny, np. `family-photos`. Wartość `photos.storage_path` ma zaczynać się od `family_id/`, a signed URLs należy generować po stronie serwera. Polityki Storage powinny sprawdzać członkostwo w `family_members`; nie używaj publicznego bucketa.

## Semantyka prywatności

`family` oznacza dostęp dla aktywnych członków rodziny. `restricted` i `private` są w migracji dostępne dla właściciela treści oraz ownera/admina rodziny. W przyszłości można dodać tabelę wyjątków widoczności dla wybranych użytkowników.

## Weryfikacja RLS

Repozytorium nie ma jeszcze test harnessu SQL ani lokalnego Supabase CLI/Docker. Po podłączeniu projektu należy sprawdzić:

1. członek rodziny odczytuje rekordy własnej rodziny,
2. członek nie odczytuje rekordów obcej rodziny,
3. `viewer` nie wykonuje mutacji,
4. `editor` zarządza osobami, relacjami i treściami,
5. tylko owner/admin zarządza członkami i zaproszeniami,
6. ten sam log powiadomienia nie może zostać dodany drugi raz,
7. powiązania osób, zdjęć, wspomnień i związków nie mogą przekraczać granicy rodziny.
