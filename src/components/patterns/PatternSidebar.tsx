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
  SidebarMenuButton,
  SidebarInput,
  useSidebar
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { agentPatterns } from '@/lib/data/patterns';
import { BookmarkSimple, GraduationCap, Lightbulb, MagnifyingGlass, Robot, X } from '@phosphor-icons/react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarSearch } from '@/hooks/use-sidebar-search';

interface PatternSidebarProps {
  activePatternId: string;
  onPatternSelect: (id: string) => void;
}

export function PatternSidebar({ activePatternId, onPatternSelect }: PatternSidebarProps) {
  const { 
    searchQuery, 
    setSearchQuery,
    filteredCategories,
    groupByCategory,
    categories
  } = useSidebarSearch(agentPatterns);
  
  // Group patterns by category on component mount
  useEffect(() => {
    groupByCategory();
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

  // Component for collapsed sidebar with expand button
  const CollapsedSidebar = () => {
    const { toggleSidebar } = useSidebar();
    
    return (
      <div className="fixed top-[50%] -translate-y-1/2 left-0 z-20">
        <Button 
          variant="outline" 
          size="sm"
          className="rounded-r-full rounded-l-none shadow-md animate-pulse transition-all duration-300 hover:translate-x-1 hover:animate-none"
          onClick={toggleSidebar}
        >
          <MagnifyingGlass size={18} className="mr-1" />
          <span className="text-xs">Patterns</span>
        </Button>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
        <CollapsedSidebar />
        <Sidebar 
          side="left" 
          variant="floating" 
          className="border-r border-border transition-transform duration-300 ease-in-out"
          collapsible="offcanvas"
        >
          <SidebarHeader className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Agent Patterns</h3>
              <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-transform duration-200 hover:rotate-90" />
            </div>
            
            <div className="relative">
              <SidebarInput 
                placeholder="Search patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 transition-all duration-200"
              />
              <MagnifyingGlass size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          </SidebarHeader>
          <Separator className="mb-2" />
          <SidebarContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              {Object.entries(filteredCategories).length > 0 ? (
                Object.entries(filteredCategories).map(([categoryName, patterns]) => (
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
                            tooltip={pattern.description}
                            className={cn(
                              "transition-all duration-200",
                              activePatternId === pattern.id 
                                ? "bg-primary/10 hover:bg-primary/20" 
                                : "hover:bg-muted"
                            )}
                          >
                            <span>{pattern.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroup>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <p>No patterns found</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </Button>
                </div>
              )}
            </ScrollArea>
          </SidebarContent>
        </Sidebar>
      </div>
    </SidebarProvider>
  );
}