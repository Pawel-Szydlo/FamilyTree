# Etap 13 — finalny przegląd i wdrożenie

Przeanalizuj repozytorium jak przed wdrożeniem produkcyjnym. Nie dodawaj nowych funkcji poza koniecznymi poprawkami.

## Zakres

- Przegląd architektury feature-based i granic importów.
- Przegląd env, sekretów i RLS.
- Przegląd Vercel, Supabase Storage, Auth i Resend.
- Konfiguracja Vercel Cron z endpointem i `CRON_SECRET`.
- Dokumentacja lokalnego uruchomienia, migracji i wdrożenia.
- Checklista backupu i monitoringu.

## Weryfikacja końcowa

Uruchom `bun format:check`, `bun lint`, pełne testy i `bun build`. Sprawdź flow: rejestracja → rodzina → osoba → relacje → drzewo → wspomnienie → kalendarz → cron → zaproszenie. Sprawdź mobile, empty/error states i dostęp do obcej rodziny.

Na końcu podaj: zmienione pliki, wykonane komendy, wynik każdego testu, wymagane env, ręczne kroki wdrożenia i pozostałe ryzyka. Nie deklaruj gotowości produkcyjnej, jeśli którykolwiek krytyczny test nie przechodzi.
