import React, { forwardRef } from 'react';
import { useUploadFile } from '../../hooks/useApi';
import { FileInput } from './FileUpload.styles'


interface FileUploadProps {
  onFileUploaded: (chatId: string, fileUrl: string, fileName: string) => void;
  onFileUploadStart?: () => void;
  onUploadComplete?: () => void;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
    ({onFileUploaded, onFileUploadStart, onUploadComplete}, ref) => {
      const uploadFileMutation = useUploadFile();

      const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
          onFileUploadStart?.();
          const response = await uploadFileMutation.mutateAsync(file);
          const fileUrl = URL.createObjectURL(file);
          onFileUploaded(response.chatId, fileUrl, file.name);
        } catch (error) {
          console.error('Error uploading file:', error);
        } finally {
          onUploadComplete?.();
        }
      };

      return (
          <FileInput
              type="file"
              ref={ref}
              accept=".pdf"
              data-testid="file-input"
              onChange={handleFileChange}
          />
      );
    }
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;