import React, { createContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem('sidebarOpen');
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', isOpen.toString());
  }, [isOpen]);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
};
