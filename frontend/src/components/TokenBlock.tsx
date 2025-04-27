import React, { memo, useState } from 'react';
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

const TokenBlock: React.FC<TokenBlockProps> = memo(
  ({ item, onHover, onSelect, heading, highlight, selected, showTokenType }) => {
    const [isHovered, setIsHovered] = useState(false);

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

    const dynamicStyles = {
      backgroundColor: selected
        ? 'red'
        : highlight
        ? 'yellow'
        : TokenTypeToColor(item.type),
    };

    return (
      <div
        className={`
          token-block
          ${isHighlighted ? 'highlighted' : ''}
          ${isHighlighted ? 'large' : ''}
          ${selected ? 'selected' : ''}
          ${highlight ? 'highlight' : ''}
          ${showTokenType ? 'show-type' : ''}  // <-- klasa pokazująca typ
        `}
        style={dynamicStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className="token-block-content">
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
