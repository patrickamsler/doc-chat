import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../FileUpload/FileUpload';
import { downloadFile, getChats } from '../../services/api';
import { ChatInfo } from '../../types/apiTypes';
import { SidebarContext } from './SidebarContext';
import {
  SidebarContainer,
  ToggleButton,
  DocumentList,
  DocumentItem,
  Timestamp,
  SidebarHeader,
  HeaderIcon,
  CloseButton,
  DocumentTitle,
} from './Sidebar.styles';
import logo from '../../logo.svg';

interface SidebarProps {
  onFileReady: (chatId: string, fileUrl: string, fileName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileReady }) => {
  const { isOpen, toggle, close } = useContext(SidebarContext);
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
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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
      <ToggleButton onClick={toggle} $open={isOpen}>☰</ToggleButton>
      <SidebarContainer ref={sidebarRef} $open={isOpen}>
        <SidebarHeader>
          <HeaderIcon src={logo} alt="logo" />
          <CloseButton onClick={close}>X</CloseButton>
        </SidebarHeader>
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
              <DocumentTitle title={doc.fileName}>{doc.fileName}</DocumentTitle>
              <Timestamp>{new Date(doc.createdAt).toLocaleString()}</Timestamp>
            </DocumentItem>
          ))}
        </DocumentList>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
