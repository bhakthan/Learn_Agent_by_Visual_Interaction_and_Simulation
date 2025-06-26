import { createContext, useContext, ReactNode } from 'react';
import { useSidebarCollapse } from '@/hooks/use-sidebar-collapse';

type SidebarContextType = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

// Create the context with a default value
const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

// Provider component
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const { isCollapsed, toggleSidebar } = useSidebarCollapse();

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook to use the sidebar context
export const useSidebarContext = () => {
  return useContext(SidebarContext);
};