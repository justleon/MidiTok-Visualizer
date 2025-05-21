import React, { useState, useEffect } from 'react';
import './VirtualKeyboard.css';

interface VirtualKeyboardProps {
  onNoteOn: (pitch: number, velocity: number) => void;
  onNoteOff: (pitch: number) => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onNoteOn, onNoteOff }) => {
  const [activeKeys, setActiveKeys] = useState<number[]>([]);
  const startOctave = 4;
  const numOctaves = 2;
  const whiteKeys = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
  const blackKeys = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

  const handleMouseDown = (pitch: number) => {
    if (!activeKeys.includes(pitch)) {
      setActiveKeys(prev => [...prev, pitch]);
      onNoteOn(pitch, 90);
    }
  };

  const handleMouseUp = (pitch: number) => {
    setActiveKeys(prev => prev.filter(key => key !== pitch));
    onNoteOff(pitch);
  };
  useEffect(() => {
    const handleWindowMouseUp = () => {
      activeKeys.forEach(key => onNoteOff(key));
      setActiveKeys([]);
    };

    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, [activeKeys, onNoteOff]);

  useEffect(() => {
    const keyMap: { [key: string]: number } = {
      'a': 60, // C4
      'w': 61, // C#4
      's': 62, // D4
      'e': 63, // D#4
      'd': 64, // E4
      'f': 65, // F4
      't': 66, // F#4
      'g': 67, // G4
      'y': 68, // G#4
      'h': 69, // A4
      'u': 70, // A#4
      'j': 71, // B4
      'k': 72, // C5
      'o': 73, // C#5
      'l': 74, // D5
      'p': 75, // D#5
      ';': 76, // E5
    };

    const pressedKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (pressedKeys.has(e.key) || !keyMap[e.key]) return;

      pressedKeys.add(e.key);
      const pitch = keyMap[e.key];
      handleMouseDown(pitch);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!pressedKeys.has(e.key) || !keyMap[e.key]) return;

      pressedKeys.delete(e.key);
      const pitch = keyMap[e.key];
      handleMouseUp(pitch);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onNoteOn, onNoteOff]);

  return (
    <div className="virtual-keyboard">
      <h3>
        Virtual MIDI Keyboard
        <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>
          {activeKeys.length > 0 ? 'Playing: ' + activeKeys.map(key => {
            const octave = Math.floor(key / 12) - 1;
            const note = key % 12;
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            return `${noteNames[note]}${octave}`;
          }).join(', ') : ''}
        </span>
      </h3>
      <div className="keyboard-container">
        {Array.from({ length: numOctaves }).flatMap((_, octaveIdx) => {
          const octave = startOctave + octaveIdx;

          return whiteKeys.map(noteInOctave => {
            const pitch = octave * 12 + noteInOctave;
            const isActive = activeKeys.includes(pitch);

            return (
              <div
                key={`white-${pitch}`}
                className={`white-key ${isActive ? 'active' : ''}`}
                onMouseDown={() => handleMouseDown(pitch)}
                onMouseUp={() => handleMouseUp(pitch)}
                onMouseLeave={() => activeKeys.includes(pitch) && handleMouseUp(pitch)}
              >
                <div className="key-label">
                  {['C', 'D', 'E', 'F', 'G', 'A', 'B'][whiteKeys.indexOf(noteInOctave)]}{octave}
                </div>
              </div>
            );
          });
        })}

        {Array.from({ length: numOctaves }).flatMap((_, octaveIdx) => {
          const octave = startOctave + octaveIdx;

          return blackKeys.map(noteInOctave => {
            const pitch = octave * 12 + noteInOctave;
            const isActive = activeKeys.includes(pitch);
            const whiteKeyWidth = 100 / (whiteKeys.length * numOctaves);
            let leftPosition;
            const adjustedPosition = whiteKeys.findIndex(k => k > noteInOctave);
            if (adjustedPosition === -1) {
              leftPosition = `${(whiteKeys.length * octaveIdx + whiteKeys.length - 0.5) * whiteKeyWidth - 10}%`;
            } else {
              leftPosition = `${(whiteKeys.length * octaveIdx + adjustedPosition - 0.5) * whiteKeyWidth - 10}%`;
            }

            return (
              <div
                key={`black-${pitch}`}
                className={`black-key ${isActive ? 'active' : ''}`}
                style={{
                  left: leftPosition,
                  width: `calc(0.6 * ${whiteKeyWidth}%)`,
                }}
                onMouseDown={() => handleMouseDown(pitch)}
                onMouseUp={() => handleMouseUp(pitch)}
                onMouseLeave={() => activeKeys.includes(pitch) && handleMouseUp(pitch)}
              />
            );
          });
        })}
      </div>
      <div className="keyboard-help">
        Play with your mouse or computer keyboard (A-L keys correspond to C4-E5)
      </div>
    </div>
  );
};

export default VirtualKeyboard;