import React, { useState } from 'react';
import { sendMessage } from '../../services/api';
import {
  ChatContainer,
  MessagesContainer,
  MessagesList,
  Message,
  InputContainer,
  MessageInput,
  SendButton,
  DocBadge
} from './Chat.styles';

interface ChatProps {
  token: string;
  onBadgeClick: (pageRef: number) => void;
}

interface MessageType {
  id: number;
  text: string;
  isUser: boolean;
  pageIndex?: number;
}

const Chat: React.FC<ChatProps> = ({ token, onBadgeClick }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: MessageType = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessage(token, inputValue);
      console.log(response.documents)
      const botMessage: MessageType = {
        id: Date.now() + 1,
        text: response.answer,
        isUser: false,
        pageIndex: response.documents?.[0]?.page ?? null,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: MessageType = {
        id: Date.now() + 1,
        text: 'Sorry, there was an error processing your request.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleBadgeClick = (pageIndex?: number) => {
    if (pageIndex) {
      onBadgeClick(pageIndex)
    }
  };

  return (
      <ChatContainer>
        <MessagesContainer>
          <MessagesList>
            {messages.map(message => (
                <Message key={message.id} isUser={message.isUser}>
                  {message.text}
                  {!message.isUser && message.pageIndex &&
                      <DocBadge onClick={() => handleBadgeClick(message.pageIndex)}>{message.pageIndex + 1}</DocBadge>
                  }
                </Message>
            ))}
            <div ref={messagesEndRef} />
          </MessagesList>
        </MessagesContainer>
        <InputContainer>
          <MessageInput
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
          />
          <SendButton onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </SendButton>
        </InputContainer>
      </ChatContainer>
  );
};

export default Chat;