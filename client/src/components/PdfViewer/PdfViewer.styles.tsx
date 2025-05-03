import styled from "styled-components";

export const PdfContainer = styled.div`
    flex: 1;
    border: 1px solid ${props => props.theme.colors.border};
    overflow: hidden;
    height: 100%;
`;

export const NavigationBar = styled.div`
    align-items: center;
    background-color: #eeeeee;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: flex-end;
    padding: 4px;
`;

export const NavigationButtonContainer = styled.div`
    padding: 0 2px;
    display: flex;
    justify-content: center;
    font-family: Arial, sans-serif;
    font-size: 14px;
`;