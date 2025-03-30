import React, { useState } from 'react';
import styled from 'styled-components';
import FileUpload from './components/FileUpload/FileUpload';
import Chat from './components/Chat/Chat';

const AppContainer = styled.div`
    width: 90%;
    max-width: 1200px; /* Increased from 800px */
    margin: 0 auto;
    padding: 20px;
    height: 100vh;
    display: flex;
    flex-direction: column;
`;

const Title = styled.h1`
    text-align: center;
    color: #333;
    margin-bottom: 5px; /* Add small margin to reduce spacing */
`;

const Subtitle = styled.p`
    text-align: center;
    color: #666;
    margin-top: 0; /* Remove default top margin */
    margin-bottom: 30px; /* Keep existing margin below subtitle */
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