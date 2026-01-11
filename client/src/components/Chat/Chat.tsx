import React, { useEffect, useRef } from 'react';
import { useChatHistory, useSendMessage, useDeleteChatHistory } from '../../hooks/useApi';
import ChatInput from './ChatInput/ChatInput';
import {
  AssistantMessage,
  AssistantMessageContainer,
  ChatContainer,
  ChatHeader,
  ChatHeaderContent,
  ChatSubtitle,
  ChatTitle,
  MessagesContainer,
  MessagesList,
  TrashIconButton,
  UserMessage
} from './Chat.styles';
import { useTheme } from 'styled-components';
import { DocumentResponse } from "../../types/apiTypes";
import { BotMessageSquare, Trash2 } from "lucide-react";
import { parseMarkdownWithPageRefBadges } from './Parser/MarkdownMessageParser';

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
  const { data: history = [] } = useChatHistory(chatId);
  const sendMessageMutation = useSendMessage();
  const deleteChatHistoryMutation = useDeleteChatHistory();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Transform API format to component format
  const messages: MessageType[] = history.map((msg, index) => ({
    id: new Date(msg.timestamp).getTime() + index,
    text: msg.content,
    documents: msg.documents,
    isUser: msg.role === 'user',
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({ chatId, question: input });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const clearChatHistory = async () => {
    if (!chatId) return;
    try {
      await deleteChatHistoryMutation.mutateAsync(chatId);
    } catch (error) {
      console.error('Error deleting chat history:', error);
    }
  };

  return (
      <ChatContainer>
        <ChatHeader>
          <ChatHeaderContent>
            <ChatTitle>
              <BotMessageSquare style={{width: '1.25rem', height: '1.25rem', color: theme.colors.primary[500]}}/>
              <span>Chat Assistant</span>
            </ChatTitle>
            <ChatSubtitle>
              {chatId && fileName ? `Chatting about: ${fileName}` : 'No document selected'}
            </ChatSubtitle>
          </ChatHeaderContent>
          <TrashIconButton onClick={() => clearChatHistory()} data-testid="clear-history-button">
            <Trash2 style={{width: '1.25rem', height: '1.25rem', color: theme.colors.gray[500]}}/>
          </TrashIconButton>
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
            isLoading={sendMessageMutation.isPending}
            isDisabled={!chatId}
        />
      </ChatContainer>
  );
};

export default Chat;
