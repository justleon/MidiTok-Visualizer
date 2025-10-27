import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFormats: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, acceptedFormats,disabled = false }) => {
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      onFileSelect(file);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = () => {
    if (isUploading) {
      return <div className="loading-spinner"></div>;
    } else if (showSuccess) {
      return <span style={{ color: '#4CAF50' }}>✓</span>;
    } else {
      return <span>📁</span>;
    }
  };

  return (
    <div className={`file-upload ${disabled ? 'disabled' : ''}`}>
      <div className="file-input-container">
        <input
          type="file"
          onChange={handleFileChange}
          accept={acceptedFormats}
          ref={fileInputRef}
          disabled={disabled}
        />
        <div
          className={`file-input-label ${showSuccess ? 'file-upload-success' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={disabled ? undefined : handleClick}
        >
          {getFileIcon()}
          <span>{fileName ? fileName : 'Choose a file...'}</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;