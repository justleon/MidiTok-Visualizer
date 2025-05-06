import React, { useEffect, useState } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import './FilePlayback.css';

interface PlaybackProps {
    file: File;
}


const FilePlayback: React.FC<PlaybackProps> = ({ file }) => {
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

    if (loading) {
        return <div className="midi-loading">Loading MIDI file...</div>;
    }

    return (
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
    );
};

export default FilePlayback;

