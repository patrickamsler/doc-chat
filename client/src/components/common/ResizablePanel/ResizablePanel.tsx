import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ResizablePanelContainer,
  ResizeHandle,
  ResizeIndicator,
  ResizeBar,
} from './ResizablePanel.styles';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey: string;
  resizePosition?: 'left' | 'right';
  minRemainingSpace?: number;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultWidth = 400,
  minWidth = 200,
  maxWidth = 800,
  storageKey,
  resizePosition = 'left',
  minRemainingSpace = 400,
}) => {
  const [width, setWidth] = useState<number>(() => {
    const savedWidth = localStorage.getItem(storageKey);
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10);
      return Math.min(Math.max(parsedWidth, minWidth), maxWidth);
    }
    return defaultWidth;
  });

  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [width]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = resizePosition === 'left'
        ? startXRef.current - e.clientX
        : e.clientX - startXRef.current;

      const newWidth = startWidthRef.current + deltaX;

      // Calculate effective max width based on window size and minimum remaining space
      const effectiveMaxWidth = Math.min(
        maxWidth,
        window.innerWidth - minRemainingSpace
      );

      const clampedWidth = Math.min(Math.max(newWidth, minWidth), effectiveMaxWidth);

      setWidth(clampedWidth);
    },
    [isResizing, minWidth, maxWidth, minRemainingSpace, resizePosition]
  );

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      localStorage.setItem(storageKey, width.toString());
    }
  }, [isResizing, storageKey, width]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <ResizablePanelContainer $width={width}>
      {resizePosition === 'left' && (
        <ResizeHandle $position="left" onMouseDown={handleMouseDown}>
          <ResizeIndicator>
            <ResizeBar />
          </ResizeIndicator>
        </ResizeHandle>
      )}
      {children}
      {resizePosition === 'right' && (
        <ResizeHandle $position="right" onMouseDown={handleMouseDown}>
          <ResizeIndicator>
            <ResizeBar />
          </ResizeIndicator>
        </ResizeHandle>
      )}
    </ResizablePanelContainer>
  );
};

export default ResizablePanel;
