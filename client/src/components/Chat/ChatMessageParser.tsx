import React from "react";
import { PageRefBadge } from "./Chat.styles";
import { DocumentResponse } from "../../types/apiTypes";

export const parseMessageWithPageRefBadges = (
    message: string,
    documents: DocumentResponse[],
    onBadgeClick: (pageRef: number, content: string) => void
): React.ReactNode => {
  const parts = message.split(/(<<\s*chunk_\d+\s*>>)/g).map(part => part.trim()); // Split and trim parts

  return parts
  .filter(part => part !== "") // Remove empty strings or whitespaces
  .map((part, index) => {
    const match = part.match(/<<\s*(chunk_\d+)\s*>>/); // Check if part is a <<>> reference
    if (match) {
      const chunkId = match[1]; // Extract the chunk ID
      const document = documents.find(doc => doc.id === chunkId);
      if (document === undefined) {
        return null
      }
      return (
          <PageRefBadge key={index} onClick={() => onBadgeClick(document.page, document.content)}>
            {document.page + 1}{/* Display page number (1-based index) */}
          </PageRefBadge>
      );
    }
    return <span key={index}>{part}</span>; // Return plain text for non-<<>> parts
  });
};