import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import styled from 'styled-components';

const PdfContainer = styled.div`
    flex: 1;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: 8px;
    overflow: hidden;
    height: 100%;
`;

const NavigationBar = styled.div`
    align-items: center;
    background-color: #eeeeee;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    padding: 4px;
`;

const NavigationButtonContainer = styled.div`
    padding: 0 2px;
`;

interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({fileUrl}) => {
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const {
    CurrentPageInput,
    GoToNextPageButton,
    GoToPreviousPageButton,
    jumpToPage
  } = pageNavigationPluginInstance;

  return (
      <PdfContainer>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <NavigationBar>
            <NavigationButtonContainer>
              <GoToPreviousPageButton/>
            </NavigationButtonContainer>
            <NavigationButtonContainer>
              <CurrentPageInput/>
            </NavigationButtonContainer>
            <NavigationButtonContainer>
              <GoToNextPageButton/>
            </NavigationButtonContainer>
          </NavigationBar>
          <Viewer fileUrl={fileUrl} plugins={[pageNavigationPluginInstance]}/>
        </Worker>
      </PdfContainer>
  );
};

export default PdfViewer;