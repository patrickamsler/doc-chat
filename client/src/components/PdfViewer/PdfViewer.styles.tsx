import styled from "styled-components";

export const ViewerContainer = styled.div`
    flex: 1;
    overflow-y: auto; /* Forces the vertical scrollbar */

    .rpv-core__inner-page {
        background-color: ${props => props.theme.colors.gray[50]};
    }

`;

export const NavigationBar = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 4px;
    height: 30px;
    background-color: ${props => props.theme.colors.gray[50]};
    font-family: ${props => props.theme.typography.fontFamily.sans};
    border-bottom: 1px solid ${props => props.theme.colors.border.main};
`;

export const FileNameContainer = styled.div`
    color: ${props => props.theme.colors.text.primary};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    padding-left: 8px;
    padding-right: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const NavigationControls = styled.div`
    display: flex;
    align-items: center;
`;

export const NavigationButtonContainer = styled.div`
    padding: 0 2px;
    display: flex;
    justify-content: center;
    font-size: 14px;
    white-space: nowrap;
`;