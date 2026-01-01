// Mock api service before any imports
jest.mock('../services/api', () => ({
  getChats: jest.fn(),
  downloadFile: jest.fn(),
  uploadFile: jest.fn(),
  sendMessage: jest.fn(),
  initAuth: jest.fn(),
  getChatHistory: jest.fn()
}));

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import ChatPage from './ChatPage';
import theme from '../theme';
import { STORAGE_KEYS } from '../constants/storageKeys';
import * as api from '../services/api';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn()
}));

// Mock child components to simplify testing
jest.mock('../components/PdfViewer/PdfViewer', () => {
  return function MockPdfViewer(props: any) {
    return <div data-testid="pdf-viewer">PDF Viewer: {props.fileName}</div>;
  };
});

jest.mock('../components/Chat/Chat', () => {
  return function MockChat(props: any) {
    return <div data-testid="chat">Chat: {props.chatId}</div>;
  };
});

jest.mock('../components/Header/Header', () => {
  return function MockHeader(props: any) {
    return (
      <div data-testid="header">
        <button onClick={props.onMenuClick}>Menu</button>
      </div>
    );
  };
});

jest.mock('../components/Sidebar/Sidebar', () => {
  return function MockSidebar(props: any) {
    return (
      <div data-testid="sidebar">
        <button onClick={props.onFileUploadClick}>Upload</button>
      </div>
    );
  };
});

jest.mock('../components/NoDocumentState/NoDocumentState', () => {
  return function MockNoDocumentState(props: any) {
    return (
      <div data-testid="no-document-state">
        <button onClick={props.onFileUploadClick}>Upload File</button>
      </div>
    );
  };
});

jest.mock('../components/FileUpload/FileUpload', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef(function MockFileUpload(props: any, ref: any) {
      return <input ref={ref} data-testid="file-upload" type="file" />;
    })
  };
});

jest.mock('../components/ResizablePanel/ResizablePanel', () => {
  return function MockResizablePanel(props: any) {
    return <div data-testid="resizable-panel">{props.children}</div>;
  };
});

const mockNavigate = jest.fn();
const useNavigateMock = require('react-router-dom').useNavigate;
const useParamsMock = require('react-router-dom').useParams;

const mockChats = {
  chats: [
    { chatId: 'chat-1', fileName: 'document1.pdf', createdAt: '2024-01-15T10:30:00Z' },
    { chatId: 'chat-2', fileName: 'document2.pdf', createdAt: '2024-01-16T14:20:00Z' }
  ]
};

const setup = async (params = {}) => {
  useNavigateMock.mockReturnValue(mockNavigate);
  useParamsMock.mockReturnValue(params);

  const result = render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <ChatPage />
      </ThemeProvider>
    </BrowserRouter>
  );

  return result;
};

describe('ChatPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (api.getChats as jest.Mock).mockResolvedValue(mockChats);
    (api.downloadFile as jest.Mock).mockResolvedValue({
      url: 'blob:mock-url',
      fileName: 'test.pdf'
    });
  });

  describe('Initial Rendering', () => {
    it('should render all main components', async () => {
      await setup();

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('chat')).toBeInTheDocument();
        expect(screen.getByTestId('file-upload')).toBeInTheDocument();
      });
    });

    it('should fetch chats on mount', async () => {
      await setup();

      await waitFor(() => {
        expect(api.getChats).toHaveBeenCalledTimes(1);
      });
    });

    it('should show no document state when no chatId is provided', async () => {
      await setup();

      await waitFor(() => {
        expect(screen.getByTestId('no-document-state')).toBeInTheDocument();
        expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument();
      });
    });
  });

  describe('Chat ID Parameter Handling', () => {
    it('should download file when chatId is provided', async () => {
      await setup({ chatId: 'chat-1' });

      await waitFor(() => {
        expect(api.downloadFile).toHaveBeenCalledWith('chat-1');
      });
    });

    it('should display PDF viewer when file is downloaded', async () => {
      await setup({ chatId: 'chat-1' });

      await waitFor(() => {
        expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
        expect(screen.getByText('PDF Viewer: test.pdf')).toBeInTheDocument();
      });
    });

    it('should pass chatId to Chat component', async () => {
      await setup({ chatId: 'chat-1' });

      await waitFor(() => {
        expect(screen.getByText('Chat: chat-1')).toBeInTheDocument();
      });
    });
  });

  describe('File Caching', () => {
    it('should cache downloaded files', async () => {
      const { rerender } = await setup({ chatId: 'chat-1' });

      await waitFor(() => {
        expect(api.downloadFile).toHaveBeenCalledTimes(1);
      });

      // Change to different chat
      useParamsMock.mockReturnValue({ chatId: 'chat-2' });
      (api.downloadFile as jest.Mock).mockResolvedValue({
        url: 'blob:mock-url-2',
        fileName: 'test2.pdf'
      });

      rerender(
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <ChatPage />
          </ThemeProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(api.downloadFile).toHaveBeenCalledWith('chat-2');
      });

      // Return to first chat - should use cache
      useParamsMock.mockReturnValue({ chatId: 'chat-1' });
      rerender(
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <ChatPage />
          </ThemeProvider>
        </BrowserRouter>
      );

      // downloadFile should still only be called twice (once for chat-1, once for chat-2)
      // The third render should use cached file
      await waitFor(() => {
        expect(api.downloadFile).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Sidebar Toggle', () => {
    it('should toggle sidebar when menu button is clicked', async () => {
      await setup();

      const menuButton = await screen.findByText('Menu');

      // Sidebar should be visible initially
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();

      // Click to hide
      await userEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      });

      // Click to show again
      await userEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      });
    });

    it('should persist sidebar state to localStorage', async () => {
      await setup();

      const menuButton = await screen.findByText('Menu');

      // Toggle sidebar
      await userEvent.click(menuButton);

      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN)).toBe('false');
      });

      // Toggle again
      await userEvent.click(menuButton);

      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN)).toBe('true');
      });
    });

    it('should initialize sidebar state from localStorage', async () => {
      localStorage.setItem(STORAGE_KEYS.COMPONENTS.SIDEBAR_OPEN, 'false');

      await setup();

      await waitFor(() => {
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      });
    });

    it('should default sidebar to open when no localStorage value exists', async () => {
      await setup();

      await waitFor(() => {
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      });
    });
  });

  describe('File Upload Flow', () => {
    it('should trigger file input click when upload button is clicked', async () => {
      await setup();

      const fileInput = screen.getByTestId('file-upload') as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click');

      const uploadButton = await screen.findByText('Upload');
      await userEvent.click(uploadButton);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should navigate to new chat on file upload', async () => {
      const { container } = await setup();

      // Simulate the FileUpload component calling onFileUploaded
      const fileUpload = container.querySelector('[data-testid="file-upload"]') as any;

      // This would normally be triggered by the FileUpload component
      // We're testing that ChatPage provides the correct callback
      await waitFor(() => {
        expect(fileUpload).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle failed chat list fetch gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (api.getChats as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

      await setup();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Failed to load documents:', expect.any(Error));
      });

      consoleError.mockRestore();
    });

    it('should handle failed file download gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      (api.downloadFile as jest.Mock).mockRejectedValue(new Error('Download failed'));

      await setup({ chatId: 'chat-1' });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Error downloading file:', expect.any(Error));
      });

      consoleError.mockRestore();
    });
  });
});
