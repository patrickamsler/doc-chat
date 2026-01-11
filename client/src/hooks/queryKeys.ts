export const queryKeys = {
  auth: ['auth'] as const,
  chats: {
    all: ['chats'] as const,
    list: () => [...queryKeys.chats.all, 'list'] as const,
    history: (chatId: string) => [...queryKeys.chats.all, 'history', chatId] as const,
    file: (chatId: string) => [...queryKeys.chats.all, 'file', chatId] as const,
  },
} as const;
