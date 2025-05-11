import React, { useRef, useEffect } from 'react';
import { InputContainer, MessageInput, SendButton } from './ChatInput.styles';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
                                               inputValue,
                                               setInputValue,
                                               onSendMessage,
                                               isLoading
                                             }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '22px';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // prevent inserting a new line in the textarea
      onSendMessage();
    }
  };

  return (
      <InputContainer>
        <MessageInput
            id="chat-message-input"
            ref={textareaRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Ask any question..."
        />
        <SendButton
            onClick={onSendMessage}
            disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </SendButton>
      </InputContainer>
  );
};

export default ChatInput;
