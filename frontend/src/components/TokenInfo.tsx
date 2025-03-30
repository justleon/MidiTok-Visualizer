import React from 'react';
import { Token } from '../interfaces/ApiResponse';
import { TokenTypeToColor } from './TokenBlock';
import './TokenInfo.css';

interface DataDisplayProps {
  token: Token | null;
  heading: string;
}

const TokenInfo: React.FC<DataDisplayProps> = ({ token, heading }) => {
  return (
    <div
      className="token-info-block"
      style={{
        backgroundColor: token ? TokenTypeToColor(token.type) : 'white', 
      }}
    >
      {token ? (
        <div className="token-info-content">
          <div>
            <strong>Type:</strong> {token.type}
          </div>
          <div>
            <strong>Value:</strong> {token.value}
          </div>
          <div>
            <strong>Time:</strong> {token.time}
          </div>
          <div>
            <strong>Program:</strong> {token.program}
          </div>
          <div>
            <strong>Desc:</strong> {token.desc}
          </div>
          <div>
            <strong>Note ID:</strong> {token.note_id}
          </div>
          <div>
            <strong>Track:</strong> {isNaN(Number(token.track_id)) ? token.track_id : Number(token.track_id) + 1}
          </div>
        </div>
      ) : (
        <div className="token-info-placeholder">
          <strong>Hover a token...</strong>
        </div>
      )}
    </div>
  );
};

export default TokenInfo;
