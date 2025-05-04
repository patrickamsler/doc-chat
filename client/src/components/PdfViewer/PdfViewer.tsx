import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { PageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import {
  ViewerContainer,
  NavigationBar,
  NavigationButtonContainer,
  FileNameContainer,
  NavigationControls
} from "./PdfViewer.styles";

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
  pageNavigationPluginInstance: PageNavigationPlugin;
}

const PdfViewer: React.FC<PdfViewerProps> = ({fileUrl, fileName, pageNavigationPluginInstance}) => {
  const {
    CurrentPageInput,
    NumberOfPages,
    GoToNextPageButton,
    GoToPreviousPageButton,
  } = pageNavigationPluginInstance;

  const zoomPluginInstance = zoomPlugin();
  const {ZoomInButton, ZoomOutButton} = zoomPluginInstance;

  return (
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <NavigationBar>
          <FileNameContainer title={fileName}>
            {fileName}
          </FileNameContainer>
          <NavigationControls>
            <NavigationButtonContainer>
              <ZoomOutButton/>
            </NavigationButtonContainer>
            <NavigationButtonContainer>
              <ZoomInButton/>
            </NavigationButtonContainer>
            <NavigationButtonContainer>
              <GoToPreviousPageButton/>
            </NavigationButtonContainer>
            <NavigationButtonContainer>
              <CurrentPageInput/>
            </NavigationButtonContainer>
            <NavigationButtonContainer>
              / <NumberOfPages/>
            </NavigationButtonContainer>
            <NavigationButtonContainer>
              <GoToNextPageButton/>
            </NavigationButtonContainer>
          </NavigationControls>
        </NavigationBar>
        <ViewerContainer>
          <Viewer
              fileUrl={fileUrl}
              plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
          />
        </ViewerContainer>
      </Worker>
  );
};

export default PdfViewer;