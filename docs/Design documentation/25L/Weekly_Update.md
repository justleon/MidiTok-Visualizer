# Weekly Update
## Tydzień 1 (17.03 - 23.03): Wprowadzenie do projektu
W tym tygodniu przygotowano środowisko do pracy nad projektem u wszystkich członków zespołu, wniesiono poprawki do design proposal, które wymagają jeszcze akceptacji. Skontaktowano się z twórcą, jak również poprzednikami projektu w celach dalszych usprawnień. Zapoznano się ze strukturą projektu, użytymi narzędziami, bibliotekami. 
## Tydzień 2 (24.03 - 30.03): Aktualizacja wersji projektu
Tydzień ten poświęcono na omówienie z twórcą projektu proponowanych zmian, jak również przekazano pierwsze uwagi dotyczące działania aplikacji. Dodatkowo grupa wzięła udział przy omawianiu najnowszej aktualizacji projektu z 24L.
## Tydzień 3 (31.03 - 06.04): Wdrożenie CICD
Dodano wstępna wersje CI zawierającą budowanie dokumentacji w MKDocs, planowana jest w trakcie rozbudowa dokumentacji o kolejne rozdziały, jak również ustawienie automatycznej dokumentacji na podstawie kodu. Cały czas trwa walka z odpowiednim ustawieniem deploy na heroku - występuje tutaj problemy z routing'iem, jednak żeby nie tracić czasu zostanie to przełożone na inne tygodnie. W kolejnym tygodniu zostanie rozbudowane automatyczne testowanie. W tym miejscu plan zostaje opóźniony min o tydzień.   
## Tydzień 4 (07.04 - 13.04): Podjęcie działań ze zmianami w backendzie
Dodano CI pod frontend oraz backend.
Dodano w nomwym backendzie klasy midi_loader,note id, note exctractor
## Tydzień 5 (14.04 - 20.04): Dalsze działania z backendem
Dodano w Frontendzie możliwość tokenizacji jednego pliku różnymi tokenizarami
Dodano w nomwym backendzie klasy tokenizer_factory oraz tokenizer_config, midi_processing
Przygotowano wstępną canve w react, umożliwiającą tworzenie oraz modyfikacje bloczków, jak również wyciągnięto informacje o pozycji oraz wielkości bloczków, które w przyszłości zostano przekształcone w Midi  
## Tydzień 6 (21.04 - 27.04):Rozpoczęcie pracy z Frontendem
- Dodano deploy na railway(https://miditok-visualizer-front-production.up.railway.app/), jak również poprawiono api w którym występował problem przy aplikacji zdeployowanej. Problem dotyczy konstrukcji tworzenia zapytania process, gdzie w backendzie przekazywano w jednym request jednocześnie body JSON oraz plik, co w Fastapi opartym na pydantic nie jest wspierane i zgodne z zasadami. Lokalnie opcja działała, dlatego że użyto Uvicorn. 
- Usunięto design propsale z dokumentacji. Dodano dokumentacje dotyczącą deploy.
- Dodano test dla tokenizera PERTOK, który w backendzie wywołuje błąd -name 'current_note_id' is not defined. Błąd został naprawiony w nowszej wersji backendu.
- Dodano w Frontendzie możliwość tokenizacji jednego pliku, różnymi tokenizerami bez wymogu każdorazowego wysyłania pliku.
- W tym tygodniu cały czas rozwijany jest backend.
## Tydzień 7 (28.04 - 04.05):    *Majówka*
## Tydzień 8 (05.05 - 11.05):Dalsze prace nad Frontedem:
## Tydzień 9 (12.05 - 18.05): Nowa funkcja
## Tydzień 10 (19.05 - 25.05):   Nowa funkcja cz.2
## Tydzień 11 (26.05 - 1.06):   Oddanie projektu, poprawa ewentualnych błędów