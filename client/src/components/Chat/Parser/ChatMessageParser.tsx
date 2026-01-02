import React from "react";
import { PageRefBadge } from "../Chat.styles";
import { DocumentResponse } from "../../../types/apiTypes";

/**
 * Plain text parser for messages with chunk references
 * Renders messages as plain text with clickable page reference badges
 * No markdown formatting support
 */
export const parsePlainTextWithPageRefBadges = (
    message: string,
    documents: DocumentResponse[],
    onBadgeClick: (pageRef: number, content: string) => void
): React.ReactNode => {
  const parts = message.split(/(<<\s*chunk_\d+\s*>>)/g);

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
            [{document.page + 1}]
          </PageRefBadge>
      );
    }
    return <span key={index} style={{whiteSpace: 'pre-wrap'}}>{part}</span>;

  });
};

// Re-export the markdown parser for convenience
export { parseMarkdownWithPageRefBadges } from "./MarkdownMessageParser";