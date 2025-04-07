export interface UploadFileResponse {
  token: string;
  message: string;
}

export interface DocumentResponse {
  page: number;
  content: string;
}

export interface QueryResponse {
  question: string;
  answer: string;
  documents: DocumentResponse[];
}