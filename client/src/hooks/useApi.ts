import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteChat,
  deleteChatHistory,
  downloadFile,
  getChatHistory,
  getChats,
  initAuth,
  sendMessage,
  uploadFile,
} from '../services/api';
import { queryKeys } from './queryKeys';
import { ChatHistoryResponse, Message } from '../types/apiTypes';

// Query Hooks

export function useAuth() {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: initAuth,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 3,
  });
}

export function useChats() {
  return useQuery({
    queryKey: queryKeys.chats.list(),
    queryFn: getChats,
    select: (data) => data.chats,
  });
}

export function useChatHistory(chatId: string) {
  return useQuery({
    queryKey: queryKeys.chats.history(chatId),
    queryFn: () => getChatHistory(chatId),
    enabled: !!chatId,
    select: (data) => data.history,
  });
}

export function useChatFile(chatId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.chats.file(chatId),
    queryFn: () => downloadFile(chatId),
    enabled: !!chatId && (options?.enabled ?? true),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

// Mutation Hooks

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.chats.list()});
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({chatId, question}: { chatId: string; question: string }) =>
        sendMessage(chatId, question),

    onMutate: async ({chatId, question}) => {
      await queryClient.cancelQueries({queryKey: queryKeys.chats.history(chatId)});
      const previousHistory = queryClient.getQueryData(queryKeys.chats.history(chatId));

      // Optimistically update chat history with user's question and a placeholder for the answer
      queryClient.setQueryData(
          queryKeys.chats.history(chatId),
          (old: ChatHistoryResponse | undefined): ChatHistoryResponse => {
            const currentHistory = old?.history || [];
            return {
              chatId: chatId,
              history: [
                ...currentHistory,
                {
                  role: 'user',
                  content: question,
                  timestamp: new Date().toISOString(),
                  documents: [],
                },
                {
                  role: 'assistant',
                  content: 'thinking...',
                  timestamp: new Date().toISOString(),
                  documents: [],
                },
              ],
            };
          }
      );

      return {previousHistory};
    },

    onSuccess: (response, {chatId}) => {
      // Replace "thinking..." with actual response
      queryClient.setQueryData(
          queryKeys.chats.history(chatId),
          (old: ChatHistoryResponse | undefined): ChatHistoryResponse => {
            const currentHistory = old?.history || [];
            const newHistory = [...currentHistory];
            newHistory[newHistory.length - 1] = {
              role: 'assistant',
              content: response.answer,
              timestamp: new Date().toISOString(),
              documents: response.documents,
            };
            return {
              chatId: chatId,
              history: newHistory,
            };
          }
      );
    },

    onError: (_err, {chatId}, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(queryKeys.chats.history(chatId), context.previousHistory);
      }
    },
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => deleteChat(chatId),
    onSuccess: (_, chatId) => {
      queryClient.removeQueries({queryKey: queryKeys.chats.history(chatId)});
      queryClient.removeQueries({queryKey: queryKeys.chats.file(chatId)});
      queryClient.invalidateQueries({queryKey: queryKeys.chats.list()});
    },
  });
}

export function useDeleteChatHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => deleteChatHistory(chatId),
    onSuccess: (_, chatId) => {
      queryClient.setQueryData(queryKeys.chats.history(chatId), {
        chatId: chatId,
        history: [],
      });
    },
  });
}
