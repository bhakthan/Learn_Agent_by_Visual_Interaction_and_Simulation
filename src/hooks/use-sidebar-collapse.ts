import { useEffect, useState } from 'react';

export function useSidebarCollapse(storageKey = 'sidebar-collapsed-state') {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Try to get the state from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(storageKey);
      // Default to expanded unless explicitly set to collapsed
      return savedState === 'collapsed';
    }
    return false; // Default to expanded
  });
  
  const [isMobile, setIsMobile] = useState(false);

  // Save to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem(storageKey, isCollapsed ? 'collapsed' : 'expanded');
  }, [isCollapsed, storageKey]);

  // Check if the device is mobile on mount and window resize
  useEffect(() => {
    const checkWidth = () => {
      const isMobileView = window.innerWidth < 768; // 768px is typically the md breakpoint
      setIsMobile(isMobileView);
      
      // If it's the first load and on mobile, collapse the sidebar
      const isFirstLoad = localStorage.getItem(`${storageKey}-initialized`) !== 'true';
      if (isFirstLoad && isMobileView) {
        setIsCollapsed(true);
        localStorage.setItem(`${storageKey}-initialized`, 'true');
      }
    };

    // Initial check
    checkWidth();

    // Add resize listener
    window.addEventListener('resize', checkWidth);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkWidth);
  }, [storageKey]);

  // Add keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with slash key
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  return {
    isCollapsed,
    setIsCollapsed,
    isMobile,
    toggleSidebar
  };
}