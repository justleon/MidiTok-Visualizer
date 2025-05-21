import React from 'react';
import './PlaybackControls.css';

interface PlaybackControlsProps {
  isPlaying: boolean;
  isDrawing: boolean;
  isRecording: boolean;
  midiArray: number;
  stopPlayback: () => void;
  handlePlayMidi: () => void;
  handleGenerateMidi: () => void;
  clearCanvas: () => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isDrawing,
  isRecording,
  midiArray,
  stopPlayback,
  handlePlayMidi,
  handleGenerateMidi,
  clearCanvas
}) => {
  return (
    <div className="playback-controls">
      {isPlaying ? (
        <button
          onClick={stopPlayback}
          className="control-button stop-button"
        >
          Stop
        </button>
      ) : (
        <button
          onClick={handlePlayMidi}
          disabled={midiArray === 0 || isDrawing || isRecording}
          className="control-button play-button"
        >
          Play
        </button>
      )}
      <button
        onClick={handleGenerateMidi}
        disabled={isPlaying || midiArray === 0 || isDrawing || isRecording}
        className="control-button generate-button"
      >
        Generate and Download MIDI
      </button>
      <button
        onClick={clearCanvas}
        disabled={isPlaying || isDrawing}
        className="control-button clear-button"
      >
        Clear Canvas
      </button>
    </div>
  );
};

export default PlaybackControls;