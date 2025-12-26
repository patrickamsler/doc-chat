import styled from "styled-components";

export const FileUploadContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
`;

export const Title = styled.h1`
    text-align: center;
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: 5px;
    margin-top: 30px;
    font-family: ${props => props.theme.typography.fontFamily.mono};
`;

export const Subtitle = styled.p`
    text-align: center;
    color: ${props => props.theme.colors.text.primary};
    margin-top: 0;
    margin-bottom: 20px;
    font-family: ${props => props.theme.typography.fontFamily.mono};
`;

export const UploadBtn = styled.button`
    background-color: ${props => props.theme.colors.primary[600]};
    color: ${props => props.theme.colors.text.inverse};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    padding: ${props => props.theme.components.button.padding.lg};
    border-radius: ${props => props.theme.borderRadius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${props => props.theme.spacing.sm}px;
    border: none;
    cursor: pointer;
    transition: background-color ${props => props.theme.transitions.duration.base};
    font-size: ${props => props.theme.typography.fontSize.base};

    &:hover {
        background-color: ${props => props.theme.colors.primary[700]};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;