import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import FileUpload from '../FileUpload/FileUpload';
import { Container, Content, IconWrapper, Text, Title, UploadButton } from './NoDocumentState.styles';

interface NoDocumentStateProps {
  hasDocuments: boolean;
  onFileUploaded: (chatId: string, fileUrl: string, fileName: string) => void;
  onUploadComplete?: () => void;
}

const NoDocumentState: React.FC<NoDocumentStateProps> = ({
                                                           hasDocuments,
                                                           onFileUploaded,
                                                           onUploadComplete
                                                         }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadComplete = () => {
    setIsUploading(false);
    onUploadComplete?.();
  };

  return (
      <>
        <Container>
          <Content>
            <IconWrapper>
              <Upload style={{width: '3rem', height: '3rem', color: '#4f46e5'}}/>
            </IconWrapper>
            <Title>
              {hasDocuments ? 'No document selected' : 'Upload your first document'}
            </Title>
            <Text>
              {hasDocuments
                  ? 'Select a document from the sidebar or upload another one to get started'
                  : 'Get started by uploading a PDF document to chat with the AI assistant'}
            </Text>
            <UploadButton onClick={handleUploadClick} disabled={isUploading}>
              <Upload style={{width: '1.25rem', height: '1.25rem'}}/>
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </UploadButton>
          </Content>
        </Container>
        <FileUpload
            ref={fileInputRef}
            onFileUploaded={onFileUploaded}
            onFileUploadStart={() => setIsUploading(true)}
            onUploadComplete={handleUploadComplete}
        />
      </>
  );
};

export default NoDocumentState;
