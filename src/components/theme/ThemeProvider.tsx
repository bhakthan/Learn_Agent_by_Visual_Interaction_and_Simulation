import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  isDarkMode: false,
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Function to synchronize theme across all HTML elements that need it
const syncTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  const body = window.document.body;
  
  // To prevent flashes during theme change, first set a class that will manage
  // the transition, then after a small delay update the actual theme classes
  root.classList.add("theme-transition");
  body.classList.add("theme-transition");
  
  setTimeout(() => {
    // Remove all theme classes
    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");
    
    // Add the new theme class
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Set data attributes for component libraries that use them
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-appearance', theme);
    body.setAttribute('data-theme', theme);
    
    // Remove the transition blocker after changes are complete
    setTimeout(() => {
      root.classList.remove("theme-transition");
      body.classList.remove("theme-transition");
    }, 100);
  }, 10);
};

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => {
      if (typeof window === 'undefined') return defaultTheme;
      
      // Check for saved theme preference
      const savedTheme = localStorage.getItem(storageKey) as Theme;
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        return savedTheme;
      }
      
      // Check for system preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return systemPrefersDark ? "dark" : defaultTheme;
    }
  );

  // Apply theme on initial render and theme changes
  useEffect(() => {
    syncTheme(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = localStorage.getItem(storageKey) as Theme || 
                        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : defaultTheme);
    
    syncTheme(initialTheme);
    setTheme(initialTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no manual preference was set
      if (!localStorage.getItem(storageKey)) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        syncTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [storageKey]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    syncTheme(newTheme);
  };

  const value = {
    theme,
    isDarkMode: theme === "dark",
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      syncTheme(newTheme);
    },
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};