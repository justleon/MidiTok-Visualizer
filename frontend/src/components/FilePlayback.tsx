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
    const [synth, setSynth] = useState<Tone.PolySynth | null>(null);
    const [part, setPart] = useState<Tone.Part | null>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const loadMidi = async () => {
            const arrayBuffer = await file.arrayBuffer();
            const midiData = new Midi(arrayBuffer);
            setMidi(midiData);

            const totalDuration = Math.max(
                ...midiData.tracks.flatMap((track) =>
                    track.notes.map((note) => note.time + note.duration)
                )
            );
            setDuration(totalDuration);

            const newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
            setSynth(newSynth);
        };

        loadMidi();
    }, [file]);

    const playMidi = async () => {
        if (!midi || !synth) return;

        await Tone.start();


        const midiPart = new Tone.Part((time, note) => {
            synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
        }, getMidiNotes(midi));

        midiPart.start(0);
        setPart(midiPart);

        Tone.Transport.start();
        setIsPlaying(true);


        Tone.Transport.scheduleRepeat(() => {
            setProgress(Tone.Transport.seconds);
        }, 0.1);
    };

    const stopMidi = () => {
        if (part) {
            part.stop();
            Tone.Transport.stop();
            Tone.Transport.cancel(); 
        }
        setProgress(0);
        setIsPlaying(false);
    };

    const seekTo = (value: number) => {
        if (!part) return;

        stopMidi(); 
        Tone.Transport.seconds = value;
        playMidi();
        setProgress(value);
    };

    const getMidiNotes = (midi: Midi) => {
        return midi.tracks.flatMap((track) =>
            track.notes.map((note) => ({
                time: note.time,
                name: note.name,
                duration: note.duration,
                velocity: note.velocity,
            }))
        );
    };

    return (
        <div className="custom-midi-player">
            <input
                type="range"
                min="0"
                max={duration}
                value={progress}
                step="0.1"
                onChange={(e) => seekTo(Number(e.target.value))}
                className="progress-bar"
            />
            <button onClick={playMidi} disabled={isPlaying}>
                ▶ Play
            </button>
            <button onClick={stopMidi} disabled={!isPlaying}>
                ■ Stop
            </button>
        </div>
    );
};

export default FilePlayback;