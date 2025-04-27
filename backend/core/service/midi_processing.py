import math
from io import BytesIO
from typing import Any, List, Optional, Tuple

import muspy
import pydantic
from miditok import TokenizerConfig
from miditoolkit import MidiFile
from mido import MidiFile as MidoMidiFile

from core.api.model import BasicInfoData, ConfigModel, MetricsData, MusicInformationData, Note
from core.service.tokenizers.tokenizer_factory import TokenizerFactory

import warnings


def tokenize_midi_file(user_config: ConfigModel, midi_bytes: bytes) -> tuple[Any, list[list[Note]]]:
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
        "num_tempos": user_config.num_tempos,
        "tempo_range": tuple(user_config.tempo_range),
        "log_tempos": user_config.log_tempos,
        "delete_equal_successive_tempo_changes": user_config.delete_equal_successive_tempo_changes,
        "sustain_pedal_duration": user_config.sustain_pedal_duration,
        "pitch_bend_range": user_config.pitch_bend_range,
        "delete_equal_successive_time_sig_changes": user_config.delete_equal_successive_time_sig_changes,
        # added for pertok
        "use_programs": user_config.use_programs,
        "use_microtiming": user_config.use_microtiming,
        "ticks_per_quarter": user_config.ticks_per_quarter,
        "max_microtiming_shift": user_config.max_microtiming_shift,
        "num_microtiming_bins": user_config.num_microtiming_bins,
        # TODO: dynamic config preparation as not all tokenizers are compatible with program parameters
        # "programs": list(range(user_config.programs[0], user_config.programs[1])),
        # "one_token_stream_for_programs": user_config.one_token_stream_for_programs,
        # "program_changes": user_config.program_changes,
    }
    tokenizer_config = TokenizerConfig(**tokenizer_params)

    tokenizer_factory = TokenizerFactory()
    tokenizer = tokenizer_factory.get_tokenizer(user_config.tokenizer, tokenizer_config)

    midi = MidiFile(file=BytesIO(midi_bytes))

    tokens = tokenizer(midi)
    notes = midi_to_notes(midi)
    if not user_config.use_programs:
        tokens = add_notes_id(tokens, notes, user_config.tokenizer)
    else:
        tokens = add_notes_id_use_programs(tokens, notes, user_config.tokenizer)

    return tokens, notes


def retrieve_information_from_midi(midi_bytes: bytes) -> MusicInformationData:
    midi = MidoMidiFile(file=BytesIO(midi_bytes))
    midi_file_music = muspy.from_mido(midi)

    basic_data = retrieve_basic_data(midi_file_music)
    metrics = retrieve_metrics(midi_file_music)
    music_info_data = create_music_info_data(basic_data, metrics)

    if music_info_data is None:
        raise ValueError("Couldn't handle music information data")

    return music_info_data


def create_music_info_data(basic_info: BasicInfoData, metrics_data: MetricsData) -> Optional[MusicInformationData]:
    try:
        data = MusicInformationData(
            title=basic_info.title,
            resolution=basic_info.resolution,
            tempos=basic_info.tempos,
            key_signatures=basic_info.key_signatures,
            time_signatures=basic_info.time_signatures,
            pitch_range=metrics_data.pitch_range,
            n_pitches_used=metrics_data.n_pitches_used,
            polyphony=metrics_data.polyphony,
            empty_beat_rate=metrics_data.empty_beat_rate,
            drum_pattern_consistency=metrics_data.drum_pattern_consistency,
        )
        return data
    except pydantic.ValidationError as e:
        print(e)
        return None


