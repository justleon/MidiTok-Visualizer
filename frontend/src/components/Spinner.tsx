import ClipLoader from 'react-spinners/ClipLoader';
import './Spinner.css';

function Spinner() {
  return (
    <div className="spinner-container">
      <ClipLoader color="#52bfd9" size={10} />
    </div>
  );
}

export default Spinner;