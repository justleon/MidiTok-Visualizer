import pytest
from miditok import TokenizerConfig

from core.service.tokenizer.tokenizer_factory import TokenizerFactory


# MIDILike 64 warnings
# CPWord 2 warnings
# Octuple 1 warning

# nie ma MMM, MuMIDI

# General example - several tokenizers can use the same parameters
def test_get_tokenizer():
    tokenizers_list = ["REMI", "TSD", "Structured"]

    tokenizer_params = {
        "pitch_range": [21, 108],
        "num_velocities": 32,
        "special_tokens": ["PAD", "EOS", "MASK"],
        "use_chords": True,
        "use_rests": True,
        "use_tempos": True,
        "use_time_signatures": True,
        "use_sustain_pedals": True,
        "use_pitch_bends": True,
        "num_tempos": 32,
        "tempo_range": [30, 240],
        "log_tempos": False,
        "delete_equal_successive_tempo_changes": True,
        "sustain_pedal_duration": True,
        "pitch_bend_range": [-8192, 0, 8192],
        "delete_equal_successive_time_sig_changes": True,
        "programs": [0, 127],
        "one_token_stream_for_programs": True,
        "program_changes": False,
        "use_programs": False,
    }

    assert_tokenizers(tokenizers_list, tokenizer_params)

def test_get_tokenizer_midilike():
    tokenizers_list = ["MIDILike"]

    tokenizer_params = {
        "pitch_range": [21, 108],
        "num_velocities": 32,
        "special_tokens": ["PAD", "EOS", "MASK"],
        "use_chords": True,
        "use_rests": True,
        "use_tempos": True,
        "use_time_signatures": True,
        "use_sustain_pedals": True,
        "use_pitch_bends": True,
        "num_tempos": 32,
        "tempo_range": [30, 240],
        "log_tempos": False,
        "delete_equal_successive_tempo_changes": True,

        # Setting sustain_pedal_duration to True causes a lot of warnings
        "sustain_pedal_duration": False,
        # TODO: Maybe could be fixed with this setting?
        "beat_res": {(0, 4): 8, (4, 12): 4},

        "pitch_bend_range": [-8192, 0, 8192],
        "delete_equal_successive_time_sig_changes": True,
        "programs": [0, 127],
        "program_changes": False,
        "use_programs": False,
    }

    assert_tokenizers(tokenizers_list, tokenizer_params)


def test_get_tokenizer_cpword():
    tokenizers_list = ["CPWord"]

    tokenizer_params = {
        "pitch_range": [21, 108],
        "num_velocities": 32,
        "special_tokens": ["PAD", "EOS", "MASK"],
        "use_chords": True,
        "use_tempos": True,

        # With CPWord, rests and time signatures shouldn't be used simultaneously
        "use_rests": True,
        "use_time_signatures": False,

        "use_sustain_pedals": True,
        "use_pitch_bends": True,
        "num_tempos": 32,
        "tempo_range": [30, 240],
        "log_tempos": False,
        "delete_equal_successive_tempo_changes": True,
        "sustain_pedal_duration": True,
        "pitch_bend_range": [-8192, 0, 8192],
        "delete_equal_successive_time_sig_changes": True,
        "programs": [0, 127],
        # "one_token_stream_for_programs": True,
        "program_changes": False,
        "use_programs": False,
    }

    assert_tokenizers(tokenizers_list, tokenizer_params)

    tokenizer_params["use_rests"] = False
    tokenizer_params["use_time_signatures"] = True

    assert_tokenizers(tokenizers_list, tokenizer_params)


def test_get_tokenizer_octuple():
    tokenizers_list = ["Octuple"]

    tokenizer_params = {
        "pitch_range": [21, 108],
        "num_velocities": 32,
        "special_tokens": ["PAD", "EOS", "MASK"],
        "use_chords": True,
        "use_rests": True,
        "use_tempos": True,
        "use_time_signatures": True,
        "use_sustain_pedals": True,
        "use_pitch_bends": True,
        "num_tempos": 32,
        "tempo_range": [30, 240],
        "log_tempos": False,
        "delete_equal_successive_tempo_changes": True,
        "sustain_pedal_duration": True,
        "pitch_bend_range": [-8192, 0, 8192],
        "delete_equal_successive_time_sig_changes": True,
        "programs": [0, 127],
        #"one_token_stream_for_programs": True,
        "program_changes": False,
        "use_programs": False,
    }

    assert_tokenizers(tokenizers_list, tokenizer_params)


def test_get_tokenizer_pertok():
    tokenizers_list = ["PerTok"]

    tokenizer_params = {
        "pitch_range": [21, 108],
        "num_velocities": 32,
        "special_tokens": ["PAD", "EOS", "MASK"],
        "use_chords": True,
        "use_rests": True,
        "use_tempos": True,
        "use_time_signatures": True,
        "use_sustain_pedals": True,
        "use_pitch_bends": True,
        "num_tempos": 32,
        "tempo_range": [30, 240],
        "log_tempos": False,
        "delete_equal_successive_tempo_changes": True,
        "sustain_pedal_duration": True,
        "pitch_bend_range": [-8192, 0, 8192],
        "delete_equal_successive_time_sig_changes": True,
        "programs": [0, 127],
        "one_token_stream_for_programs": True,
        "program_changes": False,
        "use_programs": False,
        "use_microtiming": False,
        "ticks_per_quarter": 480,
        "max_microtiming_shift": 0.04,
        "num_microtiming_bins": 16,
        "beat_res": {(0, 4): 8, (4, 12): 4},
    }

    assert_tokenizers(tokenizers_list, tokenizer_params)

def assert_tokenizers(tokenizers_list, tokenizer_params):
    for tokenizer in tokenizers_list:
        try:
            tokenizer_factory = TokenizerFactory()
            config = TokenizerConfig(**tokenizer_params)
            tokenizer_factory.get_tokenizer(tokenizer, config)
        except Exception as e:
            assert False, f"'get_tokenizer' raised an exception {e}"

def test_get_tokenizer_fail():
    with pytest.raises(ValueError):
        tokenizer_factory = TokenizerFactory()
        config = TokenizerConfig()
        tokenizer_factory.get_tokenizer("SomeRandomString", config)
