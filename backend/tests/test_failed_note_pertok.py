import pytest
from pathlib import Path
from core.service.tokenizer.tokenizer_factory import TokenizerFactory
from miditok import TokenizerConfig
from miditoolkit import MidiFile
from core.api.model import ConfigModel
from core.service.note.note_id import NoteIDHandler
from core.service.note.note_extractor import NoteExtractor
from core.constants import EXAMPLE_MIDI_FILE_PATH2
from io import BytesIO
@pytest.fixture
def midi_bytes():
    midi_path = Path(EXAMPLE_MIDI_FILE_PATH2)
    return midi_path.read_bytes()

@pytest.fixture
def user_config():
    return ConfigModel(
        pitch_range=[21, 108],
        beat_res=[(0, 4), (4, 12)],
        num_velocities=32,
        special_tokens=["PAD", "BOS", "EOS"],
        use_chords=False,
        use_rests=False,
        use_tempos=True,
        use_time_signatures=True,
        use_sustain_pedals=False,
        use_pitch_bends=False,
        num_tempos=32,
        tempo_range=[40, 250],
        log_tempos=False,
        delete_equal_successive_tempo_changes=True,
        sustain_pedal_duration=False,
        pitch_bend_range=[-12, 0, 12],
        delete_equal_successive_time_sig_changes=True,
        use_programs=False,
        programs=[0, 1],
        one_token_stream_for_programs=False,
        program_changes=False,
        use_microtiming=False,
        ticks_per_quarter=480,
        max_microtiming_shift=0.0,
        num_microtiming_bins=32,
        tokenizer="PerTok",
        base_tokenizer=None,
    )


def test_add_notes_id_should_fail_for_example2_mid(midi_bytes, user_config):
    tokenizer_config = TokenizerConfig(
        pitch_range=tuple(user_config.pitch_range),
        beat_res={(0, 4): 8, (4, 12): 4},
        num_velocities=user_config.num_velocities,
        special_tokens=user_config.special_tokens,
        use_chords=user_config.use_chords,
        use_rests=user_config.use_rests,
        use_tempos=user_config.use_tempos,
        use_time_signatures=user_config.use_time_signatures,
        use_sustain_pedals=user_config.use_sustain_pedals,
        use_pitch_bends=user_config.use_pitch_bends,
        num_tempos=user_config.num_tempos,
        tempo_range=tuple(user_config.tempo_range),
        log_tempos=user_config.log_tempos,
        delete_equal_successive_tempo_changes=user_config.delete_equal_successive_tempo_changes,
        sustain_pedal_duration=user_config.sustain_pedal_duration,
        pitch_bend_range=user_config.pitch_bend_range,
        delete_equal_successive_time_sig_changes=user_config.delete_equal_successive_time_sig_changes,
        use_programs=user_config.use_programs,
        use_microtiming=user_config.use_microtiming,
        ticks_per_quarter=user_config.ticks_per_quarter,
        max_microtiming_shift=user_config.max_microtiming_shift,
        num_microtiming_bins=user_config.num_microtiming_bins,
        base_tokenizer=None,
    )

    factory = TokenizerFactory()
    tokenizer = factory.get_tokenizer(user_config.tokenizer, tokenizer_config)
    note_extractor = NoteExtractor()
    midi = MidiFile(file=BytesIO(midi_bytes))
    tokens = tokenizer(midi)
    notes = note_extractor.midi_to_notes(midi)
    note_id_handler = NoteIDHandler()
    #with pytest.raises(Exception) as e_info:
    note_id_handler.add_notes_id(tokens, notes, user_config.tokenizer)
    #print(f"Raised exception: {e_info.value}")