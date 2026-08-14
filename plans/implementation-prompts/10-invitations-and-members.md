# Etap 10 — zaproszenia i członkowie

Przeanalizuj auth, rodziny i role. Zaimplementuj `features/invitations` oraz `features/members`.

## Zakres

- Zaproszenie e-mailem z jednorazowym tokenem.
- Wygaśnięcie i unieważnienie zaproszenia.
- Akceptacja po logowaniu lub rejestracji.
- Lista członków, zmiana roli i usunięcie członka.
- Wiele rodzin na jednym koncie i przełącznik aktywnej rodziny.

## Wymagania

Przechowuj tylko hash tokenu. Ogranicz zarządzanie do owner/admin, zabezpiecz zmianę ostatniego ownera i nie ujawniaj, czy obcy e-mail istnieje. Zaproszenie musi być powiązane z konkretną rodziną i rolą.

## Weryfikacja

Dodaj testy tokenu, wygaśnięcia, ponownego użycia, uprawnień, ostatniego ownera i wielu rodzin. Uruchom format, testy i build.
