import styled from "styled-components";

export const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0; /* Ensure it doesn't exceed the parent height */
    border: 1px solid ${props => props.theme.colors.grey300};
    overflow: hidden;
    background-color: ${props => props.theme.colors.white};
    font-family: ${props => props.theme.fonts.main};
`;

export const ChatNavigationBar = styled.div`
    align-items: center;
    height: 30px;
    display: flex;
    justify-content: flex-start;
    padding: 4px 12px;
`;

export const ChatNavigationTitle = styled.div`
    font-family: Arial, sans-serif;
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
`;

export const MessagesContainer = styled.div`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: ${props => props.theme.colors.white};
    color: ${props => props.theme.colors.textDark};
`;

export const PageRefBadge = styled.span`
  display: inline-block;
  margin-left: 5px;
  padding: 2px 6px;
  background-color: ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.textDark};
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
    background-color: ${props => props.isUser ? props.theme.colors.grey100 : props.theme.colors.white};
    color: ${props => props.isUser ? props.theme.colors.textDark : props.theme.colors.textDark};
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
