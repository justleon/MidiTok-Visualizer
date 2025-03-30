import React, { useState } from 'react';
import ReactSlider from 'react-slider';

interface RangeSliderProps {
  onRangeChange: (newValues: number[]) => void;
  initialValues: number[];
  limits: number[];
}

const RangeSlider: React.FC<RangeSliderProps> = ({ onRangeChange, initialValues, limits }) => {
  const [values, setValues] = useState(initialValues);

  const handleSliderChange = (newValues: number | number[]) => {
    if (Array.isArray(newValues)) {
      setValues(newValues);
      onRangeChange(newValues);
    }
  };

  return (
    <div style={{ width: '300px', height: '40px' }}>
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="example-thumb"
        trackClassName="example-track"
        defaultValue={values}
        ariaLabel={["Lower thumb", "Upper thumb"]}
        ariaValuetext={state => `Thumb value ${state.valueNow}`}
        renderThumb={(props, state) => (
          <div {...props}>
            <span className="thumb-value">{state.valueNow}</span>
          </div>
        )}
        pearling
        minDistance={10}
        min={limits[0]}
        max={limits[1]}
        onChange={handleSliderChange}
      />
    </div>
  );
};

export default RangeSlider;
