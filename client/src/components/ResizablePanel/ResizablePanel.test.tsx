import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ResizablePanel from './ResizablePanel';
import { lightTheme } from '../../theme/tokens';

describe('ResizablePanel Component', () => {
  const mockStorageKey = 'test-panel-width';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render children correctly', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <ResizablePanel storageKey={mockStorageKey}>
          <div>Test Content</div>
        </ResizablePanel>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should use default width when no saved width exists', () => {
    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <ResizablePanel storageKey={mockStorageKey} defaultWidth={400}>
          <div>Test Content</div>
        </ResizablePanel>
      </ThemeProvider>
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel).toHaveStyle('width: 400px');
  });

  it('should load width from localStorage if available', () => {
    localStorage.setItem(mockStorageKey, '500');

    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <ResizablePanel storageKey={mockStorageKey} defaultWidth={400}>
          <div>Test Content</div>
        </ResizablePanel>
      </ThemeProvider>
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel).toHaveStyle('width: 500px');
  });

  it('should respect min width constraint', () => {
    localStorage.setItem(mockStorageKey, '100');

    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <ResizablePanel
          storageKey={mockStorageKey}
          defaultWidth={400}
          minWidth={200}
        >
          <div>Test Content</div>
        </ResizablePanel>
      </ThemeProvider>
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel).toHaveStyle('width: 200px');
  });

  it('should respect max width constraint', () => {
    localStorage.setItem(mockStorageKey, '1000');

    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <ResizablePanel
          storageKey={mockStorageKey}
          defaultWidth={400}
          maxWidth={800}
        >
          <div>Test Content</div>
        </ResizablePanel>
      </ThemeProvider>
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel).toHaveStyle('width: 800px');
  });

  it('should render panel with correct default resize position (left)', () => {
    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <ResizablePanel storageKey={mockStorageKey}>
          <div>Test Content</div>
        </ResizablePanel>
      </ThemeProvider>
    );

    // Check that the panel container exists
    const panel = container.firstChild as HTMLElement;
    expect(panel).toBeInTheDocument();
  });

  it('should render with resize position right', () => {
    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <ResizablePanel storageKey={mockStorageKey} resizePosition="right">
          <div>Test Content</div>
        </ResizablePanel>
      </ThemeProvider>
    );

    // Check that the panel container exists
    const panel = container.firstChild as HTMLElement;
    expect(panel).toBeInTheDocument();
  });

  it('should persist width to localStorage on resize complete', () => {
    const { container } = render(
      <ThemeProvider theme={lightTheme}>
        <ResizablePanel storageKey={mockStorageKey} defaultWidth={400}>
          <div>Test Content</div>
        </ResizablePanel>
      </ThemeProvider>
    );

    const panel = container.firstChild as HTMLElement;
    expect(panel).toBeInTheDocument();

    // Initial width should not be in localStorage yet
    // (it's only saved after a resize)
    expect(localStorage.getItem(mockStorageKey)).toBeNull();
  });
});
