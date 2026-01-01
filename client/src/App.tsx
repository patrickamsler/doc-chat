import React, { useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
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
  const isAuthInitialized = useRef(false);

  useEffect(() => {
    if (!isAuthInitialized.current) {
      isAuthInitialized.current = true;
      initAuth();
    }
  }, []);

  return (
      <ThemeProvider>
        <GlobalStyle/>
        <AppContainer>
          <Routes>
            <Route
                path="/chat/:chatId"
                element={<ChatPage/>}
            />
            <Route
                path="*"
                element={<ChatPage/>}
            />
          </Routes>
        </AppContainer>
      </ThemeProvider>
  );
};

export default App;
