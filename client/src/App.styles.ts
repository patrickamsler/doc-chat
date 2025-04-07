import styled from "styled-components";

export const AppContainer = styled.div`
    margin: 0 auto;
    padding: 20px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    max-width: 1600px;
    overflow: hidden;
`;

export const Title = styled.h1`
    text-align: center;
    color: ${props => props.theme.colors.text};
    margin-bottom: 5px;
    margin-top: 30px;
    font-family: ${props => props.theme.fonts.main};
`;

export const Subtitle = styled.p`
    text-align: center;
    color: ${props => props.theme.colors.lightText};
    margin-top: 0;
    margin-bottom: 20px;
    font-family: ${props => props.theme.fonts.main};
`;

export const ContentContainer = styled.div`
    display: flex;
    flex: 1;
    height: 100%;
    gap: 15px;
    overflow: hidden;
`;

export const ContentPanel = styled.div`
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
`;