import React, { memo, useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme/ThemeProvider';
import { cn } from '@/lib/utils';

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
  const isDarkMode = theme === 'dark';
  
  // Map node types to styles
  const getNodeStyles = useCallback((nodeType: string | undefined, status: string | null | undefined) => {
    // Default style
    let style = {
      backgroundColor: 'var(--card)',
      color: 'var(--card-foreground)',
      borderColor: 'var(--border)',
      borderWidth: '1px',
      boxShadow: selected ? '0 0 0 2px var(--ring)' : 'none'
    };

    // Node type specific styles
    switch (nodeType) {
      case 'user':
        style.backgroundColor = isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)';
        style.borderColor = 'rgba(59, 130, 246, 0.7)';
        break;
      case 'agent':
        style.backgroundColor = isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)';
        style.borderColor = 'rgba(16, 185, 129, 0.7)';
        break;
      case 'tool':
        style.backgroundColor = isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)';
        style.borderColor = 'rgba(245, 158, 11, 0.7)';
        break;
      case 'reflection':
        style.backgroundColor = isDarkMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)';
        style.borderColor = 'rgba(236, 72, 153, 0.7)';
        break;
      case 'environment':
        style.backgroundColor = isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)';
        style.borderColor = 'rgba(139, 92, 246, 0.7)';
        break;
      case 'planner':
        style.backgroundColor = isDarkMode ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)';
        style.borderColor = 'rgba(22, 163, 74, 0.7)';
        break;
      case 'evaluator':
        style.backgroundColor = isDarkMode ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)';
        style.borderColor = 'rgba(234, 179, 8, 0.7)';
        break;
      default:
        // Default - no change from base style
    }
    
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
  }, [isDarkMode, selected]);
  
  // Get appropriate handle styles based on node type
  const getHandleStyles = useCallback((nodeType: string | undefined) => {
    // Default handle style
    let style = {
      backgroundColor: 'var(--border)',
      border: '1px solid var(--border)',
      width: '8px',
      height: '8px'
    };
    
    // Node type specific styles
    switch (nodeType) {
      case 'user':
        style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
        style.border = '1px solid rgba(59, 130, 246, 0.9)';
        break;
      case 'agent':
        style.backgroundColor = 'rgba(16, 185, 129, 0.9)';
        style.border = '1px solid rgba(16, 185, 129, 0.9)';
        break;
      case 'tool':
        style.backgroundColor = 'rgba(245, 158, 11, 0.9)';
        style.border = '1px solid rgba(245, 158, 11, 0.9)';
        break;
      case 'reflection':
        style.backgroundColor = 'rgba(236, 72, 153, 0.9)';
        style.border = '1px solid rgba(236, 72, 153, 0.9)';
        break;
      case 'environment':
        style.backgroundColor = 'rgba(139, 92, 246, 0.9)';
        style.border = '1px solid rgba(139, 92, 246, 0.9)';
        break;
      case 'planner':
        style.backgroundColor = 'rgba(22, 163, 74, 0.9)';
        style.border = '1px solid rgba(22, 163, 74, 0.9)';
        break;
      case 'evaluator':
        style.backgroundColor = 'rgba(234, 179, 8, 0.9)';
        style.border = '1px solid rgba(234, 179, 8, 0.9)';
        break;
      default:
        // Default style for unknown types
        style.backgroundColor = 'var(--muted)';
        style.border = '1px solid var(--muted-foreground)';
    }
    
    return style;
  }, []);
  
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
      transition={{
        duration: 0.3,
      }}
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
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
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