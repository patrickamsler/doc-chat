import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Header from './Header';
import theme from '../../theme';

const setup = (propsOverride = {}) => {
  const onMenuClick = jest.fn();
  const props = { onMenuClick, ...propsOverride };
  render(
    <ThemeProvider theme={theme}>
      <Header {...props} />
    </ThemeProvider>
  );
  return { onMenuClick };
};

describe('Header component', () => {
  it('should render', () => {
    setup();
  });
});
