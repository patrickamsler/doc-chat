export const lightTheme = {
  colors: {
    // Primary brand colors
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },

    // Secondary/accent colors
    secondary: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },

    // Neutral grays
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Semantic colors
    success: {
      light: '#D1FAE5',
      main: '#10B981',
      dark: '#065F46',
    },

    error: {
      light: '#FEE2E2',
      main: '#EF4444',
      dark: '#991B1B',
    },

    warning: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#92400E',
    },

    info: {
      light: '#DBEAFE',
      main: '#3B82F6',
      dark: '#1E40AF',
    },

    // Background colors
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
      sidebar: '#FFFFFF',
      chat: '#FFFFFF',
      pdfViewer: '#F3F4F6',
    },

    // Text colors
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
      inverse: '#FFFFFF',
    },

    // Border colors
    border: {
      light: '#F3F4F6',
      main: '#E5E7EB',
      dark: '#D1D5DB',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },

    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    none: 'none',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    sticky: 1000,
    dropdown: 1020,
    overlay: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  // Transitions
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },

    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
    },
  },
};

export const darkTheme = {
  colors: {
    // Primary brand colors (slightly adjusted for dark mode)
    primary: {
      50: '#312E81',
      100: '#3730A3',
      200: '#4338CA',
      300: '#4F46E5',
      400: '#6366F1',
      500: '#818CF8',
      600: '#A5B4FC',
      700: '#C7D2FE',
      800: '#E0E7FF',
      900: '#EEF2FF',
    },

    // Secondary/accent colors
    secondary: {
      50: '#14532D',
      100: '#166534',
      200: '#15803D',
      300: '#16A34A',
      400: '#22C55E',
      500: '#4ADE80',
      600: '#86EFAC',
      700: '#BBF7D0',
      800: '#DCFCE7',
      900: '#F0FDF4',
    },

    // Neutral grays (inverted for dark theme)
    gray: {
      50: '#111827',
      100: '#1F2937',
      200: '#374151',
      300: '#4B5563',
      400: '#6B7280',
      500: '#9CA3AF',
      600: '#D1D5DB',
      700: '#E5E7EB',
      800: '#F3F4F6',
      900: '#F9FAFB',
    },

    // Semantic colors
    success: {
      light: '#065F46',
      main: '#10B981',
      dark: '#D1FAE5',
    },

    error: {
      light: '#991B1B',
      main: '#EF4444',
      dark: '#FEE2E2',
    },

    warning: {
      light: '#92400E',
      main: '#F59E0B',
      dark: '#FEF3C7',
    },

    info: {
      light: '#1E40AF',
      main: '#3B82F6',
      dark: '#DBEAFE',
    },

    // Background colors (dark theme)
    background: {
      default: '#0F172A',
      paper: '#1E293B',
      sidebar: '#1E293B',
      chat: '#1E293B',
      pdfViewer: '#0F172A',
    },

    // Text colors (inverted)
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      disabled: '#64748B',
      inverse: '#0F172A',
    },

    // Border colors (dark)
    border: {
      light: '#1E293B',
      main: '#334155',
      dark: '#475569',
    },
  },

  // Typography (same as light)
  typography: lightTheme.typography,

  // Border radius (same as light)
  borderRadius: lightTheme.borderRadius,

  // Shadows (darker for dark mode)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    none: 'none',
  },

  // Z-index (same as light)
  zIndex: lightTheme.zIndex,

  // Transitions (same as light)
  transitions: lightTheme.transitions,
};

// Default export is light theme
export const theme = lightTheme;

// Helper function to get color with optional opacity
export const getColor = (colorPath: string, opacity?: number, themeArg = lightTheme) => {
  const keys = colorPath.split('.');
  let value: any = themeArg.colors;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return '#000000';
    }
  }

  if (opacity !== undefined && opacity >= 0 && opacity <= 1) {
    // Convert hex to rgba
    const hex = value.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return value;
};

export type Theme = typeof lightTheme;

export default lightTheme;
