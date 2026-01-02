import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import { MarkdownContent, PageRefBadge } from "../Chat.styles";
import { DocumentResponse } from "../../../types/apiTypes";

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);

interface ChunkPlaceholder {
  index: number;
  chunkId: string;
}

/**
 * Pre-processes message to extract chunk references and replace with placeholders
 * Returns: [processedMessage, chunkMetadata]
 */
const extractChunkReferences = (
    message: string
): [string, ChunkPlaceholder[]] => {
  const chunkMetadata: ChunkPlaceholder[] = [];
  let index = 0;

  const processedMessage = message.replace(
      /<<\s*(chunk_\d+)\s*>>/g,
      (match, chunkId) => {
        const placeholder = `%%CHUNK_PLACEHOLDER_${index}%%`;
        chunkMetadata.push({index, chunkId});
        index++;
        return placeholder;
      }
  );

  return [processedMessage, chunkMetadata];
};

/**
 * Component to render text with chunk reference badges
 */
interface TextWithBadgesProps {
  text: string;
  chunkMetadata: ChunkPlaceholder[];
  documents: DocumentResponse[];
  onBadgeClick: (pageRef: number, content: string) => void;
}

const TextWithBadges: React.FC<TextWithBadgesProps> = ({
                                                         text,
                                                         chunkMetadata,
                                                         documents,
                                                         onBadgeClick,
                                                       }) => {
  // If there are no chunk references, return plain text
  if (chunkMetadata.length === 0) {
    return <>{text}</>;
  }

  const parts: React.ReactNode[] = [];
  let remainingText = text;
  let key = 0;

  chunkMetadata.forEach((metadata) => {
    const placeholder = `%%CHUNK_PLACEHOLDER_${metadata.index}%%`;
    const splitIndex = remainingText.indexOf(placeholder);

    if (splitIndex !== -1) {
      // Add text before placeholder
      if (splitIndex > 0) {
        parts.push(
            <span key={`text-${key++}`}>
            {remainingText.substring(0, splitIndex)}
          </span>
        );
      }

      // Add badge
      const document = documents.find((doc) => doc.id === metadata.chunkId);
      if (document) {
        parts.push(
            <PageRefBadge
                key={`badge-${key++}`}
                onClick={() => onBadgeClick(document.page, document.content)}
            >
              [{document.page + 1}]
            </PageRefBadge>
        );
      }

      // Update remaining text
      remainingText = remainingText.substring(
          splitIndex + placeholder.length
      );
    }
  });

  // Add any remaining text
  if (remainingText) {
    parts.push(<span key={`text-${key++}`}>{remainingText}</span>);
  }

  return <>{parts}</>;
};

/**
 * Helper to process children and inject badges
 */
const processChildren = (
    children: any,
    chunkMetadata: ChunkPlaceholder[],
    documents: DocumentResponse[],
    onBadgeClick: (pageRef: number, content: string) => void
): React.ReactNode => {
  if (typeof children === "string") {
    return (
        <TextWithBadges
            text={children}
            chunkMetadata={chunkMetadata}
            documents={documents}
            onBadgeClick={onBadgeClick}
        />
    );
  }

  // Handle arrays of children
  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === "string") {
        return (
            <TextWithBadges
                key={index}
                text={child}
                chunkMetadata={chunkMetadata}
                documents={documents}
                onBadgeClick={onBadgeClick}
            />
        );
      }
      return child;
    });
  }

  return children;
};

/**
 * Fixes invalid markdown where text appears on the same line as closing code fence
 * Example: ```\ncode\n``` text  →  ```\ncode\n```\ntext
 * This is needed because markdown spec requires closing fences to be on their own line
 */
const fixCodeFenceFormatting = (message: string): string => {
  // Fix closing fence with chunk references on same line
  // Pattern: ``` followed by space(s) then << (chunk reference start)
  return message.replace(/(```)\s+(<<)/g, '$1\n$2');
};

/**
 * Main parser component for markdown messages with chunk references
 */
export const parseMarkdownWithPageRefBadges = (
    message: string,
    documents: DocumentResponse[],
    onBadgeClick: (pageRef: number, content: string) => void
): React.ReactNode => {
  // Guard clause for empty messages
  if (!message || message.trim() === "") {
    return null;
  }

  // Fix invalid markdown formatting (chunk refs on same line as closing fence)
  const fixedMessage = fixCodeFenceFormatting(message);

  // Extract chunk references
  const [processedMessage, chunkMetadata] = extractChunkReferences(fixedMessage);

  // Define custom markdown components
  const markdownComponents: any = {
    // Paragraphs - inject badges
    p: ({children, ...props}: any) => (
        <p {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </p>
    ),

    // Code blocks and inline code
    code: ({node, inline, className, children, ...props}: any) => {
      const codeString = String(children).replace(/\n$/, "");

      // Inline code - inject badges
      if (inline) {
        return (
            <code className={className} {...props}>
              {processChildren(children, chunkMetadata, documents, onBadgeClick)}
            </code>
        );
      }

      // Code block with syntax highlighting
      const match = /language-(\w+)/.exec(className || "");
      if (match) {
        return (
            <SyntaxHighlighter
                style={oneLight}
                language={match[1]}
                PreTag="div"
                {...props}
            >
              {codeString}
            </SyntaxHighlighter>
        );
      }

      // Code block without language specified
      return (
          <code className={className} {...props}>
            {children}
          </code>
      );
    },

    // List items - inject badges
    li: ({children, ...props}: any) => (
        <li {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </li>
    ),

    // Headings - inject badges
    h1: ({children, ...props}: any) => (
        <h1 {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </h1>
    ),

    h2: ({children, ...props}: any) => (
        <h2 {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </h2>
    ),

    h3: ({children, ...props}: any) => (
        <h3 {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </h3>
    ),

    h4: ({children, ...props}: any) => (
        <h4 {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </h4>
    ),

    h5: ({children, ...props}: any) => (
        <h5 {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </h5>
    ),

    h6: ({children, ...props}: any) => (
        <h6 {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </h6>
    ),

    // Blockquotes - inject badges
    blockquote: ({children, ...props}: any) => (
        <blockquote {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </blockquote>
    ),

    // Strong and emphasis - inject badges
    strong: ({children, ...props}: any) => (
        <strong {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </strong>
    ),

    em: ({children, ...props}: any) => (
        <em {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </em>
    ),

    // Table cells - inject badges
    td: ({children, ...props}: any) => (
        <td {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </td>
    ),

    th: ({children, ...props}: any) => (
        <th {...props}>
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </th>
    ),

    // Links - ensure external links open in new tab
    a: ({href, children, ...props}: any) => (
        <a
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            {...props}
        >
          {processChildren(children, chunkMetadata, documents, onBadgeClick)}
        </a>
    ),

    // Text nodes - handle any raw text that might contain placeholders
    // This catches text that appears outside of paragraphs (e.g., after code blocks)
    text: ({value, ...props}: any) => {
      if (typeof value === "string" && value.includes("%%CHUNK_PLACEHOLDER_")) {
        return (
          <TextWithBadges
            text={value}
            chunkMetadata={chunkMetadata}
            documents={documents}
            onBadgeClick={onBadgeClick}
          />
        );
      }
      return value;
    },
  };

  // Render markdown
  return (
      <MarkdownContent>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {processedMessage}
        </ReactMarkdown>
      </MarkdownContent>
  );
};
