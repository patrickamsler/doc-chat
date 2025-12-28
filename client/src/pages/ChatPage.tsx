import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import PdfViewer from '../components/PdfViewer/PdfViewer';
import Chat from '../components/Chat/Chat';
import { Container, ContentPanel, MainLayout } from './ChatPage.styles';
import { downloadFile } from '../services/api';
import Header from "../components/Header/Header";
import Sidebar from '../components/Sidebar/Sidebar';
import ResizablePanel from '../components/ResizablePanel/ResizablePanel';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface FileInfo {
  url: string;
  name: string;
}

interface ChatPageProps {
  files: Record<string, FileInfo>;
  onFileUploaded: (chatId: string, fileUrl: string, fileName: string) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({files, onFileUploaded}) => {
  const {chatId = ''} = useParams<{ chatId: string }>();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN);
    return saved !== null ? saved === 'true' : true;
  });
  const downloadCalled = useRef<Record<string, boolean>>({});

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const {jumpToPage} = pageNavigationPluginInstance;

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN, String(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!chatId) {
      // Clear file state when no chatId (empty state)
      setFileUrl(null);
      setFileName('');
      return;
    }

    const info = files[chatId]; // file already downloaded and cached (e.g. from UploadPage)
    if (info) {
      console.log('Using cached file info for chatId:', chatId);
      setFileUrl(info.url);
      setFileName(info.name);
      return;
    }

    if (downloadCalled.current[chatId]) return; // Prevent multiple downloads for the same chatId

    console.log('Downloading file for chatId:', chatId);
    downloadCalled.current[chatId] = true;
    downloadFile(chatId)
    .then(({url, fileName}) => {
      setFileUrl(url);
      setFileName(fileName);
    })
    .catch(err => console.error('Error downloading file:', err));
  }, [chatId, files]);

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
                <Sidebar isOpen={isSidebarOpen} onFileReady={onFileUploaded}/>
              </ResizablePanel>
          )}
          <ContentPanel>
            {fileUrl && (
                <PdfViewer
                    fileUrl={fileUrl}
                    fileName={fileName}
                    pageNavigationPluginInstance={pageNavigationPluginInstance}
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
                fileName={fileName}
                onBadgeClick={handleBadgeClick}
            />
          </ResizablePanel>
        </MainLayout>
      </Container>
  );
};

export default ChatPage;
