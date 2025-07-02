import { useState, useMemo } from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';

export type FlowColorType = 'query' | 'response' | 'tool_call' | 'observation' | 'reflection' | 'plan' | 'message' | 'data' | 'error';

export interface FlowColorStyle {
  color: string;
  fill?: string;
  strokeWidth?: number;
}

/**
 * Custom hook for managing flow visualization colors
 * @param initialColors Optional initial color mapping
 * @returns {Object} Color map and functions to update it
 */
export function useFlowColors(initialColors?: Record<FlowColorType, FlowColorStyle>) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Default colors based on theme
  const defaultColors = useMemo(() => {
    return {
      query: {
        color: isDarkMode ? 'rgba(96, 165, 250, 0.9)' : 'rgba(59, 130, 246, 0.9)', // Blue
        strokeWidth: 4,
      },
      response: {
        color: isDarkMode ? 'rgba(52, 211, 153, 0.9)' : 'rgba(16, 185, 129, 0.9)', // Green
        strokeWidth: 4,
      },
      tool_call: {
        color: isDarkMode ? 'rgba(251, 191, 36, 0.9)' : 'rgba(245, 158, 11, 0.9)', // Amber
        strokeWidth: 4,
      },
      observation: {
        color: isDarkMode ? 'rgba(167, 139, 250, 0.9)' : 'rgba(139, 92, 246, 0.9)', // Purple
        strokeWidth: 4,
      },
      reflection: {
        color: isDarkMode ? 'rgba(244, 114, 182, 0.9)' : 'rgba(236, 72, 153, 0.9)', // Pink
        strokeWidth: 3,
      },
      plan: {
        color: isDarkMode ? 'rgba(52, 211, 153, 0.9)' : 'rgba(22, 163, 74, 0.9)', // Emerald
        strokeWidth: 4,
      },
      error: {
        color: isDarkMode ? 'rgba(248, 113, 113, 0.9)' : 'rgba(239, 68, 68, 0.9)', // Red
        strokeWidth: 5,
      },
      data: {
        color: isDarkMode ? 'rgba(252, 211, 77, 0.9)' : 'rgba(234, 179, 8, 0.9)', // Yellow
        strokeWidth: 4,
      },
      message: {
        color: isDarkMode ? 'rgba(147, 197, 253, 0.9)' : 'rgba(59, 130, 246, 0.9)', // Blue
        strokeWidth: 4,
      },
    };
  }, [isDarkMode]);

  // State for custom colors that override defaults
  const [customColors, setCustomColors] = useState<Record<string, FlowColorStyle>>(initialColors || {});

  // Combine default and custom colors
  const colorMap = useMemo(() => {
    return { ...defaultColors, ...customColors };
  }, [defaultColors, customColors]);

  // Function to update a specific flow type color
  const updateFlowColor = (type: FlowColorType, style: Partial<FlowColorStyle>) => {
    setCustomColors(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...style,
      }
    }));
  };

  // Function to reset colors to defaults
  const resetColors = () => {
    setCustomColors({});
  };

  // Function to set all custom colors at once
  const setAllColors = (colors: Record<string, FlowColorStyle>) => {
    setCustomColors(colors);
  };

  return {
    colorMap,
    updateFlowColor,
    resetColors,
    setAllColors,
    defaultColors,
  };
}

export default useFlowColors;