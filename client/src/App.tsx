import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import FileUpload from './components/FileUpload/FileUpload';
import Chat from './components/Chat/Chat';
import PdfViewer from './components/PdfViewer/PdfViewer';
import GlobalStyle from './GlobalStyle';

const AppContainer = styled.div`
    margin: 0 auto;
    padding: 20px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    max-width: 1600px;
    overflow: hidden;
`;

const Title = styled.h1`
    text-align: center;
    color: ${props => props.theme.colors.text};
    margin-bottom: 5px;
    margin-top: 30px;
    font-family: ${props => props.theme.fonts.main};
`;

const Subtitle = styled.p`
    text-align: center;
    color: ${props => props.theme.colors.lightText};
    margin-top: 0;
    margin-bottom: 20px;
    font-family: ${props => props.theme.fonts.main};
`;

const ContentContainer = styled.div`
    display: flex;
    flex: 1;
    height: 100%;
    gap: 15px;
    overflow: hidden;
`;

const ContentPanel = styled.div`
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
`;

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileUploaded = (newToken: string, fileUrl: string) => {
    setToken(newToken);
    setFileUrl(fileUrl);
  };

  return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AppContainer>
          <Title>Doc Chat</Title>
          <Subtitle>Upload a PDF and chat with its contents</Subtitle>

          {!token ? (
              <FileUpload onFileUploaded={handleFileUploaded}/>
          ) : (
              <ContentContainer>
                <ContentPanel>
                  {fileUrl && <PdfViewer fileUrl={fileUrl}/>}
                </ContentPanel>
                <ContentPanel>
                  <Chat token={token}/>
                </ContentPanel>
              </ContentContainer>
          )}
        </AppContainer>
      </ThemeProvider>
  );
}

export default App;