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

export const ChatNavigationBar = styled.div`
    align-items: center;
    height: 30px;
    display: flex;
    justify-content: flex-start;
    padding: 4px 12px;
`;

export const ChatNavigationTitle = styled.div`
    font-family: ${props => props.theme.typography.fontFamily.sans};
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
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

export const Message = styled.div<{ $isUser: boolean }>`
    max-width: 70%;
    padding: 10px 15px;
    margin: 5px 0;
    border-radius: ${props => props.theme.borderRadius.lg};
    align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
    background-color: ${props => props.$isUser ? props.theme.colors.gray[100] : props.theme.colors.background.paper};
    color: ${props => props.$isUser ? props.theme.colors.text.primary : props.theme.colors.text.primary};
    margin-left: ${props => props.$isUser ? 'auto' : '0'};
    margin-right: ${props => !props.$isUser ? 'auto' : '0'};
    font-family: ${props => props.theme.typography.fontFamily.sans};
    font-size: ${props => props.theme.typography.fontSize.base};
    position: relative;
    text-align: left;
    word-wrap: break-word;
`;

export const MessagesList = styled.div`
    display: flex;
    flex-direction: column;
    font-family: ${props => props.theme.typography.fontFamily.sans};
`;
