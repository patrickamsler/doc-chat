import React from 'react';
import FileUpload from '../components/FileUpload/FileUpload';
import { FileUploadContainer, Title, Subtitle } from '../App.styles';

interface UploadPageProps {
  onFileUploaded: (chatId: string, fileUrl: string, fileName: string) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onFileUploaded }) => (
  <FileUploadContainer>
    <Title>Doc Chat</Title>
    <Subtitle>Upload a PDF and chat with its contents</Subtitle>
    <FileUpload onFileUploaded={onFileUploaded} />
  </FileUploadContainer>
);

export default UploadPage;
