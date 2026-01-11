import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './theme';
import GlobalStyle from './GlobalStyle';
import { AppContainer } from './App.styles';
import ChatPage from './pages/ChatPage';
import { useAuth } from './hooks/useApi';

const App: React.FC = () => {
  useAuth();

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
