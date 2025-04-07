import axios from 'axios';
import { QueryResponse, UploadFileResponse } from '../types/apiTypes';

const API_URL = process.env.REACT_APP_API_URL || (() => {
  throw new Error('REACT_APP_API_URL environment variable is not set');
})();

export const uploadFile = async (file: File): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/chat`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const sendMessage = async (token: string, question: string): Promise<QueryResponse> => {
  const response = await axios.post(`${API_URL}/chat/query`, {
    token,
    question,
  });

  return response.data;
};