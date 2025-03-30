import React, { useState } from 'react';
import styled from 'styled-components';
import { uploadFile } from '../../services/api';

const UploadContainer = styled.div`
  margin-bottom: 20px;
`;

const UploadButton = styled.button`
  background-color: #4285f4;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #3367d6;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  display: none;
`;

interface FileUploadProps {
  onFileUploaded: (token: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await uploadFile(file);
      onFileUploaded(response.token);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
      <UploadContainer>
        <UploadButton onClick={handleButtonClick} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload PDF'}
        </UploadButton>
        <FileInput
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileChange}
        />
      </UploadContainer>
  );
};

export default FileUpload;