import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only show the toggle after hydration to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handler with extra console logging for debugging
  const handleToggleTheme = () => {
    console.log(`Toggling theme from ${theme} to ${theme === "light" ? "dark" : "light"}`);
    toggleTheme();
  };
  
  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder with same dimensions
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleTheme}
            className={`rounded-full h-9 w-9 ${
              theme === "light" 
              ? "border-primary/20 bg-background" 
              : "border-primary/40 bg-primary/10"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={18} weight="fill" className="text-primary" />
            ) : (
              <Sun size={18} weight="fill" className="text-primary" />
            )}
            <span className="sr-only">
              {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{theme === "light" ? "Switch to dark mode" : "Switch to light mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}