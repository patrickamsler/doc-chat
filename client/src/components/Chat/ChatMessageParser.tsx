import React from "react";
import { PageRefBadge } from "./Chat.styles";

export const parseMessageWithPageRefBadges = (
    message: string,
    onBadgeClick: (pageRef: number) => void
): React.ReactNode => {
  const parts = message.split(/(<<\d+>>)/g); // Split message into text and <<>> parts

  return parts.map((part, index) => {
    const match = part.match(/<<(\d+)>>/); // Check if part is a <<>> reference
    if (match) {
      const pageRef = parseInt(match[1], 10); // Extract the page number
      return (
          <PageRefBadge key={index} onClick={() => onBadgeClick(pageRef)}>
            {pageRef + 1}
          </PageRefBadge>
      );
    }
    return <span key={index}>{part}</span>; // Return plain text for non-<<>> parts
  });
};