def retrieve_basic_data(music_file: muspy.Music) -> BasicInfoData:
    tempos: List[Tuple[int, float]] = []
    for tempo in music_file.tempos:
        tempo_data: Tuple[int, float] = (tempo.time, tempo.qpm)
        tempos.append(tempo_data)

    key_signatures: List[Tuple[int, int, str]] = []
    for key_signature in music_file.key_signatures:
        signature_data: Tuple[int, int, str] = (key_signature.time, key_signature.root, key_signature.mode)
        key_signatures.append(signature_data)

    time_signatures: List[Tuple[int, int, int]] = []
    for time_signature in music_file.time_signatures:
        time_data: Tuple[int, int, int] = (time_signature.time, time_signature.numerator, time_signature.denominator)
        time_signatures.append(time_data)

    return BasicInfoData(music_file.metadata.title, music_file.resolution, tempos, key_signatures, time_signatures)


def retrieve_metrics(music_file: muspy.Music) -> MetricsData:
    pitch_range = muspy.pitch_range(music_file)
    n_pitches_used = muspy.n_pitches_used(music_file)

    polyphony_rate = muspy.polyphony(music_file)
    if math.isnan(polyphony_rate):
        polyphony_rate = 0.0

    empty_beat_rate = muspy.empty_beat_rate(music_file)
    if math.isnan(empty_beat_rate):
        empty_beat_rate = 0.0

    drum_pattern_consistency = muspy.drum_pattern_consistency(music_file)
    if math.isnan(drum_pattern_consistency):
        drum_pattern_consistency = 0.0

    return MetricsData(pitch_range, n_pitches_used, polyphony_rate, empty_beat_rate, drum_pattern_consistency)


def midi_to_notes(midi: MidiFile) -> List[List[Note]]:
    notes = []
    for instrument in midi.instruments:
        track_notes = []
        for note in instrument.notes:
            note_name = pitch_to_name(note.pitch)
            track_notes.append(Note(note.pitch, note_name, note.start, note.end, note.velocity))
        notes.append(track_notes)
    return notes


def pitch_to_name(pitch: int) -> str:
    note_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    octave = pitch // 12 - 1
    note = note_names[pitch % 12]
    return f"{note}{octave}"

# Assigns tokens to notes
def add_notes_id(tokens, notes, tokenizer):
    current_note_id = None
    notes_ids = []
    i = 0
    tracks_len = []
    for row in notes:
        tracks_len.append(len(row))
        for _ in row:
            notes_ids.append(i)
            i += 1

    note_to_track = []
    current_track_id = 0
    for track_len in tracks_len:
        for _ in range(track_len):
            note_to_track.append(current_track_id)
        current_track_id += 1

    if tokenizer in ["REMI", "PerTok", "Structured", "TSD"]:
        i = -1
        current_track_id = 0
        for token_list in tokens:
            for token in token_list.events:
                if token.type_ in ["Pitch", "PitchDrum"]:
                    i += 1
                    current_note_id = notes_ids[i] + 1
                    current_track_id = note_to_track[i]
                    token.note_id = current_note_id
                    token.track_id = current_track_id
                elif token.type_ in ["Velocity", "Duration", "MicroTiming"]:
                    if current_note_id is None:
                        warnings.warn("Warning: current_note_id is None!")
                        continue
                    if current_note_id is not None:
                        token.note_id = current_note_id
                        token.track_id = current_track_id
                else:
                    token.note_id = None
                    token.track_id = current_track_id
        return tokens

    elif tokenizer == "CPWord":
        i = -1
        for token_list in tokens:
            current_note_id = None
            for compound_token in token_list.events:
                if compound_token[0].value == "Note":
                    for token in compound_token:
                        if token.type_ == "Pitch":
                            i += 1
                            current_note_id = notes_ids[i] + 1
                            current_track_id = note_to_track[i]
                            token.note_id = current_note_id
                            token.track_id = current_track_id
                        elif token.type_ in ["Velocity", "Duration"]:
                            if current_note_id:
                                token.note_id = current_note_id
                                token.track_id = current_track_id
                        else:
                            token.note_id = None
                            token.track_id = current_track_id
        return tokens

    elif tokenizer == "MIDILike":
        active_notes = {}
        current_note_id = None
        i = -1
        for token_list in tokens:
            for token in token_list.events:
                if token.type_ == "NoteOn":
                    i += 1
                    current_note_id = notes_ids[i] + 1
                    current_track_id = note_to_track[i]
                    active_notes[token.value] = current_note_id
                    token.note_id = current_note_id
                    token.track_id = current_track_id
                elif token.type_ == "Velocity":
                    if current_note_id:
                        token.note_id = current_note_id
                        token.track_id = current_track_id
                elif token.type_ == "NoteOff":
                    if token.value in active_notes:
                        token.note_id = active_notes.pop(token.value)
                        token.track_id = current_track_id
                    else:
                        token.note_id = None
                        token.track_id = current_track_id
                    current_note_id = None
                else:
                    token.note_id = None
                    token.track_id = current_track_id
        return tokens

    elif tokenizer == "Octuple":
        i = -1
        for token_list in tokens:
            current_note_id = None
            for compound_token in token_list.events:
                if compound_token[0].type_ in ["Pitch", "PitchDrum"]:
                    for token in compound_token:
                        if token.type_ == "Pitch":
                            i += 1
                            current_note_id = notes_ids[i] + 1
                            current_track_id = note_to_track[i]
                            token.note_id = current_note_id
                            token.track_id = current_track_id
                        elif token.type_ in ["Velocity", "Duration", "Position", "Bar"]:
                            if current_note_id:
                                token.note_id = current_note_id
                                token.track_id = current_track_id
                        else:
                            token.note_id = None
                            token.track_id = current_track_id
        return tokens


