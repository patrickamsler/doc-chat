import styled from "styled-components";

export const UploadContainer = styled.div`
    margin-bottom: 20px;
`;

export const UploadButton = styled.button`
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.white};
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: ${props => props.theme.colors.secondary};
    }

    &:disabled {
        background-color: ${props => props.theme.colors.disabled};
        cursor: not-allowed;
    }
`;

export const FileInput = styled.input`
    display: none;
`;
