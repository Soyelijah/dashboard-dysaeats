import React from 'react';
import { createContext, useContext } from 'react';
import { theme, Theme } from '../theme';

// Crear contexto de tema
const ThemeContext = createContext<Theme>(theme);

// Hook para acceder al tema
export const useTheme = () => useContext(ThemeContext);

// Componente proveedor de tema
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;