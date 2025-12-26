import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import Header from './Header';
import theme from '../../theme';

const setup = (propsOverride = {}) => {
  const onMenuClick = jest.fn();
  const props = {onMenuClick, ...propsOverride};
  render(
      <ThemeProvider theme={theme}>
        <Header {...props} />
      </ThemeProvider>
  );
  return {onMenuClick};
};

describe('Header component', () => {
  it('should call onMenuClick when the menu button is clicked', () => {
    const {onMenuClick} = setup();

    const menuButton = screen.getByRole('button');
    userEvent.click(menuButton);

    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it('should render all required UI elements', () => {
    setup();

    // Check for brand title
    expect(screen.getByText('RAG Chat')).toBeInTheDocument();

    // Check for user info
    expect(screen.getByText('Guest User')).toBeInTheDocument();

    // Check for menu button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
