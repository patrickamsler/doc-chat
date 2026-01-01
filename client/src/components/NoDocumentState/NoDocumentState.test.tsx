import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import NoDocumentState from './NoDocumentState';
import theme from '../../theme';

// Mock the FileUpload component to avoid axios import issues
jest.mock('../FileUpload/FileUpload', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => (
        <input
            type="file"
            ref={ref}
            data-testid="file-upload"
            style={{display: 'none'}}
            onChange={() => {
            }}
        />
    ))
  };
});

const setup = (props = {}) => {
  const defaultProps = {
    hasDocuments: false,
    isUploading: false,
    onFileUploadClick: jest.fn(),
    ...props
  };

  return {
    ...render(
        <ThemeProvider theme={theme}>
          <NoDocumentState {...defaultProps} />
        </ThemeProvider>
    ),
    ...defaultProps
  };
};

describe('NoDocumentState', () => {
  describe('When no documents exist', () => {
    it('should display "Upload your first document" title', () => {
      setup({hasDocuments: false});
      expect(screen.getByText('Upload your first document')).toBeInTheDocument();
    });

    it('should display appropriate help text', () => {
      setup({hasDocuments: false});
      expect(screen.getByText(/Get started by uploading a PDF document/i)).toBeInTheDocument();
    });

    it('should show upload button', () => {
      setup({hasDocuments: false});
      expect(screen.getByRole('button', {name: /Upload PDF/i})).toBeInTheDocument();
    });

    it('should show upload icon', () => {
      const {container} = setup({hasDocuments: false});
      const uploadIcons = container.querySelectorAll('svg');
      expect(uploadIcons.length).toBeGreaterThan(0);
    });
  });

  describe('When documents exist but none selected', () => {
    it('should display "No document selected" title', () => {
      setup({hasDocuments: true});
      expect(screen.getByText('No document selected')).toBeInTheDocument();
    });

    it('should display appropriate help text', () => {
      setup({hasDocuments: true});
      expect(screen.getByText(/Select a document from the sidebar/i)).toBeInTheDocument();
    });

    it('should show upload button', () => {
      setup({hasDocuments: true});
      expect(screen.getByRole('button', {name: /Upload PDF/i})).toBeInTheDocument();
    });
  });

  describe('Upload functionality', () => {
    it('should show enabled upload button when not uploading', () => {
      setup({hasDocuments: false, isUploading: false});
      const uploadButton = screen.getByRole('button', {name: /Upload PDF/i});
      expect(uploadButton).not.toBeDisabled();
      expect(uploadButton).toHaveTextContent('Upload PDF');
    });

    it('should disable button and show uploading state during upload', () => {
      setup({hasDocuments: false, isUploading: true});
      const uploadButton = screen.getByRole('button', {name: /Uploading.../i});
      expect(uploadButton).toBeDisabled();
      expect(uploadButton).toHaveTextContent('Uploading...');
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner when isLoadingDocuments is true', () => {
      setup({hasDocuments: false, isLoadingDocuments: true});
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should NOT show upload button when loading', () => {
      setup({hasDocuments: false, isLoadingDocuments: true});
      expect(screen.queryByRole('button', {name: /Upload PDF/i})).not.toBeInTheDocument();
    });

    it('should NOT show help text when loading', () => {
      setup({hasDocuments: false, isLoadingDocuments: true});
      expect(screen.queryByText(/Get started by uploading/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Select a document from the sidebar/i)).not.toBeInTheDocument();
    });

    it('should show loading icon when loading', () => {
      const {container} = setup({hasDocuments: false, isLoadingDocuments: true});
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should show normal state after loading completes', () => {
      const {rerender} = setup({hasDocuments: false, isLoadingDocuments: true});
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <NoDocumentState
            hasDocuments={false}
            isLoadingDocuments={false}
            isUploading={false}
            onFileUploadClick={jest.fn()}
          />
        </ThemeProvider>
      );

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('Upload your first document')).toBeInTheDocument();
    });

    it('should transition from loading to "No document selected" when documents exist', () => {
      const {rerender} = setup({hasDocuments: false, isLoadingDocuments: true});
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <NoDocumentState
            hasDocuments={true}
            isLoadingDocuments={false}
            isUploading={false}
            onFileUploadClick={jest.fn()}
          />
        </ThemeProvider>
      );

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByText('No document selected')).toBeInTheDocument();
    });
  });
});
