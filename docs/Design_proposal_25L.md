## WIMU 25Z
Do ewentualnego przetłumaczenia na ang:

# Funkcje

* Poprawa błędów kodu i obsługa wyjątków - już podczas pierwszych testów napotkano na problemu związane z tokenizacją plików midi. Dla example_files wszystko fajnie działa ale losowy plik z internetu spowodował problem z jego rozpakowaniem. Tym samym chcemy wprowadzić obsługe błędów( dla przykładu podstawa czyli odczyt i zapis pliku), jak również tych wymagajacych restrukturyzacje funkcji. 

* Restrukturyzacja backendu- widać ze backend był pisany przez studentów, gdyż nie spełnia on żadnych zasad dobrego programowania obiektowego, tym bardziej zasad SOLID, przez co jedna funkcja ma po 150 linijek z x ifami.

* Dodanie do frontedu dynamicznego odtwarzania dźwięku wraz z piano rollem

* Ogarnięcie dokumentacji wraz z CICD - według grupy majacej ostatnio ten projekt, jest on bardzo nie uporzadkowany oraz brakuje komentarzy co i jak. Dlatego też chcielibyśmy pochylić się nad dokumentacją, która pozwalałaby lepiej rozwijać projekt. Chcielibysmy również stworzyć środowisko na bazie github actions umożliwiających automatyzację i usprawnienie procesów rozwoju, testowania oraz wdrażania aplikacji, a także integrację z generowaniem dokumentacji MkDocs.

* Edycja midi na stronie i jego zapis- dodanie zakładki umożliwiającej edycje pliku midi z ewentualna obsługa przez biblioteke mido urzadzen wysyłających komunikaty midi. 

* Dodanie testów jednostkowych, integracyjnych i wydajnościowych

* Ogarnięcie do porządku konfiguracje tokenizerów( json)

* Trzymanie w pamięci przegladarki załadowanych plików itp a nie za każdym razem ich ładowanie - o ile to nie wynika z ustawień dockera itp

* (opcja) Dodanie nowego tokenizera - program korzysta w pełni z biblioteki miditok i pobrał juz  wszystkie dostępne tokenizery



# Harmonogram projektu
Rozdzielić to na tygodnie

# Planowany stack technologiczny
Stack jez zależny od możliwości integracji aktualnej wersji projektu z nowymi narzedziami:

* Repozytorium: Github
* Testy: pytest, pytest-mock, pytest-benchamrk
* Backend: Python, FastAPI
* Frontend: React
* Dokumentacja: MkDocs material + plugin mkdocstrings
* CICD: github actions

