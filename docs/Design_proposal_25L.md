# WIMU 25L

## Funkcje oraz komentarze opisujący aktulany stan

* Poprawa błędów kodu i obsługa wyjątków - podczas wstępnych testów napotkano na problemy związane z tokenizacją plików MIDI. Dla example_files wszystko działa, ale losowy plik z internetu spowodował problem z jego rozpakowaniem. Dlatego chcemy wprowadzić obsługę błędów (pierwsze co się rzuca w oczy: odczyt i zapis pliku), jak również tych wymagajacych restrukturyzację funkcji. 

* Restrukturyzacja backendu - wprowadzanie zasad dobrego programowania obiektowego w tym zasady SOLID z powodu co raz to bardziej rozbudowanych funkcji.

* Dodanie do frontedu dynamicznego odtwarzania dźwięku wraz z piano rollem.

* Dodanie dokumentacji - według grupy majacej ostatnio ten projekt, kod jest bardzo nieuporządkowany oraz brakuje w nim komentarzy, dlatego też chcielibyśmy popracować nad dokumentacją, która pozwalałaby lepiej rozwijać projekt. 

* Dodanie CICD - środowisko na bazie GitHub Actions umożliwiających automatyzację i usprawnienie procesów rozwoju, testowania oraz wdrażania aplikacji, a także integrację z generowaniem dokumentacji MkDocs.

* Edycja MIDI na stronie i jego zapis - dodanie zakładki umożliwiającej edycję pliku MIDI z ewentualną obsługą przez bibliotekę Mido urządzeń wysyłających komunikaty MIDI. 

* Dodanie testów jednostkowych, integracyjnych i wydajnościowych.

* Uporządkowanie konfiguracji tokenizerów poprzez pliki JSON z ewentualną automatyzacją po stronie odczytu informacji po prostu z pliku MIDI. 

* Trzymanie w pamięci przeglądarki załadowanych plików, aby nie trzeba było za każdym razem ich ładować / dodanie zakładki z załadowanymi już przykładami MIDI.

## Harmonogram projektu

* **Tydzień 1 (17.03 - 21.03):**    Przygotowanie środowiska do pracy nad projektem, zapoznanie się z narzędziami, poprawki design proposal
* **Tydzień 2 (24.03 - 28.03):**    Początek pracy nad restrukturyzacją backendu oraz dokumentacją
* **Tydzień 3 (31.03 - 04.04):**    Dalsze prace nad restrukturyzacją backendu oraz dokumentacją
* **Tydzień 4 (07.04 - 11.04):**    Ustawienie CICD oraz końcowe prace nad integracją kodu. 
* **Tydzień 5 (14.04 - 18.04):**    Początek pracy nad edycją MIDI
* **Tydzień 6 (21.04 - 25.04):**   Dalsza praca nad edycją MIDI
* **Tydzień 7 (28.04 - 02.05):**    *Majówka*
* **Tydzień 8 (05.05 - 09.05):**    Dodanie dynamicznego odtwarzania dźwięku i piano rolla
* **Tydzień 9 (12.05 - 16.05):**    Praca nad trzymaniem w pamięci przeglądarki załadowanych plików
* **Tydzień 10 (19.05 - 23.05):**   Stworzenie testów jednostkowych, integracyjnych i wydajnościowych
* **Tydzień 11 (26.05 - 30.05):**   Oddanie projektu

W każdym z tych etapów, na bieżąco będzie aktualizowana dokumentacja projektu. Podkreśla się jednak, że harmonogram może ulec zmianie, ze względa na wystąpienie ewentualnych problemów. 
## Planowany stack technologiczny
Stack jez zależny od możliwości integracji aktualnej wersji projektu z nowymi narzędziami:

* **Repozytorium:** GitHub
* **Testy:** pytest, pytest-mock, pytest-benchamrk
* **Backend:** Python, FastAPI
* **Frontend:** React
* **Dokumentacja:** MkDocs material + plugin mkdocstrings
* **CICD:** GitHub Actions

## Bibliografia

* MidiTok documentation ([https://miditok.readthedocs.io/en/stable/](https://miditok.readthedocs.io/en/stable/)) 
* GitHub Actions  documentation ([https://docs.github.com/en/actions](https://docs.github.com/en/actions))
* MkDocs documentation ([https://www.mkdocs.org/](https://www.mkdocs.org/))
