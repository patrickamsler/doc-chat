import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    html, body, #root {
        height: 100%;
        margin: 0;
        overflow: hidden;
        text-align: center;
    }
`;

export default GlobalStyle;