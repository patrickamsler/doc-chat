import React from 'react';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import ChatInput from './ChatInput';
import { ThemeProvider } from 'styled-components';
import { theme } from "../../../theme";

describe('ChatInput', () => {
  const setup = (propsOverride = {}) => {
    const props = {
      inputValue: '',
      setInputValue: jest.fn(),
      onSendMessage: jest.fn(),
      isLoading: false,
      ...propsOverride,
    };
    render(
      <ThemeProvider theme={theme}>
        <ChatInput {...props} />
      </ThemeProvider>
    );
    return props;
  };

  afterEach(() => {
    cleanup();
  });

  it('renders input and send button', () => {
    setup();
    expect(screen.getByPlaceholderText(/ask any question/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('calls setInputValue on input change', () => {
    const setInputValue = jest.fn();
    setup({ setInputValue });
    fireEvent.change(screen.getByPlaceholderText(/ask any question/i), {
      target: { value: 'Hello' },
    });
    expect(setInputValue).toHaveBeenCalledWith('Hello');
  });

  it('calls onSendMessage on send button click', () => {
    const onSendMessage = jest.fn();
    setup({ inputValue: 'Hi', onSendMessage });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(onSendMessage).toHaveBeenCalled();
  });

  it('disables send button when loading or input is empty', () => {
    setup({ inputValue: '', isLoading: false });
    expect(screen.getAllByRole('button', { name: /send/i })[0]).toBeDisabled();
    cleanup();

    setup({ inputValue: '   ', isLoading: false });
    expect(screen.getAllByRole('button', { name: /send/i })[0]).toBeDisabled();
    cleanup();

    setup({ inputValue: 'Hello', isLoading: true });
    expect(screen.getAllByRole('button', { name: /send/i })[0]).toBeDisabled();
    cleanup();
  });

  it('calls onSendMessage on Enter key (without shift)', () => {
    const onSendMessage = jest.fn();
    setup({ inputValue: 'Hello', onSendMessage });
    const textarea = screen.getByPlaceholderText(/ask any question/i);
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });
    expect(onSendMessage).toHaveBeenCalled();
  });

  it('does not call onSendMessage on Shift+Enter', () => {
    const onSendMessage = jest.fn();
    setup({ inputValue: 'Hello', onSendMessage });
    const textarea = screen.getByPlaceholderText(/ask any question/i);
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(onSendMessage).not.toHaveBeenCalled();
  });
});
