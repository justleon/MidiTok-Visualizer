# Podsumowanie projektu

W ramach projektu rozwinęliśmy narzędzie MidiTok Visualizer.  
Repozytorium: https://github.com/DukiDuki2000/MidiTok-Visualizer/tree/pr-5
Film przedstawiający zmiany: https://youtu.be/3Ks9YF1G9r0



## Główne zmiany
(Ciąg wszystkich zmian zawarty jest w Weekly_update.md)
* Dodano CI/CD dla backendu, frontendu oraz dla dokumentacji na GitHub Pages
* Stworzono automatyczną dokumentację backendu oraz modelu i API, jak również opisano proces deploy na Railway oraz uruchomienia aplikacji
* Przeorganizowano backend w klasy i odpowiadające jej metody. Dużo z klas zostało napisanych od początku - note_id, tokenizer_factory, midi_event
* Klasa MidiProcessing jest teraz klasą główną tworzącą obiekty
* Poprawiono błędy związane z plikami MIDI, dla których pierwszy token nie jest Pitch
* Przeorganizowano stronę do stylu formularza
* Dodano bardzo dużą ilość stylów dla komponentów we frontendzie
* Dodano przycisk demo, ładujący domyślnie wpisany w klasę plik midi-demofile.tsx
* Upload pliku MIDI dodaje go do aplikacji (pamięć tymczasowa), umożliwiając dodanie kilku plików i intuicyjny wybór do tokenizacji
* Plik MIDI można tokenizować kilka razy - nie trzeba za każdym razem odświeżać strony (tabs)
* Przeskalowano całą aplikację do działania na różnych urządzeniach w zależności od wielkości ekranu
* Zintegrowano odtwarzacz z piano rollem
* Odtwarzacz otrzymał informację o długości pliku, możliwość pause, jak również kontrolę głośności
* Odtwarzacz może teraz "grać" kilka zdefiniowanych instrumentów
* Dodano slider do piano rolla
* Dodano podświetlanie nut oraz ścieżek w piano rollu
* Dodano przycisk włączenia śledzenia slidera
* Dodano tokenizer MMM oraz MuMIDI
* Dodano animacje ładowania komponentów
* Dodano nową zakładkę tworzenia plików MIDI:
  * Dodano ustawienie BPM, tick per beat oraz nazwy pliku wyjściowego
  * Dodawanie nut myszką, usuwanie Ctrl
  * Opcja nagrywania poprzez virtual keyboard (klawiatura A-L lub ekran) lub urządzenia produkujące komunikaty MIDI
  * Opcja odtworzenia na urządzeniu MIDI
  * Możliwość dodawania do 5 ścieżek 
  * Możliwość usuwania nut z canvy
  * Stworzone dzieła można pobierać, jak również od razu wysłać do tokenizacji


## Dalszy rozwój projektu

* **Przeniesienie piano rolla** - aby wygodniej korzystać z piano rolla można go przeorganizować, dostosowując aplikację np. do działania jak w trybie podzielonego ekranu, gdzie dolna część ekranu to piano roll a górna to tokeny. Inna opcja to dwie strony współpracujące ze sobą
* **Dodanie edycji nut na piano rollu** - po załadowaniu pliku możliwość usuwania, skracania nut i przy tym bieżące pokazywanie zmian w tokenach
* **MidiTok jest już w prawie w pełni wykorzystany (stan na 05.25)** - więc może teraz użyć MusicLang tokenizer
* **Implementacja z Miditok tokenizera REMIPlus** 
* **Dodanie zmiany instrumentów do zakłądki "tworzenia MIDI"**
* **Generowanie wyników tokeniazcji do pliku**
* **Zakładka porównawcza wszystkich metod tokenizacji**- wybieramy plik, następnie generuje się wyniki ze wszystkich tokenizacji na jednej stronie (problem- dopasowanie konfiguracji)