def add_notes_id_use_programs(tokens, notes, tokenizer):
    current_note_id = None
    notes_ids = []
    i = 0
    tracks_len = []

    for row in notes:
        tracks_len.append(len(row))
        for _ in row:
            notes_ids.append(i)
            i += 1

    note_to_track = []
    current_track_id = 0

    for track_len in tracks_len:
        for _ in range(track_len):
            note_to_track.append(current_track_id)
        current_track_id += 1

    if tokenizer in ["REMI", "Structured", "TSD"]:
        i = -1
        for token in tokens.events:
            if token.type_ == "Pitch":
                i += 1
                current_note_id = notes_ids[i] + 1
                current_track_id = note_to_track[i]
                token.note_id = current_note_id
                token.track_id = current_track_id
            elif token.type_ in ["Velocity", "Duration", "MicroTiming"]:
                if current_note_id is not None:
                    token.note_id = current_note_id
                    token.track_id = current_track_id
            else:
                token.note_id = None
        return tokens

    elif tokenizer == "CPWord":
        i = -1
        for token_list in tokens.events:
            current_note_id = None
            for token in token_list:
                if token.type_ == "Pitch":
                    i += 1
                    current_note_id = notes_ids[i] + 1
                    current_track_id = note_to_track[i]
                    token.note_id = current_note_id
                    token.track_id = current_track_id
                elif token.type_ in ["Velocity", "Duration"]:
                    if current_note_id is not None:
                        token.note_id = current_note_id
                        token.track_id = current_track_id
                else:
                    token.note_id = None
                    token.track_id = current_track_id
        return tokens

    elif tokenizer == "MIDILike":
        active_notes = {}
        current_note_id = None
        i = -1
        for token in tokens.events:
            if token.type_ == "NoteOn":
                i += 1
                current_note_id = notes_ids[i] + 1
                current_track_id = note_to_track[i]
                active_notes[token.value] = current_note_id
                token.note_id = current_note_id
                token.track_id = current_track_id
            elif token.type_ == "Velocity":
                if current_note_id:
                    token.note_id = current_note_id
                    token.track_id = current_track_id
            elif token.type_ == "NoteOff":
                if token.value in active_notes:
                    token.note_id = active_notes.pop(token.value)
                    token.track_id = current_track_id
                else:
                    token.note_id = None
                    token.track_id = current_track_id
                current_note_id = None
            else:
                token.note_id = None
                token.track_id = current_track_id

        return tokens
