from core.service.midi import *
from core.service.midi.midi_loader import MidiLoader
from core.service.midi.note_extractor import NoteExtractor
from core.service.midi.midi_analyzer import MidiAnalyzer
from core.api.model import BasicInfoData, MetricsData, MusicInformationData
class MidiProcessor:
    def __init__(self):
        self.midi_loader = MidiLoader()
        self.note_extractor = NoteExtractor()
        self.midi_analyzer = MidiAnalyzer()

    def tokenize_midi_file(self,midi_bytes: bytes):
        midi = self.midi_loader.load_midi_toolkit(midi_bytes)
        notes = self.note_extractor.midi_to_notes(midi)
        return midi, notes

    def retrieve_information_from_midi(self,midi_bytes: bytes) -> MusicInformationData:
        midi = self.midi_loader.load_midi_toolkit(midi_bytes)
        midi_file_music=muspy.from_mido(midi)
        return self.midi_analyzer.analyze(midi_file_music)