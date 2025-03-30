[TOC]

# WIMU Projekt 2024L - Design Proposal

------------------------

## Autorzy

***Piotr Malesa*** - 01112501@pw.edu.pl

***Kacper Stefański*** - kacper.stefanski.stud@pw.edu.pl

***Konstantin Panov*** - konstantin.panov.stud@pw.edu.pl



## Temat projektu

Tematem projektu jest kontynuacja projektu **MIDITok Visualizer** z poprzedniej edycji przedmiotu.

Na chwilę obecną narzędzie to składa się z aplikacji web'owej, która pozwala na przegląd tokenów wygenerowanych przez bibliotekę MidiTok na podstawie wgranego przez użytkownika pliku w formacie MIDI oraz wizualizację metryk (np. tonacja, metrum, tempo), które są wyczytywane w celu dokładnej analizy zapisanych danych w formacie MIDI.



## Harmonogram projektu

- Tydzień 1 (19.02 - 23.02):	-
- Tydzień 2 (26.02 - 01.03):	-
- Tydzień 3 (04.03 - 08.03):	-
- **Tydzień 4 (11.03 - 15.03)**:	 -
- **Tydzień 5 (18.03 - 22.03)**:	Dostarczenie poprawionego design proposal'a ze zmodyfikowanym planem rozszerzenia aplikacji
- **Tydzień 6 (25.03 - 29.03)**:    Przygotowanie środowiska do pracy nad projektem oraz rozpoczęcie rozwoju nowych funkcjonalności
- **Tydzień 7 (01.04 - 05.04)**:	Przerwa świąteczna 
- **Tydzień 8 (08.04 - 12.04)**:	Dalsze prace nad UI oraz prezentacja prototypu
- **Tydzień 9 (15.04 - 19.04)**:    Dalsze prace nad UI
- **Tydzień 10 (22.04 -26.04)**:	Ukończona część rozszerzenia UI
- **Tydzień 11 (29.04 - 03.05)**:   Majówka
- **Tydzień 12 (06.05 - 10.05)**:	Praca nad implementacją kolejnych tokenizerów (MMM, MuMIDI) i ewentualne poprawki UI
- **Tydzień 13 (13.05 - 17.05)**:	Dostarczenie i zademonstrowanie funkcjonalnego prototypu
- **Tydzień 14 (20.05 - 24.05)**:	Ukończenie rozszerzenia API o nowe tokenizery
- **Tydzień 15 (27.05 - 31.05)**:   Praca nad poprawkami po pierwszej prezentacji projektu
- **Tydzień 16 (03.06 - 07.06)**:	Oddanie projektu (szacowany termin)
- Tydzień 17 (10.06 - 14.06):	-



Powyższy harmonogram dopuszcza możliwość modyfikacji dat kolejnych etapów projektu, w zależności od szybkości postępu prac nad projektem lub w wyniku zdarzeń losowych w ciągu semestru. Jest to jedynie poglądowy plan, gdyż na chwilę obecną ciężko dokładnie sprecyzować ile czasu zajmą nam poszczególne etapy.



## Planowana funkcjonalność programu

Planowanym przez nas rozszerzeniem aplikacji MIDITok Visualizer jest modyfikacja zarówno istniejącej części backendowej jak i frontendowej. Część API została by poszerzona o kolejne tokenizery (MMM, MuMIDI) a część frontendu o ulepszony widok tokenów. Obecnie istniejący widok tokenów (tokeny oddzielnych ścieżej w oddzielnych wierszach) pozostanie bez zmian, natomiast zostanie dodany nowy i czytelniejszy widok tokenów, gdzie tokeny oddzielnych ścieżek byłyby wyświetlane w oddzielnych zakładkach oraz byłyby pomniejszone i wyświetlane wierszami. Dodatkowo obok tokenów każdej ścieżki wgranego pliku MIDI wyświetlony zostałby piano roll. Po najechaniu na konkretny dźwięk w piano roll'u danej ścieżi zostaną podświetlone tokeny, które mu odpowiadają (i na odwrót - po najechaniu na dany token podświetli się powiązany z nim dźwięk na piano roll'u). Okno do konfiguracji tokenizerów również zostanie ulepszone.

## Planowany stack technologiczny

Przewidywany stack technologiczny jest oczywiście poniekąd uzależniony od obecnej wersji projektu, który zamierzamy rozszerzyć. Zamierzamy zatem wykorzystać podobne narzędzia co pierwotni autorzy projektu.

- **Frontend**: TypeScript, React
- **Backend**: Python, FastAPI/Flask
- **Tokenizacja plików**: MidiTok

- **Hosting aplikacji**: Heroku
- **System kontroli wersji**: Git

- **Hosting repozytorium**: GitLab

- **Testy**: pytest


-----------------------

## Bibliografia

- MIDITok. (n.d.). *MIDITok Documentation (Version 3.0.1)*.  ([https://miditok.readthedocs.io/en/v3.0.1/](https://miditok.readthedocs.io/en/v3.0.1/)) 




W miarę postępów prac nad projektem bibliografia będzie mogła być rozszerzona.