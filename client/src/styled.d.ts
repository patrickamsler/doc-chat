import 'styled-components';
import { Theme } from './theme/index';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}