import React, { useState } from 'react';
import { uploadFile } from '../../services/api';
import { FileInput, UploadButton, UploadContainer, } from './FileUpload.styles'


interface FileUploadProps {
  onFileUploaded: (chatId: string, fileUrl: string, fileName: string) => void;
  onFileUploadStart?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, onFileUploadStart }) => {
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
      onFileUploadStart?.();
      const response = await uploadFile(file);
      const fileUrl = URL.createObjectURL(file);
      onFileUploaded(response.chatId, fileUrl, file.name);
    } catch (error) {
      console.error('Error uploading file:', error);
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
            data-testid="file-input"
            onChange={handleFileChange}
        />
      </UploadContainer>
  );
};

export default FileUpload;