import React, { useEffect, useRef, useState } from 'react';
import { getChatHistory, sendMessage } from '../../services/api';
import { parseMessageWithPageRefBadges } from './ChatMessageParser'
import ChatInput from './ChatInput/ChatInput';
import {
  ChatContainer,
  ChatNavigationBar,
  ChatNavigationTitle,
  Message,
  MessagesContainer,
  MessagesList
} from './Chat.styles';
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from 'styled-components';
import { DocumentResponse } from "../../types/apiTypes";

interface ChatProps {
  chatId: string;
  onBadgeClick: (pageRef: number, content: string) => void;
}

interface MessageType {
  id: number;
  text: string;
  documents: DocumentResponse[];
  isUser: boolean;
}

const Chat: React.FC<ChatProps> = ({chatId, onBadgeClick}) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const historyResponse = await getChatHistory(chatId);
        const historicalMessages: MessageType[] = historyResponse.history.map((msg, index) => ({
          id: new Date(msg.timestamp).getTime() + index,
          text: msg.content,
          documents: msg.documents,
          isUser: msg.role === 'user',
        }));
        setMessages(historicalMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [chatId]);

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: MessageType = {
      id: Date.now(),
      text: input,
      documents: [],
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessage(chatId, input);
      const botMessage: MessageType = {
        id: Date.now() + 1,
        text: response.answer,
        documents: response.documents || [],
        isUser: false,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: MessageType = {
        id: Date.now() + 1,
        text: 'Sorry, there was an error processing your request.',
        documents: [],
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <ChatContainer>
        <ChatNavigationBar>
          <ChatNavigationTitle>Chat</ChatNavigationTitle>
        </ChatNavigationBar>
        <MessagesContainer>
          <MessagesList>
            {messages.map(message => (
                <Message key={message.id} $isUser={message.isUser}>
                  {!message.isUser && (
                      <FontAwesomeIcon icon={faRobot}
                                       style={{marginRight: 8, color: theme.colors.primaryA0}}
                      />
                  )}
                  {parseMessageWithPageRefBadges(message.text, message.documents, onBadgeClick)}
                </Message>
            ))}
            <div ref={messagesEndRef}/>
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
