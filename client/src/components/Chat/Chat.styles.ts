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
    max-width: 70%;
    padding: 10px 15px;
    margin: 5px 0;
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
    margin-left: auto;
    margin-right: 0;
`;

export const AssistantMessage = styled(MessageBase)`
    align-self: flex-start;
    background-color: ${props => props.theme.colors.background.paper};
    margin-left: 0;
    margin-right: auto;
`;

export const MessagesList = styled.div`
    display: flex;
    flex-direction: column;
    font-family: ${props => props.theme.typography.fontFamily.sans};
`;
