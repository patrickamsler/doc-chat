// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock react-syntax-highlighter to avoid ESM/CJS issues in tests
jest.mock('react-syntax-highlighter', () => {
  const mockHighlighter = jest.fn(({ children, ...props }: any) => {
    const mockReact = require('react');
    return mockReact.createElement('pre', props, mockReact.createElement('code', {}, children));
  });

  return {
    Prism: mockHighlighter,
    PrismLight: Object.assign(mockHighlighter, {
      registerLanguage: jest.fn(),
    }),
  };
});

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneLight: {},
}));

// Mock the language imports
jest.mock('react-syntax-highlighter/dist/esm/languages/prism/javascript', () => ({}));
jest.mock('react-syntax-highlighter/dist/esm/languages/prism/typescript', () => ({}));
jest.mock('react-syntax-highlighter/dist/esm/languages/prism/python', () => ({}));
jest.mock('react-syntax-highlighter/dist/esm/languages/prism/java', () => ({}));
jest.mock('react-syntax-highlighter/dist/esm/languages/prism/bash', () => ({}));
jest.mock('react-syntax-highlighter/dist/esm/languages/prism/json', () => ({}));
