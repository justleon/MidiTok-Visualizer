import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import VirtualKeyboard from './VirtualKeyboard';
import SettingsPanel from './SettingsPanel';
import MIDIDeviceManager from './MIDIDeviceManager';
import MIDICanvas from './MIDICanvas';
import PlaybackControls from './PlaybackControls';
import SoundSynthesizer, { Synthesizer } from './SoundSynthesizer';
import { NoteEventPayload, MIDIEventPayload, MIDIConversionRequestPayload } from './types/midi';
import './MIDISequencer.css';

interface MIDISequencerProps {
  onMidiFileCreated?: (file: File) => void;
}


const MIDISequencer: React.FC<MIDISequencerProps> = ({ onMidiFileCreated }) => {
  const activeTimeoutsRef = useRef<(number | NodeJS.Timeout)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [midiTracks, setMidiTracks] = useState<number[][][]>([[]]); 
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const trackColor = 'rgba(0, 255, 0, 0.7)'
  const [hoveredTrackIndex, setHoveredTrackIndex] = useState<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const midiOutputRef = useRef<WebMidi.MIDIOutput | null>(null);
  const midiInputRef = useRef<WebMidi.MIDIInput | null>(null);
  const synthRef = useRef<Synthesizer | null>(null);
  const [midiInputDevices, setMidiInputDevices] = useState<WebMidi.MIDIInput[]>([]);
  const [midiOutputDevices, setMidiOutputDevices] = useState<WebMidi.MIDIOutput[]>([]);
  const [selectedOutputIndex, setSelectedOutputIndex] = useState<number>(-1);
  const [selectedInputIndex, setSelectedInputIndex] = useState<number>(-1);
  const [isRecording, setIsRecording] = useState(false);
  const recordingStartTimeRef = useRef<number>(0);
  const animationFrameIdRefRecording = useRef<number | null>(null);
  const activeNotesRef = useRef<Map<number, { startTime: number, startX: number }>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPositionX, setPlaybackPositionX] = useState(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number>(0);

  const [ticksPerBeat, setTicksPerBeat] = useState(480); 
  const [outputFilename, setOutputFilename] = useState("output.mid");
  const [bpm, setBpm] = useState(120);

  const [isDrawing, setIsDrawing] = useState(false); 
  const [isErasingDrag, setIsErasingDrag] = useState(false); 
  const [firstX, setFirstX] = useState(0);
  const [lastX, setLastX] = useState(0); 
  const [currX, setCurrX] = useState(0);
  const [drawBorder, setDrawBorder] = useState(false); 
  const [startY, setStartY] = useState(0); 

  const blockWidth = 40;
  const blockHeight = 25; 
  const fillColor = 'rgba(0, 255, 0, 0.7)'; 
  const eraseColor = 'rgba(255, 0, 0, 0.3)'; 
  const borderColor = 'black'; 
  const lineWidth = 1; 
  const [activeVirtualNote, setActiveVirtualNote] = useState(false);
  const [lastActivePitch, setLastActivePitch] = useState<number | null>(null);
  const [midiOctaveOffset, setMidiOctaveOffset] = useState(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingStatus, setGeneratingStatus] = useState<string>("");
  const [virtualKeyboardActiveKeys, setVirtualKeyboardActiveKeys] = useState<number[]>([]);


  const handleSynthesizerReady = (synth: Synthesizer) => {
    synthRef.current = synth;
  };

  const addTrack = () => {
    if (midiTracks.length < 5) {
      setMidiTracks(prev => [...prev, []]);
      setActiveTrackIndex(midiTracks.length);
    } else {
      alert("Maximum of 5 tracks reached.");
    }
  };

  const deleteTrack = (indexToDelete: number) => {
    if (midiTracks.length <= 1) {
      alert("Cannot delete the last track.");
      return;
    }

    setMidiTracks(prevTracks => {
      const newTracks = prevTracks.filter((_, idx) => idx !== indexToDelete);
      if (activeTrackIndex === indexToDelete) {
        setActiveTrackIndex(Math.max(0, indexToDelete - 1));
      } else if (activeTrackIndex > indexToDelete) {
        setActiveTrackIndex(prev => prev - 1);
      }
      return newTracks;
    });
  };

  const selectTrack = (index: number) => {
    if (index >= 0 && index < midiTracks.length) {
      setActiveTrackIndex(index);
    }
  };

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({ sysex: false, software: true }).then((access) => {
        const outputs = Array.from(access.outputs.values());
        setMidiOutputDevices(outputs);
        if (outputs.length > 0) {
          setSelectedOutputIndex(0);
          midiOutputRef.current = outputs[0];
          //console.log("MIDI output devices:", outputs.map(device => device.name));
        }

        const inputs = Array.from(access.inputs.values());
        setMidiInputDevices(inputs);
        if (inputs.length > 0) {
          setSelectedInputIndex(0);
          //console.log("MIDI input devices:", inputs.map(device => device.name));
        }

        access.onstatechange = (event) => {
          const port = event.port;
         // console.log(`MIDI port ${port.name} state changed to ${port.state}`);

          if (port.type === "input") {
            setMidiInputDevices(Array.from(access.inputs.values()));
          } else if (port.type === "output") {
            setMidiOutputDevices(Array.from(access.outputs.values()));
          }
        };
      }).catch((err) => {
        console.error("Failed to get MIDI access", err);
      });
    } else {
      console.warn("Web MIDI API not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    if (midiInputRef.current) {
      midiInputRef.current.onmidimessage = null;
    }

    if (selectedInputIndex >= 0 && midiInputDevices[selectedInputIndex]) {
      const selectedInput = midiInputDevices[selectedInputIndex];
      midiInputRef.current = selectedInput;
      selectedInput.onmidimessage = handleMidiMessage;
    } else {
      midiInputRef.current = null;
    }

    return () => {
      if (midiInputRef.current) {
        midiInputRef.current.onmidimessage = null;
      }
    };
  }, [selectedInputIndex, midiInputDevices, isRecording, bpm, blockWidth, blockHeight, activeTrackIndex, setStartY, setCurrX, setActiveVirtualNote, setMidiTracks, midiOctaveOffset, lastActivePitch, setLastActivePitch]);

  useEffect(() => {
    if (selectedOutputIndex >= 0 && midiOutputDevices[selectedOutputIndex]) {
      midiOutputRef.current = midiOutputDevices[selectedOutputIndex];
    } else {
      midiOutputRef.current = null;
    }
  }, [selectedOutputIndex, midiOutputDevices]);


  const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
    const data = event.data;
    const status = data[0] & 0xF0;
    const channel = data[0] & 0x0F;
    const now = performance.now();
    const elapsedMs = now - recordingStartTimeRef.current;

   // console.log("MIDI message received:", data, "Channel:", channel);

    if (status === 0x90 && data[2] > 0) {
      const rawPitch = data[1];
      const pitch = rawPitch + midiOctaveOffset;
      const velocity = data[2];

     // console.log("Note On - Raw Pitch:", rawPitch, "Adjusted Pitch:", pitch, "Note name:", getNoteNameFromPitch(pitch));

      setVirtualKeyboardActiveKeys(prev =>
        prev.includes(pitch) ? prev : [...prev, pitch]
      );

      if (isRecording) {
        const xPos = Math.floor((elapsedMs / 1000) * (bpm / 60) * blockWidth);
        const alignedX = xPos - (xPos % blockWidth);
        const highestPitch = 108;
        const yPos = (highestPitch - pitch) * blockHeight;
        setStartY(yPos);
        setCurrX(alignedX);
        setActiveVirtualNote(true);
        setLastActivePitch(pitch);

        activeNotesRef.current.set(pitch, {
          startTime: elapsedMs,
          startX: alignedX
        });
      }
      if (synthRef.current) {
        synthRef.current.playNote(pitch, velocity);
      }

      if (midiOutputRef.current) {
        midiOutputRef.current.send([0x90, pitch, velocity]);
      }
    }
    else if (status === 0x80 || (status === 0x90 && data[2] === 0)) {
      const rawPitch = data[1];
      const pitch = rawPitch + midiOctaveOffset;
      setVirtualKeyboardActiveKeys(prev => prev.filter(key => key !== pitch));
      if (pitch === lastActivePitch) {
        setActiveVirtualNote(false);
      }

      if (isRecording) {
        const noteStart = activeNotesRef.current.get(pitch);
        if (noteStart) {
          const duration = elapsedMs - noteStart.startTime;
          const durationInBlocks = Math.max(1, Math.floor((duration / 1000) * (bpm / 60)));
          const endX = noteStart.startX + (durationInBlocks * blockWidth);
          const highestPitch = 108;
          const yPos = (highestPitch - pitch) * blockHeight;

          setCurrX(endX);

          setMidiTracks(prevTracks => {
            const newTracks = [...prevTracks];
            newTracks[activeTrackIndex] = [...newTracks[activeTrackIndex], [noteStart.startX, endX, yPos]];
            return newTracks;
          });
        }
      }
      activeNotesRef.current.delete(pitch);
      if (synthRef.current) {
        synthRef.current.stopNote(pitch);
      }

      if (midiOutputRef.current) {
        midiOutputRef.current.send([0x80, pitch, 0]);
      }
    }
  };

   const handleVirtualNoteOn = (pitch: number, velocity: number) => {

    const noteOnMessage = [0x90, pitch, velocity];
    const now = performance.now();
    const elapsedMs = now - recordingStartTimeRef.current;
    let xPos;
    if (isRecording) {
      xPos = Math.floor((elapsedMs / 1000) * (bpm / 60) * blockWidth);
      const alignedX = xPos - (xPos % blockWidth);
      const highestPitch = 108;
      const yPos = (highestPitch - pitch) * blockHeight;

      setStartY(yPos);
      setCurrX(alignedX);
      setActiveVirtualNote(true);
      setLastActivePitch(pitch);
      activeNotesRef.current.set(pitch, {
        startTime: elapsedMs,
        startX: alignedX
      });
    }
    if (synthRef.current) {
      synthRef.current.playNote(pitch, velocity);
    }

    if (midiOutputRef.current) {
      midiOutputRef.current.send(noteOnMessage);
    }
  };

  const handleVirtualNoteOff = (pitch: number) => {
    const noteOffMessage = [0x80, pitch, 0];
    const now = performance.now();
    const elapsedMs = now - recordingStartTimeRef.current;
    if (pitch === lastActivePitch) {
      setActiveVirtualNote(false);
    }

    if (isRecording) {
      const noteStart = activeNotesRef.current.get(pitch);
      if (noteStart) {
        const duration = elapsedMs - noteStart.startTime;
        const durationInBlocks = Math.max(0, Math.floor((duration / 1000) * (bpm / 60)));
        const endX = noteStart.startX + (durationInBlocks * blockWidth);
        const highestPitch = 108;
        const yPos = (highestPitch - pitch) * blockHeight;
        setCurrX(endX);

        setMidiTracks(prevTracks => {
          const newTracks = [...prevTracks];
          newTracks[activeTrackIndex] = [...newTracks[activeTrackIndex], [noteStart.startX, endX, yPos]];
          return newTracks;
        });
      }
    }

    activeNotesRef.current.delete(pitch);
    if (synthRef.current) {
      synthRef.current.stopNote(pitch);
    }

    if (midiOutputRef.current) {
      midiOutputRef.current.send(noteOffMessage);
    }
  };

  const startRecording = () => {
    if (isPlaying) {
      stopPlayback();
    }

    activeNotesRef.current.clear();
    recordingStartTimeRef.current = performance.now();
    setIsRecording(true);
    const drawRecordingIndicator = () => {
      if (!isRecording) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) return;
      animationFrameIdRefRecording.current = requestAnimationFrame(drawRecordingIndicator);
    };
    drawRecordingIndicator();
  };

  const stopRecording = () => {
    if (animationFrameIdRefRecording.current !== null) {
      cancelAnimationFrame(animationFrameIdRefRecording.current);
      animationFrameIdRefRecording.current = null;
    }
    const now = performance.now();
    const elapsedMs = now - recordingStartTimeRef.current;
    activeNotesRef.current.forEach((noteInfo, pitch) => {
      const duration = elapsedMs - noteInfo.startTime;
      const durationInBlocks = Math.max(1, Math.floor((duration / 1000) * (bpm / 60)));
      const endX = noteInfo.startX + (durationInBlocks * blockWidth);
      const highestPitch = 108;
      const yPos = (highestPitch - pitch) * blockHeight;
      setMidiTracks(prevTracks => {
        const newTracks = [...prevTracks];
        newTracks[activeTrackIndex] = [...newTracks[activeTrackIndex], [noteInfo.startX, endX, yPos]];
        return newTracks;
      });
    });
    activeNotesRef.current.clear();
    setIsRecording(false);
    setCurrX(0);
    setStartY(0);
    setActiveVirtualNote(false);
    setLastActivePitch(null);
    setVirtualKeyboardActiveKeys([]);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    activeTimeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    activeTimeoutsRef.current = [];
    animationStartTimeRef.current = 0;

    if (synthRef.current) {
      for (let i = 0; i < 128; i++) {
        synthRef.current.stopNote(i, 0.05);
      }
    }

    setVirtualKeyboardActiveKeys([]);
  };


  const convertCanvasToMidiEvents = useCallback((): MIDIEventPayload[] => {
    const events: MIDIEventPayload[] = [];
    events.push({
      event_type: "tempo",
      track: 0,
      time: 0,
      bpm: bpm,
    });

    midiTracks.forEach((trackMidiArray, trackIndex) => {
      const sortedMidiArray = [...trackMidiArray].sort((a, b) => a[0] - b[0]);

      sortedMidiArray.forEach(([fX, lX, sY]) => {
        const timeInTicks = Math.floor((fX / blockWidth) * ticksPerBeat);
        const durationInPixels = lX - fX + blockWidth;
        const durationInTicks = Math.max(
          ticksPerBeat / 4,
          Math.floor((durationInPixels / blockWidth) * ticksPerBeat)
        );
        const highestPitch = 108;
        const pitchStep = 1;
        const pitch = highestPitch - Math.floor(sY / blockHeight) * pitchStep;
        const safePitch = Math.max(0, Math.min(127, pitch));

        const noteEvent: NoteEventPayload = {
          event_type: "note",
          track: trackIndex,
          time: Math.max(0, timeInTicks),
          duration: Math.max(1, durationInTicks),
          pitch: safePitch,
          velocity: 90,
          channel: 0,
        };

        events.push(noteEvent);
      });
    });

    return events;
  }, [midiTracks, bpm, blockWidth, blockHeight, ticksPerBeat]);

  const handleGenerateMidi = async () => {
    const midiEvents = convertCanvasToMidiEvents();
    if (midiEvents.length <= 1 && midiEvents[0]?.event_type === "tempo") {
      alert("Please draw some notes on the canvas first!");
      return;
    }

    const payload: MIDIConversionRequestPayload = {
      events: midiEvents,
      ticks_per_beat: ticksPerBeat,
      output_filename: outputFilename,
    };

    console.log("Sending download payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/convert-to-midi/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
        throw new Error(`HTTP error ${response.status}: ${errorData.detail || response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFilename || 'music.mid';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to generate MIDI for download:', error);
      alert(`Failed to generate MIDI: ${error instanceof Error ? error.message : String(error)}.`);
    }
  };

  const handlePlayMidi = async () => {
    stopPlayback();
    setIsDrawing(false);
    setPlaybackPositionX(0);

    const midiEvents = convertCanvasToMidiEvents();
    if (midiEvents.length <= 1 && midiEvents[0]?.event_type === "tempo") {
      alert("Please draw some notes on the canvas first!");
      return;
    }

    let totalDurationTicks = 0;
    let totalWidthPixels = 0;
    midiTracks.forEach(trackMidiArray => {
      trackMidiArray.forEach(([fX, lX]) => {
        const noteEndX = lX + blockWidth;
        totalWidthPixels = Math.max(totalWidthPixels, noteEndX);
        const ticks = Math.floor(noteEndX / blockWidth * ticksPerBeat);
        totalDurationTicks = Math.max(totalDurationTicks, ticks);
      });
    });

    const totalDurationMs = (totalDurationTicks / ticksPerBeat) * (60 / bpm) * 1000;

    if (totalDurationMs <= 0) {
      alert("No valid notes to play!");
      return;
    }

    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const animatePlayback = (timestamp: number) => {
      if (!isPlayingRef.current) {
        return;
      }
      if (animationStartTimeRef.current === 0) {
        animationStartTimeRef.current = timestamp;
      }

      const elapsed = timestamp - animationStartTimeRef.current;
      if (elapsed >= totalDurationMs) {
        setPlaybackPositionX(0);
        stopPlayback();
        return;
      }
      const ratio = elapsed / totalDurationMs;
      const currentX = Math.floor(ratio * totalWidthPixels);
      setPlaybackPositionX(currentX);
      if (isPlayingRef.current) {
        animationFrameIdRef.current = window.requestAnimationFrame(animatePlayback);
      }
    };

    animationStartTimeRef.current = 0;
    animationFrameIdRef.current = window.requestAnimationFrame(animatePlayback);

    if (synthRef.current) {
      const beatsPerSecond = bpm / 60;
      const ticksPerSecond = beatsPerSecond * ticksPerBeat;
      const msPerTick = 1000 / ticksPerSecond;
      const sortedEvents = midiEvents
        .filter((e): e is NoteEventPayload => e.event_type === "note")
        .sort((a, b) => a.time - b.time);

      const stopOffsetMs = 5;
      const synthesizerReleaseTime = 10;
      sortedEvents.forEach(note => {
        const startTimeMs = note.time * msPerTick;
        const durationMs = Math.max(50, note.duration * msPerTick);
        const noteOnTimeout = setTimeout(() => {
          if (isPlayingRef.current && synthRef.current) {
            synthRef.current.playNote(note.pitch, note.velocity);
          }
        }, startTimeMs);
        activeTimeoutsRef.current.push(noteOnTimeout);
        const scheduledStopTriggerTimeMs = startTimeMs + durationMs - stopOffsetMs;
        const actualStopTriggerTimeMs = Math.max(startTimeMs, scheduledStopTriggerTimeMs);
        const noteOffTimeout = setTimeout(() => {
          if (synthRef.current) {
            synthRef.current.stopNote(note.pitch, synthesizerReleaseTime / 1000);
          }
        }, actualStopTriggerTimeMs);
        activeTimeoutsRef.current.push(noteOffTimeout);
      });
    }
  };


  const handlePlayOnDevice = async () => {
    if (!midiOutputRef.current) {
      alert("No MIDI output device available.");
      return;
    }

    stopPlayback();
    setIsDrawing(false);

    const midiEvents = convertCanvasToMidiEvents();
    if (midiEvents.length <= 1 && midiEvents[0]?.event_type === "tempo") {
      alert("Please draw some notes on the canvas first!");
      return;
    }

    const sortedEvents = midiEvents
      .filter((e): e is NoteEventPayload => e.event_type === "note")
      .sort((a, b) => a.time - b.time);

    const ticksPerMs = ticksPerBeat / ((60 / bpm) * 1000);

    let lastTimestamp = 0;

    for (const note of sortedEvents) {
      const timeMs = note.time / ticksPerMs;
      const delay = timeMs - lastTimestamp;

      await new Promise((res) => setTimeout(res, Math.max(0, delay)));
      lastTimestamp = timeMs;

      midiOutputRef.current.send([0x90 + note.channel, note.pitch, note.velocity]);

      if (synthRef.current) {
        synthRef.current.playNote(note.pitch, note.velocity);
      }

      setTimeout(() => {
        if (midiOutputRef.current) {
          midiOutputRef.current.send([0x80 + note.channel, note.pitch, 0]);
        }

        if (synthRef.current) {
          synthRef.current.stopNote(note.pitch);
        }
      }, note.duration / ticksPerMs);
    }

    setIsPlaying(true);
  };


  const clearCanvas = () => {
    stopPlayback();
    if (isRecording) {
      stopRecording();
    }
    setMidiTracks([[]]);
    setActiveTrackIndex(0);
    setVirtualKeyboardActiveKeys([]);
  };


    const handleGenerateAndAddToTokenizer = async () => {
    if (!onMidiFileCreated) {
      alert("Cannot automatically add to tokenizer. Please use the download button instead.");
      return;
    }

    const midiEvents = convertCanvasToMidiEvents();
    if (midiEvents.length <= 1 && midiEvents[0]?.event_type === "tempo") {
      alert("Please draw some notes on the canvas first!");
      return;
    }

    setIsGenerating(true);
    setGeneratingStatus("Generating MIDI file...");

    const payload: MIDIConversionRequestPayload = {
      events: midiEvents,
      ticks_per_beat: ticksPerBeat,
      output_filename: outputFilename,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/convert-to-midi/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
        throw new Error(`HTTP error ${response.status}: ${errorData.detail || response.statusText}`);
      }

      const blob = await response.blob();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${outputFilename.replace('.mid', '')}_${timestamp}.mid`;
      const file = new File([blob], fileName, { type: 'audio/midi' });

      setGeneratingStatus("Adding file to tokenizer...");
      onMidiFileCreated(file);

      setGeneratingStatus("File added successfully!");
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratingStatus("");
      }, 1000);

    } catch (error) {
      console.error('Failed to generate MIDI for tokenizer:', error);
      setGeneratingStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratingStatus("");
      }, 3000);
    }
  };





  return (
    <div className="midi-sequencer-container">
      <h2 className="midi-sequencer-title">Make your own MIDI file</h2>

      <SoundSynthesizer onSynthesizerReady={handleSynthesizerReady} />

      <SettingsPanel
        ticksPerBeat={ticksPerBeat}
        setTicksPerBeat={setTicksPerBeat}
        bpm={bpm}
        setBpm={setBpm}
        outputFilename={outputFilename}
        setOutputFilename={setOutputFilename}
        midiOctaveOffset={midiOctaveOffset}
        setMidiOctaveOffset={setMidiOctaveOffset}
      />
      <MIDIDeviceManager
        midiInputDevices={midiInputDevices}
        midiOutputDevices={midiOutputDevices}
        selectedInputIndex={selectedInputIndex}
        selectedOutputIndex={selectedOutputIndex}
        setSelectedInputIndex={setSelectedInputIndex}
        setSelectedOutputIndex={setSelectedOutputIndex}
        isRecording={isRecording}
        startRecording={startRecording}
        stopRecording={stopRecording}
        handlePlayOnDevice={handlePlayOnDevice}
      />
      <VirtualKeyboard
        onNoteOn={handleVirtualNoteOn}
        onNoteOff={handleVirtualNoteOff}
        activeKeys={virtualKeyboardActiveKeys}
        setActiveKeys={setVirtualKeyboardActiveKeys}
      />
      <div className="track-controls">
        <h4>MIDI Tracks</h4>
        <div className="track-buttons">
          {midiTracks.map((_, index) => (
            <button
              key={`track-button-${index}`}
              className="track-button"
              onClick={() => selectTrack(index)}
              onMouseEnter={() => setHoveredTrackIndex(index)}
              onMouseLeave={() => setHoveredTrackIndex(null)}
              style={index === activeTrackIndex ? {
                transform: 'scale(1.1)',
                backgroundColor: '#4285f4',
                color: 'white',
                zIndex: 1
              } : {}}
            >
              <span>Track {index + 1}</span>
              {midiTracks.length > 1 && hoveredTrackIndex === index && (
                <button
                  className="delete-track-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTrack(index);
                  }}
                  title="Delete Track"
                >
                  X
                </button>
              )}
            </button>
          ))}
          {midiTracks.length < 5 && (
            <button onClick={addTrack} className="add-track-button">
              + Add Track
            </button>
          )}
        </div>
      </div>
      <MIDICanvas
        canvasRef={canvasRef}
        containerRef={containerRef}
        midiArray={midiTracks[activeTrackIndex]}
        setMidiArray={(newMidiArrayOrUpdater) => {
          setMidiTracks(prevTracks => {
            const newTracks = [...prevTracks];
            if (typeof newMidiArrayOrUpdater === 'function') {
              newTracks[activeTrackIndex] = newMidiArrayOrUpdater(prevTracks[activeTrackIndex]);
            } else {
              newTracks[activeTrackIndex] = newMidiArrayOrUpdater;
            }
            return newTracks;
          });
        }}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        isErasingDrag={isErasingDrag}
        setIsErasingDrag={setIsErasingDrag}
        firstX={firstX}
        setFirstX={setFirstX}
        lastX={lastX}
        setLastX={setLastX}
        currX={currX}
        setCurrX={setCurrX}
        drawBorder={drawBorder}
        setDrawBorder={setDrawBorder}
        startY={startY}
        setStartY={setStartY}
        playbackPositionX={playbackPositionX}
        isPlaying={isPlaying}
        isRecording={isRecording}
        recordingStartTimeRef={recordingStartTimeRef}
        blockWidth={blockWidth}
        blockHeight={blockHeight}
        fillColor={fillColor}
        eraseColor={eraseColor}
        borderColor={borderColor}
        lineWidth={lineWidth}
        bpm={bpm}
        stopPlayback={stopPlayback}
        trackColor={trackColor}
        activeVirtualNote={activeVirtualNote}
      />
      <div className="controls-contianer">
      <PlaybackControls
        isPlaying={isPlaying}
        isDrawing={isDrawing}
        isRecording={isRecording}
        midiArray={midiTracks[activeTrackIndex].length}
        stopPlayback={stopPlayback}
        handlePlayMidi={handlePlayMidi}
        handleGenerateMidi={handleGenerateMidi}
        clearCanvas={clearCanvas}
      />
              {onMidiFileCreated && (
          <div className="tokenizer-integration-section">
            <button
              onClick={handleGenerateAndAddToTokenizer}
              disabled={isGenerating || midiTracks.every(track => track.length === 0)}
              className="create-and-tokenize-button"
            >
              {isGenerating ? (
                <span>
                  <span className="loading-spinner-small"></span>
                  {generatingStatus}
                </span>
              ) : (
                "Create & Upload to Tokenizers"
              )}
            </button>

            {generatingStatus && !isGenerating && (
              <div className={generatingStatus.includes("Error") ? "error-message" : "success-message"}>
                {generatingStatus}
              </div>
            )}
          </div>
        )}
    </div>
      </div>
  );
};

export default MIDISequencer;