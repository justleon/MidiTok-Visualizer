from io import BytesIO
from miditoolkit import MidiFile as MidiToolkitFile
from mido import MidiFile as MidoMidiFile


class MidiLoader:
    def __init__(self):
        pass

    def load_midi_toolkit(self, midi_bytes: bytes) -> MidiToolkitFile:
        try:
            return MidiToolkitFile(file=BytesIO(midi_bytes))
        except Exception as e:
            raise ValueError(f"Failed to load MIDI file with MidiToolkit: {str(e)}")

    def load_mido_midi(self, midi_bytes: bytes) -> MidoMidiFile:
        try:
            return MidoMidiFile(file=BytesIO(midi_bytes))
        except Exception as e:
            raise ValueError(f"Failed to load MIDI file with Mido: {str(e)}")
