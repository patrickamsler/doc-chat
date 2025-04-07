import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import FileUpload from './components/FileUpload/FileUpload';
import Chat from './components/Chat/Chat';
import PdfViewer from './components/PdfViewer/PdfViewer';
import GlobalStyle from './GlobalStyle';
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { AppContainer, Title, Subtitle, ContentContainer, ContentPanel } from './App.styles';


const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileUploaded = (newToken: string, fileUrl: string) => {
    setToken(newToken);
    setFileUrl(fileUrl);
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
          <Title>Doc Chat</Title>
          <Subtitle>Upload a PDF and chat with its contents</Subtitle>

          {!token ? (
              <FileUpload onFileUploaded={handleFileUploaded}/>
          ) : (
              <ContentContainer>
                <ContentPanel>
                  {fileUrl && <PdfViewer fileUrl={fileUrl}
                                         pageNavigationPluginInstance={pageNavigationPluginInstance} />}
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