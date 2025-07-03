import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useTheme } from '@/components/theme/ThemeProvider';
import { cn } from '@/lib/utils';

/**
 * Get a color for a node based on its type
 */
function getNodeColor(nodeType: string = 'agent') {
  switch(nodeType.toLowerCase()) {
    case 'user':
      return '#60a5fa'; // Blue
    case 'agent':
      return '#34d399'; // Green
    case 'llm':
      return '#2563eb'; // Deeper Blue
    case 'tool':
      return '#fbbf24'; // Yellow
    case 'router':
      return '#f59e0b'; // Amber
    case 'input':
      return '#6366f1'; // Indigo
    case 'output':
      return '#10b981'; // Emerald
    case 'aggregator':
      return '#8b5cf6'; // Purple
    case 'environment':
      return '#a78bfa'; // Violet
    case 'reflection':
      return '#f472b6'; // Pink
    case 'planner':
      return '#22d3ee'; // Cyan
    case 'evaluator':
      return '#f59e0b'; // Amber
    default:
      return '#94a3b8'; // Slate (default)
  }
}

/**
 * A customizable agent node component for ReactFlow
 */
export const AgentNode = memo(({ data, id, selected }: NodeProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const { 
    nodeType = 'agent',
    label = 'Agent',
    description,
    status = null
  } = data || {};
  
  // Get border color based on status
  const getBorderColor = () => {
    if (status === 'active' || status === 'running') return 'var(--primary)';
    if (status === 'complete') return 'var(--accent)';
    if (status === 'error' || status === 'failed') return 'var(--destructive)';
    return getNodeColor(nodeType);
  };
  
  return (
    <div
      className={cn(
        'rounded-md p-3 w-[180px] border shadow-sm transition-all duration-300',
        'flex flex-col gap-1 bg-card text-card-foreground',
        selected ? 'shadow-md ring-2 ring-primary' : '',
        status === 'active' || status === 'running' ? 'shadow-glow' : ''
      )}
      style={{ 
        borderColor: getBorderColor(),
        boxShadow: (status === 'active' || status === 'running') ? 
          `0 0 15px ${getBorderColor()}40` : undefined,
        transform: (status === 'active' || status === 'running') ? 
          'scale(1.02) translateZ(0)' : 'translateZ(0)',
        zIndex: (status === 'active' || status === 'running') ? 10 : undefined,
        opacity: 1,
        visibility: 'visible',
        position: 'relative',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ 
          background: isDarkMode ? '#fff' : '#000', 
          opacity: 0.5,
          visibility: 'visible',
          display: 'block'
        }} 
      />
      
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getNodeColor(nodeType) }}
        />
        <div className="font-medium text-sm">{label}</div>
        {(status === 'active' || status === 'running') && (
          <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>
      
      {description && (
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {description}
        </div>
      )}
      
      {data.result && (
        <div className="text-xs bg-background/50 border border-border/50 rounded p-1.5 mt-2">
          {typeof data.result === 'string' && data.result.length > 40 
            ? `${data.result.substring(0, 40)}...` 
            : data.result}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ 
          background: isDarkMode ? '#fff' : '#000', 
          opacity: 0.5,
          visibility: 'visible',
          display: 'block'
        }} 
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';

export default AgentNode;