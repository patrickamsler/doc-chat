import React, { useEffect, useRef, useState } from 'react';
import {
  DropdownContainer,
  DropdownList,
  DropdownItem,
  ItemIcon,
  ItemLabel
} from './DropdownMenu.styles';

export interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  triggerRef: React.RefObject<HTMLElement | null>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  onClose,
  items,
  triggerRef
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, right: undefined as number | undefined });

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const calculatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const dropdownWidth = 180; // min-width from styles
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = triggerRect.bottom + 4;
      let left = triggerRect.left;
      let right: number | undefined = undefined;

      // Check if dropdown would overflow right edge
      if (left + dropdownWidth > viewportWidth - 16) {
        // Position from right edge instead
        right = viewportWidth - triggerRect.right;
        left = 0; // Reset left when using right
      }

      // Check if dropdown would overflow bottom edge
      if (top + 200 > viewportHeight) {
        // Position above trigger instead
        top = triggerRect.top - 200 - 4;
      }

      setPosition({ top, left, right });
    };

    calculatePosition();
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const handleItemClick = (item: MenuItem) => {
    item.onClick();
    onClose();
  };

  return (
    <DropdownContainer
      ref={dropdownRef}
      $top={position.top}
      $left={position.left}
      $right={position.right}
      role="menu"
    >
      <DropdownList>
        {items.map((item, index) => (
          <li key={index}>
            <DropdownItem
              $variant={item.variant || 'default'}
              onClick={() => handleItemClick(item)}
              role="menuitem"
            >
              {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
              <ItemLabel>{item.label}</ItemLabel>
            </DropdownItem>
          </li>
        ))}
      </DropdownList>
    </DropdownContainer>
  );
};

export default DropdownMenu;
