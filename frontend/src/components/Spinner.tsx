import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = '#FFFFFF',
  text
}) => {

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 32;
      case 'medium':
      default:
        return 20;
    }
  };

  const spinnerSize = getSpinnerSize();

  const spinnerStyle = {
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
    borderWidth: `${Math.max(2, spinnerSize / 8)}px`,
    borderColor: `rgba(255, 255, 255, 0.2)`,
    borderTopColor: color
  };

  return (
    <div className="spinner-container">
      <div
        className="loading-spinner"
        style={spinnerStyle}
      />
      {text && <span>{text}</span>}
    </div>
  );
};

export default Spinner;