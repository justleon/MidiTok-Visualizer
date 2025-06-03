import React, { useState } from 'react';
import './DemoFile.css';

interface DemoFileProps {
  onFileLoaded: (file: File) => void;
  onDemoModeChange: (isInDemoMode: boolean) => void;
  isInDemoMode: boolean;
}

const DemoFile: React.FC<DemoFileProps> = ({
  onFileLoaded,
  onDemoModeChange,
  isInDemoMode
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMidiFromBase64 = () => {
    const workingMidiBase64 = "TVRoZAAAAAYAAAABAGBNVHJrAAAA2AD/AwAA/1gEBAIkCAD/WAQEAiQIAJApawCQLXUYgClAAIAtQBiQLVwYgC1AGJAoYgCQLXUYgChAAIAtQBiQLVwYgC1AGJApbgCQLXEYgClAAIAtQBiQLVkYgC1AGJAoYgCQLXEYgChAAIAtQBiQLVkYgC1AGJApbQCQLXUYgClAAIAtQBiQLVwYgC1AGJAoYgCQLXUYgChAAIAtQBiQLVwYgC1AGJApbQCQLXEYgClAAIAtQBiQLVkYgC1AGJAoYgCQLXEYgChAAIAtQBiQLVkYgC1AAP8vAA==";
    const binaryString = atob(workingMidiBase64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new File([bytes], "DEMO.file", { type: "audio/midi" });
  };

  const handleDemoButtonClick = () => {
    if (isInDemoMode) {
      onDemoModeChange(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const midiFile = createMidiFromBase64();
      onFileLoaded(midiFile);
      onDemoModeChange(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      onDemoModeChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="demo-file-container">
      <div className="file-input-container">
        <button
          className={`demo-file-button ${isInDemoMode ? 'demo-active' : ''}`}
          onClick={handleDemoButtonClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner-container">
              <div className="loading-spinner"></div>
              <span>Loading demo file...</span>
            </div>
          ) : isInDemoMode ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="demo-icon">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
              <span>Exit Demo Mode</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="demo-icon">
                <path d="M5 12h14M12 5v14"></path>
              </svg>
              <span>Load Demo MIDI</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="demo-file-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isInDemoMode && (
        <div className="demo-mode-banner">
          <div className="demo-mode-icon">🔍</div>
          <div className="demo-mode-text">
            <strong>Demo Mode Active</strong>
            <div>You're currently working with a demo MIDI file. File upload is disabled.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoFile;