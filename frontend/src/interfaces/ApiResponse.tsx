interface Token {
  type: string;
  value: string;
  time: number;
  program: number;
  desc: string;
  note_id?: string | null;
  track_id?: string | null;
}

interface Note {
  pitch: number;
  name: string;
	start: number;
	end: number;
	velocity: number;
  note_id: string;
}

interface MusicInfoData {
  title: string;
  resolution: number;
  tempos: Array<[number, number]>;
  key_signatures: Array<[number, number, string]>;
  time_signatures: Array<[number, number, number]>;
  
  pitch_range: number;
  n_pitches_used: number;
  polyphony: number;

  empty_beat_rate: number;
  drum_pattern_consistency: number;
}

interface DataStructure {
  tokens: NestedList<Token>;
  metrics: MusicInfoData;
  notes: Note[][];
}

interface ApiResponse {
  success: boolean;
  data: DataStructure;
  error: string;
}

type NestedList<T> = Array<T | NestedList<T>>;

export type { Token, Note, ApiResponse, NestedList, MusicInfoData };
