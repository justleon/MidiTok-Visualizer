from test import *



class TestMidiLoader(unittest.TestCase):
    def setUp(self):
        self.midi_loader = MidiLoader()
        self.mock_midi_bytes = b'MThd' + b'\x00\x00\x00\x06' + b'\x00\x01' + b'\x00\x01' + b'\x01\xE0'

    @patch('backend_new.core.service.midi.midi_loader.MidiToolkitFile')
    def test_load_midi_toolkit(self, mock_midi_toolkit):
        mock_instance = Mock()
        mock_midi_toolkit.return_value = mock_instance

        with patch('io.BytesIO', return_value=MagicMock()) as mock_bytesio:
            result = self.midi_loader.load_midi_toolkit(self.mock_midi_bytes)

        mock_midi_toolkit.assert_called_once()
        self.assertEqual(result, mock_instance)

    @patch('backend_new.core.service.midi.midi_loader.MidoMidiFile')
    def test_load_mido_midi(self, mock_mido_midi):
        mock_instance = Mock()
        mock_mido_midi.return_value = mock_instance

        with patch('io.BytesIO', return_value=MagicMock()) as mock_bytesio:
            result = self.midi_loader.load_mido_midi(self.mock_midi_bytes)

        mock_mido_midi.assert_called_once()
        self.assertEqual(result, mock_instance)