import styled from "styled-components";

export const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0; /* Ensure it doesn't exceed the parent height */
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: 8px;
    overflow: hidden;
    background-color: ${props => props.theme.colors.white};
    font-family: ${props => props.theme.fonts.main};
`;

export const MessagesContainer = styled.div`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
`;

export const InputContainer = styled.div`
    display: flex;
    padding: 15px;
    background-color: ${props => props.theme.colors.white};
    border-top: 1px solid ${props => props.theme.colors.border};
`;

export const MessageInput = styled.input`
    flex: 1;
    padding: 10px;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: 4px;
    font-size: 16px;
    color: ${props => props.theme.colors.text};
    font-family: ${props => props.theme.fonts.main};

    &:disabled {
        background-color: ${props => props.theme.colors.background};
    }
`;

export const SendButton = styled.button`
  margin-left: 10px;
  padding: 10px 15px;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-family: ${props => props.theme.fonts.main};

  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }

  &:disabled {
    background-color: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
  }
`;

export const DocBadge = styled.span`
  display: inline-block;
  margin-left: 10px;
  padding: 2px 6px;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
`;

export const Message = styled.div<{ isUser: boolean }>`
    max-width: 70%;
    padding: 10px 15px;
    margin: 5px 0;
    border-radius: 18px;
    align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
    background-color: ${props => props.isUser ? props.theme.colors.primary : '#e5e5ea'};
    color: ${props => props.isUser ? props.theme.colors.white : props.theme.colors.text};
    margin-left: ${props => props.isUser ? 'auto' : '0'};
    margin-right: ${props => !props.isUser ? 'auto' : '0'};
    font-family: ${props => props.theme.fonts.main};
    position: relative;
    text-align: left;
    word-wrap: break-word;
`;

export const MessagesList = styled.div`
    display: flex;
    flex-direction: column;
    font-family: ${props => props.theme.fonts.main};
`;