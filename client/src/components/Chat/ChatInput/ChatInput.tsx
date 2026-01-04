import React, { useEffect, useRef, useState } from 'react';
import { InputContainer, MessageInput, SendButton, SpinningIcon } from './ChatInput.styles';
import { Loader2, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (input: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
                                               onSendMessage,
                                               isLoading,
                                               isDisabled
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
            placeholder={isDisabled ? "" : "Ask any question..."}
            disabled={isDisabled}
        />
        <SendButton
            onClick={handleSend}
            disabled={isDisabled || isLoading || !inputValue.trim()}
            aria-label={isLoading ? "Sending..." : "Send"}
            $height={textareaHeight}
        >
          {isLoading ? (
              <SpinningIcon>
                <Loader2 size={16}/>
              </SpinningIcon>
          ) : (
              <Send size={16}/>
          )}
        </SendButton>
      </InputContainer>
  );
};

export default ChatInput;

