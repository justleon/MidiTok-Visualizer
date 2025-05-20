# MidiTokVisualizer

## MIDI Processing and Visualization Library

Welcome to the MidiTokVisualizer documentation! This library provides tools for processing, tokenizing, analyzing, and visualizing MIDI files through integration with the MidiTok package.

## Built on [MidiTok](https://miditok.readthedocs.io/en/latest/)

MidiTokVisualizer builds upon the MidiTok Python package, a powerful open-source library for MIDI file tokenization introduced at the ISMIR 2021 conference. MidiTok enables the conversion of MIDI files into token sequences that can be fed to machine learning models like Transformers for various music generation, transcription, and analysis tasks.

## Supported Tokenizers

MidiTokVisualizer currently supports the following tokenization methods from the MidiTok library:

- **REMI**: Represents music events based on relative timing and emphasizes musical structure
- **MIDILike**: A simpler representation that closely follows the raw MIDI message format
- **TSD**: Time-Shift-Duration tokenization which captures temporal relationships explicitly
- **Structured**: Provides a hierarchical representation of musical content
- **CPWord**: Compound Word tokenization for representing complex musical relationships
- **Octuple**: Multi-track tokenization with eight different token types
- **MuMIDI**: A multitrack tokenization that represents all tracks in a single token sequence
- **MMM**: A multitrack tokenization primarily designed for music inpainting and infilling
- **PerTok**: Per-token representation with advanced microtiming capabilities

Each tokenizer comes with customizable parameters to adapt to different musical tasks and genres.

## Key Features

- **Interactive Visualization**: View MIDI files and their tokenized representations side by side
- **Piano Roll Display**: Visualize notes and their relationship to tokens

## Getting Started

### Running the Application

MidiTokVisualizer can be run locally using Docker Compose or by setting up the development environment manually.

#### Using Docker Compose (Recommended)

The easiest way to run MidiTokVisualizer is with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/justleon/MidiTok-Visualizer.git
# Start the application
docker compose up
```

After running these commands, the application will be available at:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)

#### Running the Application Manually
##### Backend
```bash
# Install Poetry if you don't have it
pip install poetry
# Setup and run the backend
cd backend
poetry install
python main.py
```
##### Frontend
Requirements:
Node.js 21+ and npm
```bash
# Setup and run the frontend
cd frontend
npx serve -s build"
```
#### Running the Documentation

To build and serve the documentation locally:

```bash
# Serve the documentation
mkdocs serve
```

The documentation will be available at [http://localhost:8000](http://localhost:8000).

### Online Deployment

MidiTokVisualizer is also available online:

- Production deployment: [https://miditok-visualizer-front-production.up.railway.app/](https://miditok-visualizer-front-production.up.railway.app/)
- Documentation: [https://dukiduki2000.github.io/MidiTok-Visualizer/](https://dukiduki2000.github.io/MidiTok-Visualizer/)





