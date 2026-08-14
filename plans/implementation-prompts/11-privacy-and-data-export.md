# Etap 11 — prywatność i eksport

Przeanalizuj wszystkie feature’y, RLS i Storage. Wzmocnij prywatność oraz dodaj eksport danych.

## Zakres

- Widoczność żyjących osób tylko w rodzinie.
- Ochrona roku urodzenia i prywatnych pól.
- Kontrola widoczności zdjęć i wspomnień.
- Eksport JSON/CSV danych genealogicznych.
- Eksport ZIP ze zdjęciami, jeśli uprawnienia i rozmiar na to pozwalają.
- Bezpieczne usuwanie lub anonimizacja zgodnie z rolą.

## Wymagania

Eksport wykonuj po stronie serwera, sprawdzaj membership i nie ujawniaj tokenów Storage. Zdefiniuj, co dzieje się z relacjami po anonimizacji osoby. Nie ujawniaj publicznych profili.

## Weryfikacja

Dodaj testy dostępu do danych żyjących, obcej rodziny, podpisanych URL-i i eksportu. Sprawdź, że sekrety nie występują w bundlu klienta. Uruchom format, testy i build.
