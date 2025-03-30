import React, { useState } from 'react';
import styled from 'styled-components';
import { sendMessage } from '../../services/api';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: white;
  border-top: 1px solid #ddd;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const SendButton = styled.button`
  margin-left: 10px;
  padding: 10px 15px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #3367d6;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  padding: 10px 15px;
  margin: 5px 0;
  border-radius: 18px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.isUser ? '#4285f4' : '#e5e5ea'};
  color: ${props => props.isUser ? 'white' : 'black'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin-left: ${props => props.isUser ? 'auto' : '0'};
  margin-right: ${props => !props.isUser ? 'auto' : '0'};
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
`;

interface ChatProps {
  token: string;
}

interface MessageType {
  id: number;
  text: string;
  isUser: boolean;
}

const Chat: React.FC<ChatProps> = ({ token }) => {
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
      const botMessage: MessageType = {
        id: Date.now() + 1,
        text: response,
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
                  {message.text}
                </Message>
            ))}
            <div ref={messagesEndRef} />
          </MessagesList>
        </MessagesContainer>
        <InputContainer>
          <MessageInput
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
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