import math
from typing import List, Optional, Tuple

import muspy
import pydantic

from core.api.model import BasicInfoData, MetricsData, MusicInformationData


class MidiInformationExtractor:
    """
    Class for extracting musical information and metrics from MIDI files.
    """
    def __init__(self):
        pass


    def extract_information(self, midi_file_music: muspy.Music) -> MusicInformationData:
        """
        Extracts and returns information from a MIDI file.

        Args:
            midi_file_music: MIDI file loaded as muspy.Music object

        Returns:
            MusicInformationData with information about the MIDI file

        Raises:
            ValueError: If the music information data couldn't be created
        """
        basic_data = self._extract_basic_data(midi_file_music)
        metrics = self._extract_metrics(midi_file_music)
        music_info_data = self._create_music_info_data(basic_data, metrics)

        if music_info_data is None:
            raise ValueError("Couldn't handle music information data")

        return music_info_data

    def _create_music_info_data(self, basic_info: BasicInfoData, metrics_data: MetricsData) -> Optional[MusicInformationData]:
        """
        Creates MusicInformationData object from basic info and metrics.

        Args:
            basic_info: Basic information about the MIDI file
            metrics_data: Metrics extracted from the MIDI file

        Returns:
            MusicInformationData object or None if validation fails
        """
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

    def _extract_basic_data(self, music_file: muspy.Music) -> BasicInfoData:
        """
        Extracts basic data from a MIDI file.

        Args:
            music_file: MIDI file loaded as muspy.Music object

        Returns:
            BasicInfoData with basic information about the MIDI file
        """
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
            time_data: Tuple[int, int, int] = (
                time_signature.time, time_signature.numerator, time_signature.denominator)
            time_signatures.append(time_data)

        return BasicInfoData(music_file.metadata.title, music_file.resolution, tempos, key_signatures, time_signatures)

    def _extract_metrics(self, music_file: muspy.Music) -> MetricsData:
        """
        Extracts metrics from a MIDI file.

        Args:
            music_file: MIDI file loaded as muspy.Music object

        Returns:
            MetricsData with metrics extracted from the MIDI file
        """
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