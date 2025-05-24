import React from 'react';
import './SettingsPanel.css';

interface SettingsPanelProps {
  ticksPerBeat: number;
  setTicksPerBeat: (value: number) => void;
  bpm: number;
  setBpm: (value: number) => void;
  outputFilename: string;
  setOutputFilename: (value: string) => void;
  midiOctaveOffset: number;
  setMidiOctaveOffset: (value: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  ticksPerBeat,
  setTicksPerBeat,
  bpm,
  setBpm,
  outputFilename,
  setOutputFilename,
}) => {
  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      <div className="settings-grid">
        <div className="setting-item">
          <label>BPM:</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
            min="40"
            max="240"
          />
        </div>
        <div className="setting-item">
          <label>Ticks per Beat:</label>
          <input
            type="number"
            value={ticksPerBeat}
            onChange={(e) => setTicksPerBeat(parseInt(e.target.value) || 480)}
            min="96"
            max="960"
          />
        </div>
        <div className="setting-item">
          <label>Output Filename:</label>
          <input
            type="text"
            value={outputFilename}
            onChange={(e) => setOutputFilename(e.target.value)}
            placeholder="output.mid"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;