from miditok import TokenizerConfig
from core.api.model import ConfigModel
class TokenizerFactory:
    def __init__(self):
        self.registry = TokenizerRegistry()

    def create_tokenizer(self, user_config: ConfigModel):
        """Creates a tokenizer based on user configuration"""
        tokenizer_type = user_config.tokenizer
        tokenizer_config = self._create_tokenizer_config(user_config)

        return self.registry.get_tokenizer(tokenizer_type, tokenizer_config)

    def _create_tokenizer_config(self, user_config: ConfigModel) -> TokenizerConfig:
        """Creates a TokenizerConfig object from user configuration"""
        tokenizer_params = {
            "pitch_range": tuple(user_config.pitch_range),
            "beat_res": {(0, 4): 8, (4, 12): 4},
            "num_velocities": user_config.num_velocities,
            "special_tokens": user_config.special_tokens,
            "use_chords": user_config.use_chords,
            "use_rests": user_config.use_rests,
            "use_tempos": user_config.use_tempos,
            "use_time_signatures": user_config.use_time_signatures,
            "use_sustain_pedals": user_config.use_sustain_pedals,
            "use_pitch_bends": user_config.use_pitch_bends,
            "nb_tempos": user_config.nb_tempos,
            "tempo_range": tuple(user_config.tempo_range),
            "log_tempos": user_config.log_tempos,
            "delete_equal_successive_tempo_changes": user_config.delete_equal_successive_tempo_changes,
            "sustain_pedal_duration": user_config.sustain_pedal_duration,
            "pitch_bend_range": user_config.pitch_bend_range,
            "delete_equal_successive_time_sig_changes": user_config.delete_equal_successive_time_sig_changes,
            "use_programs": user_config.use_programs,
            "use_microtiming": user_config.use_microtiming,
            "ticks_per_quarter": user_config.ticks_per_quarter,
            "max_microtiming_shift": user_config.max_microtiming_shift,
            "num_microtiming_bins": user_config.num_microtiming_bins,
        }

        return TokenizerConfig(**tokenizer_params)