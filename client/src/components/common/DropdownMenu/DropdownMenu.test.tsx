import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import DropdownMenu, { MenuItem } from './DropdownMenu';
import { theme } from '../../../theme/tokens';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('DropdownMenu', () => {
  const mockOnClose = jest.fn();
  const mockOnClick1 = jest.fn();
  const mockOnClick2 = jest.fn();

  const triggerRef = React.createRef<HTMLButtonElement>();

  const menuItems: MenuItem[] = [
    {
      label: 'Clear history',
      onClick: mockOnClick1,
      variant: 'default'
    },
    {
      label: 'Delete chat',
      onClick: mockOnClick2,
      variant: 'danger'
    }
  ];

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnClick1.mockClear();
    mockOnClick2.mockClear();

    // Create a mock trigger button in the DOM
    const button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.top = '100px';
    button.style.left = '100px';
    document.body.appendChild(button);
    (triggerRef as any).current = button;
  });

  afterEach(() => {
    // Clean up
    if (triggerRef.current) {
      document.body.removeChild(triggerRef.current);
    }
  });

  it('should not render when isOpen is false', () => {
    renderWithTheme(
      <DropdownMenu
        isOpen={false}
        onClose={mockOnClose}
        items={menuItems}
        triggerRef={triggerRef}
      />
    );

    expect(screen.queryByText('Clear history')).not.toBeInTheDocument();
  });

  it('should render menu items when isOpen is true', () => {
    renderWithTheme(
      <DropdownMenu
        isOpen={true}
        onClose={mockOnClose}
        items={menuItems}
        triggerRef={triggerRef}
      />
    );

    expect(screen.getByText('Clear history')).toBeInTheDocument();
    expect(screen.getByText('Delete chat')).toBeInTheDocument();
  });

  it('should call onClick handler and close menu when item is clicked', () => {
    renderWithTheme(
      <DropdownMenu
        isOpen={true}
        onClose={mockOnClose}
        items={menuItems}
        triggerRef={triggerRef}
      />
    );

    const clearHistoryItem = screen.getByText('Clear history');
    fireEvent.click(clearHistoryItem);

    expect(mockOnClick1).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call second item onClick handler when clicked', () => {
    renderWithTheme(
      <DropdownMenu
        isOpen={true}
        onClose={mockOnClose}
        items={menuItems}
        triggerRef={triggerRef}
      />
    );

    const deleteChatItem = screen.getByText('Delete chat');
    fireEvent.click(deleteChatItem);

    expect(mockOnClick2).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    renderWithTheme(
      <DropdownMenu
        isOpen={true}
        onClose={mockOnClose}
        items={menuItems}
        triggerRef={triggerRef}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside the menu', () => {
    renderWithTheme(
      <DropdownMenu
        isOpen={true}
        onClose={mockOnClose}
        items={menuItems}
        triggerRef={triggerRef}
      />
    );

    // Click outside (on document body)
    fireEvent.mouseDown(document.body);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render items with icons', () => {
    const itemsWithIcons: MenuItem[] = [
      {
        label: 'Item with icon',
        onClick: mockOnClick1,
        icon: <span data-testid="test-icon">Icon</span>
      }
    ];

    renderWithTheme(
      <DropdownMenu
        isOpen={true}
        onClose={mockOnClose}
        items={itemsWithIcons}
        triggerRef={triggerRef}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Item with icon')).toBeInTheDocument();
  });

  it('should render danger variant items', () => {
    const dangerItems: MenuItem[] = [
      {
        label: 'Dangerous action',
        onClick: mockOnClick1,
        variant: 'danger'
      }
    ];

    renderWithTheme(
      <DropdownMenu
        isOpen={true}
        onClose={mockOnClose}
        items={dangerItems}
        triggerRef={triggerRef}
      />
    );

    expect(screen.getByText('Dangerous action')).toBeInTheDocument();
  });
});
