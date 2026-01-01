import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from './FileUpload';
import { uploadFile } from '../../services/api';
import theme from "../../theme";
import { ThemeProvider } from "styled-components";

jest.mock('../../services/api', () => ({
  uploadFile: jest.fn()
}));
global.URL.createObjectURL = () => 'mocked-file-url';

describe('FileUpload Component', () => {
  it('uploads a file and calls onFileUploaded', async () => {
    const fakeChatId = '12345';
    (uploadFile as jest.Mock).mockResolvedValueOnce({ chatId: fakeChatId });
    const onFileUploaded = jest.fn();

    render(
        <ThemeProvider theme={theme}>
          <FileUpload onFileUploaded={onFileUploaded} />
        </ThemeProvider>
    );

    // Create a file and directly trigger the change event on the input
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByTestId('file-input');
    userEvent.upload(input, file);

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledWith(file);
    });

    await waitFor(() => {
      expect(onFileUploaded).toHaveBeenCalled();
    });

  });
});