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
import { BookmarkSimple, CaretRight, GraduationCap, Keyboard, Lightbulb, MagnifyingGlass, Robot, X } from '@phosphor-icons/react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarSearch } from '@/hooks/use-sidebar-search';
import { useSidebarCollapse } from '@/hooks/use-sidebar-collapse';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  
  const { isCollapsed, toggleSidebar } = useSidebarCollapse();
  
  // Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If "/" is pressed, focus the search input
      if (e.key === '/' && !isCollapsed && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.querySelector('.pattern-search-input') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
      
      // If "Escape" is pressed while the sidebar is open, collapse it
      if (e.key === 'Escape' && !isCollapsed) {
        toggleSidebar();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, toggleSidebar]);

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

  const CollapsedSidebarButton = () => {
    return (
      <div className="fixed top-[50%] -translate-y-1/2 left-0 z-40">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-r-full rounded-l-none shadow-md hover:shadow-lg sidebar-transition hover:translate-x-1 hover:bg-primary hover:text-primary-foreground group bg-primary/5"
                onClick={toggleSidebar}
                aria-label="Show patterns sidebar"
              >
                <CaretRight size={16} className="mr-1 group-hover:animate-pulse" />
                <span className="text-xs">Patterns</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-primary-foreground">
              <div className="flex items-center gap-1">
                <p>Show pattern navigation</p>
                <kbd className="px-1.5 py-0.5 text-xs rounded bg-primary-foreground/20 font-mono text-xs ml-1">
                  <span className="text-xs">/</span>
                </kbd>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <div className="relative">
      {isCollapsed && <CollapsedSidebarButton />}
      
      <div 
        className={cn(
          "border-r border-border bg-background shadow-md sidebar-transition fixed z-30 top-[142px] flex flex-col",
          isCollapsed 
            ? "-translate-x-full opacity-0 pointer-events-none" 
            : "translate-x-0 opacity-100"
        )}
        style={{ width: '250px', maxHeight: 'calc(100vh - 150px)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 flex flex-col gap-2 border-b border-border">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Agent Patterns</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-muted transition-transform duration-200 hover:rotate-90"
                onClick={toggleSidebar}
                aria-label="Close sidebar"
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="relative">
              <div className="relative">
                <input 
                  placeholder="Search patterns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pattern-search-input w-full py-1 px-3 pl-8 pr-8 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <div className="absolute right-0 bottom-[-24px] flex items-center gap-1 text-muted-foreground">
                  <Keyboard size={12} />
                  <kbd className="text-[10px] font-mono px-1 rounded bg-muted">
                    /
                  </kbd>
                  <span className="text-[10px]">to search</span>
                  <span className="mx-1 text-[10px]">·</span>
                  <kbd className="text-[10px] font-mono px-1 rounded bg-muted">
                    Ctrl+/
                  </kbd>
                  <span className="text-[10px]">toggle</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pattern List */}
          <ScrollArea className="flex-1 overflow-y-auto p-2">
            {Object.entries(filteredCategories).length > 0 ? (
              Object.entries(filteredCategories).map(([categoryName, patterns]) => (
                <div key={categoryName} className="mb-4">
                  <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground">
                    {getCategoryIcon(categoryName)}
                    <span>{categoryName}</span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {patterns.map(pattern => (
                      <TooltipProvider key={pattern.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm",
                                activePatternId === pattern.id 
                                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                                  : "hover:bg-muted"
                              )}
                              onClick={() => onPatternSelect(pattern.id)}
                            >
                              <span>{pattern.name}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs text-sm">
                            {pattern.description}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
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
        </div>
      </div>
    </div>
  );
}