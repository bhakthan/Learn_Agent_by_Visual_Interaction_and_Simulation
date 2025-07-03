import { useTheme } from '@/components/theme/ThemeProvider';
import { DataFlowType } from './dataFlowUtils';

// Types for flow edge styles
interface FlowStyleParams {
  color: string;
  textColor?: string;
  strokeWidth?: number;
  dotSize?: number;
  pulseSpeed?: number;
  fill?: string;
}

/**
 * Hook for consistent visualization theme and styling
 */
export function useVisualizationTheme() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Get background style parameters
  const background = {
    gap: 12,
    size: 1,
    color: isDarkMode ? '#ffffff20' : '#aaa'
  };
  
  // Get edge style parameters
  const edges = {
    default: {
      stroke: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)',
      strokeWidth: 1.5
    },
    animated: {
      stroke: 'var(--primary)',
      strokeWidth: 2
    }
  };
  
  // Get flow styles based on flow type
  const getFlowStyle = (type: DataFlowType): FlowStyleParams => {
    switch (type) {
      case 'query':
        return { 
          color: isDarkMode ? '#60a5fa' : '#2563eb',
          strokeWidth: 2,
          dotSize: 6,
          pulseSpeed: 1.2
        };
      case 'response':
        return { 
          color: isDarkMode ? '#34d399' : '#10b981',
          strokeWidth: 2,
          dotSize: 6,
          pulseSpeed: 1 
        };
      case 'tool_call':
        return { 
          color: isDarkMode ? '#fbbf24' : '#d97706',
          strokeWidth: 1.5,
          dotSize: 5,
          pulseSpeed: 1.3 
        };
      case 'observation':
        return { 
          color: isDarkMode ? '#a78bfa' : '#7c3aed',
          strokeWidth: 1.5,
          dotSize: 5,
          pulseSpeed: 0.9 
        };
      case 'reflection':
        return { 
          color: isDarkMode ? '#f472b6' : '#db2777',
          strokeWidth: 1.5,
          dotSize: 5,
          pulseSpeed: 0.8 
        };
      case 'plan':
        return { 
          color: isDarkMode ? '#22d3ee' : '#06b6d4',
          strokeWidth: 1.5,
          dotSize: 5,
          pulseSpeed: 1.1 
        };
      case 'message':
        return { 
          color: isDarkMode ? '#c4b5fd' : '#8b5cf6',
          strokeWidth: 1.5,
          dotSize: 5,
          pulseSpeed: 1 
        };
      case 'data':
        return { 
          color: isDarkMode ? '#38bdf8' : '#0284c7',
          strokeWidth: 1.5,
          dotSize: 5,
          pulseSpeed: 1.2 
        };
      case 'error':
        return { 
          color: isDarkMode ? '#f87171' : '#dc2626',
          strokeWidth: 2,
          dotSize: 6,
          pulseSpeed: 1.5 
        };
      default:
        return { 
          color: isDarkMode ? '#94a3b8' : '#64748b',
          strokeWidth: 1.5,
          dotSize: 5,
          pulseSpeed: 1 
        };
    }
  };
  
  // Get node color based on node type
  const getNodeColor = (nodeType: string): string => {
    switch (nodeType?.toLowerCase()) {
      case 'user':
        return isDarkMode ? '#60a5fa' : '#2563eb';
      case 'agent':
        return isDarkMode ? '#34d399' : '#10b981';
      case 'tool':
        return isDarkMode ? '#fbbf24' : '#d97706';
      case 'environment':
        return isDarkMode ? '#a78bfa' : '#7c3aed';
      case 'reflection':
        return isDarkMode ? '#f472b6' : '#db2777';
      case 'planner':
        return isDarkMode ? '#22d3ee' : '#06b6d4';
      case 'evaluator':
        return isDarkMode ? '#f59e0b' : '#d97706';
      default:
        return isDarkMode ? '#94a3b8' : '#64748b';
    }
  };
  
  return {
    theme,
    isDarkMode,
    background,
    edges,
    getFlowStyle,
    getNodeColor
  };
}

export default useVisualizationTheme;