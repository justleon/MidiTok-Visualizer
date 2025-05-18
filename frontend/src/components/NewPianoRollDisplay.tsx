import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { Note, Token } from '../interfaces/ApiResponse';
import './NewPianoRollDisplay.css';

interface NewPianoRollDisplayProps {
    notes: Note[][];
    onNoteHover: (note: Note | null) => void;
    onNoteSelect: (note: Note | null) => void;
    track?: number;
    hoveredToken: Token | null;
    selectedToken: Token | null;
    file: File;
}

const NewPianoRollDisplay: React.FC<NewPianoRollDisplayProps> = ({
                                                               notes,
                                                               onNoteHover,
                                                               onNoteSelect,
                                                               hoveredToken,
                                                               selectedToken,
                                                               track = 0,
                                                               file,
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

    const globalRightmostNote = useMemo(
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

    const [midi, setMidi] = useState<Midi | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [synths, setSynths] = useState<Record<number, Tone.PolySynth>>({});
    const [part, setPart] = useState<Tone.Part | null>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(-10);
    const [loading, setLoading] = useState(true);


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPlaylinePosition = (progress: number, duration: number) : number => {

        const initialPosition = whiteKeyWidth + 15; // TODO: get a better estimate

        const newPosition = initialPosition + timeScale * globalRightmostNote * progress/duration;

        return newPosition;
    }

    const createInstrumentSynth = (instrumentNumber: number) => {

        let oscillatorType = 'triangle';
        let attack = 0.02;
        let decay = 0.1;
        let sustain = 0.7;
        let release = 0.8;

        if (instrumentNumber >= 0 && instrumentNumber <= 7) {
            oscillatorType = 'triangle';attack = 0.01;decay = 0.1;sustain = 0.7;release = 0.8;
        } else if (instrumentNumber >= 8 && instrumentNumber <= 15) {
            oscillatorType = 'sine';attack = 0.01;decay = 0.5;sustain = 0.1;release = 1.0;
        } else if (instrumentNumber >= 16 && instrumentNumber <= 23) {
            oscillatorType = 'sawtooth';attack = 0.05;decay = 0.1;sustain = 0.9;release = 0.3;
        } else if (instrumentNumber >= 24 && instrumentNumber <= 31) {
            oscillatorType = 'fmsine';attack = 0.01;decay = 0.2;sustain = 0.5;release = 0.5;
        } else if (instrumentNumber >= 32 && instrumentNumber <= 39) {
            oscillatorType = 'fmsawtooth';attack = 0.01;decay = 0.3;sustain = 0.4;release = 0.3;
        } else if (instrumentNumber >= 40 && instrumentNumber <= 47) {
            oscillatorType = 'sine';attack = 0.05;decay = 0.3;sustain = 0.8;release = 0.8;
        } else if (instrumentNumber >= 56 && instrumentNumber <= 63) {
            oscillatorType = 'sawtooth';attack = 0.03;decay = 0.3;sustain = 0.7;release = 0.4;
        } else if (instrumentNumber >= 72 && instrumentNumber <= 79) {
            oscillatorType = 'sine';attack = 0.05;decay = 0.1;sustain = 0.7;release = 0.3;
        } else if (instrumentNumber >= 80 && instrumentNumber <= 87) {
            oscillatorType = 'square';attack = 0.01;decay = 0.1;sustain = 0.9;release = 0.4;
        } else if (instrumentNumber >= 88 && instrumentNumber <= 95) {
            oscillatorType = 'sine';attack = 0.1;decay = 0.3;sustain = 0.9;release = 2.0;
        }

        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: oscillatorType as any },
            envelope: { attack, decay, sustain, release }
        });

        synth.volume.value = volume;
        synth.toDestination();
        return synth;
    };

    useEffect(() => {
        const loadMidi = async () => {
            setLoading(true);
            try {
                const arrayBuffer = await file.arrayBuffer();
                const midiData = new Midi(arrayBuffer);
                setMidi(midiData);

                const totalDuration = Math.max(
                    ...midiData.tracks.flatMap((track) =>
                        track.notes.map((note) => note.time + note.duration)
                    ), 0
                );
                setDuration(totalDuration);

                const synthsMap: Record<number, Tone.PolySynth> = {};

                midiData.tracks.forEach((track, index) => {
                    const instrumentNumber = track.instrument ? track.instrument.number : 0;
                    const synth = createInstrumentSynth(instrumentNumber);
                    synthsMap[index] = synth;
                });

                setSynths(synthsMap);
                setLoading(false);
            } catch (error) {
                console.error("MIDI file loading error:", error);
                setLoading(false);
            }
        };

        loadMidi();

        return () => {
            Tone.Transport.stop();
            Tone.Transport.cancel();
            Object.values(synths).forEach(synth => synth.dispose());
        };
    }, [file]);

    useEffect(() => {
        Object.values(synths).forEach(synth => {
            synth.volume.value = volume;
        });
    }, [volume, synths]);

    const playMidi = async () => {
        if (!midi || Object.keys(synths).length === 0) return;

        await Tone.start();

        if (isPaused) {
            Tone.Transport.start();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        if (part) {
            part.dispose();
        }

        const allNotes = midi.tracks.flatMap((track, trackIndex) => {
            return track.notes.map(note => ({
                time: note.time,
                note: note.name,
                duration: note.duration,
                velocity: note.velocity,
                trackIndex
            }));
        });

        const midiPart = new Tone.Part((time, noteData) => {
            const { note, duration, velocity, trackIndex } = noteData;
            const synth = synths[trackIndex];
            if (synth) {
                synth.triggerAttackRelease(
                    note,
                    duration,
                    time,
                    velocity
                );
            }
        }, allNotes).start(0);

        setPart(midiPart);

        Tone.Transport.scheduleRepeat(() => {
            setProgress(Tone.Transport.seconds);
        }, 0.1);

        Tone.Transport.schedule(() => {
            stopMidi();
        }, duration);

        Tone.Transport.start();
        setIsPlaying(true);
    };

    const pauseMidi = () => {
        if (isPlaying) {
            Tone.Transport.pause();
            setIsPlaying(false);
            setIsPaused(true);
        }
    };

    const stopMidi = () => {
        if (part) {
            part.dispose();
            setPart(null);
        }
        Tone.Transport.stop();
        Tone.Transport.cancel();
        setProgress(0);
        setIsPlaying(false);
        setIsPaused(false);
    };

    const seekTo = (value: number) => {
        if (part) {
            part.dispose();
            setPart(null);
        }
        Tone.Transport.seconds = value;
        setProgress(value);

        if (isPlaying) {
            playMidi();
        }
    };

    // TODO: usunąłem to na szybko ale pewnie było istotne, oryginalnie zmieniało return value samego FilePlayback
    // if (loading) {
    //     return <div className="midi-loading">Loading MIDI file...</div>;
    // }

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
        <div className="new-piano-roll-container">
            <div className="custom-midi-player">
                <div className="player-header">
                    <h3>{file.name}</h3>
                </div>

                <div className="player-controls">
                    <div className="time-display">
                        <span>{formatTime(progress)}</span>
                        <span> / </span>
                        <span>{formatTime(duration)}</span>
                    </div>

                    <div className="progress-container">
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            value={progress}
                            step="0.1"
                            onChange={(e) => seekTo(Number(e.target.value))}
                            className="progress-bar"
                        />
                    </div>

                    <div className="control-buttons">
                        <button
                            onClick={playMidi}
                            disabled={isPlaying && !isPaused}
                            className="play-button"
                        >
                            ▶ Play
                        </button>
                        <button
                            onClick={pauseMidi}
                            disabled={!isPlaying || isPaused}
                            className="pause-button"
                        >
                            ⏸ Pause
                        </button>
                        <button
                            onClick={stopMidi}
                            disabled={!isPlaying && !isPaused}
                            className="stop-button"
                        >
                            ■ Stop
                        </button>
                    </div>
                </div>

                <div className="player-settings">
                    <div className="setting-group">
                        <label>
                            <div className="volume-icon">🔊</div>
                            <div className="volume-slider-container">
                                <input
                                    type="range"
                                    min="-40"
                                    max="0"
                                    value={volume}
                                    onChange={(e) => {
                                        const newVolume = Number(e.target.value);
                                        setVolume(newVolume);
                                        const percentage = ((newVolume + 40) / 40) * 100;
                                        e.target.style.background = `linear-gradient(to right, #4285f4 0%, #4285f4 ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
                                    }}
                                    className="volume-slider"
                                    style={{
                                        background: `linear-gradient(to right, #4285f4 0%, #4285f4 ${((volume + 40) / 40) * 100}%, #ddd ${((volume + 40) / 40) * 100}%, #ddd 100%)`
                                    }}
                                />
                                <div className="volume-level">{volume} dB</div>
                            </div>
                        </label>
                    </div>
                </div>


            </div>

            <div ref={pianoRollContainerRef} className="piano-roll-scrollable">
                <div className="piano-roll-playline" style={{left: getPlaylinePosition(progress, duration), right: getPlaylinePosition(progress, duration)}}/>s
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

            {/* TODO: To dodaje drugi scroll. Czy aby na pewno jest potrzebne?*/}
            {/*<div*/}
            {/*    ref={bottomScrollRef}*/}
            {/*    className="piano-roll-bottom-scroll"*/}
            {/*    onScroll={handleBottomScroll}*/}
            {/*>*/}
            {/*    <div*/}
            {/*        className="piano-roll-bottom-scroll-placeholder"*/}
            {/*        style={{ width: `${canvasWidth}px` }}*/}
            {/*    />*/}
            {/*</div>*/}
        </div>
    );
};

export default NewPianoRollDisplay;
