
import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  isCompactView: boolean;
  toggleDarkMode: () => void;
  toggleCompactView: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    const storedCompactView = localStorage.getItem('compactView');
    
    if (storedDarkMode) setIsDarkMode(storedDarkMode === 'true');
    if (storedCompactView) setIsCompactView(storedCompactView === 'true');
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // Update primary color CSS variables when dark mode changes
    if (isDarkMode) {
      document.documentElement.style.setProperty('--primary', '226 69% 49%'); // consistent blue in dark mode
    } else {
      document.documentElement.style.setProperty('--primary', '226 69% 49%'); // consistent blue in light mode
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('compactView', isCompactView.toString());
    document.documentElement.classList.toggle('compact', isCompactView);
  }, [isCompactView]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleCompactView = () => setIsCompactView(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, isCompactView, toggleDarkMode, toggleCompactView }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
