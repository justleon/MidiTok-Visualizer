from mido import Message, MetaMessage, MidiFile, MidiTrack, bpm2tempo
from core.api.model import MIDIConversionRequest



class MidiEvent:
    def __init__(self, ticks_per_beat=480):
        self.ticks_per_beat = ticks_per_beat

    def create_midi_file_from_events(self  ,params: MIDIConversionRequest) -> MidiFile:
        if hasattr(params, 'ticks_per_beat'):
            ticks_per_beat = params.ticks_per_beat
        else:
            ticks_per_beat = self.ticks_per_beat
        mid = MidiFile(ticks_per_beat=ticks_per_beat)
        track = MidiTrack()
        mid.tracks.append(track)
        primitive_events = self._convert_events_to_primitive_events(params.events)

        sorted_events = self._sort_primitive_events(primitive_events)

        self._add_events_to_track(track, sorted_events)

        return mid

    def _convert_events_to_primitive_events(self, events):
        """
        Convert high-level event objects to primitive MIDI event dictionaries.

        Args:
            events: A list of event wrapper objects

        Returns:
            A list of primitive event dictionaries
        """
        primitive_events = []

        for event_wrapper in events:
            event = event_wrapper.root

            if event.event_type == "note":
                primitive_events.append({
                    'time': event.time,
                    'type': 'note_on',
                    'pitch': event.pitch,
                    'velocity': event.velocity,
                    'channel': event.channel
                })

                primitive_events.append({
                    'time': event.time + event.duration,
                    'type': 'note_off',
                    'pitch': event.pitch,
                    'velocity': event.velocity,
                    'channel': event.channel
                })

            elif event.event_type == "tempo":
                primitive_events.append({
                    'time': event.time,
                    'type': 'set_tempo',
                    'bpm': event.bpm
                })

        return primitive_events

    def _sort_primitive_events(self, primitive_events):
        """
        Sort primitive events by time and type priority.

        This ensures events at the same time point are processed in the correct order:
        tempo changes first, then note-offs, then note-ons.

        Args:
            primitive_events: List of primitive event dictionaries

        Returns:
            Sorted list of primitive event dictionaries
        """
        return sorted(primitive_events, key=lambda x: (
            x['time'],
            0 if x['type'] == 'set_tempo' else (1 if x['type'] == 'note_off' else 2)
        ))

    def _add_events_to_track(self, track, primitive_events):
        """
        Add sorted primitive events to a MIDI track with proper delta times.

        Args:
            track: A MidiTrack object to add events to
            primitive_events: Sorted list of primitive event dictionaries
        """
        current_time_on_track = 0

        for event_data in primitive_events:
            delta_time = event_data['time'] - current_time_on_track
            if delta_time < 0:
                print(f"Warning: Negative delta time calculated ({delta_time}). Clamping to 0. Event: {event_data}")
                delta_time = 0

            if event_data['type'] == 'note_on':
                track.append(Message(
                    'note_on',
                    note=event_data['pitch'],
                    velocity=event_data['velocity'],
                    time=delta_time,
                    channel=event_data['channel']
                ))

            elif event_data['type'] == 'note_off':
                track.append(Message(
                    'note_off',
                    note=event_data['pitch'],
                    velocity=event_data['velocity'],
                    time=delta_time,
                    channel=event_data['channel']
                ))

            elif event_data['type'] == 'set_tempo':
                tempo_microseconds_per_beat = bpm2tempo(event_data['bpm'])
                track.append(MetaMessage(
                    'set_tempo',
                    tempo=tempo_microseconds_per_beat,
                    time=delta_time
                ))
            current_time_on_track = event_data['time']

        if not any(msg.is_meta and msg.type == 'end_of_track' for msg in track):
            track.append(MetaMessage('end_of_track', time=0))
