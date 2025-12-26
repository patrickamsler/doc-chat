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
    padding: 0.75rem 1.5rem;
    border-radius: ${props => props.theme.borderRadius.lg};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
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