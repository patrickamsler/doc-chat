import React, { useState } from 'react';
import styled from 'styled-components';
import FileUpload from './components/FileUpload/FileUpload';
import Chat from './components/Chat/Chat';

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 30px;
`;

function App() {
  const [token, setToken] = useState<string | null>(null);

  const handleFileUploaded = (newToken: string) => {
    setToken(newToken);
  };

  return (
      <AppContainer>
        <Title>Doc Chat</Title>
        <Subtitle>Upload a PDF and chat with its contents</Subtitle>

        {!token ? (
            <FileUpload onFileUploaded={handleFileUploaded} />
        ) : (
            <Chat token={token} />
        )}
      </AppContainer>
  );
}

export default App;