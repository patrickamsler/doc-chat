import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './theme';
import GlobalStyle from './GlobalStyle';
import { AppContainer } from './App.styles';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import { initAuth } from './services/api';
import Sidebar from './components/Sidebar/Sidebar';

interface FileInfo {
  url: string;
  name: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<Record<string, FileInfo>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
      <ThemeProvider>
        <GlobalStyle/>
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onFileReady={handleFileUploaded}/>
        <AppContainer>
          <Routes>
            <Route path="*" element={<UploadPage onFileUploaded={handleFileUploaded}/>}/>
            <Route path="/" element={<UploadPage onFileUploaded={handleFileUploaded}/>}/>
            <Route path="/chat/:chatId" element={<ChatPage files={files} toggleSidebar={toggleSidebar}/>}/>
          </Routes>
        </AppContainer>
      </ThemeProvider>
  );
};

export default App;
