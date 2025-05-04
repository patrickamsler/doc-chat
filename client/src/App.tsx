import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import FileUpload from './components/FileUpload/FileUpload';
import Chat from './components/Chat/Chat';
import PdfViewer from './components/PdfViewer/PdfViewer';
import GlobalStyle from './GlobalStyle';
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { AppContainer, Title, Subtitle, ContentContainer, ContentPanel, FileUploadContainer } from './App.styles';


const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUploaded = (newToken: string, fileUrl: string) => {
    setToken(newToken);
    setFileUrl(fileUrl);
    setFileName(fileName);
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
          {!token ? (
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
                      token={token}
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