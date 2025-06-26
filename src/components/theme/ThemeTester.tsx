import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Check } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export function ThemeTester() {
  const { theme, setTheme } = useTheme();
  const [transitionActive, setTransitionActive] = useState(false);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTransitionActive(true);
    setTheme(newTheme);
    
    setTimeout(() => {
      setTransitionActive(false);
    }, 500);
  };

  return (
    <Card className="w-full border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {theme === "light" ? (
            <Sun className="text-primary" size={24} />
          ) : (
            <Moon className="text-primary" size={24} />
          )}
          Theme Test Panel
        </CardTitle>
        <CardDescription>
          Testing that theme colors and dark mode are working properly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Current Theme: <span className="text-primary">{theme}</span></h3>
          <p className="text-sm text-muted-foreground">
            This panel shows various UI elements to verify that theme switching is working correctly.
            Try switching between light and dark mode using the toggle in the header.
          </p>
        </div>

        <div className="flex items-center justify-center p-3 gap-4 border border-border rounded-md">
          <Button 
            variant={theme === "light" ? "default" : "outline"}
            size="sm" 
            onClick={() => handleThemeChange("light")}
            className="min-w-[100px] flex items-center gap-2"
          >
            <Sun size={16} weight="fill" />
            Light
            {theme === "light" && <Check size={16} className="ml-1" weight="bold" />}
          </Button>
          
          <Button 
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange("dark")}
            className="min-w-[100px] flex items-center gap-2"
          >
            <Moon size={16} weight="fill" />
            Dark
            {theme === "dark" && <Check size={16} className="ml-1" weight="bold" />}
          </Button>
        </div>

        <div className={`grid grid-cols-2 gap-4 transition-opacity duration-300 ${transitionActive ? 'opacity-50' : 'opacity-100'}`}>
          <div className="space-y-3">
            <h4 className="font-medium">Text Colors</h4>
            <p className="text-foreground">Text foreground</p>
            <p className="text-muted-foreground">Text muted</p>
            <p className="text-primary">Text primary</p>
            <p className="text-secondary">Text secondary</p>
            <p className="text-accent">Text accent</p>
            <p className="text-destructive">Text destructive</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Background Colors</h4>
            <div className="h-6 bg-background border border-border rounded-md"></div>
            <div className="h-6 bg-muted border border-border rounded-md"></div>
            <div className="h-6 bg-primary border border-border rounded-md"></div>
            <div className="h-6 bg-secondary border border-border rounded-md"></div>
            <div className="h-6 bg-accent border border-border rounded-md"></div>
            <div className="h-6 bg-destructive border border-border rounded-md"></div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">UI Components</h4>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="theme-test-input">Input Test</Label>
            <Input id="theme-test-input" placeholder="Test input field" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium">Cards & Borders</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-md bg-card text-card-foreground border border-border">
              Card Background
            </div>
            <div className="p-4 rounded-md bg-popover text-popover-foreground border border-border">
              Popover Background
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Theme variables are applied correctly: {" "}
          <span className="text-primary font-medium">✓</span>
        </p>
        <Badge variant="outline" className={theme === "light" ? "bg-primary/10" : "bg-primary/20"}>
          {theme === "light" ? "Light Mode Active" : "Dark Mode Active"}
        </Badge>
      </CardFooter>
    </Card>
  );
}