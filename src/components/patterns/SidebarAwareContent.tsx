import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useSidebarCollapse } from '@/hooks/use-sidebar-collapse';
import { SidebarProvider } from '@/contexts/SidebarContext';

interface SidebarAwareContentProps {
  children: ReactNode;
}

export function SidebarAwareContent({ children }: SidebarAwareContentProps) {
  const { isCollapsed } = useSidebarCollapse();
  
  return (
    <SidebarProvider>
      <div 
        className={cn(
          "flex-1 w-full max-w-full transition-all duration-300 ease-in-out",
          isCollapsed ? "pl-0" : "pl-[260px]"
        )}
      >
        {children}
      </div>
    </SidebarProvider>
  );
}