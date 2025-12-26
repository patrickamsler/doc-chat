// Main theme export
import { lightTheme } from './tokens';

// Export the light theme as the default theme (for backwards compatibility)
export const theme = lightTheme;

// Export type for TypeScript
export type Theme = typeof theme;

// Re-export utilities from tokens
export { getColor, lightTheme, darkTheme } from './tokens';

// Re-export theme provider
export { ThemeProvider } from './ThemeContext';

// Default export
export default theme;
