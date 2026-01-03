import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.overlay};
  animation: fadeIn ${props => props.theme.transitions.duration.base} ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const DialogContainer = styled.div`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  max-width: 400px;
  width: 90%;
  z-index: ${props => props.theme.zIndex.modal};
  animation: slideIn ${props => props.theme.transitions.duration.base} ease-in-out;

  @keyframes slideIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export const DialogHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

export const DialogTitle = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
`;

export const DialogMessage = styled.p`
  padding: 16px 24px;
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
`;

export const DialogActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid ${props => props.theme.colors.border.light};
`;

export const CancelButton = styled.button`
  padding: 8px 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  border: 1px solid ${props => props.theme.colors.border.main};
  background-color: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  transition: all ${props => props.theme.transitions.duration.base};

  &:hover {
    background-color: ${props => props.theme.colors.gray[50]};
    border-color: ${props => props.theme.colors.gray[300]};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

export const ConfirmButton = styled.button<{ $variant?: 'danger' | 'warning' | 'info' }>`
  padding: 8px 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  border: none;
  background-color: ${props => {
    switch (props.$variant) {
      case 'danger':
        return props.theme.colors.error.main;
      case 'warning':
        return props.theme.colors.warning?.main || '#f59e0b';
      case 'info':
      default:
        return props.theme.colors.primary[600];
    }
  }};
  color: ${props => props.theme.colors.text.inverse};
  transition: all ${props => props.theme.transitions.duration.base};

  &:hover {
    background-color: ${props => {
      switch (props.$variant) {
        case 'danger':
          return props.theme.colors.error.dark;
        case 'warning':
          return props.theme.colors.warning?.dark || '#d97706';
        case 'info':
        default:
          return props.theme.colors.primary[700];
      }
    }};
  }

  &:focus {
    outline: 2px solid ${props => {
      switch (props.$variant) {
        case 'danger':
          return props.theme.colors.error.light;
        case 'warning':
          return props.theme.colors.warning?.light || '#fbbf24';
        case 'info':
        default:
          return props.theme.colors.primary[400];
      }
    }};
    outline-offset: 2px;
  }
`;
