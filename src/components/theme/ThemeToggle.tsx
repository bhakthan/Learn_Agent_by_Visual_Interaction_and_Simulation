import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "@phosphor-icons/react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon size={18} weight="fill" className="text-foreground" />
      ) : (
        <Sun size={18} weight="fill" className="text-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}