import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { PageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import {
  PdfContainer,
  NavigationBar,
  NavigationButtonContainer
} from "./PdfViewer.styles";


interface PdfViewerProps {
  fileUrl: string;
  pageNavigationPluginInstance: PageNavigationPlugin;
}

const PdfViewer: React.FC<PdfViewerProps> = ({fileUrl, pageNavigationPluginInstance}) => {
  const {
    CurrentPageInput,
    GoToNextPageButton,
    GoToPreviousPageButton,
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