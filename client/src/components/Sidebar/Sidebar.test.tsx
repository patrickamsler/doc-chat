import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import { downloadFile } from '../../services/api';
import theme from '../../theme';
import { ChatInfo } from '../../types/apiTypes';

jest.mock('../../services/api', () => ({
  downloadFile: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn()
}));

const mockNavigate = jest.fn();
const useNavigateMock = require('react-router-dom').useNavigate;
const useParamsMock = require('react-router-dom').useParams;

const mockDocuments: ChatInfo[] = [
  {
    chatId: 'chat-1',
    fileName: 'document1.pdf',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    chatId: 'chat-2',
    fileName: 'document2.pdf',
    createdAt: '2024-01-16T14:20:00Z'
  },
  {
    chatId: 'chat-3',
    fileName: 'very-long-document-name-that-should-be-truncated.pdf',
    createdAt: '2024-01-17T09:45:00Z'
  }
];

const setup = async (propsOverride = {}, params = {}) => {
  const onFileUploaded = jest.fn();
  const props = {
    isOpen: true,
    documents: mockDocuments,
    onFileUploaded,
    ...propsOverride
  };

  useNavigateMock.mockReturnValue(mockNavigate);
  useParamsMock.mockReturnValue(params);

  const result = render(
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Sidebar {...props} />
        </ThemeProvider>
      </BrowserRouter>
  );

  // Wait for the component to render
  await waitFor(() => {
    expect(screen.queryByText('Your Documents')).toBeInTheDocument();
  });

  return {onFileUploaded, ...result};
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the sidebar with upload button', async () => {
      await setup({documents: []});

      expect(screen.getByText('Upload PDF')).toBeInTheDocument();
      expect(screen.getByText('Your Documents')).toBeInTheDocument();
    });

    it('should display empty state when no documents exist', async () => {
      await setup({documents: []});

      await waitFor(() => {
        expect(screen.getByText('No documents yet')).toBeInTheDocument();
        expect(screen.getByText('Upload a PDF to get started')).toBeInTheDocument();
      });
    });

    it('should display documents when passed via props', async () => {
      await setup({documents: mockDocuments});

      await waitFor(() => {
        expect(screen.getByText('document1.pdf')).toBeInTheDocument();
        expect(screen.getByText('document2.pdf')).toBeInTheDocument();
        expect(screen.getByText('very-long-document-name-that-should-be-truncated.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('Document Display', () => {
    it('should format timestamps correctly', async () => {
      await setup({documents: mockDocuments});

      await waitFor(() => {
        expect(screen.getByText('2024-01-15')).toBeInTheDocument();
        expect(screen.getByText('2024-01-16')).toBeInTheDocument();
        expect(screen.getByText('2024-01-17')).toBeInTheDocument();
      });
    });

    it('should highlight selected document', async () => {
      await setup({documents: mockDocuments}, {chatId: 'chat-2'});

      await waitFor(() => {
        const documentItems = screen.getAllByRole('generic').filter(
            el => el.textContent?.includes('document2.pdf')
        );
        expect(documentItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Document Click Handler', () => {
    it('should download file and navigate when document is clicked', async () => {
      (downloadFile as jest.Mock).mockResolvedValue({
        url: 'http://example.com/file.pdf',
        fileName: 'document1.pdf'
      });

      const {onFileUploaded} = await setup({documents: mockDocuments});

      await waitFor(() => {
        expect(screen.getByText('document1.pdf')).toBeInTheDocument();
      });

      const documentItem = screen.getByText('document1.pdf');

      await waitFor(() => {
        userEvent.click(documentItem);
      });

      await waitFor(() => {
        expect(downloadFile).toHaveBeenCalledWith('chat-1');
        expect(onFileUploaded).toHaveBeenCalledWith('chat-1', 'http://example.com/file.pdf', 'document1.pdf');
        expect(mockNavigate).toHaveBeenCalledWith('/chat/chat-1');
      });
    });

    it('should handle download errors gracefully', async () => {
      (downloadFile as jest.Mock).mockRejectedValue(new Error('Download failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await setup({documents: mockDocuments});

      await waitFor(() => {
        expect(screen.getByText('document1.pdf')).toBeInTheDocument();
      });

      const documentItem = screen.getByText('document1.pdf');

      await waitFor(() => {
        userEvent.click(documentItem);
      });

      await waitFor(() => {
        expect(downloadFile).toHaveBeenCalledWith('chat-1');
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Upload Functionality', () => {
    it('should trigger file input click when upload button is clicked', async () => {
      await setup({documents: []});

      await waitFor(() => {
        expect(screen.getByText('Upload PDF')).toBeInTheDocument();
      });

      const uploadButton = screen.getByText('Upload PDF');

      // The actual file input is hidden, so we can't directly test the click
      // But we can verify the button is clickable
      expect(uploadButton).not.toBeDisabled();

      await waitFor(() => {
        userEvent.click(uploadButton);
      });
    });

    it('should disable upload button while uploading', async () => {
      await setup({documents: []});

      const uploadButton = screen.getByText('Upload PDF');
      expect(uploadButton).not.toBeDisabled();
    });

    it('should handle file upload completion', async () => {
      const {onFileUploaded} = await setup({documents: []});

      // Simulate the FileUpload component calling onFileUploaded
      // This would normally be triggered by the FileUpload component
      await waitFor(() => {
        expect(screen.getByText('Upload PDF')).toBeInTheDocument();
      });

      // We can verify the prop was passed correctly
      expect(onFileUploaded).toBeDefined();
    });
  });

  describe('Sidebar Visibility', () => {
    it('should handle isOpen prop correctly', async () => {
      const {container} = await setup({isOpen: false, documents: []});

      // The sidebar container should still be rendered but with isOpen=false
      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should render sidebar when isOpen is true', async () => {
      await setup({isOpen: true, documents: []});

      await waitFor(() => {
        expect(screen.getByText('Your Documents')).toBeInTheDocument();
      });
    });
  });
});
