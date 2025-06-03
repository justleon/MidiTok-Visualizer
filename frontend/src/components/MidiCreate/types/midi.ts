export interface NoteEventPayload {
  event_type: "note";
  track: number;
  time: number;
  duration: number;
  pitch: number;
  velocity: number;
  channel: number;
}

export interface TempoEventPayload {
  event_type: "tempo";
  track: number;
  time: number;
  bpm: number;
}

export type MIDIEventPayload = NoteEventPayload | TempoEventPayload;

export interface MIDIConversionRequestPayload {
  events: MIDIEventPayload[];
  ticks_per_beat: number;
  output_filename: string;
}