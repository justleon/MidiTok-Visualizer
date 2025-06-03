import React, { useEffect, useRef } from 'react';
import './SoundSynthesizer.css';

class Synthesizer {
  private audioContext: AudioContext;
  private oscillators: Map<number, OscillatorNode>;
  private gainNodes: Map<number, GainNode>;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.oscillators = new Map();
    this.gainNodes = new Map();
  }

  playNote(pitch: number, velocity: number = 90): void {
    if (this.oscillators.has(pitch)) {
      this.stopNote(pitch, 0);
    }
    const frequency = 440 * Math.pow(2, (pitch - 69) / 12);
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    const gainNode = this.audioContext.createGain();
    const normalizedVelocity = velocity / 127;
    gainNode.gain.setValueAtTime(normalizedVelocity * 0.3, this.audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    oscillator.start(this.audioContext.currentTime);
    this.oscillators.set(pitch, oscillator);
    this.gainNodes.set(pitch, gainNode);
  }

  stopNote(pitch: number, releaseTime: number = 0.01): void {
    const oscillator = this.oscillators.get(pitch);
    const gainNode = this.gainNodes.get(pitch);

    if (oscillator && gainNode) {
      this.oscillators.delete(pitch);
      this.gainNodes.delete(pitch);

      gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + releaseTime);

      setTimeout(() => {
        try {
          if (oscillator.context.state !== 'closed' && oscillator.numberOfOutputs > 0) {
              oscillator.stop(this.audioContext.currentTime);
              oscillator.disconnect();
              gainNode.disconnect();
          }
        } catch (e) {
          console.warn("Error stopping oscillator or disconnecting nodes:", e);
        }
      }, releaseTime * 1000 + 50);
    }
  }

}

interface SoundSynthesizerProps {
  onSynthesizerReady: (synth: Synthesizer) => void;
}

const SoundSynthesizer: React.FC<SoundSynthesizerProps> = ({ onSynthesizerReady }) => {
  const synthRef = useRef<Synthesizer | null>(null);

  useEffect(() => {
    if (!synthRef.current) {
      synthRef.current = new Synthesizer();
      onSynthesizerReady(synthRef.current);
    }
    return () => {
    };
  }, [onSynthesizerReady]);
  return null;
};

export default SoundSynthesizer;
export { Synthesizer };
