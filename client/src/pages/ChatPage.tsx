import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import PdfViewer from '../components/PdfViewer/PdfViewer';
import Chat from '../components/Chat/Chat';
import { Container, ContentPanel, MainLayout } from './ChatPage.styles';
import Header from "../components/Header/Header";
import Sidebar from '../components/Sidebar/Sidebar';
import ResizablePanel from '../components/common/ResizablePanel/ResizablePanel';
import NoDocumentState from '../components/NoDocumentState/NoDocumentState';
import { STORAGE_KEYS } from '../constants/storageKeys';
import FileUpload from "../components/FileUpload/FileUpload";
import { useChats, useChatFile } from '../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/queryKeys';

const ChatPage: React.FC = () => {
  const {chatId = ''} = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chats = [], isLoading: isLoadingChats } = useChats();
  const { data: fileData, isLoading: isLoadingFile } = useChatFile(chatId);

  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN);
    return saved !== null ? saved === 'true' : true;
  });

  const isLoading = isLoadingChats || (!!chatId && isLoadingFile);
  const selectedFile = fileData ? { url: fileData.url, name: fileData.fileName } : null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN, String(isSidebarOpen));
  }, [isSidebarOpen]);

  const onFileUploadClick = () => {
    fileInputRef.current?.click();
  }

  const onFileUploaded = (chatId: string, fileUrl: string, fileName: string) => {
    // Pre-populate cache to avoid loading state
    queryClient.setQueryData(queryKeys.chats.file(chatId), {
      url: fileUrl,
      fileName: fileName,
    });
    navigate(`/chat/${chatId}`);
  };

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const {jumpToPage} = pageNavigationPluginInstance;

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  }

  const handleBadgeClick = (pageRef: number, content: string) => {
    if (jumpToPage) {
      console.log(content)
      jumpToPage(pageRef);
    }
  };

  const handleChatDeleted = (deletedChatId: string) => {
    if (chatId === deletedChatId) {
      navigate('/');
    }
  };

  return (
      <Container>
        <FileUpload
            ref={fileInputRef}
            onFileUploaded={onFileUploaded}
            onFileUploadStart={() => setIsFileUploading(true)}
            onUploadComplete={() => setIsFileUploading(false)}
        />
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
                <Sidebar isOpen={isSidebarOpen}
                         isUploading={isFileUploading}
                         documents={chats}
                         onFileUploadClick={onFileUploadClick}
                         onChatDeleted={handleChatDeleted}
                />
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
                    hasDocuments={chats.length > 0}
                    isUploading={isFileUploading}
                    isLoadingDocuments={isLoading}
                    onFileUploadClick={onFileUploadClick}
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
