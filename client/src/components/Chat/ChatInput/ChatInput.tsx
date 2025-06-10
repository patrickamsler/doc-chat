import React, { useRef, useEffect, useState } from 'react';
import { InputContainer, MessageInput, SendButton } from './ChatInput.styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ChatInputProps {
  onSendMessage: (input: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaHeight, setTextareaHeight] = useState(22); // initial height

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '22px';
      textarea.style.height = `${textarea.scrollHeight}px`;
      // Use offsetHeight to match the rendered height (including when scrollbar is visible)
      setTextareaHeight(textarea.offsetHeight);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const handleSend = () => {
    if (isLoading) return;
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isLoading) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
        onClick={handleSend}
        disabled={isLoading || !inputValue.trim()}
        aria-label={isLoading ? "Sending..." : "Send"}
        $height={textareaHeight}
      >
        {isLoading ? (
          <FontAwesomeIcon icon={faSpinner} spin />
        ) : (
          <FontAwesomeIcon icon={faPaperPlane} />
        )}
      </SendButton>
    </InputContainer>
  );
};

export default ChatInput;

