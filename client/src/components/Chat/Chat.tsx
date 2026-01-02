import React, { useEffect, useRef, useState } from 'react';
import { getChatHistory, sendMessage } from '../../services/api';
import ChatInput from './ChatInput/ChatInput';
import {
  AssistantMessage,
  AssistantMessageContainer,
  ChatContainer,
  ChatHeader,
  ChatSubtitle,
  ChatTitle,
  MessagesContainer,
  MessagesList,
  UserMessage
} from './Chat.styles';
import { useTheme } from 'styled-components';
import { DocumentResponse } from "../../types/apiTypes";
import { BotMessageSquare } from "lucide-react";
import { parseMarkdownWithPageRefBadges } from "./Parser/ChatMessageParser";

// Select which parser to use for rendering assistant messages
// - parseMarkdownWithPageRefBadges: Renders markdown with syntax highlighting (default)
// - parsePlainTextWithPageRefBadges: Renders plain text only (legacy)
const messageParser = parseMarkdownWithPageRefBadges;

interface ChatProps {
  chatId: string;
  fileName?: string;
  onBadgeClick: (pageRef: number, content: string) => void;
}

interface MessageType {
  id: number;
  text: string;
  documents: DocumentResponse[];
  isUser: boolean;
}

const Chat: React.FC<ChatProps> = ({chatId, fileName, onBadgeClick}) => {
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
    if (!chatId) {
      return
    }
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
        <ChatHeader>
          <ChatTitle>
            <BotMessageSquare style={{width: '1.25rem', height: '1.25rem', color: theme.colors.primary[500]}}/>
            <span>Chat Assistant</span>
          </ChatTitle>
          <ChatSubtitle>
            {fileName && `Chatting about: ${fileName}`}
          </ChatSubtitle>
        </ChatHeader>
        <MessagesContainer>
          <MessagesList>
            {messages.map(message => (
                message.isUser ? (
                    <UserMessage key={message.id}>{message.text}</UserMessage>
                ) : (
                    <AssistantMessageContainer key={message.id}>
                      <BotMessageSquare
                          strokeWidth={2.0}
                          style={{
                            height: 21, width: 21, marginRight: 5, paddingTop: 3,
                            color: theme.colors.primary[500]
                          }}/>
                      <AssistantMessage>
                        {messageParser(message.text, message.documents, onBadgeClick)}
                      </AssistantMessage>
                    </AssistantMessageContainer>
                )
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
