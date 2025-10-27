from io import BytesIO
from miditoolkit import MidiFile as MidiToolkitFile
from mido import MidiFile as MidoMidiFile


class MidiLoader:
    """
    Utility class for loading MIDI files using different MIDI processing libraries.

    This class provides methods to load MIDI data using both miditoolkit and mido libraries,
    which offer different capabilities for MIDI file manipulation and analysis. The class
    handles the conversion of raw bytes to MIDI objects that can be processed by these libraries.
    """
    def __init__(self):
        pass

    def load_midi_toolkit(self, midi_bytes: bytes) -> MidiToolkitFile:
        """
        Load a MIDI file using the miditoolkit library.

        This method converts raw bytes into a MidiToolkitFile object, which provides
        comprehensive capabilities for MIDI manipulation, including note extraction,
        tempo and time signature analysis, and more.

        Args:
            midi_bytes: Raw MIDI file data as bytes.

        Returns:
            A MidiToolkitFile object representing the loaded MIDI file.

        Raises:
            ValueError: If the MIDI file cannot be loaded using miditoolkit,
                with details about the specific error.
        """
        try:
            return MidiToolkitFile(file=BytesIO(midi_bytes))
        except Exception as e:
            raise ValueError(f"Failed to load MIDI file with MidiToolkit: {str(e)}")

    def load_mido_midi(self, midi_bytes: bytes) -> MidoMidiFile:
        """
        Load a MIDI file using the mido library.

        This method converts raw bytes into a MidoMidiFile object, which provides
        low-level access to MIDI messages and is useful for MIDI message manipulation
        and analysis at the event level.

        Args:
            midi_bytes: Raw MIDI file data as bytes.

        Returns:
            A MidoMidiFile object representing the loaded MIDI file.

        Raises:
            ValueError: If the MIDI file cannot be loaded using mido,
                with details about the specific error.
        """
        try:
            return MidoMidiFile(file=BytesIO(midi_bytes))
        except Exception as e:
            raise ValueError(f"Failed to load MIDI file with Mido: {str(e)}")
