from miditoolkit import MidiFile as MidiToolkitFile

from typing import List
from core.api.model import Note
class NoteExtractor:
    """
    Utility class for extracting note information from MIDI files.

    This class provides functionality to convert MIDI files into structured Note objects
    that contain detailed information about each note in the file, including pitch, note name,
    start time, end time, and velocity.
    """
    def __init__(self):
        pass
    def midi_to_notes(self, midi: MidiToolkitFile) -> List[List[Note]]:
        """
        Converts a MIDI file to a list of notes by track

        Args:
            midi: A MidiToolkitFile object

        Returns:
            A list of lists of Note objects, organized by track
        """
        notes = []
        for instrument in midi.instruments:
            track_notes = []
            for note in instrument.notes:
                note_name = self._pitch_to_name(note.pitch)
                track_notes.append(
                    Note(
                        note.pitch,
                        note_name,
                        note.start,
                        note.end,
                        note.velocity
                    )
                )
            notes.append(track_notes)
        return notes

    @staticmethod
    def _pitch_to_name(pitch: int) -> str:
        """
        Converts a MIDI pitch to a note name

        Args:
            pitch: MIDI pitch value

        Returns:
            String representation of the note (e.g., "C4")
        """
        note_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        octave = pitch // 12 - 1
        note = note_names[pitch % 12]
        return f"{note}{octave}"