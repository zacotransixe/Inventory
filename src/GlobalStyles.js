// src/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

// Import the font file if using locally
import AptosDisplay from './Aptos-Display.ttf'; // Make sure the path is correct

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'Aptos Display';
    src: url(${AptosDisplay}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  * {
    font-family: 'Aptos Display', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

export default GlobalStyles;
