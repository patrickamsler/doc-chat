import styled from 'styled-components';

export const DropdownContainer = styled.div<{ $top: number; $left: number; $right?: number }>`
  position: fixed;
  top: ${props => props.$top}px;
  ${props => props.$right !== undefined ? `right: ${props.$right}px;` : `left: ${props.$left}px;`}
  z-index: ${props => props.theme.zIndex.dropdown};
  background-color: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border.main};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.md};
  min-width: 180px;
  animation: fadeInScale ${props => props.theme.transitions.duration.fast} ease-out;

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const DropdownList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 4px;
`;

export const DropdownItem = styled.button<{ $variant?: 'default' | 'danger' }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: background-color ${props => props.theme.transitions.duration.base};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.$variant === 'danger'
    ? props.theme.colors.error.main
    : props.theme.colors.text.primary};
  text-align: left;

  &:hover {
    background-color: ${props => props.$variant === 'danger'
      ? `${props.theme.colors.error.main}10`
      : props.theme.colors.gray[100]};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary[500]};
    outline-offset: -2px;
  }
`;

export const ItemIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

export const ItemLabel = styled.span`
  flex: 1;
  white-space: nowrap;
`;
