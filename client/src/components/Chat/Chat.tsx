import React, { useRef, useEffect, useState } from 'react';
import { sendMessage } from '../../services/api';
import { parseMessageWithPageRefBadges } from './ChatMessageParser'
import ChatInput from './ChatInput/ChatInput';
import { ChatContainer, Message, MessagesContainer, MessagesList } from './Chat.styles';

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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: MessageType = {
      id: Date.now(),
      text: input,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessage(token, input);
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
        <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
        />
      </ChatContainer>
  );
};

export default Chat;
