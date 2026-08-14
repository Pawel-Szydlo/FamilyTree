# Etap 09 — Resend, cron i logi

Przeanalizuj kalendarz i preferencje z poprzedniego etapu. Zaimplementuj `features/notifications` i serwerowy endpoint Vercel Cron.

## Zakres

- Resend client wyłącznie na serwerze.
- Szablony przypomnienia 7 dni wcześniej i w dniu urodzin.
- Endpoint zabezpieczony `CRON_SECRET`.
- Pobieranie odbiorców z aktywnymi preferencjami.
- Idempotencja przez `notification_logs`.
- Historia sukcesów i błędów.

## Wymagania

Obsłuż brak env, błąd Resend, niepoprawny adres, ponowienie endpointu i częściową porażkę. Nie loguj sekretów ani pełnych danych prywatnych. Zabezpiecz przed równoległym podwójnym wysłaniem przez constraint/upsert.

## Weryfikacja

Dodaj testy z mockiem Resend dla obu typów przypomnień, preferencji, duplikatu, błędu odbiorcy i nieautoryzowanego crona. Sprawdź format, testy i build.
