import React, { useEffect, useRef } from 'react';
import {
  Overlay,
  DialogContainer,
  DialogHeader,
  DialogTitle,
  DialogMessage,
  DialogActions,
  CancelButton,
  ConfirmButton
} from './ConfirmDialog.styles';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info'
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus cancel button when dialog opens
    cancelButtonRef.current?.focus();

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <DialogContainer role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <DialogHeader>
          <DialogTitle id="dialog-title">{title}</DialogTitle>
        </DialogHeader>
        <DialogMessage>{message}</DialogMessage>
        <DialogActions>
          <CancelButton ref={cancelButtonRef} onClick={onCancel}>
            {cancelText}
          </CancelButton>
          <ConfirmButton $variant={variant} onClick={onConfirm}>
            {confirmText}
          </ConfirmButton>
        </DialogActions>
      </DialogContainer>
    </Overlay>
  );
};

export default ConfirmDialog;
