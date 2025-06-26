import { useState, useMemo } from 'react';
import { agentPatterns } from '@/lib/data/patterns';

interface PatternData {
  id: string;
  name: string;
  description: string;
  category?: string;
  [key: string]: any;
}

export function useSidebarSearch(items: PatternData[] = agentPatterns) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Record<string, PatternData[]>>({});
  
  // Group and filter patterns based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const filtered: Record<string, PatternData[]> = {};
    
    Object.entries(categories).forEach(([category, patterns]) => {
      const matchedPatterns = patterns.filter(pattern => 
        pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pattern.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchedPatterns.length > 0) {
        filtered[category] = matchedPatterns;
      }
    });
    
    return filtered;
  }, [categories, searchQuery]);
  
  // Group items by category
  const groupByCategory = () => {
    const categorized: Record<string, PatternData[]> = {};
    
    items.forEach(item => {
      const category = item.category || 'General';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(item);
    });
    
    setCategories(categorized);
  };
  
  return {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    groupByCategory,
    categories,
  };
}