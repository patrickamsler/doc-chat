import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import PdfViewer from './PdfViewer';
import theme from "../../theme";
import { PageNavigationPlugin } from '@react-pdf-viewer/page-navigation';

const createMockPlugin = (): PageNavigationPlugin => ({
  CurrentPageInput: () => <input data-testid="current-page-input" />,
  NumberOfPages: () => <span data-testid="number-of-pages">1</span>,
  GoToNextPageButton: () => <button data-testid="next-page">Next</button>,
  GoToPreviousPageButton: () => <button data-testid="prev-page">Prev</button>,
} as unknown as PageNavigationPlugin);

beforeAll(() => {
  // @react-pdf-viewer relies on these observers which are not provided by JSDOM
  class IntersectionObserverMock {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }
  // @ts-ignore
  global.IntersectionObserver = IntersectionObserverMock;
});

describe('PdfViewer', () => {
  it('renders file name and navigation controls', () => {
    const plugin = createMockPlugin();
    render(
      <ThemeProvider theme={theme}>
        <PdfViewer fileUrl="dummy.pdf" fileName="Dummy" pageNavigationPluginInstance={plugin} />
      </ThemeProvider>
    );

    expect(screen.getByText('Dummy')).toBeInTheDocument();
    expect(screen.getByTestId('current-page-input')).toBeInTheDocument();
    expect(screen.getByTestId('number-of-pages')).toBeInTheDocument();
    expect(screen.getByTestId('next-page')).toBeInTheDocument();
    expect(screen.getByTestId('prev-page')).toBeInTheDocument();
  });
});
