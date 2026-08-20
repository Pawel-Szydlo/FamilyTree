# Wdrożenie FamilyTree

## Wymagane zmienne środowiskowe

Ustaw w Vercel Production/Preview oraz lokalnie w `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` — URL projektu Supabase,
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` albo `NEXT_PUBLIC_SUPABASE_ANON_KEY` — klucz publiczny,
- `SUPABASE_SERVICE_ROLE_KEY` — wyłącznie serwerowy; potrzebny do zadań administracyjnych,
- `RESEND_API_KEY` — klucz serwerowy Resend,
- `RESEND_FROM_EMAIL` — zweryfikowany nadawca Resend,
- `NEXT_PUBLIC_APP_URL` — publiczny adres aplikacji, bez końcowego `/`,
- `CRON_SECRET` — długi losowy sekret używany przez `/api/cron/birthdays`.

Nie używaj prefiksu `NEXT_PUBLIC_` dla service-role, Resend ani Cron secret. Nie commituj `.env.local`.

## Supabase i migracje

1. Wykonaj backup bazy przed pierwszym wdrożeniem migracji.
2. Zaloguj i połącz Supabase CLI:

   ```bash
   supabase login
   supabase link --project-ref <PROJECT_REF>
   supabase db push
   ```

3. Sprawdź, że zastosowane są wszystkie migracje w kolejności, szczególnie migracje Storage, membership safety i privacy/anonymization.
4. Sprawdź, że bucket `family-private` istnieje i jest prywatny.
5. Utwórz testowego użytkownika w każdej potrzebnej roli i wykonaj checklistę RLS.

## Vercel, Cron i Resend

`vercel.json` uruchamia `/api/cron/birthdays` codziennie o `07:00 UTC`. Endpoint wymaga `Authorization: Bearer <CRON_SECRET>`; Vercel Cron przekazuje sekret z ustawień projektu jako nagłówek.

Po wdrożeniu:

1. sprawdź w Vercel, że Cron jest aktywny,
2. ręcznie wywołaj endpoint z poprawnym sekretem w środowisku Preview,
3. sprawdź, że błędny lub brakujący sekret daje `401`/`503`,
4. zweryfikuj domenę nadawcy w Resend,
5. sprawdź logi Resend i `notification_logs` po pierwszym przebiegu.

## Backup i monitoring

- Włącz automatyczne backupy Supabase i okresowo testuj odtworzenie.
- Przed migracją wykonuj ręczny backup punktowy.
- Monitoruj błędy `/api/cron/birthdays`, liczbę `failed` w `notification_logs` oraz błędy uploadów Storage.
- Ustaw alert dla nieudanych buildów Vercel i błędów funkcji serverless.
- Nie wysyłaj do logów tokenów zaproszeń, signed URL-i, kluczy ani pełnych danych prywatnych.
- Rate limiter aplikacji jest procesowy; przy wielu instancjach zastąp go współdzielonym mechanizmem.

## Checklista flow przed produkcją

- rejestracja/logowanie i callback Auth,
- utworzenie dwóch rodzin i przełączanie rodziny,
- osoba żyjąca z ukrytym rokiem oraz osoba zmarła,
- związek wielu partnerów, rozwód, adopcja, opieka i placeholder,
- drzewo desktop/mobile, pusty graf i duży graf,
- wspomnienie tekstowe oraz zdjęcie z signed URL-em,
- obca rodzina nie ma dostępu do danych ani Storage,
- kalendarz i preferencje urodzin,
- cron z poprawnym i błędnym sekretem,
- zaproszenie: rejestracja/logowanie, akceptacja, wygaśnięcie i ponowne użycie,
- eksport JSON/CSV/ZIP oraz limit ZIP,
- anonimizacja osoby zachowuje krawędzie relacji i usuwa dane identyfikujące.

## Ograniczenia lokalnej weryfikacji

Vitest, Biome, TypeScript i Next build nie zastępują testu prawdziwych polityk Postgres/Storage. Pełne testy RLS wymagają lokalnego Supabase CLI/Dockera albo środowiska Preview z co najmniej dwiema rodzinami i rolami `owner`, `admin`, `editor`, `member`, `viewer`.
