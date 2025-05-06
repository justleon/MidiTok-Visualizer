import React, { memo, useState, useEffect, useRef } from 'react';
import { Token } from '../interfaces/ApiResponse';
import './TokenBlock.css';

interface TokenBlockProps {
  item: Token;
  showTokenType: boolean;
  onHover: (t: Token | null, heading: string) => void;
  onSelect: (t: Token | null) => void;
  heading: string;
  highlight: boolean | null;
  selected: boolean | null;
}

export function TokenTypeToColor(type: string): string {
  switch (type) {
    case 'Bar': return 'lightcyan';
    case 'Position': return 'lavender';
    case 'TimeShift': return 'lightgreen';
    case 'Tempo': return 'lightpink';
    case 'Rest': return 'palegreen';
    case 'Pitch': return 'lightblue';
    case 'PitchDrum': return 'lightskyblue';
    case 'NoteOn': return 'peachpuff';
    case 'DrumOn': return 'sandybrown';
    case 'Velocity': return 'lightcoral';
    case 'Duration': return 'lightgoldenrodyellow';
    case 'NoteOff': return 'khaki';
    case 'DrumOff': return 'darkkhaki';
    case 'Family': return 'lightgray';
    case 'TimeSig': return 'thistle';
    case 'MicroTiming': return 'plum';
    case 'Program': return 'lightseagreen';
    case 'Ignore': return 'white';
    case 'PositionPosEnc': return 'lavenderblush'; // MuMIDI
    case 'BarPosEnc': return 'lightsteelblue'; // MuMIDI
    case 'Track': return 'deeppink'; // MMM
    default: return 'white';
  }
}
// Split token names into several lines e.g. PitchDrum into Pitch\nDrum
 export function SplitTokenNames(name: string): string {
     // Split by capital letters
     var arr = name.split(/(?=[A-Z])/);
     if(arr.length < 2) return name; // only one word -> return it

     // Multiple words -> insert new lines between them
     var newName = '';
     arr.forEach((word) => {
         newName = newName.concat(word);
         newName = newName.concat("\n");
     })

     return newName;
 }

// Split token names into several lines e.g. PitchDrum into Pitch\nDrum
export function SplitTokenNames(name: string): string {
    // Split by capital letters
    var arr = name.split(/(?=[A-Z])/);
    if(arr.length < 2) return name; // only one word -> return it

    // Multiple words -> insert new lines between them
    var newName = '';
    arr.forEach((word) => {
        newName = newName.concat(word);
        newName = newName.concat("\n");
    })

    return newName;
}

const TokenBlock: React.FC<TokenBlockProps> = memo(
  ({ item, onHover, onSelect, heading, highlight, selected, showTokenType }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const tokenRef = useRef<HTMLDivElement>(null);

    // Track window size for responsive adjustments
    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    const handleMouseEnter = () => {
      setIsHovered(true);
      onHover(item, heading);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      onHover(null, '');
    };

    const handleClick = () => {
      if (item.note_id) {
        onSelect(item);
      }
    };

    const isHighlighted = selected || highlight || isHovered;

    // Calculate size based on screen width
    const getSize = () => {
      if (windowWidth < 768) {
        return showTokenType ? { width: 22, height: 22, fontSize: 5 } : { width: 18, height: 18, fontSize: 8 };
      } else if (windowWidth < 1024) {
        return showTokenType ? { width: 28, height: 28, fontSize: 6 } : { width: 22, height: 22, fontSize: 9 };
      } else {
        return showTokenType ? { width: 35, height: 35, fontSize: 7 } : { width: 25, height: 25, fontSize: 10 };
      }
    };

    const getExpandedSize = () => {
      if (windowWidth < 768) {
        return { width: 32, height: 32, fontSize: 8 };
      } else if (windowWidth < 1024) {
        return { width: 40, height: 40, fontSize: 9 };
      } else {
        return { width: 50, height: 50, fontSize: 10 };
      }
    };

    const size = getSize();
    const expandedSize = getExpandedSize();

    const dynamicStyles = {
      backgroundColor: selected
        ? 'red'
        : highlight
        ? 'yellow'
        : TokenTypeToColor(item.type),
      width: isHighlighted ? `${expandedSize.width}px` : `${size.width}px`,
      height: isHighlighted ? `${expandedSize.height}px` : `${size.height}px`,
      borderRadius: isHighlighted ? '5px' : '3px',
    };

    const fontStyles = {
      fontSize: isHighlighted ? `${expandedSize.fontSize}px` : `${size.fontSize}px`,
    };

    return (
      <div
        ref={tokenRef}
        className={`
          token-block
          ${isHighlighted ? 'highlighted' : ''}
          ${selected ? 'selected' : ''}
          ${highlight ? 'highlight' : ''}
          ${showTokenType ? 'show-type' : ''}
        `}
        style={dynamicStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className="token-block-content" style={fontStyles}>
          <strong>
              {
                  SplitTokenNames(item.type)
              }
          </strong>
        </div>
      </div>
    );
  }
);

export default TokenBlock;