import React from "react";
import { PageRefBadge } from "./Chat.styles";
import { DocumentResponse } from "../../types/apiTypes";

export const parseMessageWithPageRefBadges = (
    message: string,
    documents: DocumentResponse[],
    onBadgeClick: (pageRef: number) => void
): React.ReactNode => {
  const parts = message.split(/(<<\s*doc_\d+\s*>>)/g).map(part => part.trim()); // Split and trim parts

  return parts
  .filter(part => part !== "") // Remove empty strings or whitespaces
  .map((part, index) => {
    const match = part.match(/<<\s*(doc_\d+)\s*>>/); // Check if part is a <<>> reference
    if (match) {
      const docId = match[1]; // Construct the document ID
      const document = documents.find(doc => doc.id === docId);
      const pageIndex = document?.page
      if (pageIndex === undefined) {
        return null
      }
      return (
          <PageRefBadge key={index} onClick={() => onBadgeClick(pageIndex)}>
            {pageIndex + 1}
          </PageRefBadge>
      );
    }
    return <span key={index}>{part}</span>; // Return plain text for non-<<>> parts
  });
};