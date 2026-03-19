import React, { createContext, useContext, useState, useEffect } from 'react';

interface DevModeContextType {
  isDevMode: boolean;
  isDevModeAllowed: boolean;
  toggleDevMode: () => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDevModeAllowed = import.meta.env.VITE_DEV_MODE_ALLOWED === 'true';
  const [isDevMode, setIsDevMode] = useState(() => {
    if (!isDevModeAllowed) return false;
    return localStorage.getItem('isDevMode') === 'true';
  });

  useEffect(() => {
    if (isDevModeAllowed) {
      localStorage.setItem('isDevMode', isDevMode.toString());
    } else {
      localStorage.removeItem('isDevMode');
      setIsDevMode(false);
    }
  }, [isDevMode, isDevModeAllowed]);

  const toggleDevMode = () => {
    if (isDevModeAllowed) {
      setIsDevMode(prev => !prev);
    }
  };

  return (
    <DevModeContext.Provider value={{ isDevMode, isDevModeAllowed, toggleDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
};

export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (context === undefined) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
};
