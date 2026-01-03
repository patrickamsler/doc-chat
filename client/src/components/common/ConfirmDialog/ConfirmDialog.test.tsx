import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ConfirmDialog from './ConfirmDialog';
import { theme } from '../../../theme/tokens';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ConfirmDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it('should not render when isOpen is false', () => {
    renderWithTheme(
      <ConfirmDialog
        isOpen={false}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should render with correct title and message when isOpen is true', () => {
    renderWithTheme(
      <ConfirmDialog
        isOpen={true}
        title="Delete Chat"
        message="Are you sure you want to delete this chat?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Delete Chat')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this chat?')).toBeInTheDocument();
  });

  it('should render custom button text', () => {
    renderWithTheme(
      <ConfirmDialog
        isOpen={true}
        title="Test"
        message="Test message"
        confirmText="Yes, Delete"
        cancelText="No, Keep"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    expect(screen.getByText('No, Keep')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    renderWithTheme(
      <ConfirmDialog
        isOpen={true}
        title="Test"
        message="Test message"
        confirmText="Confirm"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', () => {
    renderWithTheme(
      <ConfirmDialog
        isOpen={true}
        title="Test"
        message="Test message"
        cancelText="Cancel"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Escape key is pressed', () => {
    renderWithTheme(
      <ConfirmDialog
        isOpen={true}
        title="Test"
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when overlay is clicked', () => {
    renderWithTheme(
      <ConfirmDialog
        isOpen={true}
        title="Test"
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    // Find the dialog and click its parent (the overlay)
    const dialog = screen.getByRole('dialog');
    const overlay = dialog.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });

  it('should render with danger variant', () => {
    const { container } = renderWithTheme(
      <ConfirmDialog
        isOpen={true}
        title="Delete Chat"
        message="Are you sure?"
        variant="danger"
        confirmText="Delete"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(container).toBeInTheDocument();
    expect(screen.getByText('Delete Chat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
