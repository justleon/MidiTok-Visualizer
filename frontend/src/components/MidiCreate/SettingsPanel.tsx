import React from 'react';
import './SettingsPanel.css';

interface SettingsPanelProps {
  ticksPerBeat: number;
  setTicksPerBeat: (value: number) => void;
  bpm: number;
  setBpm: (value: number) => void;
  outputFilename: string;
  setOutputFilename: (value: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  ticksPerBeat,
  setTicksPerBeat,
  bpm,
  setBpm,
  outputFilename,
  setOutputFilename
}) => {
  return (
    <div className="settings-panel">
      <h3>MIDI Settings</h3>
      <div>
        <label htmlFor="ticksPerBeat">Ticks per Beat: </label>
        <input
          type="number"
          id="ticksPerBeat"
          value={ticksPerBeat}
          onChange={(e) => setTicksPerBeat(parseInt(e.target.value, 10) || 480)}
          min="1"
        />
      </div>
      <div>
        <label htmlFor="bpm">BPM (for initial tempo): </label>
        <input
          type="number"
          id="bpm"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value, 10) || 120)}
          min="1"
        />
      </div>
      <div>
        <label htmlFor="outputFilename">Output Filename: </label>
        <input
          type="text"
          id="outputFilename"
          value={outputFilename}
          onChange={(e) => setOutputFilename(e.target.value || 'output.mid')}
        />
      </div>
    </div>
  );
};

export default SettingsPanel;