export interface UploadFileResponse {
  chatId: string;
  message: string;
}

export interface DocumentResponse {
  id: string;
  page: number;
  content: string;
}

export interface QueryResponse {
  question: string;
  answer: string;
  documents: DocumentResponse[];
}

export interface ChatInfo {
  chatId: string;
  fileName: string;
  createdAt: string;
}

export interface ChatsResponse {
  userId: string;
  chats: ChatInfo[];
}