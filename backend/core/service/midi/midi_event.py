from mido import Message, MetaMessage, MidiFile, MidiTrack, bpm2tempo
from typing import Dict, List
from core.api.model import MIDIConversionRequest


class MidiEvent:
    def __init__(self, ticks_per_beat=480):
        self.ticks_per_beat = ticks_per_beat

    def create_midi_file_from_events(self, params: MIDIConversionRequest) -> MidiFile:
        """
        Creates a MIDI file from a collection of high-level MIDI events grouped by track.

        Args:
            params (MIDIConversionRequest): MIDI conversion input data.

        Returns:
            MidiFile: A fully structured MIDI file object.
        """
        ticks_per_beat = getattr(params, 'ticks_per_beat', self.ticks_per_beat)
        mid = MidiFile(ticks_per_beat=ticks_per_beat)

        events_by_track = self._group_events_by_track(params.events)

        for track_num in sorted(events_by_track.keys()):
            primitive_events = self._convert_and_sort_primitive_events(events_by_track[track_num])
            midi_track = self._create_midi_track(primitive_events)
            mid.tracks.append(midi_track)

        return mid

    def _group_events_by_track(self, events) -> Dict[int, List[dict]]:
        """
        Groups high-level MIDI events by their track number.

        Args:
            events: List of event wrapper objects.

        Returns:
            Dict[int, List[object]]: Events grouped by track number.
        """
        grouped: Dict[int, List[object]] = {}

        for event_wrapper in events:
            event = event_wrapper.root
            track = event.track

            if track not in grouped:
                grouped[track] = []

            grouped[track].append(event)

        return grouped

    def _convert_and_sort_primitive_events(self, events: List[object]) -> List[dict]:
        """
        Converts high-level MIDI events to primitive events and sorts them.

        Args:
            events: List of high-level MIDI events.

        Returns:
            List[dict]: Sorted primitive MIDI events.
        """
        primitives: List[dict] = []

        for event in events:
            if event.event_type == "note":
                primitives.append({
                    'time': event.time,
                    'type': 'note_on',
                    'pitch': event.pitch,
                    'velocity': event.velocity,
                    'channel': event.channel
                })
                primitives.append({
                    'time': event.time + event.duration,
                    'type': 'note_off',
                    'pitch': event.pitch,
                    'velocity': event.velocity,
                    'channel': event.channel
                })
            elif event.event_type == "tempo":
                primitives.append({
                    'time': event.time,
                    'type': 'set_tempo',
                    'bpm': event.bpm
                })

        return sorted(primitives, key=lambda x: (
            x['time'],
            0 if x['type'] == 'set_tempo' else (1 if x['type'] == 'note_off' else 2)
        ))

    def _create_midi_track(self, primitive_events: List[dict]) -> MidiTrack:
        """
        Creates a MidiTrack and adds primitive events to it with proper delta times.

        Args:
            primitive_events: List of sorted primitive MIDI events.

        Returns:
            MidiTrack: A populated MIDI track.
        """
        track = MidiTrack()
        current_time = 0

        for event in primitive_events:
            delta = event['time'] - current_time
            if delta < 0:
                print(f"Warning: Negative delta time ({delta}) – clamped to 0. Event: {event}")
                delta = 0

            if event['type'] == 'note_on':
                track.append(Message('note_on',
                                     note=event['pitch'],
                                     velocity=event['velocity'],
                                     time=delta,
                                     channel=event['channel']))
            elif event['type'] == 'note_off':
                track.append(Message('note_off',
                                     note=event['pitch'],
                                     velocity=event['velocity'],
                                     time=delta,
                                     channel=event['channel']))
            elif event['type'] == 'set_tempo':
                tempo = bpm2tempo(event['bpm'])
                track.append(MetaMessage('set_tempo', tempo=tempo, time=delta))

            current_time = event['time']

        if not any(msg.is_meta and msg.type == 'end_of_track' for msg in track):
            track.append(MetaMessage('end_of_track', time=0))

        return track

