# Model

### ConfigModel

Configuration model that defines the parameters for MIDI tokenization and processing.

```python
class ConfigModel(BaseModel):
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenizer` | `Literal` | The tokenization method to use. Options include "REMI", "REMIPlus", "MIDILike", "TSD", "Structured", "CPWord", "Octuple", "MuMIDI", "MMM", "PerTok". |
| `pitch_range` | `list[int]` | A list containing the minimum and maximum MIDI pitch values to consider (0-127). |
| `num_velocities` | `int` | The number of velocity levels to quantize to (0-127). |
| `special_tokens` | `list[str]` | List of special tokens to include in the vocabulary. |
| `use_chords` | `bool` | Whether to include chord tokens in the tokenization. |
| `use_rests` | `bool` | Whether to include rest tokens in the tokenization. |
| `use_tempos` | `bool` | Whether to include tempo tokens in the tokenization. |
| `use_time_signatures` | `bool` | Whether to include time signature tokens in the tokenization. |
| `use_sustain_pedals` | `bool` | Whether to include sustain pedal events in the tokenization. |
| `use_pitch_bends` | `bool` | Whether to include pitch bend events in the tokenization. |
| `num_tempos` | `NonNegativeInt` | The number of tempo levels to quantize to. |
| `tempo_range` | `list[NonNegativeInt]` | A list containing the minimum and maximum tempo values in BPM. |
| `log_tempos` | `bool` | Whether to use logarithmic scaling for tempo quantization. |
| `delete_equal_successive_tempo_changes` | `bool` | Whether to remove consecutive identical tempo changes. |
| `sustain_pedal_duration` | `bool` | Whether to include sustain pedal duration in tokenization. |
| `pitch_bend_range` | `list[int]` | A list of three values defining the minimum, maximum, and step size for pitch bend. |
| `delete_equal_successive_time_sig_changes` | `bool` | Whether to remove consecutive identical time signature changes. |
| `use_programs` | `bool` | Whether to include program change events in the tokenization. |
| `programs` | `Optional[list[int]]` | Optional range of MIDI program numbers to include. |
| `one_token_stream_for_programs` | `Optional[bool]` | Whether to use a single token stream for all programs. |
| `program_changes` | `Optional[bool]` | Whether to include program change events. |
| `use_microtiming` | `bool` | Whether to include microtiming information. |
| `ticks_per_quarter` | `int` | MIDI ticks per quarter note (24-960). |
| `max_microtiming_shift` | `float` | Maximum microtiming shift as a fraction of a beat (0-1). |
| `num_microtiming_bins` | `int` | Number of bins for quantizing microtiming (1-64). |


### MusicInformationData

Model that contains extracted information and metrics from a MIDI file.

```python
class MusicInformationData(BaseModel):
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | `str` | The title of the MIDI file. |
| `resolution` | `PositiveInt` | The MIDI file resolution (ticks per quarter note). |
| `tempos` | `list[tuple[NonNegativeInt, float]]` | List of tempo changes as (tick, tempo in BPM) pairs. |
| `key_signatures` | `list[tuple[NonNegativeInt, int, str]]` | List of key signature changes as (tick, key, mode) triplets. |
| `time_signatures` | `list[tuple[NonNegativeInt, int, int]]` | List of time signature changes as (tick, numerator, denominator) triplets. |
| `pitch_range` | `NonNegativeInt` | The range between the highest and lowest pitch used in the MIDI file. |
| `n_pitches_used` | `NonNegativeInt` | The number of unique pitches used in the MIDI file. |
| `polyphony` | `NonNegativeFloat` | The average number of simultaneous notes played. |
| `empty_beat_rate` | `NonNegativeFloat` | The ratio of beats with no notes to total beats. |
| `drum_pattern_consistency` | `NonNegativeFloat` | A measure of how consistent drum patterns are throughout the MIDI file (0-1). |

### BasicInfoData

Data class that contains basic information extracted from a MIDI file.

```python
@dataclass
class BasicInfoData:
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `title` | `str` | The title of the MIDI file. |
| `resolution` | `int` | The MIDI file resolution (ticks per quarter note). |
| `tempos` | `list[tuple[int, float]]` | List of tempo changes as (tick, tempo in BPM) pairs. |
| `key_signatures` | `list[tuple[int, int, str]]` | List of key signature changes as (tick, key, mode) triplets. |
| `time_signatures` | `list[tuple[int, int, int]]` | List of time signature changes as (tick, numerator, denominator) triplets. |

### MetricsData

Data class that contains calculated metrics from a MIDI file.

```python
@dataclass
class MetricsData:
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pitch_range` | `int` | The range between the highest and lowest pitch used in the MIDI file. |
| `n_pitches_used` | `int` | The number of unique pitches used in the MIDI file. |
| `polyphony` | `float` | The average number of simultaneous notes played. |
| `empty_beat_rate` | `float` | The ratio of beats with no notes to total beats. |
| `drum_pattern_consistency` | `float` | A measure of how consistent drum patterns are throughout the MIDI file (0-1). |

### Note

Data class representing a single note in a MIDI file.

```python
@dataclass
class Note:
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pitch` | `int` | The MIDI pitch value of the note (0-127). |
| `name` | `str` | The note name (e.g., "C4", "F#5"). |
| `start` | `int` | The start time of the note in MIDI ticks. |
| `end` | `int` | The end time of the note in MIDI ticks. |
| `velocity` | `int` | The velocity (loudness) of the note (0-127). |

