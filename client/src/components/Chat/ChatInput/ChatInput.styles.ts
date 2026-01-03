import styled, { keyframes } from "styled-components";

const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

export const InputContainer = styled.div`
    display: flex;
    padding: 24px;
    background-color: ${props => props.theme.colors.background.paper};
    gap: 8px;
`;

export const MessageInput = styled.textarea`
    flex: 1;
    min-height: 22px;
    max-height: 150px;
    padding: 10px 10px 0 10px;
    background-color: ${props => props.theme.colors.background.paper};
    border: 1px solid ${props => props.theme.colors.border.dark};
    border-radius: ${props => props.theme.borderRadius.lg};
    font-size: 16px;
    color: ${props => props.theme.colors.text.primary};
    font-family: ${props => props.theme.typography.fontFamily.sans};
    resize: none; /* Prevent manual resizing */
    overflow-y: auto; /* Enable vertical scrolling when content exceeds max-height */
    line-height: 1.5;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.primary[300]};
    }

    &:disabled {
        background-color: ${props => props.theme.colors.gray[50]};
        cursor: not-allowed;
    }
`;

export const SendButton = styled.button<{ $height?: number }>`
    // margin-left: 5px;
    width: 60px;
    min-height: 22px;
    height: ${({$height}) => ($height ? `${$height}px` : '40px')};
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${props => props.theme.colors.primary[600]};
    color: ${props => props.theme.colors.text.inverse};
    border: none;
    border-radius: ${props => props.theme.borderRadius.lg};
    font-size: 20px;
    font-family: ${props => props.theme.typography.fontFamily.sans};
    transition: background-color ${props => props.theme.transitions.duration.base};

    &:hover:not(:disabled) {
        background-color: ${props => props.theme.colors.primary[700]};
        cursor: pointer;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        /* Make sure the icon is centered and sized appropriately */
        width: 20px;
        height: 20px;
    }
`;

export const SpinningIcon = styled.span`
    display: inline-flex;
    animation: ${spin} 1s linear infinite;
`;

