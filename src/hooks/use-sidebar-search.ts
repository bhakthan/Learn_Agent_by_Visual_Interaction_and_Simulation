import { useState, useMemo, useCallback } from 'react';
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
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    Object.entries(categories).forEach(([category, patterns]) => {
      const matchedPatterns = patterns.filter(pattern => 
        // Check if ALL search terms are found in either name or description
        searchTerms.every(term => 
          pattern.name.toLowerCase().includes(term) ||
          pattern.description.toLowerCase().includes(term)
        )
      );
      
      if (matchedPatterns.length > 0) {
        filtered[category] = matchedPatterns;
      }
    });
    
    return filtered;
  }, [categories, searchQuery]);
  
  // Group items by category
  const groupByCategory = useCallback(() => {
    const categorized: Record<string, PatternData[]> = {};
    
    items.forEach(item => {
      const category = item.category || 'General';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(item);
    });
    
    // Sort each category's patterns alphabetically
    Object.keys(categorized).forEach(category => {
      categorized[category].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    setCategories(categorized);
  }, [items]);

  // Highlight matching text in search results
  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    if (searchTerms.length === 0) return text;
    
    // Simple implementation - this doesn't handle overlapping matches correctly
    let highlightedText = text;
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
  }, []);
  
  return {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    groupByCategory,
    categories,
    highlightText,
  };
}