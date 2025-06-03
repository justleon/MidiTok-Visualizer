# WIMU 25L Design Proposal

## Funkcje oraz komentarze opisujący aktualny stan

* Poprawa błędów kodu i obsługa wyjątków - podczas wstępnych testów napotkano na problemy związane z tokenizacją plików MIDI. Dla example_files wszystko działa, ale losowy plik z internetu spowodował problem z jego rozpakowaniem. Dlatego chcemy wprowadzić obsługę błędów (pierwsze co się rzuca w oczy: odczyt i zapis pliku), jak również tych wymagajacych restrukturyzację funkcji. 

* Restrukturyzacja backendu - wprowadzanie zasad dobrego programowania obiektowego w tym zasady SOLID z powodu co raz to bardziej rozbudowanych funkcji.

* Dodanie do frontedu dynamicznego odtwarzania dźwięku wraz z piano rollem.

* Dodanie dokumentacji - według grupy majacej ostatnio ten projekt, kod jest bardzo nieuporządkowany oraz brakuje w nim komentarzy, dlatego też chcielibyśmy popracować nad dokumentacją, która pozwalałaby lepiej rozwijać projekt. 

* Dodanie CICD - środowisko na bazie GitHub Actions umożliwiających automatyzację i usprawnienie procesów rozwoju, testowania oraz wdrażania aplikacji, a także integrację z generowaniem dokumentacji MkDocs.

* Edycja MIDI na stronie i jego zapis - dodanie zakładki umożliwiającej edycję pliku MIDI z ewentualną obsługą przez bibliotekę Mido urządzeń wysyłających komunikaty MIDI. 

* Uporządkowanie konfiguracji tokenizerów poprzez pliki JSON z ewentualną automatyzacją po stronie odczytu informacji po prostu z pliku MIDI. 



## Harmonogram projektu

* **Tydzień 1 (17.03 - 23.03): Wprowadzenie do projektu:**
<br>Przygotowanie środowiska do pracy nad projektem, zapoznanie się z narzędziami, poprawki design proposal
* **Tydzień 2 (24.03 - 30.03): Aktualizacja wersji projektu:** 
<br>Merge nowego interfejsu graficznego z poprzedniej iteracji do głównej wersji projektu oraz dogłebne zapoznanie się ze zmianami. 
* **Tydzień 3 (31.03 - 06.04): Wdrożenie CICD:** 
<br>Przygotowanie repo pod przyszła dokumentację, przygotowanie CICD wraz z automatycznymi buildem, testami oraz deployem na railway / heroku / (ewentualnie zostanie wykorzystany serwer galera, jednak wymaga to przeniesienia repo na gitlaba)
* **Tydzień 4 (07.04 - 13.04): Podjęcie działań ze zmianami w backendzie:** 
<br>Poprawienie pliku midi_processing, a dokładniej funkcji stworzonych w nowej wersji programu, usunięcie niepotrzebnych komponentów ( np. Tokenizer_factory), jak również struktury tokenizerów(głównie struktur plików service).
* **Tydzień 5 (14.04 - 20.04): Dalsze działania z backendem** 
<br>Poprawa powstałych błędów znalezionych podczas testów aplikacji. Pierwsze opisy funkcji do dokumentacji
* **Tydzień 6 (21.04 - 27.04):Rozpoczęci pracy z Frontendem** 
<br>Poprawa zmian aktualnych tokenizerów( po wybraniu jednego tokenizera, trzeba odświeżyć stronę żeby wybrac inny), dodanie funkcji zmiany instrumentu przy play(*), wstępne prace nad piano rollem.
* **Tydzień 7 (28.04 - 04.05):**    *Majówka*
* **Tydzień 8 (05.05 - 11.05):Dalsze prace nad Frontedem**: 
<br>Dynamiczny piano roll wraz z podświetlaniem się aktualnie odtwarzanej informacji o dźwięku    
* **Tydzień 9 (12.05 - 18.05): Nowa funkcja** 
<br>Pracę nad podstroną do tworzenia własnego midi: Stworzenie nad backedznie odpowiednich funkcji wykorzystując bibliotekę MIDO do tworzenia midi, przygotowanie funkcji do API.    
* **Tydzień 10 (19.05 - 25.05):   Nowa funkcja cz.2** 
<br> Stworzenie na frontedzie obiektów wysyłajacych informacje do backendu o wywołanie nowo stworzonych funkcji. Dodanie operacji odtwarzania danej sekwencji przez klawiaturę ( Virtual MIDI)
* **Tydzień 11 (26.05 - 1.06):**   Oddanie projektu, poprawa ewentualnych błędów

W każdym z tych etapów, na bieżąco będzie aktualizowana dokumentacja projektu. Podkreśla się jednak, że harmonogram może ulec zmianie, ze względu na wystąpienie ewentualnych problemów.
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