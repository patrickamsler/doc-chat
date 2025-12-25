// Main theme export
import { lightTheme } from './tokens';

// Export the light theme as the default theme
export const theme = lightTheme;

// Export type for TypeScript
export type Theme = typeof theme;

// Re-export utilities from tokens
export { getColor, getSpacing, lightTheme, darkTheme } from './tokens';

// Default export
export default theme;
