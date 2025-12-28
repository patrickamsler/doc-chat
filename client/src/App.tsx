import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './theme';
import GlobalStyle from './GlobalStyle';
import { AppContainer } from './App.styles';
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
    setFiles(prev => ({...prev, [chatId]: {url: fileUrl, name: fileName}}));
    navigate(`/chat/${chatId}`);
  };

  return (
      <ThemeProvider>
        <GlobalStyle/>
        <AppContainer>
          <Routes>
            <Route
                path="/chat/:chatId"
                element={<ChatPage files={files} onFileUploaded={handleFileUploaded}/>}
            />
            <Route
                path="*"
                element={<ChatPage files={files} onFileUploaded={handleFileUploaded}/>}
            />
          </Routes>
        </AppContainer>
      </ThemeProvider>
  );
};

export default App;
