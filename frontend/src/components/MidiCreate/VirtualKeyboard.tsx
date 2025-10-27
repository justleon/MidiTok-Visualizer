import React, { useEffect } from 'react';
import './VirtualKeyboard.css';

interface VirtualKeyboardProps {
  onNoteOn: (pitch: number, velocity: number) => void;
  onNoteOff: (pitch: number) => void;
  activeKeys: number[];
  setActiveKeys: React.Dispatch<React.SetStateAction<number[]>>;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onNoteOn,
  onNoteOff,
  activeKeys,
  setActiveKeys
}) => {
  const startOctave = 4;
  const numOctaves = 2;
  const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
  const blackKeys = [1, 3, 6, 8, 10];

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
  }, [activeKeys, onNoteOff, setActiveKeys]);

  useEffect(() => {
    const keyMap: { [key: string]: number } = {
      'a': 60,
      'w': 61,
      's': 62,
      'e': 63,
      'd': 64,
      'f': 65,
      't': 66,
      'g': 67,
      'y': 68,
      'h': 69,
      'u': 70,
      'j': 71,
      'k': 72,
      'o': 73,
      'l': 74,
      'p': 75,
      ';': 76,
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
            const pitch = (octave + 1) * 12 + noteInOctave;
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
            const pitch = (octave + 1) * 12 + noteInOctave;
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
        Play with your mouse or computer keyboard (A-L keys correspond to C4-E5). Press CTRL to delete node.
      </div>
    </div>
  );
};

export default VirtualKeyboard;