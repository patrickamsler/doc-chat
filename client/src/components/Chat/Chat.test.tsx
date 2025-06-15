import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from './Chat';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../theme';
import { sendMessage } from '../../services/api';

jest.mock('../../services/api', () => ({
  sendMessage: jest.fn(),
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
  });

  it('sends a message and displays the response', async () => {
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
    (sendMessage as jest.Mock).mockResolvedValueOnce({
      answer: 'See <<doc_42>>',
      documents: [{id: 'doc_42', page: 13, content: 'test document'}],
    });
    const {onBadgeClick} = setup('chat1');

    const textbox = screen.getByRole('textbox');
    userEvent.type(textbox, 'Hello');
    userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('14')).toBeInTheDocument();
    });
    userEvent.click(screen.getByText('14')); // badge text is '43' because it is 1-based index
    expect(onBadgeClick).toHaveBeenCalledWith(13); // 0-based index in the function
  });
});

