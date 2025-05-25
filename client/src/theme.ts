export const theme = {
  colors: {
    // Brand indigos
    primaryA0: '#3F51B5', // Indigo 500 – core brand hue
    primaryA1: '#303F9F', // Indigo 700 – brand darken-1
    primaryA2: '#283593', // Indigo 800 – brand darken-2

    // Neutral greys (Material ramp)
    grey50:  '#FAFAFA', // Grey 50 – page / app canvas
    grey100: '#F5F5F5', // Grey 100 – cards & raised surfaces
    grey200: '#EEEEEE', // Grey 200 – input fills / hovers
    grey300: '#E0E0E0', // Grey 300 – dividers & hairline borders
    grey400: '#BDBDBD', // Grey 400 – disabled text on light bg
    grey500: '#9E9E9E', // Grey 500 – low-emphasis text (light bg)
    grey800: '#424242', // Grey 800 – primary body text (light bg)
    grey900: '#212121', // Grey 900 – headings / highest emphasis

    accent:    '#B0BEC5', // Blue-Grey 200 – subtle accent
    textDark:  '#171919', // Custom dark heading colour
    lightText: '#E5E8F5', // Text on indigo buttons
    white:     '#FFFFFF', // Pure white
  },
  fonts: {
    body: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    mono: '"Roboto Mono", "Menlo", monospace'
  },
};

export type Theme = typeof theme;