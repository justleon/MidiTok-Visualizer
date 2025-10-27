
from typing import Any, List, Optional, Tuple

import muspy

from miditok import TokenizerConfig


from core.api.model import BasicInfoData, ConfigModel, MetricsData, MusicInformationData, Note
from core.service.tokenizer.tokenizer_factory import TokenizerFactory
from core.service.midi.midi_loader import MidiLoader
from core.service.note.note_extractor import NoteExtractor
from core.service.tokenizer.tokenizer_config import TokenizerConfigUser
from core.service.note.note_id import NoteIDHandler
from core.service.midi.midi_info_extractor import MidiInformationExtractor
class MidiProcessor:
    def __init__(self,user_config: ConfigModel= None):
        """
        Initializes the MidiProcessor with required components.

        """
        self.user_config = user_config
        self.loader = MidiLoader()
        self.tokenizer_factory = TokenizerFactory()
        self.note_extractor = NoteExtractor()
        self.note_id_handler = NoteIDHandler()
        self.midi_info_extractor = MidiInformationExtractor()


    def tokenize_midi_file(self, user_config: ConfigModel, midi_bytes: bytes) -> tuple[Any, list[list[Note]]]:
        """
        Tokenizes a MIDI file based on user configuration.

        Args:
            user_config: Configuration model with tokenization parameters
            midi_bytes: Raw bytes of the MIDI file

        Returns:
            Tuple containing tokenized MIDI and extracted notes
        """

        tokenizer_config_user = TokenizerConfigUser(user_config)
        tokenizer_config = TokenizerConfig(**tokenizer_config_user.get_params())

        tokenizer = self.tokenizer_factory.get_tokenizer(user_config.tokenizer, tokenizer_config)

        midi = self.loader.load_midi_toolkit(midi_bytes)

        tokens = tokenizer(midi)

        notes = self.note_extractor.midi_to_notes(midi)
        tokens = self.note_id_handler.add_notes_id(tokens, notes, user_config.tokenizer,user_config.use_programs,user_config.base_tokenizer)

        return tokens, notes

    def retrieve_information_from_midi(self, midi_bytes: bytes) -> MusicInformationData:
        """
        Extracts musical information from a MIDI file.

        Args:
            midi_bytes: Raw bytes of the MIDI file

        Returns:
            MusicInformationData containing extracted information

        Raises:
            ValueError: If music information data could not be processed
        """

        midi = self.loader.load_mido_midi(midi_bytes)
        midi_file_music = muspy.from_mido(midi)

        return self.midi_info_extractor.extract_information(midi_file_music)



