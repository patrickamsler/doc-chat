import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import PdfViewer from '../components/PdfViewer/PdfViewer';
import Chat from '../components/Chat/Chat';
import { Container, ContentPanel, MainLayout } from './ChatPage.styles';
import { downloadFile, getChats } from '../services/api';
import { ChatInfo } from '../types/apiTypes';
import Header from "../components/Header/Header";
import Sidebar from '../components/Sidebar/Sidebar';
import ResizablePanel from '../components/ResizablePanel/ResizablePanel';
import NoDocumentState from '../components/NoDocumentState/NoDocumentState';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface FileInfo {
  url: string;
  name: string;
}

const ChatPage: React.FC = () => {
  const {chatId = ''} = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const downloadCalled = useRef<Record<string, boolean>>({});

  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null); // currently viewed file
  const [files, setFiles] = useState<Record<string, FileInfo>>({}); // buffer for downloaded files

  const [documents, setDocuments] = useState<ChatInfo[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN);
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN, String(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    getChats()
    .then(res => setDocuments(res.chats))
    .catch(err => console.error('Failed to load documents:', err));
  }, []);

  const onFileUploaded = (chatId: string, fileUrl: string, fileName: string) => {
    setFiles(prev => ({...prev, [chatId]: {url: fileUrl, name: fileName}}));
    navigate(`/chat/${chatId}`);
  };

  const handleFileUploadComplete = () => {
    getChats()
    .then(res => setDocuments(res.chats))
    .catch(err => console.error('Failed to refresh documents:', err));
  };

  useEffect(() => {
    if (!chatId) {
      setSelectedFile(null)
      return;
    }

    const info = files[chatId]; // file already downloaded and cached (e.g. from UploadPage)
    if (info) {
      console.log('Using cached file info for chatId:', chatId);
      setSelectedFile(info);
      return;
    }

    if (downloadCalled.current[chatId]) return; // Prevent multiple downloads for the same chatId

    console.log('Downloading file for chatId:', chatId);
    downloadCalled.current[chatId] = true;
    downloadFile(chatId)
    .then(({url, fileName}) => {
      setSelectedFile({url, name: fileName});
    })
    .catch(err => console.error('Error downloading file:', err));
  }, [chatId, files]);

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const {jumpToPage} = pageNavigationPluginInstance;

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleBadgeClick = (pageRef: number, content: string) => {
    if (jumpToPage) {
      console.log(content)
      jumpToPage(pageRef);
    }
  };

  return (
      <Container>
        <Header onMenuClick={toggleSidebar}/>
        <MainLayout>
          {isSidebarOpen && (
              <ResizablePanel
                  storageKey={STORAGE_KEYS.COMPONENTS.SIDEBAR_WIDTH}
                  defaultWidth={256}
                  minWidth={200}
                  maxWidth={500}
                  resizePosition="right"
                  minRemainingSpace={700}
              >
                <Sidebar isOpen={isSidebarOpen} documents={documents} onFileUploaded={onFileUploaded}/>
              </ResizablePanel>
          )}
          <ContentPanel>
            {selectedFile ? (
                <PdfViewer
                    fileUrl={selectedFile.url}
                    fileName={selectedFile.name}
                    pageNavigationPluginInstance={pageNavigationPluginInstance}
                />
            ) : (
                <NoDocumentState
                    hasDocuments={documents.length > 0}
                    onFileUploaded={onFileUploaded}
                    onUploadComplete={handleFileUploadComplete}
                />
            )}
          </ContentPanel>
          <ResizablePanel
              storageKey={STORAGE_KEYS.COMPONENTS.CHAT_WIDTH}
              defaultWidth={550}
              minWidth={300}
              maxWidth={1000}
              resizePosition="left"
              minRemainingSpace={500}
          >
            <Chat
                chatId={chatId}
                fileName={selectedFile?.name}
                onBadgeClick={handleBadgeClick}
            />
          </ResizablePanel>
        </MainLayout>
      </Container>
  );
};

export default ChatPage;
