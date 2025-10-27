from core.api.model import  ConfigModel
class TokenizerConfigUser:
    """
    Adapter class that converts a user-provided ConfigModel into the format
    expected by the tokenizer implementation.
    """
    def __init__(self, user_config: ConfigModel):
        """
        Initialize the TokenizerConfigUser with parameters from a user ConfigModel.

        Args:
            user_config: The user-provided configuration model containing tokenization parameters.
        """
        self.pitch_range = tuple(user_config.pitch_range)
        self.beat_res = {(0, 4): 8, (4, 12): 4}
        self.num_velocities = user_config.num_velocities
        self.special_tokens = user_config.special_tokens
        self.use_chords = user_config.use_chords
        self.use_rests = user_config.use_rests
        self.use_tempos = user_config.use_tempos
        self.use_time_signatures = user_config.use_time_signatures
        self.use_sustain_pedals = user_config.use_sustain_pedals
        self.use_pitch_bends = user_config.use_pitch_bends
        self.num_tempos = user_config.num_tempos
        self.tempo_range = tuple(user_config.tempo_range)
        self.log_tempos = user_config.log_tempos
        self.delete_equal_successive_tempo_changes = user_config.delete_equal_successive_tempo_changes
        self.sustain_pedal_duration = user_config.sustain_pedal_duration
        self.pitch_bend_range = user_config.pitch_bend_range
        self.delete_equal_successive_time_sig_changes = user_config.delete_equal_successive_time_sig_changes
        self.use_programs = user_config.use_programs
        self.use_microtiming = user_config.use_microtiming
        self.ticks_per_quarter = user_config.ticks_per_quarter
        self.max_microtiming_shift = user_config.max_microtiming_shift
        self.num_microtiming_bins = user_config.num_microtiming_bins
        # added for MMM
        self.base_tokenizer= user_config.base_tokenizer

    def get_params(self) -> dict:
        """
        Get all configuration parameters as a dictionary.

        This method returns all the tokenizer configuration parameters in a
        dictionary format that can be passed to the tokenizer implementation.

        Returns:
            A dictionary containing all tokenizer configuration parameters.
        """
        return {
                "pitch_range": self.pitch_range,
                "beat_res": self.beat_res,
                "num_velocities": self.num_velocities,
                "special_tokens": self.special_tokens,
                "use_chords": self.use_chords,
                "use_rests": self.use_rests,
                "use_tempos": self.use_tempos,
                "use_time_signatures": self.use_time_signatures,
                "use_sustain_pedals": self.use_sustain_pedals,
                "use_pitch_bends": self.use_pitch_bends,
                "num_tempos": self.num_tempos,
                "tempo_range": self.tempo_range,
                "log_tempos": self.log_tempos,
                "delete_equal_successive_tempo_changes": self.delete_equal_successive_tempo_changes,
                "sustain_pedal_duration": self.sustain_pedal_duration,
                "pitch_bend_range": self.pitch_bend_range,
                "delete_equal_successive_time_sig_changes": self.delete_equal_successive_time_sig_changes,
                "use_programs": self.use_programs,
                "use_microtiming": self.use_microtiming,
                "ticks_per_quarter": self.ticks_per_quarter,
                "max_microtiming_shift": self.max_microtiming_shift,
                "num_microtiming_bins": self.num_microtiming_bins,
                "base_tokenizer": self.base_tokenizer,
            }