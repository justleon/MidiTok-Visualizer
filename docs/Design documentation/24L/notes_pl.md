# WIMU-MidiTokVisualizer

MidiTok Visualizer to aplikacja webowa pozwalająca na wizualizację tokenizacji plików MIDI przez bibliotekę MidiTok.

**Funkcjonalność dodana w wersji 2023Z:**
- wgrywanie pliku MIDI z urządzenia,
- wybranie tokenizera i jego parametrów,
- przegląd wyodrębnionych tokenów w formacie przyjaznym dla użytkownika,
- przegląd metryk symbolicznych (takich jak klucz, metrum, tempo) na podstawie MIDI

**Funkcjonalność dodana w wersji 2024L:**
- zmiana metody prezentacji tokenów na sposób bardziej czytelny (wyświetlanie w rzędach),
- możliwość wgrywania wielu plików i przełączania się pomiędzy nimi,
- wyświetlanie piano roll'a z wgranym plikiem MIDI (osobne track'i/programy w osobnych zakładkach),
- możliwość odtworzenia wgranego pliku MIDI,
- możliwość zaznaczania i podświetlania tokenów oraz odpowiadających im dźwięków na piano roll'u
- wyświetlanie szczegółowych informacji o tokenie w osobnej, powiększonej ramce

**Potencjalna funkcjonalność do dodania w przyszłych wersjach:**
- poprawa wydajności działania aplikacji przy wgrywanych bardzo dużych plikach MIDI,
- dodanie implementacji reszty tokenizerów (MMM, MuMIDI, REMIPlus),
- poprawa ogólnej oprawy graficznej aplikacji,
- dodanie śledzenia obecnie odtwarzanej pozycji na piano roll'u


### Proces developerski

W celu zachowania zasad clean code, przed wrzuceniem commita na brancha, zaleca się wykonanie pre-commita. Aby uruchomić pre-commit, należy użyć komendy:

```
cd backend
pre-commit run --all-files
```

W skład skryptu pre-commit wchodzą:

- black (formatowanie)
- ruff (linting)
- isort (sortowanie importów)
- mypy (weryfikacja typowania)

### Budowanie i uruchamianie aplikacji

#### Aplikacja frontendowa

Podstawowe uruchamianie aplikacji:

```
cd frontend
npm install
npm run dev
```

Uruchamianie aplikacji przy pomocy Dockera:

```
cd frontend
docker build . -t frontend
docker run frontend -p 3000:3000
```

#### Aplikacja backendowa

Podstawowe uruchamianie aplikacji:

```
cd backend
poetry shell
poetry install
python -m core.main
```

lub

```
poetry run python -m core.main
```

Uruchamianie aplikacji przy pomocy Dockera:

```
cd backend
DOCKER_BUILDKIT=1 docker build --target=runtime . -t backend
docker run backend -p 8000:8000
```

#### Docker Compose

Możliwe jest również uruchomienie całego projektu przy użyciu Docker Compose:

```
docker-compose up --build
```

### Testowanie aplikacji

#### Aplikacja frontendowa

Testy jednostkowe uruchamiane są przy użyciu *jest*:

```
cd frontend
npm install
npm run test
```

### Aplikacja backendowa

Testy jednostkowe uruchamiane są przy użyciu *pytest*:

```
poetry shell
poetry install
pytest
```

lub:

```
poetry run pytest
```

### Logi

Zaimplementowano *middleware* na bazie *starlette*, który przy użyciu modułu *logging* tworzy logi dla każdego zapytania do serwera. Pojedynczy wpis w logach zawiera podstawowe dane dla pojedynczego zapytania oraz odpowiedzi serwera, jak również czas przetwarzania zapytania. Domyślnie logi zapisywane są do pliku *logfile.log*.

### Deployment

Obie aplikacje są hostowane na Heroku. Aplikacja frontendowa jest dostępna pod adresem: [https://wimu-frontend-ccb0bbc023d3.herokuapp.com](https://wimu-frontend-ccb0bbc023d3.herokuapp.com)

### Oryginalni autorzy (2023Z)

- Łukasz Pokorzyński
- Olga Sapiechowska
- Michał Wiszenko

### Autorzy rozwijający projekt (2024L)

- Kacper Stefański
- Konstantin Panov
- Piotr Malesa

### Planowany harmonogram prac projektu

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