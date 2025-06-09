import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { theme } from './theme';
import GlobalStyle from './GlobalStyle';
import { AppContainer } from './App.styles';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import { initAuth } from './services/api';

interface FileInfo {
  url: string;
  name: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<Record<string, FileInfo>>({});
  const isAuthInitialized = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthInitialized.current) {
      isAuthInitialized.current = true;
      initAuth();
    }
  }, []);

  const handleFileUploaded = (chatId: string, fileUrl: string, fileName: string) => {
    setFiles(prev => ({ ...prev, [chatId]: { url: fileUrl, name: fileName } }));
    navigate(`/chat/${chatId}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Routes>
          <Route path="/" element={<UploadPage onFileUploaded={handleFileUploaded} />} />
          <Route path="/chat/:chatId" element={<ChatPage files={files} />} />
        </Routes>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
