import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../FileUpload/FileUpload';
import { downloadFile, getChats } from '../../services/api';
import { ChatInfo } from '../../types/apiTypes';
import {
  SidebarContainer,
  DocumentList,
  DocumentItem,
  Timestamp,
  SidebarHeader,
  CloseButton,
  DocumentTitle,
  SidebarContent,
} from './Sidebar.styles';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onFileReady: (chatId: string, fileUrl: string, fileName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, onToggle, onFileReady}) => {
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [documents, setDocuments] = useState<ChatInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    getChats()
    .then(res => {
      const sorted = [...res.chats].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setDocuments(sorted);
      setError(null);
    })
    .catch(() => setError('Failed to load documents'));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) { // close sidebar if clicked outside
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onToggle]);

  const handleDocumentClick = async (doc: ChatInfo) => {
    try {
      const {url, fileName} = await downloadFile(doc.chatId);
      onFileReady(doc.chatId, url, fileName);
      navigate(`/chat/${doc.chatId}`);
      onToggle();
    } catch (err) {
      console.error(err);
    }
  };

  const onFileUploadStart = () => {
    //close() TODO handle file upload start if needed
  }

  const onFileUploaded = (id: string, url: string, name: string) => {
    onFileReady(id, url, name);
    navigate(`/chat/${id}`);
    onToggle(); // close sidebar after file upload
  }

  return (
      <>
        <SidebarContainer ref={sidebarRef} $open={isOpen}>
          <SidebarHeader>
            <CloseButton onClick={onToggle}>X</CloseButton>
          </SidebarHeader>
          <SidebarContent>
            <FileUpload onFileUploaded={onFileUploaded} onFileUploadStart={onFileUploadStart}/>
            {error && <div>{error}</div>}
            {!error && documents.length === 0 && <div>No documents</div>}
            <DocumentList>
              {documents.map(doc => (
                  <DocumentItem key={doc.chatId} onClick={() => handleDocumentClick(doc)}>
                    <DocumentTitle title={doc.fileName}>{doc.fileName}</DocumentTitle>
                    <Timestamp>{new Date(doc.createdAt).toLocaleDateString()}</Timestamp>
                  </DocumentItem>
              ))}
            </DocumentList>
          </SidebarContent>
        </SidebarContainer>
      </>
  );
};

export default Sidebar;