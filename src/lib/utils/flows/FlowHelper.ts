/**
 * Flow Helper - Utilities for data flows in visualizations
 */

/**
 * Interface for data flow messages
 */
export interface DataFlowMessage {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: 'message' | 'data' | 'response' | 'error' | string;
  progress: number;
  label?: string;
  complete?: boolean;
}

/**
 * Create a data flow message
 */
export function createFlow(
  source: string,
  target: string,
  content: string,
  type: 'message' | 'data' | 'response' | 'error' | string = 'message',
  label?: string
): DataFlowMessage {
  // Generate unique ID for the flow
  const id = `flow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Create the flow object
  return {
    id,
    edgeId: `${source}-${target}`, // Default edge ID pattern
    source,
    target,
    content,
    timestamp: Date.now(),
    type,
    progress: 0, // Start at 0% progress
    label,
    complete: false
  };
}

/**
 * Get a standard color for a flow type
 */
export function getFlowColor(
  type: string,
  isDarkMode: boolean = false
): { color: string; fill: string; strokeWidth: number } {
  // Default colors
  const defaults = {
    color: isDarkMode ? '#94a3b8' : '#64748b',
    fill: isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)',
    strokeWidth: 2
  };
  
  // Type-specific colors
  switch (type) {
    case 'query':
      return {
        color: isDarkMode ? '#60a5fa' : '#3b82f6', // blue
        fill: isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)',
        strokeWidth: 2
      };
      
    case 'response':
      return {
        color: isDarkMode ? '#4ade80' : '#10b981', // green
        fill: isDarkMode ? 'rgba(74, 222, 128, 0.2)' : 'rgba(16, 185, 129, 0.2)',
        strokeWidth: 2
      };
      
    case 'tool_call':
      return {
        color: isDarkMode ? '#f97316' : '#ea580c', // orange
        fill: isDarkMode ? 'rgba(249, 115, 22, 0.2)' : 'rgba(234, 88, 12, 0.2)',
        strokeWidth: 2
      };
      
    case 'observation':
      return {
        color: isDarkMode ? '#a78bfa' : '#8b5cf6', // purple
        fill: isDarkMode ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.2)',
        strokeWidth: 2
      };
      
    case 'reflection':
      return {
        color: isDarkMode ? '#c084fc' : '#a855f7', // purple-pink
        fill: isDarkMode ? 'rgba(192, 132, 252, 0.2)' : 'rgba(168, 85, 247, 0.2)',
        strokeWidth: 2.5
      };
      
    case 'plan':
      return {
        color: isDarkMode ? '#fbbf24' : '#f59e0b', // amber
        fill: isDarkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.2)',
        strokeWidth: 2
      };
      
    case 'error':
      return {
        color: isDarkMode ? '#f87171' : '#ef4444', // red
        fill: isDarkMode ? 'rgba(248, 113, 113, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        strokeWidth: 3
      };
      
    case 'data':
      return {
        color: isDarkMode ? '#22d3ee' : '#06b6d4', // cyan
        fill: isDarkMode ? 'rgba(34, 211, 238, 0.2)' : 'rgba(6, 182, 212, 0.2)',
        strokeWidth: 2
      };
      
    default:
      return defaults;
  }
}

/**
 * Truncate content to a specified length
 */
export function truncateContent(content: string, maxLength: number = 30): string {
  if (content.length <= maxLength) return content;
  return `${content.substring(0, maxLength)}...`;
}