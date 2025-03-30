import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Note, Token } from '../interfaces/ApiResponse';
import './PianoRollDisplay.css';

interface PianoRollDisplayProps {
  notes: Note[][];
  onNoteHover: (note: Note | null) => void;
  onNoteSelect: (note: Note | null) => void;
  track?: number;
  hoveredToken: Token | null;
  selectedToken: Token | null;
}

const PianoRollDisplay: React.FC<PianoRollDisplayProps> = ({
  notes,
  onNoteHover,
  onNoteSelect,
  hoveredToken,
  selectedToken,
  track = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pianoRollContainerRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  const trackNotes = useMemo(() => notes[track] || [], [notes, track]);
  const allNotes = useMemo(() => notes.flat(), [notes]);

  const globalLowestPitch = useMemo(
    () => (allNotes.length > 0 ? Math.min(...allNotes.map((n) => n.pitch)) : 60),
    [allNotes]
  );
  const globalHighestPitch = useMemo(
    () => (allNotes.length > 0 ? Math.max(...allNotes.map((n) => n.pitch)) : 72),
    [allNotes]
  );
  const globalMaxTime = useMemo(
    () => (allNotes.length > 0 ? Math.max(...allNotes.map((n) => n.end)) : 0),
    [allNotes]
  );

  const lowestOctaveNote = Math.floor(globalLowestPitch / 12) * 12 - 12;
  const highestOctaveNote = Math.ceil(globalHighestPitch / 12) * 12 + 11;

  const noteHeight = 20;
  const whiteKeyWidth = 75;
  const noteStartOffset = whiteKeyWidth + 10; 
  const timeScale = 0.5;

  const numKeys = highestOctaveNote - lowestOctaveNote + 1;
  const minGridWidth = 1000;
  const canvasHeight = numKeys * noteHeight;
  const canvasWidth = Math.max(globalMaxTime * timeScale + noteStartOffset, minGridWidth);

  const [hoveredNote, setHoveredNote] = useState<Note | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawGrid = () => {
      ctx.lineWidth = 0.5;

      for (let i = 0; i <= numKeys; i++) {
        const y = canvasHeight - i * noteHeight;
        ctx.strokeStyle = 'lightgray';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    };

    const drawNotes = () => {
      trackNotes.forEach((note) => {
        const highlight_token = hoveredToken && note.note_id === hoveredToken.note_id;
        const selected_token = selectedToken && note.note_id === selectedToken.note_id;
        const highlight_note = note === hoveredNote;
        const selected_note = note === selectedNote;

        const highlight = highlight_token || highlight_note;
        const selected = selected_token || selected_note;

        ctx.fillStyle = highlight ? 'yellow' : selected ? 'red' : 'blue';

        const x = note.start * timeScale + noteStartOffset;
        const width = Math.max((note.end - note.start) * timeScale, 1); 
        const y = canvasHeight - (note.pitch - lowestOctaveNote + 1) * noteHeight;

        ctx.beginPath();
        ctx.roundRect(x, y, width, noteHeight, 5);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    drawGrid();
    drawNotes();
  }, [
    trackNotes,
    hoveredToken,
    selectedToken,
    hoveredNote,
    selectedNote,
    lowestOctaveNote,
    numKeys,
    canvasHeight,
    canvasWidth,
    timeScale,
    noteStartOffset,
  ]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hovered = trackNotes.find((note) => {
      const noteX = note.start * timeScale + noteStartOffset;
      const noteWidth = (note.end - note.start) * timeScale;
      const noteY = canvasHeight - (note.pitch - lowestOctaveNote + 1) * noteHeight;

      return (
        x >= noteX &&
        x <= noteX + noteWidth &&
        y >= noteY &&
        y <= noteY + noteHeight
      );
    });
    setHoveredNote(hovered || null);
    onNoteHover(hovered || null);
  };

  const handleMouseLeave = () => {
    setHoveredNote(null);
    onNoteHover(null);
  };

  const handleNoteClick = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const clicked = trackNotes.find((note) => {
      const noteX = note.start * timeScale + noteStartOffset;
      const noteWidth = (note.end - note.start) * timeScale;
      const noteY = canvasHeight - (note.pitch - lowestOctaveNote + 1) * noteHeight;

      return (
        x >= noteX &&
        x <= noteX + noteWidth &&
        y >= noteY &&
        y <= noteY + noteHeight
      );
    });
    setSelectedNote(clicked || null);
    onNoteSelect(clicked || null);
  };

  useEffect(() => {
    const pianoRoll = pianoRollContainerRef.current;
    const bottomScroll = bottomScrollRef.current;

    if (pianoRoll && bottomScroll) {
      const onScroll = () => {
        bottomScroll.scrollLeft = pianoRoll.scrollLeft;
      };

      pianoRoll.addEventListener('scroll', onScroll);
      return () => {
        pianoRoll.removeEventListener('scroll', onScroll);
      };
    }
  }, []);

  const handleBottomScroll = () => {
    const pianoRoll = pianoRollContainerRef.current;
    const bottomScroll = bottomScrollRef.current;

    if (pianoRoll && bottomScroll) {
      pianoRoll.scrollLeft = bottomScroll.scrollLeft;
    }
  };

  return (
    <div className="piano-roll-container">
      <div ref={pianoRollContainerRef} className="piano-roll-scrollable">
        <div
          className="piano-roll-key-column"
          style={{ width: `${whiteKeyWidth}px`, height: `${canvasHeight}px` }}
        >
          {Array.from({ length: numKeys }, (_, i) => {
            const y = canvasHeight - (i + 1) * noteHeight;
            const noteNumber = lowestOctaveNote + i;
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const baseName = noteNames[noteNumber % 12];
            const isBlack = ['C#', 'D#', 'F#', 'G#', 'A#'].includes(baseName);
            const noteName = `${baseName}${Math.floor(noteNumber / 12) - 1}`;
  
            return (
              <div
                key={i}
                className={`piano-roll-key ${isBlack ? 'black' : 'white'}`}
                style={{
                  top: `${y}px`,
                  width: `${whiteKeyWidth}px`,
                  height: `${noteHeight}px`,
                }}
              >
                {noteName}
              </div>
            );
          })}
        </div>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleNoteClick}
          className="piano-roll-canvas"
        />
      </div>
  
      <div
        ref={bottomScrollRef}
        className="piano-roll-bottom-scroll"
        onScroll={handleBottomScroll}
      >
        <div
          className="piano-roll-bottom-scroll-placeholder"
          style={{ width: `${canvasWidth}px` }}
        />
      </div>
    </div>
  );
};

export default PianoRollDisplay;
