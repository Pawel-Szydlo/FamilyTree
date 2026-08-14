# FamilyTree — architektura i plan implementacji MVP

## 1. Cel i decyzje projektowe

FamilyTree będzie prywatnym, wielorodzinnym albumem genealogicznym. Jedno konto może należeć do wielu rodzin, a dane żyjących osób są dostępne tylko członkom odpowiedniej rodziny. Każdy odbiorca sam zarządza preferencjami urodzinowych powiadomień.

Stack:

- Next.js App Router + TypeScript,
- Bun jako package manager i runner skryptów,
- Tailwind CSS + shadcn/ui,
- Biome jako formatter i podstawowy linter,
- React Flow + własne węzły,
- ELK.js do układania grafu,
- Supabase Auth, PostgreSQL i Storage,
- Resend,
- Vercel + Vercel Cron.

Prettier nie jest używany. Każda zmiana musi przejść `bun format:check`.

## 2. Architektura feature-based

```text
src/
├── app/
│   ├── (auth)/login/
│   ├── (auth)/invite/
│   └── (family)/family/[familyId]/
│       ├── tree/
│       ├── calendar/
│       ├── memories/
│       └── settings/
├── features/
│   ├── auth/ families/ members/ invitations/
│   ├── people/ relationships/ tree/
│   ├── birthdays/ memories/ notifications/
├── components/
│   ├── ui/ layout/ shared/
├── lib/
│   ├── supabase/ auth/ permissions/ email/ storage/ validation/
├── hooks/
├── types/
└── config/
```

Feature posiada własne `components/`, `actions/`, `queries/`, `schemas/`, `types.ts` i publiczne `index.ts` tylko tam, gdzie są potrzebne. Feature’y nie importują prywatnych plików innych feature’ów.

## 3. Model danych

Tabele Supabase:

- `families(id, name, slug, created_by, created_at)`,
- `family_members(family_id, user_id, role, status, joined_at)`,
- `people(family_id, first_name, last_name, preferred_name, birth_month, birth_day, birth_year, birth_year_visible, is_living, is_placeholder, privacy_level, biography, avatar_path, created_by)`,
- `partnerships(family_id, partnership_type, status, start_date, end_date, notes)`,
- `partnership_members(partnership_id, person_id, role, position)`,
- `parent_links(family_id, parent_person_id, parent_partnership_id, child_person_id, relation_type, status, notes)`,
- `invitations(family_id, email, role, token_hash, expires_at, accepted_at, invited_by)`,
- `memories`, `memory_people`, `photos`, `photo_people`,
- `notification_preferences`, `notification_logs`.

Genealogia nie jest modelowana jako proste drzewo osoba–osoba. Węzeł związku pozwala obsłużyć wielu partnerów, rozwody, dzieci z różnych związków, adopcję, opiekę i brakujących rodziców. Relacja rodzicielska może wskazywać osobę albo związek. Rok urodzenia jest opcjonalny.

`notification_logs` musi mieć unikalność `(recipient_user_id, person_id, notification_type, birthday_year)`.

## 4. Bezpieczeństwo

- RLS ogranicza każdy rekord do rodzin, których użytkownik jest członkiem.
- Role: `owner`, `admin`, `editor`, `member`, `viewer`.
- Żyjące osoby nie są publiczne; pola prywatne respektują `privacy_level` i `birth_year_visible`.
- Bucket zdjęć jest prywatny; klient dostaje tylko krótkie signed URLs.
- Service role i `CRON_SECRET` istnieją wyłącznie po stronie serwera.
- Cron jest idempotentny dzięki unikalności logów i bezpiecznym upsertom.

## 5. Interfejs

### Drzewo

Wyszukiwanie, tryb „Moja gałąź”/„Cała rodzina”, zoom, przesuwanie, centrowanie, zwijanie gałęzi, przycisk dodawania osoby i panel szczegółów. Węzły `person` pokazują zdjęcie, imię, datę urodzenia, relację i opcjonalne liczniki. Węzeł `partnership` łączy partnerów i dzieci.

### Kalendarz

Najbliższe urodziny, widok miesięczny, stan powiadomień, preferencje globalne i per osoba oraz historia wysyłek.

### Wspomnienia

Zdjęcia, historie i wydarzenia, które można przypisać do wielu osób.

Styl: ciepłe jasne tło, ciemna zieleń, granat lub brąz, zaokrąglone karty, duże zdjęcia, delikatne linie relacji, mobile-first.

## 6. Powiadomienia

Codzienny Vercel Cron wywołuje endpoint z `Authorization: Bearer $CRON_SECRET`. Endpoint znajduje urodziny za 7 dni i dzisiaj, sprawdza preferencje, pomija rekordy już zapisane w `notification_logs`, wysyła Resend i zapisuje wynik. W latach nieprzestępnych 29 lutego traktujemy jako 28 lutego.

## 7. Etapy MVP

1. Fundament Next.js/Bun/Biome/Tailwind/shadcn/ui/routing.
2. Migracje Supabase i RLS.
3. Auth, onboarding i aktywna rodzina.
4. Osoby i profile.
5. Relacje genealogiczne.
6. Drzewo React Flow + ELK.js.
7. Zdjęcia i wspomnienia.
8. Urodziny i kalendarz.
9. Resend, cron i logi.
10. Zaproszenia i członkowie.
11. Prywatność i eksport.
12. Testy i bezpieczeństwo.
13. Finalny przegląd i wdrożenie.

## 8. Kryteria akceptacji

- Bun instaluje, uruchamia, formatuje i buduje projekt.
- `bun format:check` przechodzi bez zmian.
- Graf obsługuje wielu partnerów, rozwody, dzieci z różnych związków, adopcję, opiekę i brakujące osoby.
- RLS izoluje rodziny, a zdjęcia nie są publiczne.
- Cron nie wysyła duplikatów i respektuje preferencje.
- Drzewo, panel osoby, kalendarz i wspomnienia działają na mobile.
- Pełny rok urodzenia nie jest wymagany.
