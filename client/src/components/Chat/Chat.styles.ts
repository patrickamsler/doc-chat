import styled from "styled-components";

export const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0; /* Ensure it doesn't exceed the parent height */
    border-left: 1px solid ${props => props.theme.colors.border.main};
    overflow: hidden;
    background-color: ${props => props.theme.colors.background.paper};
    font-family: ${props => props.theme.typography.fontFamily.sans};
`;

export const ChatHeader = styled.div`
    padding: 12px 16px;
    border-bottom: 1px solid ${props => props.theme.colors.border.main};
`;

export const ChatTitle = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 4px;
    color: ${props => props.theme.colors.text.primary};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
`;

export const ChatSubtitle = styled.div`
    font-size: ${props => props.theme.typography.fontSize.xs};
    color: ${props => props.theme.colors.text.secondary};
    margin-top: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
`;

export const MessagesContainer = styled.div`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: ${props => props.theme.colors.background.paper};
    color: ${props => props.theme.colors.text.primary};
`;

export const PageRefBadge = styled.span`
    display: inline;
    margin: 0 1px;
    color: ${props => props.theme.colors.primary[600]};
    cursor: pointer;
    font-size: ${props => props.theme.typography.fontSize.sm};

    &:hover {
        text-decoration: underline;
    }
`;

const MessageBase = styled.div`
    max-width: 80%;
    border-radius: ${props => props.theme.borderRadius.lg};
    color: ${props => props.theme.colors.text.primary};
    font-family: ${props => props.theme.typography.fontFamily.sans};
    font-size: ${props => props.theme.typography.fontSize.base};
    position: relative;
    text-align: left;
    word-wrap: break-word;
`;

export const UserMessage = styled(MessageBase)`
    align-self: flex-end;
    background-color: ${props => props.theme.colors.gray[100]};
    padding: 10px 15px;
    margin: 20px 0 20px auto;
`;

export const AssistantMessage = styled(MessageBase)`
    align-self: flex-start;
    background-color: ${props => props.theme.colors.background.paper};
    margin-left: 2px;
    margin-right: auto;
`;

export const AssistantMessageContainer = styled.div`
    display: flex;
    align-items: flex-start;
    margin-top: 20px;
    margin-bottom: 20px;
`;

export const MessagesList = styled.div`
    display: flex;
    flex-direction: column;
`;

export const MarkdownContent = styled.div`
  font-family: ${props => props.theme.typography.fontFamily.sans};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    line-height: 1.3;
    color: ${props => props.theme.colors.text.primary};
  }

  h1:first-child,
  h2:first-child,
  h3:first-child,
  h4:first-child,
  h5:first-child,
  h6:first-child {
    margin-top: 0;
  }

  h1 { font-size: 1.75em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1.1em; }
  h5 { font-size: 1em; }
  h6 { font-size: 0.9em; }

  /* Paragraphs */
  p {
    margin-top: 0.75em;
    margin-bottom: 0.75em;
    white-space: pre-wrap;
  }

  p:first-child {
    margin-top: 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  /* Lists */
  ul, ol {
    margin-top: 0.75em;
    margin-bottom: 0.75em;
    padding-left: 2em;
  }

  li {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }

  /* Nested lists */
  li > ul,
  li > ol {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }

  /* Inline code */
  code {
    background-color: ${props => props.theme.colors.gray[100]};
    padding: 0.2em 0.4em;
    border-radius: ${props => props.theme.borderRadius.sm};
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: ${props => props.theme.colors.text.primary};
  }

  /* Code blocks */
  pre {
    margin-top: 1em;
    margin-bottom: 1em;
    padding: 1em;
    background-color: ${props => props.theme.colors.gray[50]};
    border-radius: ${props => props.theme.borderRadius.md};
    overflow-x: auto;
    border: 1px solid ${props => props.theme.colors.border.main};

    code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
      font-size: ${props => props.theme.typography.fontSize.sm};
    }
  }

  /* Links */
  a {
    color: ${props => props.theme.colors.primary[600]};
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: ${props => props.theme.colors.primary[700]};
    }
  }

  /* Blockquotes */
  blockquote {
    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 1em;
    border-left: 4px solid ${props => props.theme.colors.primary[300]};
    color: ${props => props.theme.colors.text.secondary};
    font-style: italic;
  }

  /* Tables */
  table {
    width: 100%;
    margin-top: 1em;
    margin-bottom: 1em;
    border-collapse: collapse;
  }

  th, td {
    padding: 0.5em;
    border: 1px solid ${props => props.theme.colors.border.main};
    text-align: left;
  }

  th {
    background-color: ${props => props.theme.colors.gray[50]};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }

  /* Horizontal rules */
  hr {
    margin-top: 2em;
    margin-bottom: 2em;
    border: none;
    border-top: 1px solid ${props => props.theme.colors.border.main};
  }

  /* Strong and emphasis */
  strong {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }

  em {
    font-style: italic;
  }

  /* Strikethrough (GFM) */
  del {
    text-decoration: line-through;
  }

  /* Task lists (GFM) */
  input[type="checkbox"] {
    margin-right: 0.5em;
  }
`;
