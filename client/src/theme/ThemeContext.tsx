import React, { ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import lightTheme from "./tokens";


interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const theme = lightTheme;
  // const theme = darkTheme;

  return (
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
  );
};
