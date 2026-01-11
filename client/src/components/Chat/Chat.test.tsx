import React from 'react';
import { screen, waitFor, renderWithProviders } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import Chat from './Chat';
import { deleteChatHistory, getChatHistory, sendMessage } from '../../services/api';

jest.mock('../../services/api', () => ({
  sendMessage: jest.fn(),
  getChatHistory: jest.fn(),
  deleteChatHistory: jest.fn(),
}));

const setup = (chatId = 'chat1', propsOverride = {}) => {
  const onBadgeClick = jest.fn();
  const props = {chatId, onBadgeClick, ...propsOverride};
  renderWithProviders(<Chat {...props} />);
  return {onBadgeClick};
};


describe('Chat component', () => {
  beforeAll(() => {
    // jsdom does not implement scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    (sendMessage as jest.Mock).mockReset();
    (getChatHistory as jest.Mock).mockReset();
    (deleteChatHistory as jest.Mock).mockReset();
  });

  it('sends a message and displays the response', async () => {
    (getChatHistory as jest.Mock).mockResolvedValueOnce({history: []});
    (sendMessage as jest.Mock).mockResolvedValueOnce({answer: 'Hi there'});
    setup();

    const textbox = screen.getByRole('textbox');
    userEvent.type(textbox, 'Hello');

    await waitFor(() => {
      expect(textbox).toHaveValue('Hello');
    });

    userEvent.click(screen.getByRole('button'));

    // Wait for the mutation to fire
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('chat1', 'Hello');
    });

    // user message should appear immediately
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    // response should appear after API call completes
    await waitFor(() => {
      expect(screen.getByText('Hi there')).toBeInTheDocument();
    });
  });

  it('calls onBadgeClick when a page reference badge is clicked', async () => {
    (getChatHistory as jest.Mock).mockResolvedValueOnce({history: []});
    (sendMessage as jest.Mock).mockResolvedValueOnce({
      answer: 'See <<chunk_42>>',
      documents: [{id: 'chunk_42', page: 13, content: 'test document'}],
    });
    const {onBadgeClick} = setup('chat1');

    const textbox = screen.getByRole('textbox');
    userEvent.type(textbox, 'Hello');

    await waitFor(() => {
      expect(textbox).toHaveValue('Hello');
    });

    userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('[14]')).toBeInTheDocument();
    });
    userEvent.click(screen.getByText('[14]')); // badge text is '[14]' because it is 1-based index
    expect(onBadgeClick).toHaveBeenCalledWith(13, 'test document'); // 0-based index in the function
  });

  it('loads and displays chat history correctly', async () => {
    const mockHistory = {
      history: [
        {
          timestamp: '2025-01-01T10:00:00Z',
          content: 'What is this document about?',
          documents: [],
          role: 'user',
        },
        {
          timestamp: '2025-01-01T10:00:05Z',
          content: 'This document is about testing. See <<chunk_1>>',
          documents: [{id: 'chunk_1', page: 5, content: 'testing content'}],
          role: 'assistant',
        },
        {
          timestamp: '2025-01-01T10:00:10Z',
          content: 'Can you tell me more?',
          documents: [],
          role: 'user',
        },
      ],
    };

    (getChatHistory as jest.Mock).mockResolvedValueOnce(mockHistory);
    setup('chat1');

    expect(getChatHistory).toHaveBeenCalledWith('chat1');

    await waitFor(() => {
      expect(screen.getByText('What is this document about?')).toBeInTheDocument();
    });

    expect(screen.getByText('Can you tell me more?')).toBeInTheDocument();
    expect(screen.getByText(/This document is about testing\./)).toBeInTheDocument();
    expect(screen.getByText('[6]')).toBeInTheDocument(); // page badge (5 + 1 for 1-based index)
  });

  it('clears chat history when trash icon is clicked', async () => {
    const mockHistory = {
      history: [
        {
          timestamp: '2025-01-01T10:00:00Z',
          content: 'Test message',
          documents: [],
          role: 'user',
        },
        {
          timestamp: '2025-01-01T10:00:05Z',
          content: 'Test response',
          documents: [],
          role: 'assistant',
        },
      ],
    };

    (getChatHistory as jest.Mock).mockResolvedValueOnce(mockHistory);
    (deleteChatHistory as jest.Mock).mockResolvedValueOnce(undefined);
    setup('chat1');

    // Wait for history to load
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    expect(screen.getByText('Test response')).toBeInTheDocument();

    // Find and click the trash icon button
    const trashButton = screen.getByTestId('clear-history-button');
    userEvent.click(trashButton);

    // Verify deleteChatHistory was called with correct chatId
    await waitFor(() => {
      expect(deleteChatHistory).toHaveBeenCalledWith('chat1');
    });

    // Verify messages are cleared from the UI
    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      expect(screen.queryByText('Test response')).not.toBeInTheDocument();
    });
  });
});

