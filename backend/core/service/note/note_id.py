from miditok import Event
class NoteIDHandler:
    """
    Handles assigning note and track IDs to tokens in MIDI processing pipeline.

    This class is responsible for tracking and assigning unique identifiers to notes
    and tokens in processed MIDI data. It supports various tokenization schemes and
    can operate in both normal mode and programs mode depending on the configuration.

    Attributes:
        current_note_id: The ID of the currently processed note
        current_track_id: The ID of the current track being processed
        i: Counter used to track position in notes collection
        active_notes: Dictionary tracking active notes (for MIDILike tokenizer)
    """
    def __init__(self):
        self.current_note_id = None
        self.current_track_id = 0
        self.i = -1
        self.active_notes = {}

    def add_notes_id(self, tokens, notes, tokenizer, use_programs=False, base_tokenizer=None):
        """
        Assigns note and track IDs to tokens.

        Args:
            tokens: Tokens to process
            notes: List of notes from MIDI file
            tokenizer: Tokenizer type ("REMI", "CPWord", etc.)
            use_programs: Whether to use programs mode

        Returns:
            Processed tokens with assigned IDs
        """
        self._prepare_note_mappings(notes)

        if use_programs:
            handlers = {
                "REMI": self._process_tokens_REMI_use_programs,
                "Structured": self._process_tokens_REMI_use_programs,
                "TSD": self._process_tokens_REMI_use_programs,
                "CPWord": self._process_tokens_CPWord_use_programs,
                "MIDILike": self._process_tokens_MIDILike_use_programs,
            }
        else:
            handlers = {
                "REMI": self._process_tokens_REMI,
                "PerTok": self._process_tokens_REMI,
                "Structured": self._process_tokens_REMI,
                "TSD": self._process_tokens_REMI,
                "CPWord": self._process_tokens_CPWord,
                "MIDILike": self._process_tokens_MIDILike,
                "Octuple": self._process_tokens_Octuple,
                "MuMIDI": self._process_tokens_MuMIDI,
                "MMM": lambda t: self._process_tokens_MMM(t, base_tokenizer)
            }

        if tokenizer not in handlers:
            raise ValueError(f"Unsupported tokenizer: {tokenizer} with use_programs={use_programs}")
        if tokenizer == "MuMIDI" and not use_programs:
            tokens = self._add_events_to_mumidi(tokens)

        return handlers[tokenizer](tokens)

    def _prepare_note_mappings(self, notes):
        """Prepares mappings for note and track IDs"""
        tracks_len = [len(row) for row in notes]
        self.notes_ids = list(range(sum(tracks_len)))
        self.note_to_track = [track_id for track_id, l in enumerate(tracks_len) for _ in range(l)]




    def _set_non_pitch_attributes(self, token):
        """Sets attributes for non-Pitch tokens"""
        if token.type_ in ["Velocity", "Duration", "MicroTiming"]:
            token.note_id = self.current_note_id
            if not self.current_note_id:
                print("Warning: current_note_id is None!")
        else:
            token.note_id = None

    def _update_note_and_track_ids(self):
        """Updates current note and track IDs"""
        self.current_note_id = self.notes_ids[self.i] + 1
        self.current_track_id = self.note_to_track[self.i]

    def _increment_counter(self):
        """Increments note counter"""
        self.i += 1

    def _reset_counters(self):
        """Resets counters and current IDs"""
        self.i = -1
        self.current_note_id = None
        self.current_track_id = 0




    def _process_tokens_REMI(self, tokens):
        """Processes REMI tokens without use_programs"""
        self._reset_counters()
        for token_list in tokens:
            for token in token_list.events:
                token.track_id = self.current_track_id

                if token.type_ in ["Pitch", "PitchDrum"]:
                    self._increment_counter()
                    self._update_note_and_track_ids()
                    token.note_id = self.current_note_id
                else:
                    self._set_non_pitch_attributes(token)
        return tokens

    def _process_tokens_CPWord(self, tokens):
        """Processes CPWord tokens without use_programs"""
        self._reset_counters()
        for token_list in tokens:
            for compound_token in token_list.events:
                if compound_token[0].value == "Note":
                    for token in compound_token:
                        if token.type_ == "Pitch":
                            self._increment_counter()
                            self._update_note_and_track_ids()
                        token.note_id = self.current_note_id if token.type_ in ["Pitch", "Velocity","Duration"] else None
                        token.track_id = self.current_track_id
        return tokens

    def _process_tokens_MIDILike(self, tokens):
        """Processes MIDILike tokens without use_programs"""
        self._reset_counters()
        self.active_notes = {}
        for token_list in tokens:
            for token in token_list.events:
                if token.type_ == "NoteOn":
                    self._increment_counter()
                    self._update_note_and_track_ids()
                    self.active_notes[token.value] = (self.current_note_id, self.current_track_id)
                    token.note_id, token.track_id = self.current_note_id, self.current_track_id
                elif token.type_ == "Velocity":
                    token.note_id, token.track_id = self.current_note_id, self.current_track_id
                elif token.type_ == "NoteOff":
                    note_info = self.active_notes.pop(token.value, (None, self.current_track_id))
                    token.note_id, token.track_id = note_info
                    self.current_note_id = None
                else:
                    token.note_id, token.track_id = None, self.current_track_id
        return tokens

    def _process_tokens_Octuple(self, tokens):
        """Processes Octuple tokens without use_programs"""
        self._reset_counters()
        for token_list in tokens:
            for compound_token in token_list.events:
                if compound_token[0].type_ in ["Pitch", "PitchDrum"]:
                    for token in compound_token:
                        if token.type_ == "Pitch":
                            self._increment_counter()
                            self._update_note_and_track_ids()
                        token.note_id = self.current_note_id if token.type_ in ["Pitch", "Velocity", "Duration","Position", "Bar"] else None
                        token.track_id = self.current_track_id
        return tokens









    def _process_tokens_REMI_use_programs(self, tokens):
        """Processes REMI tokens with use_programs"""
        self._reset_counters()
        for token in tokens.events:
            if token.type_ == "Pitch":
                self._increment_counter()
                self._update_note_and_track_ids()
                token.note_id = self.current_note_id
                token.track_id = self.current_track_id
            elif token.type_ in ["Velocity", "Duration", "MicroTiming"]:
                if self.current_note_id is not None:
                    token.note_id = self.current_note_id
                    token.track_id = self.current_track_id
            else:
                token.note_id = None
        return tokens

    def _process_tokens_CPWord_use_programs(self, tokens):
        """Processes CPWord tokens with use_programs"""
        self._reset_counters()
        for token_list in tokens.events:
            for token in token_list:
                if token.type_ == "Pitch":
                    self._increment_counter()
                    self._update_note_and_track_ids()
                    token.note_id = self.current_note_id
                    token.track_id = self.current_track_id
                elif token.type_ in ["Velocity", "Duration"]:
                    if self.current_note_id is not None:
                        token.note_id = self.current_note_id
                        token.track_id = self.current_track_id
                else:
                    token.note_id = None
                    token.track_id = self.current_track_id
        return tokens

    def _process_tokens_MIDILike_use_programs(self, tokens):
        """Processes MIDILike tokens with use_programs"""
        self._reset_counters()
        self.active_notes = {}
        for token in tokens.events:
            if token.type_ == "NoteOn":
                self._increment_counter()
                self._update_note_and_track_ids()
                self.active_notes[token.value] = self.current_note_id
                token.note_id = self.current_note_id
                token.track_id = self.current_track_id
            elif token.type_ == "Velocity":
                if self.current_note_id:
                    token.note_id = self.current_note_id
                    token.track_id = self.current_track_id
            elif token.type_ == "NoteOff":
                if token.value in self.active_notes:
                    token.note_id = self.active_notes.pop(token.value)
                    token.track_id = self.current_track_id
                else:
                    token.note_id = None
                    token.track_id = self.current_track_id
                self.current_note_id = None
            else:
                token.note_id = None
                token.track_id = self.current_track_id
        return tokens

     # New methods for MuMIDI and MMM tokenizers
    def _add_events_to_mumidi(self, tokens):
        """
        MuMIDI tokenizer does not have the events attribute assigned by MIDITok's library.
        This method creates events from tokens attribute.
        """
        tokens.events = []
        for token_list in tokens.tokens:
            event_list = []
            for token in token_list:
                type_ = token.split("_")[0]
                value = token.split("_")[1]
                # Create Event object with type and value
                event_list.append(Event(type_, value))
            tokens.events.append(event_list)
        return tokens

    def _process_tokens_MuMIDI(self, tokens):
        """Processes MuMIDI tokens"""
        self._reset_counters()
        for token_list in tokens.events:
            for token in token_list:
                if token.type_ in ["Pitch", "PitchDrum"]:
                    self._increment_counter()
                    self._update_note_and_track_ids()
                    token.note_id = self.current_note_id
                    token.track_id = self.current_track_id
                elif token.type_ in ["Velocity", "Duration"]:
                    if self.current_note_id is None:
                        import warnings
                        warnings.warn("Warning: current_note_id is None!")
                        continue
                    token.note_id = self.current_note_id
                    token.track_id = self.current_track_id
                else:
                    token.note_id = None
                    token.track_id = self.current_track_id
        return tokens

    def _process_tokens_MMM(self, tokens, base_tokenizer):
        """
        Processes MMM tokens using a base tokenizer

        Args:
            tokens: Tokens to process
            base_tokenizer: Base tokenizer type used by MMM

        Returns:
            Processed tokens with assigned IDs
        """
        if base_tokenizer is None:
            raise ValueError("MMM tokenizers must have a specified base tokenizer!")

        self._reset_counters()

        if base_tokenizer == "MIDILike":
            for token in tokens.events:
                if token.type_ in ["NoteOn", "DrumOn"]:
                    self._increment_counter()
                    self._update_note_and_track_ids()
                    self.active_notes[token.value] = self.current_note_id
                    token.note_id = self.current_note_id
                    token.track_id = self.current_track_id
                elif token.type_ == "Velocity":
                    if self.current_note_id:
                        token.note_id = self.current_note_id
                        token.track_id = self.current_track_id
                elif token.type_ in ["NoteOff", "DrumOff"]:
                    if token.value in self.active_notes:
                        token.note_id = self.active_notes.pop(token.value)
                        token.track_id = self.current_track_id
                    else:
                        token.note_id = None
                        token.track_id = self.current_track_id
                    self.current_note_id = None
                else:
                    token.note_id = None
                    token.track_id = self.current_track_id

        elif base_tokenizer in ["REMI", "TSD"]:
            for token in tokens.events:
                if token.type_ in ["Pitch", "PitchDrum"]:
                    self._increment_counter()
                    self._update_note_and_track_ids()
                    token.note_id = self.current_note_id
                    token.track_id = self.current_track_id
                elif token.type_ in ["Velocity", "Duration"]:
                    if self.current_note_id is None:
                        import warnings
                        warnings.warn("Warning: current_note_id is None!")
                        continue
                    token.note_id = self.current_note_id
                    token.track_id = self.current_track_id
                else:
                    token.note_id = None
                    token.track_id = self.current_track_id
        else:
            raise ValueError(f"{base_tokenizer} is NOT a supported base tokenizer for MMM!")

        return tokens

