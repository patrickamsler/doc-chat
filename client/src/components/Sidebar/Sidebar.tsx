import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Upload } from 'lucide-react';
import FileUpload from '../FileUpload/FileUpload';
import { downloadFile } from '../../services/api';
import { ChatInfo } from '../../types/apiTypes';
import {
  DocumentIcon,
  DocumentInfo,
  DocumentItem,
  DocumentItemContent,
  DocumentList,
  DocumentTitle,
  EmptyIconWrapper,
  EmptyState,
  EmptySubtitle,
  EmptyTitle,
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  Timestamp,
  UploadBtn,
} from './Sidebar.styles';

interface SidebarProps {
  isOpen: boolean;
  documents: ChatInfo[];
  onFileReady: (chatId: string, fileUrl: string, fileName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, documents, onFileReady}) => {
  const navigate = useNavigate();
  const {chatId} = useParams<{ chatId: string }>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);


  const handleDocumentClick = async (doc: ChatInfo) => {
    try {
      const {url, fileName} = await downloadFile(doc.chatId);
      onFileReady(doc.chatId, url, fileName);
      navigate(`/chat/${doc.chatId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileUploaded = (id: string, url: string, name: string) => {
    onFileReady(id, url, name);
    navigate(`/chat/${id}`);
  }

  return (
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <UploadBtn onClick={handleUploadClick} disabled={isUploading}>
            <Upload style={{width: '1rem', height: '1rem'}}/>
            {isUploading ? 'Uploading...' : 'Upload PDF'}
          </UploadBtn>
          <FileUpload
              ref={fileInputRef}
              onFileUploaded={onFileUploaded}
              onFileUploadStart={() => setIsUploading(true)}
              onUploadComplete={() => setIsUploading(false)}
          />
        </SidebarHeader>

        <SidebarContent>
          <SidebarTitle>Your Documents</SidebarTitle>
          {documents.length > 0 ? (
              <DocumentList>
                {documents.map(doc => (
                    <DocumentItem
                        key={doc.chatId}
                        onClick={() => handleDocumentClick(doc)}
                        $isSelected={chatId === doc.chatId}
                    >
                      <DocumentItemContent>
                        <DocumentIcon $isSelected={chatId === doc.chatId}/>
                        <DocumentInfo>
                          <DocumentTitle $isSelected={chatId === doc.chatId} title={doc.fileName}>
                            {doc.fileName}
                          </DocumentTitle>
                          <Timestamp>
                            {new Date(doc.createdAt).toISOString().split('T')[0]}
                          </Timestamp>
                        </DocumentInfo>
                      </DocumentItemContent>
                    </DocumentItem>
                ))}
              </DocumentList>
          ) : (
              <EmptyState>
                <EmptyIconWrapper>
                  <FileText style={{width: '2rem', height: '2rem', color: '#9ca3af'}}/>
                </EmptyIconWrapper>
                <EmptyTitle>No documents yet</EmptyTitle>
                <EmptySubtitle>Upload a PDF to get started</EmptySubtitle>
              </EmptyState>
          )}
        </SidebarContent>
      </SidebarContainer>
  );
};

export default Sidebar;