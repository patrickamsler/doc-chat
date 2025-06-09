import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../FileUpload/FileUpload';
import { downloadFile, getChats } from '../../services/api';
import { ChatInfo } from '../../types/apiTypes';
import { SidebarContext } from './SidebarContext';
import { SidebarContainer, ToggleButton, DocumentList, DocumentItem, Timestamp } from './Sidebar.styles';

interface SidebarProps {
  onFileReady: (chatId: string, fileUrl: string, fileName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileReady }) => {
  const { isOpen, toggle, close } = useContext(SidebarContext);
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

  const handleDocumentClick = async (doc: ChatInfo) => {
    try {
      const { url, fileName } = await downloadFile(doc.chatId);
      onFileReady(doc.chatId, url, fileName);
      navigate(`/chat/${doc.chatId}`);
      close();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <ToggleButton onClick={toggle}>☰</ToggleButton>
      <SidebarContainer $open={isOpen}>
        <FileUpload onFileUploaded={(id, url, name) => {
          onFileReady(id, url, name);
          navigate(`/chat/${id}`);
          close();
        }} />
        {error && <div>{error}</div>}
        {!error && documents.length === 0 && <div>No documents</div>}
        <DocumentList>
          {documents.map(doc => (
            <DocumentItem key={doc.chatId} onClick={() => handleDocumentClick(doc)}>
              <span>{doc.fileName}</span>
              <Timestamp>{new Date(doc.createdAt).toLocaleString()}</Timestamp>
            </DocumentItem>
          ))}
        </DocumentList>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
