import React from 'react';
import { MusicInfoData } from '../interfaces/ApiResponse';
import './MusicInfoDisplay.css';

interface TableDisplayProps {
  data: MusicInfoData;
}

const MusicInfoDisplay: React.FC<TableDisplayProps> = ({ data }) => {
  return (
    <div>
      {data.title && (
        <div className="music-info-title">
          <b>{data.title}</b>
        </div>
      )}
  
      {data.resolution !== undefined && (
        <div className="music-info-resolution">
          <strong>Resolution: {data.resolution}</strong>
        </div>
      )}
  
      <div className="music-info-container">
        {data.tempos && data.tempos.length > 0 && (
          <div className="music-info-block" style={{ backgroundColor: 'lightcyan' }}>
            <div className="music-info-content">
              <div className="music-info-text">
                <strong>Tempos:</strong>
                {data.tempos.map((item, index) => (
                  <div key={index}>
                    <strong>Time:</strong> {item[0]} <strong>Value:</strong> {item[1].toFixed(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
  
        {data.key_signatures && data.key_signatures.length > 0 && (
          <div className="music-info-block" style={{ backgroundColor: 'lightgoldenrodyellow' }}>
            <div className="music-info-content">
              <div className="music-info-text">
                <strong>Key Signatures:</strong>
                {data.key_signatures.map((item, index) => (
                  <div key={index}>
                    <strong>Time:</strong> {item[0]}{' '}
                    <strong>Root:</strong> {item[1]}{' '}
                    <strong>Mode:</strong> {item[2]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
  
        {data.time_signatures && data.time_signatures.length > 0 && (
          <div className="music-info-block" style={{ backgroundColor: 'lightgreen' }}>
            <div className="music-info-content">
              <div className="music-info-text">
                <strong>Time Signatures:</strong>
                {data.time_signatures.map((item, index) => (
                  <div key={index}>
                    <strong>Time:</strong> {item[0]}{' '}
                    <strong>Signature:</strong> {item[1]}/{item[2]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
  
        {(data.pitch_range ||
          data.n_pitches_used ||
          data.polyphony ||
          data.empty_beat_rate ||
          data.drum_pattern_consistency) && (
          <div className="music-info-block" style={{ backgroundColor: 'lightcoral' }}>
            <div className="music-info-content">
              <div className="music-info-text">
                {data.pitch_range !== undefined && (
                  <div>
                    <strong>Pitch Range:</strong> {data.pitch_range}
                  </div>
                )}
                {data.n_pitches_used !== undefined && (
                  <div>
                    <strong>Number of Pitches Used:</strong> {data.n_pitches_used}
                  </div>
                )}
                {data.polyphony !== undefined && (
                  <div>
                    <strong>Polyphony:</strong> {data.polyphony.toPrecision(3)}
                  </div>
                )}
                {data.empty_beat_rate !== undefined && (
                  <div>
                    <strong>Empty Beat Rate:</strong> {data.empty_beat_rate.toPrecision(3)}
                  </div>
                )}
                {data.drum_pattern_consistency !== undefined && (
                  <div>
                    <strong>Drum Pattern Consistency:</strong> {data.drum_pattern_consistency.toPrecision(3)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicInfoDisplay;
