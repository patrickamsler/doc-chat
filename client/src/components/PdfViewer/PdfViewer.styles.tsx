import styled from "styled-components";

export const ViewerContainer = styled.div`
    flex: 1;
    overflow-y: auto; /* Forces the vertical scrollbar */
`;

export const NavigationBar = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 4px;
    height: 30px;
`;

export const FileNameContainer = styled.div`
    font-family: ${props => props.theme.fonts.body}
    font-size: 16px;
    font-weight: 700;
    margin-left: 30px;
    padding-left: 8px;
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