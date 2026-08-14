# Etap 07 — zdjęcia i wspomnienia

Przeanalizuj istniejący panel osób, auth i RLS. Zaimplementuj `features/memories` oraz prywatne zdjęcia Supabase Storage.

## Zakres

- Prywatny bucket i konwencja ścieżek z `familyId`.
- Upload, walidacja typu/rozmiaru i usuwanie zdjęcia.
- Signed URLs generowane po stronie serwera.
- Wspomnienia typu zdjęcie, historia i wydarzenie.
- Przypisanie wspomnienia/zdjęcia do wielu osób.
- Lista, szczegóły i pusty stan.

## Wymagania

Nie używaj publicznych URL-i. Sprawdź członkostwo i rolę przed każdą mutacją. Obsłuż anulowany upload, duplikat, brak zdjęcia, wygasły URL i niepowiązane wspomnienie.

## Weryfikacja

Dodaj testy walidacji, uprawnień i relacji many-to-many. Sprawdź signed URL bez dostępu do obcej rodziny. Uruchom `bun format:check`, testy i build.
