import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import FileUpload from './components/FileUpload/FileUpload';
import Chat from './components/Chat/Chat';

const AppContainer = styled.div`
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    height: 100vh;
    display: flex;
    flex-direction: column;
`;

const Title = styled.h1`
    text-align: center;
    color: ${props => props.theme.colors.text};
    margin-bottom: 5px;
    font-family: ${props => props.theme.fonts.main};
`;

const Subtitle = styled.p`
    text-align: center;
    color: ${props => props.theme.colors.lightText};
    margin-top: 0;
    margin-bottom: 30px;
    font-family: ${props => props.theme.fonts.main};
`;

function App() {
  const [token, setToken] = useState<string | null>(null);

  const handleFileUploaded = (newToken: string) => {
    setToken(newToken);
  };

  return (
      <ThemeProvider theme={theme}>
        <AppContainer>
          <Title>Doc Chat</Title>
          <Subtitle>Upload a PDF and chat with its contents</Subtitle>

          {!token ? (
              <FileUpload onFileUploaded={handleFileUploaded} />
          ) : (
              <Chat token={token} />
          )}
        </AppContainer>
      </ThemeProvider>
  );
}

export default App;