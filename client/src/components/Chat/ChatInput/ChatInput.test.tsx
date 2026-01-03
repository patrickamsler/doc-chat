import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ChatInput from './ChatInput';
import { ThemeProvider } from 'styled-components';
import theme from "../../../theme";

describe('ChatInput', () => {
  const setup = (propsOverride = {}) => {
    const props = {
      onSendMessage: jest.fn(),
      isLoading: false,
      isDisabled: false,
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
    const textbox = screen.getByRole('textbox');
    expect(textbox).toBeInTheDocument();
    expect(textbox).toHaveAttribute('placeholder', 'Ask any question...');
    expect(screen.getByRole('button', {name: /send/i})).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    setup();
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, {target: {value: 'Hello'}});
    expect((textbox as HTMLTextAreaElement).value).toBe('Hello');
  });

  it('calls onSendMessage with input value on send button click', () => {
    const onSendMessage = jest.fn();
    setup({onSendMessage});
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, {target: {value: 'Hi'}});
    fireEvent.click(screen.getByRole('button', {name: /send/i}));
    expect(onSendMessage).toHaveBeenCalledWith('Hi');
  });

  it('disables send button when loading or input is empty', () => {
    setup({isLoading: false});
    expect(screen.getAllByRole('button', {name: /send/i})[0]).toBeDisabled();
    cleanup();

    setup({isLoading: false});
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, {target: {value: '   '}});
    expect(screen.getAllByRole('button', {name: /send/i})[0]).toBeDisabled();
    cleanup();

    setup({isLoading: true});
    const textbox2 = screen.getByRole('textbox');
    fireEvent.change(textbox2, {target: {value: 'Hello'}});
    expect(screen.getAllByRole('button', {name: /send/i})[0]).toBeDisabled();
    cleanup();
  });

  it('calls onSendMessage with input value on Enter key (without shift)', () => {
    const onSendMessage = jest.fn();
    setup({onSendMessage});
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {target: {value: 'Hello'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter', shiftKey: false});
    expect(onSendMessage).toHaveBeenCalledWith('Hello');
  });

  it('does not call onSendMessage on Shift+Enter', () => {
    const onSendMessage = jest.fn();
    setup({onSendMessage});
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {target: {value: 'Hello'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter', shiftKey: true});
    expect(onSendMessage).not.toHaveBeenCalled();
  });
});
