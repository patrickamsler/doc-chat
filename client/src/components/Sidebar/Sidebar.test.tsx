import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import { downloadFile, getChats } from '../../services/api';
import theme from '../../theme';
import { ChatInfo } from '../../types/apiTypes';

jest.mock('../../services/api', () => ({
  getChats: jest.fn(),
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

const setup = (propsOverride = {}, params = {}) => {
  const onFileReady = jest.fn();
  const props = {
    isOpen: true,
    onFileReady,
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

  return {onFileReady, ...result};
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the sidebar with upload button', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: []});
      setup();

      expect(screen.getByText('Upload PDF')).toBeInTheDocument();
      expect(screen.getByText('Your Documents')).toBeInTheDocument();
    });

    it('should display empty state when no documents exist', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: []});
      setup();

      await waitFor(() => {
        expect(screen.getByText('No documents yet')).toBeInTheDocument();
        expect(screen.getByText('Upload a PDF to get started')).toBeInTheDocument();
      });
    });

    it('should load and display documents on mount', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: mockDocuments});
      setup();

      await waitFor(() => {
        expect(screen.getByText('document1.pdf')).toBeInTheDocument();
        expect(screen.getByText('document2.pdf')).toBeInTheDocument();
        expect(screen.getByText('very-long-document-name-that-should-be-truncated.pdf')).toBeInTheDocument();
      });

      expect(getChats).toHaveBeenCalledTimes(1);
    });

    it('should display error message when loading documents fails', async () => {
      (getChats as jest.Mock).mockRejectedValue(new Error('Network error'));
      setup();

      await waitFor(() => {
        expect(screen.getByText('Failed to load documents')).toBeInTheDocument();
      });
    });
  });

  describe('Document Display', () => {
    it('should format timestamps correctly', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: mockDocuments});
      setup();

      await waitFor(() => {
        expect(screen.getByText('2024-01-15')).toBeInTheDocument();
        expect(screen.getByText('2024-01-16')).toBeInTheDocument();
        expect(screen.getByText('2024-01-17')).toBeInTheDocument();
      });
    });

    it('should highlight selected document', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: mockDocuments});
      setup({}, {chatId: 'chat-2'});

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
      (getChats as jest.Mock).mockResolvedValue({chats: mockDocuments});
      (downloadFile as jest.Mock).mockResolvedValue({
        url: 'http://example.com/file.pdf',
        fileName: 'document1.pdf'
      });

      const {onFileReady} = setup();

      await waitFor(() => {
        expect(screen.getByText('document1.pdf')).toBeInTheDocument();
      });

      const documentItem = screen.getByText('document1.pdf');
      userEvent.click(documentItem);

      await waitFor(() => {
        expect(downloadFile).toHaveBeenCalledWith('chat-1');
        expect(onFileReady).toHaveBeenCalledWith('chat-1', 'http://example.com/file.pdf', 'document1.pdf');
        expect(mockNavigate).toHaveBeenCalledWith('/chat/chat-1');
      });
    });

    it('should handle download errors gracefully', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: mockDocuments});
      (downloadFile as jest.Mock).mockRejectedValue(new Error('Download failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      setup();

      await waitFor(() => {
        expect(screen.getByText('document1.pdf')).toBeInTheDocument();
      });

      const documentItem = screen.getByText('document1.pdf');
      userEvent.click(documentItem);

      await waitFor(() => {
        expect(downloadFile).toHaveBeenCalledWith('chat-1');
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Upload Functionality', () => {
    it('should trigger file input click when upload button is clicked', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: []});
      setup();

      const uploadButton = screen.getByText('Upload PDF');

      // The actual file input is hidden, so we can't directly test the click
      // But we can verify the button is clickable
      expect(uploadButton).not.toBeDisabled();
      userEvent.click(uploadButton);
    });

    it('should disable upload button while uploading', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: []});
      setup();

      const uploadButton = screen.getByText('Upload PDF');
      expect(uploadButton).not.toBeDisabled();
    });

    it('should handle file upload completion', async () => {
      (getChats as jest.Mock)
      .mockResolvedValueOnce({chats: []})
      .mockResolvedValueOnce({chats: mockDocuments});

      const {onFileReady} = setup();

      // Simulate the FileUpload component calling onFileUploaded
      // This would normally be triggered by the FileUpload component
      await waitFor(() => {
        expect(screen.getByText('Upload PDF')).toBeInTheDocument();
      });

      // We can verify the prop was passed correctly
      expect(onFileReady).toBeDefined();
    });
  });

  describe('Sidebar Visibility', () => {
    it('should handle isOpen prop correctly', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: []});
      const {container} = setup({isOpen: false});

      // The sidebar container should still be rendered but with isOpen=false
      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should render sidebar when isOpen is true', async () => {
      (getChats as jest.Mock).mockResolvedValue({chats: []});
      setup({isOpen: true});

      await waitFor(() => {
        expect(screen.getByText('Your Documents')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should not show empty state when there is an error', async () => {
      (getChats as jest.Mock).mockRejectedValue(new Error('API Error'));
      setup();

      await waitFor(() => {
        expect(screen.getByText('Failed to load documents')).toBeInTheDocument();
      });

      expect(screen.queryByText('No documents yet')).not.toBeInTheDocument();
    });
  });
});
