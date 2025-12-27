import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { PageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import {
  FileNameContainer,
  NavigationBar,
  NavigationButtonContainer,
  NavigationControls,
  ViewerContainer
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
  const {ZoomInButton, ZoomOutButton, ZoomPopover} = zoomPluginInstance;

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
              <ZoomPopover/>
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
              theme={{
                theme: 'light', // or 'light'
              }}

          />
        </ViewerContainer>
      </Worker>
  );
};

export default PdfViewer;