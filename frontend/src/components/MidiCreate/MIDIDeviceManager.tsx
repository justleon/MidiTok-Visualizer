import React from 'react';
import './MIDIDeviceManager.css';

interface MIDIDeviceManagerProps {
  midiInputDevices: WebMidi.MIDIInput[];
  midiOutputDevices: WebMidi.MIDIOutput[];
  selectedInputIndex: number;
  selectedOutputIndex: number;
  setSelectedInputIndex: (index: number) => void;
  setSelectedOutputIndex: (index: number) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  handlePlayOnDevice: () => void;
}

const MIDIDeviceManager: React.FC<MIDIDeviceManagerProps> = ({
  midiInputDevices,
  midiOutputDevices,
  selectedInputIndex,
  selectedOutputIndex,
  setSelectedInputIndex,
  setSelectedOutputIndex,
  isRecording,
  startRecording,
  stopRecording,
  handlePlayOnDevice
}) => {
  return (
    <div className="midi-device-manager">
      <h3>MIDI Devices</h3>
      <div className="device-container">
        {/* Input devices */}
        <div className="device-section">
          <h4>Input Devices {midiInputDevices.length === 0 && <span style={{ color: '#666', fontWeight: 'normal', fontSize: '12px' }}>(None available - using virtual keyboard)</span>}</h4>
          <select
            className="device-select"
            value={selectedInputIndex}
            onChange={(e) => setSelectedInputIndex(parseInt(e.target.value, 10))}
          >
            <option value={-1}>Select MIDI Input...</option>
            {midiInputDevices.map((device, index) => (
              <option key={`input-${index}`} value={index}>
                {device.name || `Input Device ${index + 1}`}
              </option>
            ))}
          </select>
          <div>
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="record-button recording"
              >
                ■ Stop Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="record-button not-recording"
              >
                ● Record {selectedInputIndex < 0 ? 'Virtual Keyboard' : 'MIDI Input'}
              </button>
            )}
          </div>
        </div>

        {/* Output devices */}
        <div className="device-section">
          <h4>Output Devices</h4>
          <select
            className="device-select"
            value={selectedOutputIndex}
            onChange={(e) => setSelectedOutputIndex(parseInt(e.target.value, 10))}
          >
            <option value={-1}>Select MIDI Output...</option>
            {midiOutputDevices.map((device, index) => (
              <option key={`output-${index}`} value={index}>
                {device.name || `Output Device ${index + 1}`}
              </option>
            ))}
          </select>
          <div>
            <button
              onClick={handlePlayOnDevice}
              disabled={selectedOutputIndex < 0}
              className="play-device-button"
            >
              Play via MIDI Device
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIDIDeviceManager;