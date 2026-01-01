import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Upload } from 'lucide-react';
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
  isUploading: boolean;
  documents: ChatInfo[];
  onFileUploadClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, isUploading, documents, onFileUploadClick}) => {
  const navigate = useNavigate();
  const {chatId} = useParams<{ chatId: string }>();

  const handleDocumentClick = async (doc: ChatInfo) => {
    try {
      navigate(`/chat/${doc.chatId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <UploadBtn onClick={onFileUploadClick} disabled={isUploading}>
            <Upload style={{width: '1rem', height: '1rem'}}/>
            {isUploading ? 'Uploading...' : 'Upload PDF'}
          </UploadBtn>
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