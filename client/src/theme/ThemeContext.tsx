import React, { ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from "./tokens";

let THEME_MODE: 'light' | 'dark' = 'light';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const theme = THEME_MODE === 'light' ? lightTheme : darkTheme;

  return (
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
  );
};
