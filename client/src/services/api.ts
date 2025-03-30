import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000';

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_URL}/chat`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const sendMessage = async (token: string, question: string) => {
  const response = await axios.post(`${API_URL}/chat/query`, {
    token,
    question,
  });

  return response.data;
};