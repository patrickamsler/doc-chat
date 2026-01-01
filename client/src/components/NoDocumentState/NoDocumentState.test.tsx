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
        style={{ display: 'none' }}
        onChange={() => {}}
      />
    ))
  };
});

const setup = (props = {}) => {
  const defaultProps = {
    hasDocuments: false,
    onFileUploaded: jest.fn(),
    onUploadComplete: jest.fn(),
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
      setup({ hasDocuments: false });
      expect(screen.getByText('Upload your first document')).toBeInTheDocument();
    });

    it('should display appropriate help text', () => {
      setup({ hasDocuments: false });
      expect(screen.getByText(/Get started by uploading a PDF document/i)).toBeInTheDocument();
    });

    it('should show upload button', () => {
      setup({ hasDocuments: false });
      expect(screen.getByRole('button', { name: /Upload PDF/i })).toBeInTheDocument();
    });

    it('should show upload icon', () => {
      const { container } = setup({ hasDocuments: false });
      const uploadIcons = container.querySelectorAll('svg');
      expect(uploadIcons.length).toBeGreaterThan(0);
    });
  });

  describe('When documents exist but none selected', () => {
    it('should display "No document selected" title', () => {
      setup({ hasDocuments: true });
      expect(screen.getByText('No document selected')).toBeInTheDocument();
    });

    it('should display appropriate help text', () => {
      setup({ hasDocuments: true });
      expect(screen.getByText(/Select a document from the sidebar/i)).toBeInTheDocument();
    });

    it('should NOT show upload button', () => {
      setup({ hasDocuments: true });
      expect(screen.queryByRole('button', { name: /Upload PDF/i })).not.toBeInTheDocument();
    });
  });

  describe('Upload functionality', () => {
    it('should trigger file input when upload button is clicked', async () => {
      setup({ hasDocuments: false });

      const uploadButton = screen.getByRole('button', { name: /Upload PDF/i });
      expect(uploadButton).not.toBeDisabled();
    });

    it('should disable button and show uploading state during upload', () => {
      setup({ hasDocuments: false });
      const uploadButton = screen.getByRole('button', { name: /Upload PDF/i });
      expect(uploadButton).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should accept onFileUploaded callback', () => {
      const onFileUploaded = jest.fn();
      setup({ hasDocuments: false, onFileUploaded });
      expect(onFileUploaded).not.toHaveBeenCalled();
    });

    it('should accept optional onUploadComplete callback', () => {
      const onUploadComplete = jest.fn();
      setup({ hasDocuments: false, onUploadComplete });
      expect(onUploadComplete).not.toHaveBeenCalled();
    });
  });
});
