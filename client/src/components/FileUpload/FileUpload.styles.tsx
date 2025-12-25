import styled from "styled-components";

export const UploadContainer = styled.div`
    margin-bottom: 20px;
`;

export const UploadButton = styled.button`
    background-color: ${props => props.theme.colors.primary[600]};
    color: ${props => props.theme.colors.background.paper};
    width: 100%;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: ${props => props.theme.colors.primary[800]};
    }

    &:disabled {
        background-color: ${props => props.theme.colors.gray[400]};
        cursor: not-allowed;
    }
`;

export const FileInput = styled.input`
    display: none;
`;
