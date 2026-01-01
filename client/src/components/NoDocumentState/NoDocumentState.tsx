import React from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Container, Content, IconWrapper, SpinningIcon, Text, Title, UploadButton } from './NoDocumentState.styles';

interface NoDocumentStateProps {
  hasDocuments: boolean;
  isUploading: boolean;
  isLoadingDocuments?: boolean;
  onFileUploadClick: () => void;
}

const NoDocumentState: React.FC<NoDocumentStateProps> = ({
                                                           hasDocuments,
                                                           isUploading,
                                                           isLoadingDocuments = false,
                                                           onFileUploadClick
                                                         }) => {
  if (isLoadingDocuments) {
    return (
        <Container>
          <Content>
            <IconWrapper>
              <SpinningIcon>
                <Loader2 style={{width: '3rem', height: '3rem', color: '#4f46e5'}}/>
              </SpinningIcon>
            </IconWrapper>
            <Title>Loading...</Title>
          </Content>
        </Container>
    );
  }

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
            <UploadButton onClick={onFileUploadClick} disabled={isUploading}>
              <Upload style={{width: '1.25rem', height: '1.25rem'}}/>
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </UploadButton>
          </Content>
        </Container>
      </>
  );
};

export default NoDocumentState;
