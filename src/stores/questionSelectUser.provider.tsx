'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface StringStateContextProps {
  stringValue: string;
  updateStringValue: (newValue: string) => void;
}
interface StringStateProviderProps {
  children: ReactNode;
}

const StringStateContext = createContext<StringStateContextProps | undefined>(undefined);

export const StringStateProvider: React.FC<StringStateProviderProps> = ({ children }) => {
  const [stringValue, setStringValue] = useState('123456');

  const updateStringValue = (newValue: string) => {
    setStringValue(newValue);
  };

  const value = useMemo(
    () => ({
      stringValue,
      updateStringValue,
    }),
    [stringValue]
  );

  return <StringStateContext.Provider value={value}>{children}</StringStateContext.Provider>;
};

export const useStringState = (): StringStateContextProps => {
  const context = useContext(StringStateContext);
  if (!context) {
    throw new Error('useStringState must be used within a StringStateProvider');
  }
  return context;
};
