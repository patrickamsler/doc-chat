import styled from "styled-components";

export const Container = styled.div`
    height: 100vh;
    width: 100%;
    background-color: ${props => props.theme.colors.background.default};
    display: flex;
    flex-direction: column;
`;

export const MainLayout = styled.div`
    flex: 1;
    display: flex;
    overflow: hidden;
`;

export const ContentPanel = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;