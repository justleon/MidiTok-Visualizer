import muspy

from core.constants import EXAMPLE_MIDI_FILE_PATH

from core.service.midi.midi_info_extractor import MidiInformationExtractor


def test_retrieve_basic_info():
    music_file = muspy.read(EXAMPLE_MIDI_FILE_PATH)
    midi_info_extractor = MidiInformationExtractor()
    basic_info_data=midi_info_extractor._extract_basic_data(music_file)
    assert basic_info_data
    print(basic_info_data)


def test_retrieve_metrics():
    music_file = muspy.read(EXAMPLE_MIDI_FILE_PATH)
    midi_info_extractor = MidiInformationExtractor()
    metrics=midi_info_extractor._extract_metrics(music_file)
    assert metrics
    print(metrics)


# def test_retrieve_info():
#     music_obj = open(EXAMPLE_MIDI_FILE_PATH, "rb")
#
#     music_obj_bytes: bytes = music_obj.read()
#     midi_info_extractor = MidiInformationExtractor()
#     music = midi_info_extractor.extract_information(music_obj_bytes)
#     assert music
#     print(music)
