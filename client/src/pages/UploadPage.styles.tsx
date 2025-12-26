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