# Notatka ze spotkania 17.4.25

Spotkanie z projektu MidiTok Vizualizer odbyło się 17.4.25 o godzinie 11:20.
## Przegląd wykonanych prac:
### Backend: <br>
- Wdrożono działający system CI dla backendu. <br>
- Zaimplementowano wstępną integrację z MkDocs oraz fragmenty automatycznej dokumentacji kodu jak również deploy na Github Pages. <br>
- Przeprowadzono wstępną refaktoryzację pliku midi_processing – wprowadzono podział na klasy i metody, rozwiniętą funkcję ładowania, tworzenia node oraz ładowania configu o obsługę błędów. <br>
### Frontend: <br>
- Dodano możliwość przypisywania kilku tokenizerów do jednego pliku. <br>
- Przygotowanie wstępnej funkcjonalność tworzenia kafelków, których pozycje trzeba będzie przetworzyć do MIDI. <br>
- Zakończono integrację nowego interfejsu użytkownika z poprzedniej iteracji projektu.<br>
## Kolejne kroki:
### Frontend: <br>
- Rozwój funkcji związanych z tworzeniem i edycją MIDI (zgodnie z założeniami design proposal). <br>
- Poprawki w warstwie wizualnej interfejsu (np. układ elementów).
### Backend: <br>
- Refaktoryzacja kodu w kierunku paradygmatu obiektowego. <br>
- Dodanie komentarzy dokumentacyjnych do istniejącego kodu. <br>
- Implementacja wsparcia dla formatów muMIDI i MMM. <br>
- Usunięcie sekcji design proposal z dokumentacji MkDocs. <br>
### Deploy: <br>
- Deploy aplikacji na serwis oraz sprzężenie z CI <br>
- Upewnienie się, że projekt działa lokalnie u wszystkich członków zespołu. <br>
## Uwagi i zalecenia:
- Przygotować zbiór testowy plików MIDI do weryfikacji funkcjonalności aplikacji. <br>
- Zorganizować automatyczną dokumentację backendu. <br>
- Deploy aplikacji na serwis oraz sprzężenie z CI
