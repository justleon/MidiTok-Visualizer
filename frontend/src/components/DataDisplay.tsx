import React, { useState } from 'react';
import { Token, NestedList, Note } from '../interfaces/ApiResponse';
import TokenBlock from './TokenBlock';
import TokenInfo from './TokenInfo';
import './DataDisplay.css';

interface DataDisplayProps {
  data: NestedList<Token>;
  hoveredNote: Note | null;
  selectedNote: Note | null;
  onTokenHover: (token: Token | null) => void;
  onTokenSelect: (token: Token | null) => void;
  hoveredToken: Token | null;
  selectedToken: Token | null;
}

const ITEMS_PER_PAGE = 140; 
const CHUNK_SIZE = 14; 

const DataDisplay: React.FC<DataDisplayProps> = ({ data, hoveredNote, selectedNote, hoveredToken, selectedToken, onTokenHover, onTokenSelect }) => {
  const [token, setToken] = useState<Token | null>(null);
  const [heading, setHeading] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(true);
  const [showTokenType, setShowTokenType] = useState(false);

  const flattenedData: Token[] = React.useMemo(() => {
    const flatten = (list: NestedList<Token>): Token[] => {
      if (Array.isArray(list)) {
        return list.flatMap((item) => (Array.isArray(item) ? flatten(item) : [item]));
      }
      return [list];
    };
    return flatten(data);
  }, [data]);

  const totalPages = Math.ceil(flattenedData.length / ITEMS_PER_PAGE);

  const currentPageTokens = React.useMemo(() => {
    if (!isPaginationEnabled) {
      return flattenedData;
    }
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return flattenedData.slice(start, end);
  }, [flattenedData, currentPage, isPaginationEnabled]);

  const chunkTokens = (tokens: Token[], size: number): Token[][] => {
    let chunks: Token[][] = [];
    for (let i = 0; i < tokens.length; i += size) {
      chunks.push(tokens.slice(i, i + size));
    }
    return chunks;
  };

  const chunkedTokens = chunkTokens(currentPageTokens, CHUNK_SIZE);

  const updateTokenInfo = (token: Token | null, heading: string) => {
    setToken(token);
    setHeading(heading);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const shouldShowPaginationToggle = totalPages > 1;

  if (!Array.isArray(data)) {
    return <div>Invalid data</div>;
  }

  return (
    <div className="data-display">
      <div className="toggle">
        <label>
            <input
              type="checkbox"
              checked={showTokenType}
              onChange={() => setShowTokenType(!showTokenType)}
            />
            Show tokens types
          </label>
      </div>
      {shouldShowPaginationToggle && (
        <div className="toggle">
          <label>
            <input
              type="checkbox"
              checked={!isPaginationEnabled}
              onChange={() => setIsPaginationEnabled(!isPaginationEnabled)}
            />
            Disable pagination
          </label>
        </div>
      )}
      <div className="data-display-content">
        <div className="token-info">
          <TokenInfo token={token} heading={heading} />
        </div>
        <div className="token-container">
          <div className="token-column">
            {chunkedTokens.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="token-row">
                {chunk.map((token, tokenIndex) => (
                  <TokenBlock
                    key={tokenIndex}
                    item={token}
                    showTokenType={showTokenType}
                    onHover={(token, heading) => {
                      onTokenHover(token);
                      updateTokenInfo(token, heading);
                    }}
                    onSelect={onTokenSelect}
                    heading={
                      isPaginationEnabled
                        ? `${currentPage + 1}.${chunkIndex * CHUNK_SIZE + tokenIndex + 1}`
                        : `${chunkIndex * CHUNK_SIZE + tokenIndex + 1}`
                    }
                    highlight={
                      (hoveredNote && token.note_id === hoveredNote.note_id) ||
                      (hoveredToken && hoveredToken.note_id !== null && token.note_id === hoveredToken.note_id)
                    }
                    selected={
                      (selectedNote && token.note_id === selectedNote.note_id) ||
                      (selectedToken && token.note_id === selectedToken.note_id)
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {isPaginationEnabled && (
        <div className="pagination-bar">
          <div className="pagination-bar-content">
            <button
              className="pagination-button"
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
            >
              Prev
            </button>
            <span>{currentPage + 1} of {totalPages}</span>
            <button
              className="pagination-button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDisplay;
