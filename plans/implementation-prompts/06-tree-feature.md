# Etap 06 — interaktywne drzewo

Przeanalizuj osoby i relacje, a następnie zbuduj `src/features/tree` z React Flow i ELK.js.

## Zakres

- Węzeł `person` z własną kartą albumową.
- Węzeł `partnership` do łączenia partnerów i dzieci.
- Krawędzie biologiczne, adopcyjne, opiekuńcze i nieznane.
- Layout ELK.js.
- Zoom, przesuwanie, fit view, centrowanie na osobie.
- Wyszukiwanie, „Moja gałąź”, „Cała rodzina” i zwijanie gałęzi.

## Wymagania

Oddziel transformację modelu domenowego od renderowania. Relację na karcie obliczaj względem aktywnej osoby. Obsłuż pusty graf, duży graf, brakującego rodzica i mobile. Nie przechowuj layoutu jako źródła prawdy.

## Weryfikacja

Dodaj testy buildera grafu i layoutu. Ręcznie sprawdź wielu partnerów, wspólne dzieci, różne typy relacji, centrowanie i zwijanie. Uruchom format, testy i build.
