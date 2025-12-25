import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from './Chat';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../theme/index';
import { getChatHistory, sendMessage } from '../../services/api';

jest.mock('../../services/api', () => ({
  sendMessage: jest.fn(),
  getChatHistory: jest.fn(),
}));

const setup = (chatId = 'chat1', propsOverride = {}) => {
  const onBadgeClick = jest.fn();
  const props = {chatId, onBadgeClick, ...propsOverride};
  render(
      <ThemeProvider theme={theme}>
        <Chat {...props} />
      </ThemeProvider>
  );
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
  });

  it('sends a message and displays the response', async () => {
    (getChatHistory as jest.Mock).mockResolvedValueOnce({history: []});
    (sendMessage as jest.Mock).mockResolvedValueOnce({answer: 'Hi there'});
    setup();

    const textbox = screen.getByRole('textbox');
    userEvent.type(textbox, 'Hello');
    userEvent.click(screen.getByRole('button'));

    expect(sendMessage).toHaveBeenCalledWith('chat1', 'Hello');
    // user message should appear immediately
    expect(screen.getByText('Hello')).toBeInTheDocument();

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
});

