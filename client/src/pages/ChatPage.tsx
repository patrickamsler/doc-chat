import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import PdfViewer from '../components/PdfViewer/PdfViewer';
import Chat from '../components/Chat/Chat';
import { ContentContainer, ContentPanel } from '../App.styles';
import { downloadFile } from '../services/api';

interface FileInfo {
  url: string;
  name: string;
}

interface ChatPageProps {
  files: Record<string, FileInfo>;
}

const ChatPage: React.FC<ChatPageProps> = ({ files }) => {
  const { chatId = '' } = useParams<{ chatId: string }>();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  useEffect(() => {
    if (!chatId) return;
    const info = files[chatId];
    if (info) {
      setFileUrl(info.url);
      setFileName(info.name);
    } else {
      downloadFile(chatId)
        .then(({ url, fileName }) => {
          setFileUrl(url);
          setFileName(fileName);
        })
        .catch(err => console.error('Error downloading file:', err));
    }
  }, [chatId, files]);

  const handleBadgeClick = (pageRef: number) => {
    if (jumpToPage) {
      jumpToPage(pageRef);
    }
  };

  if (!chatId) return null;

  return (
    <ContentContainer>
      <ContentPanel>
        {fileUrl && (
          <PdfViewer
            fileUrl={fileUrl}
            fileName={fileName}
            pageNavigationPluginInstance={pageNavigationPluginInstance}
          />
        )}
      </ContentPanel>
      <ContentPanel>
        <Chat chatId={chatId} onBadgeClick={handleBadgeClick} />
      </ContentPanel>
    </ContentContainer>
  );
};

export default ChatPage;
