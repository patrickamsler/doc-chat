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
  PageRefBadge
} from './Chat.styles';

interface ChatProps {
  token: string;
  onBadgeClick: (pageRef: number) => void;
}

interface MessageType {
  id: number;
  text: string;
  isUser: boolean;
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

  const parseMessageWithPageRefBadges = (
      message: string,
      onBadgeClick: (pageRef: number) => void
  ): React.ReactNode => {
    const parts = message.split(/(<<\d+>>)/g); // Split message into text and <<>> parts

    return parts.map((part, index) => {
      const match = part.match(/<<(\d+)>>/); // Check if part is a <<>> reference
      if (match) {
        const pageRef = parseInt(match[1], 10); // Extract the page number
        return (
            <PageRefBadge key={index} onClick={() => onBadgeClick(pageRef)}>
              {pageRef + 1}
            </PageRefBadge>
        );
      }
      return <span key={index}>{part}</span>; // Return plain text for non-<<>> parts
    });
  };

  return (
      <ChatContainer>
        <MessagesContainer>
          <MessagesList>
            {messages.map(message => (
                <Message key={message.id} isUser={message.isUser}>
                  {parseMessageWithPageRefBadges(message.text, handleBadgeClick)}
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