import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useVisualizationTheme } from '@/lib/utils/visualizationTheme';
import { cn } from '@/lib/utils';

export const AgentNode = memo(({ data, id, selected }: NodeProps) => {
  const { nodeType = 'agent', label = 'Agent', status = null } = data || {};
  const { isDarkMode, getNodeColor } = useVisualizationTheme();
  
  const getBorderColor = () => {
    if (status === 'active') return 'var(--primary)';
    if (status === 'complete') return 'var(--accent)';
    if (status === 'error') return 'var(--destructive)';
    return getNodeColor(nodeType);
  };
  
  return (
    <div
      className={cn(
        'rounded-md p-3 w-[180px] border shadow-sm transition-all duration-300',
        'flex flex-col gap-1 bg-card text-card-foreground',
        selected ? 'shadow-md ring-2 ring-primary' : '',
        status === 'active' ? 'shadow-glow' : ''
      )}
      style={{ 
        borderColor: getBorderColor(),
        boxShadow: status === 'active' ? `0 0 15px ${getBorderColor()}40` : undefined,
        transform: status === 'active' ? 'scale(1.02)' : undefined,
        zIndex: status === 'active' ? 10 : undefined,
        // Hardware acceleration
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: status === 'active' ? 'scale(1.02) translateZ(0)' : 'translateZ(0)',
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
      </div>
      
      {data.description && (
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {data.description}
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