import React, { useState } from 'react';
import { sendMessage } from '../../services/api';
import { parseMessageWithPageRefBadges } from './ChatMessageParser'
import {
  ChatContainer,
  InputContainer,
  Message,
  MessageInput,
  MessagesContainer,
  MessagesList,
  SendButton
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
      console.log(response)
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

  return (
      <ChatContainer>
        <MessagesContainer>
          <MessagesList>
            {messages.map(message => (
                <Message key={message.id} isUser={message.isUser}>
                  {parseMessageWithPageRefBadges(message.text, onBadgeClick)}
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
          />
          <SendButton onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </SendButton>
        </InputContainer>
      </ChatContainer>
  );
};

export default Chat;