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
import ResizablePanel from '../components/common/ResizablePanel/ResizablePanel';
import NoDocumentState from '../components/NoDocumentState/NoDocumentState';
import { STORAGE_KEYS } from '../constants/storageKeys';
import FileUpload from "../components/FileUpload/FileUpload";

interface FileInfo {
  url: string;
  name: string;
}

const ChatPage: React.FC = () => {
  const {chatId = ''} = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null); // currently viewed file
  const filesRef = useRef<Record<string, FileInfo>>({}); // buffer for downloaded files
  const [documents, setDocuments] = useState<ChatInfo[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN);
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN, String(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    setIsLoading(true);

    const promises: Promise<any>[] = [
      getChats()
      .then(res => setDocuments(res.chats))
      .catch(err => console.error('Failed to load documents:', err))
    ];

    if (chatId) {
      if (filesRef.current[chatId]) {
        console.log('Using cached file for chatId:', chatId);
        setSelectedFile(filesRef.current[chatId]);
        setIsLoading(false);
      } else {
        console.log('Downloading file for chatId:', chatId);
        promises.push(
            downloadFile(chatId)
            .then(({url, fileName}) => {
              setSelectedFile({url, name: fileName});
              filesRef.current = {...filesRef.current, [chatId]: {url: url, name: fileName}};
            })
            .catch(err => {
              console.error('Error downloading file:', err)
            })
        );
      }
    } else {
      setSelectedFile(null);
    }

    // downloading both documents list and selected file (if any)
    Promise.all(promises).finally(() => setIsLoading(false));
  }, [chatId]);

  const onFileUploadClick = () => {
    fileInputRef.current?.click();
  }

  const onFileUploaded = (chatId: string, fileUrl: string, fileName: string) => {
    filesRef.current = {...filesRef.current, [chatId]: {url: fileUrl, name: fileName}};
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
    const newFilesRef = {...filesRef.current};
    delete newFilesRef[deletedChatId];
    filesRef.current = newFilesRef;

    if (chatId === deletedChatId) {
      setSelectedFile(null);
      navigate('/');
    }

    setDocuments(prev => prev.filter(doc => doc.chatId !== deletedChatId));
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
                         documents={documents}
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
                    hasDocuments={documents.length > 0}
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
