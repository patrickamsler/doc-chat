import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import PdfViewer from '../components/PdfViewer/PdfViewer';
import Chat from '../components/Chat/Chat';
import { ContentContainer, ContentPanel } from './ChatPage.styles';
import { downloadFile } from '../services/api';
import Header from "../components/Header/Header";
import Sidebar from '../components/Sidebar/Sidebar';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const downloadCalled = useRef<Record<string, boolean>>({});

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const {jumpToPage} = pageNavigationPluginInstance;

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  useEffect(() => {
    if (!chatId) return;

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

  if (!chatId) return null;

  return (
      <>
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onFileReady={onFileUploaded}/>
        <Header onMenuClick={toggleSidebar}/>
        <ContentContainer>
          <ContentPanel>
            {fileUrl && (
                <PdfViewer
                    fileUrl={fileUrl}
                    fileName={fileName}
                    pageNavigationPluginInstance={pageNavigationPluginInstance}
                />
            )}
          </ContentPanel>
          <ContentPanel>
            <Chat chatId={chatId} onBadgeClick={handleBadgeClick}/>
          </ContentPanel>
        </ContentContainer>
      </>
  );
};

export default ChatPage;
