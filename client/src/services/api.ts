import axios from 'axios';
import { QueryResponse, UploadFileResponse, ChatsResponse, ChatHistoryResponse } from '../types/apiTypes';

const API_URL = process.env.REACT_APP_API_URL || (() => {
  throw new Error('REACT_APP_API_URL environment variable is not set');
})();

export const uploadFile = async (file: File): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/chats`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true,
  });

  return response.data;
};

export const sendMessage = async (chatId: string, question: string): Promise<QueryResponse> => {
  const response = await axios.post(`${API_URL}/chats/query`, {
    chatId,
    question,
  }, {
    withCredentials: true
  });

  return response.data;
};

export const initAuth = async (): Promise<void> => {
  await axios.post(`${API_URL}/auth/init`, {}, {
    withCredentials: true,
  });
};

export const downloadFile = async (chatId: string): Promise<{ url: string; fileName: string }> => {
  const response = await axios.get(`${API_URL}/chats/${chatId}/file`, {
    responseType: 'blob',
    withCredentials: true,
  });

  const disposition = response.headers["content-disposition"] || '';
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);
  const fileName = filenameMatch ? decodeURIComponent(filenameMatch[1]) : 'Document';
  const url = URL.createObjectURL(response.data);
  return { url, fileName };
};

export const getChats = async (): Promise<ChatsResponse> => {
  const response = await axios.get(`${API_URL}/chats`, { withCredentials: true });
  return response.data;
};

export const getChatHistory = async (chatId: string): Promise<ChatHistoryResponse> => {
  const response = await axios.get(`${API_URL}/chats/${chatId}/history`, {
    withCredentials: true,
  });
  return response.data;
};