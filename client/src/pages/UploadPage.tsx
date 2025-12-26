import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import FileUpload from '../components/FileUpload/FileUpload';
import { FileUploadContainer, Subtitle, Title, UploadBtn } from './UploadPage.styles';

interface UploadPageProps {
  onFileUploaded: (chatId: string, fileUrl: string, fileName: string) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({onFileUploaded}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <FileUploadContainer>
      <Title>Doc Chat</Title>
      <Subtitle>Upload a PDF and chat with its contents</Subtitle>
      <UploadBtn onClick={handleUploadClick} disabled={isUploading}>
        <Upload style={{ width: '1.25rem', height: '1.25rem' }} />
        {isUploading ? 'Uploading...' : 'Upload PDF'}
      </UploadBtn>
      <FileUpload
        ref={fileInputRef}
        onFileUploaded={onFileUploaded}
        onFileUploadStart={() => setIsUploading(true)}
        onUploadComplete={() => setIsUploading(false)}
      />
    </FileUploadContainer>
  );
};

export default UploadPage;
