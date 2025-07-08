import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useKV } from '@github/spark/hooks';

interface EnlightenMeContextType {
  getInsight: (conceptId: string) => string | null;
  saveInsight: (conceptId: string, content: string) => void;
  clearInsight: (conceptId: string) => void;
  clearAllInsights: () => void;
  recentInsights: Record<string, string>;
}

const EnlightenMeContext = createContext<EnlightenMeContextType | null>(null);

export const useEnlightenMe = (): EnlightenMeContextType => {
  const context = useContext(EnlightenMeContext);
  if (!context) {
    throw new Error('useEnlightenMe must be used within an EnlightenMeProvider');
  }
  return context;
};

interface EnlightenMeProviderProps {
  children: ReactNode;
}

export const EnlightenMeProvider: React.FC<EnlightenMeProviderProps> = ({ children }) => {
  // Use KV store for persistence
  const [recentInsights, setRecentInsights] = useKV<Record<string, string>>(
    'enlighten-me-insights',
    {}
  );

  // Get an insight for a specific concept
  const getInsight = (conceptId: string): string | null => {
    return recentInsights[conceptId] || null;
  };

  // Save an insight for a concept
  const saveInsight = (conceptId: string, content: string) => {
    setRecentInsights((current) => ({
      ...current,
      [conceptId]: content,
    }));
  };

  // Clear a specific insight
  const clearInsight = (conceptId: string) => {
    setRecentInsights((current) => {
      const updated = { ...current };
      delete updated[conceptId];
      return updated;
    });
  };

  // Clear all insights
  const clearAllInsights = () => {
    setRecentInsights({});
  };

  return (
    <EnlightenMeContext.Provider
      value={{
        getInsight,
        saveInsight,
        clearInsight,
        clearAllInsights,
        recentInsights,
      }}
    >
      {children}
    </EnlightenMeContext.Provider>
  );
};

export default EnlightenMeProvider;