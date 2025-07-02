import React, { memo, useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme/ThemeProvider';
import { cn } from '@/lib/utils';
import { useVisualizationTheme, NodeType } from '@/lib/utils/visualizationTheme';

interface AgentNodeData {
  label: string;
  nodeType?: string;
  status?: 'idle' | 'active' | 'success' | 'error' | 'processing' | null;
}

/**
 * Custom AgentNode component for ReactFlow with animated status indicators
 */
export const AgentNode = memo(({ id, data, selected }: NodeProps<AgentNodeData>) => {
  const { theme } = useTheme();
  const { isDarkMode, getNodeStyle, animations } = useVisualizationTheme();
  
  // Map node types to styles using our standardized theme
  const getNodeStyles = useCallback((nodeType: string | undefined, status: string | null | undefined) => {
    // Get standardized style for this node type
    const nodeStyleParams = getNodeStyle(nodeType as NodeType || 'default');
    
    // Default style
    let style = {
      backgroundColor: nodeStyleParams.backgroundColor,
      color: nodeStyleParams.color,
      borderColor: nodeStyleParams.borderColor,
      borderWidth: '1px',
      boxShadow: selected ? '0 0 0 2px var(--ring)' : 'none'
    };
    
    // Add status-specific styles
    if (status) {
      switch (status) {
        case 'active':
        case 'processing':
          style.boxShadow = '0 0 0 2px var(--primary), 0 0 15px rgba(16, 185, 129, 0.5)';
          style.borderColor = 'var(--primary)';
          break;
        case 'success':
          style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.7), 0 0 10px rgba(16, 185, 129, 0.3)';
          style.borderColor = 'rgba(16, 185, 129, 0.9)';
          break;
        case 'error':
          style.boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.7), 0 0 10px rgba(239, 68, 68, 0.3)';
          style.borderColor = 'rgba(239, 68, 68, 0.9)';
          break;
        default:
          // Default - no change from base style
      }
    }
    
    return style;
  }, [selected, getNodeStyle]);
  
  // Get appropriate handle styles based on node type
  const getHandleStyles = useCallback((nodeType: string | undefined) => {
    // Get standardized style for this node type
    const nodeStyleParams = getNodeStyle(nodeType as NodeType || 'default');
    
    // Default handle style
    return {
      backgroundColor: nodeStyleParams.handleColor,
      border: `1px solid ${nodeStyleParams.handleColor}`,
      width: '8px',
      height: '8px'
    };
  }, [getNodeStyle]);
  
  const nodeStyles = getNodeStyles(data.nodeType, data.status);
  const handleStyles = getHandleStyles(data.nodeType);
  
  return (
    <motion.div
      className={cn(
        "px-4 py-2 rounded-md shadow-sm nodrag",
        "transition-all duration-200",
        "min-w-[120px] min-h-[40px] max-w-[200px]",
        "flex flex-col justify-center items-center",
        "relative"
      )}
      style={nodeStyles}
      animate={{
        boxShadow: nodeStyles.boxShadow
      }}
      transition={animations.smooth}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={handleStyles}
      />
      
      <div className="text-center">
        <p className="text-sm font-medium truncate">{data.label}</p>
        {data.nodeType && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {data.nodeType}
          </p>
        )}
      </div>
      
      {/* Status indicator */}
      {data.status && data.status !== 'idle' && (
        <motion.div
          className={cn(
            "absolute -top-1 -right-1 w-3 h-3 rounded-full",
            {
              "bg-primary": data.status === 'active' || data.status === 'processing',
              "bg-green-500": data.status === 'success',
              "bg-red-500": data.status === 'error',
            }
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={animations.spring}
        />
      )}
      
      {/* Processing indicator */}
      {data.status === 'processing' && (
        <motion.div 
          className="absolute inset-0 rounded-md border-2 border-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={handleStyles}
      />
    </motion.div>
  );
});

export default AgentNode;