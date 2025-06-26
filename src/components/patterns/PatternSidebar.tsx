import { useState, useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { agentPatterns } from '@/lib/data/patterns';
import { BookmarkSimple, GraduationCap, Lightbulb, Robot } from '@phosphor-icons/react';
import { Separator } from "@/components/ui/separator";

interface PatternSidebarProps {
  activePatternId: string;
  onPatternSelect: (id: string) => void;
}

export function PatternSidebar({ activePatternId, onPatternSelect }: PatternSidebarProps) {
  const [categories, setCategories] = useState<Record<string, typeof agentPatterns>>({});
  
  // Group patterns by category
  useEffect(() => {
    const categorized: Record<string, typeof agentPatterns> = {};
    
    // Group patterns by their categories
    agentPatterns.forEach(pattern => {
      const category = pattern.category || 'General';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(pattern);
    });
    
    setCategories(categorized);
  }, []);

  // Get appropriate icon for pattern category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Core':
        return <Robot />;
      case 'Advanced':
        return <GraduationCap />;
      case 'Specialized':
        return <Lightbulb />;
      default:
        return <BookmarkSimple />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
        <Sidebar side="left" variant="floating" className="border-r border-border">
          <SidebarHeader className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Agent Patterns</h3>
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          </SidebarHeader>
          <Separator className="mb-2" />
          <SidebarContent>
            <ScrollArea className="h-[calc(100vh-180px)]">
              {Object.entries(categories).map(([categoryName, patterns]) => (
                <SidebarGroup key={categoryName}>
                  <SidebarGroupLabel className="flex items-center gap-2">
                    {getCategoryIcon(categoryName)}
                    <span>{categoryName}</span>
                  </SidebarGroupLabel>
                  <SidebarMenu>
                    {patterns.map(pattern => (
                      <SidebarMenuItem key={pattern.id}>
                        <SidebarMenuButton
                          onClick={() => onPatternSelect(pattern.id)}
                          isActive={activePatternId === pattern.id}
                          tooltip={pattern.name}
                        >
                          <span>{pattern.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              ))}
            </ScrollArea>
          </SidebarContent>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
}