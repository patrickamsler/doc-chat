import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import FileUpload from './components/FileUpload/FileUpload';
import Chat from './components/Chat/Chat';
import PdfViewer from './components/PdfViewer/PdfViewer';
import GlobalStyle from './GlobalStyle';
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { AppContainer, Title, Subtitle, ContentContainer, ContentPanel, FileUploadContainer } from './App.styles';
import { initAuth } from './services/api'; // Add this import


const App: React.FC = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const isAuthInitialized = useRef(false);

  useEffect(() => {
    if (!isAuthInitialized.current) {
      isAuthInitialized.current = true;
      // Call /auth/init on app mount
      console.log("Initializing authentication...");
      initAuth();
    }
  }, []);

  const handleFileUploaded = (chatId: string, newFileUrl: string, newFileName: string) => {
    setChatId(chatId);
    setFileUrl(newFileUrl);
    setFileName(newFileName);
  };

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const {
    jumpToPage
  } = pageNavigationPluginInstance;

  const handleBadgeClick = (pageRef: number) => {
    if (jumpToPage) {
      jumpToPage(pageRef);
    }
  };

  return (
      <ThemeProvider theme={theme}>
        <GlobalStyle/>
        <AppContainer>
          {!chatId ? (
              <FileUploadContainer>
                <Title>Doc Chat</Title>
                <Subtitle>Upload a PDF and chat with its contents</Subtitle>
                <FileUpload onFileUploaded={handleFileUploaded}/>
              </FileUploadContainer>
          ) : (
              <ContentContainer>
                <ContentPanel>
                  {fileUrl && <PdfViewer fileUrl={fileUrl}
                                         fileName={fileName}
                                         pageNavigationPluginInstance={pageNavigationPluginInstance}/>}
                </ContentPanel>
                <ContentPanel>
                  <Chat
                      chatId={chatId}
                      onBadgeClick={handleBadgeClick}
                  />
                </ContentPanel>
              </ContentContainer>
          )}
        </AppContainer>
      </ThemeProvider>
  );
}

export default App;