import React, { useMemo } from 'react';
import { NodeProps } from 'reactflow';

/**
 * MemoizedReactFlowNode is a higher-order component that wraps any ReactFlow node component
 * with React.memo optimization to prevent unnecessary re-renders
 * 
 * @param Component The node component to memoize
 * @returns A memoized version of the node component
 */
export function MemoizedReactFlowNode<T = any>(
  Component: React.ComponentType<NodeProps<T>>,
  propsAreEqual?: (prev: NodeProps<T>, next: NodeProps<T>) => boolean
): React.ComponentType<NodeProps<T>> {
  // Default comparison function that checks important properties
  const defaultPropsAreEqual = (prev: NodeProps<T>, next: NodeProps<T>): boolean => {
    // Always re-render if selected state changes
    if (prev.selected !== next.selected) return false;
    
    // Check if data has changed significantly
    const prevData = prev.data;
    const nextData = next.data;
    
    // Different data reference means something changed
    if (prevData !== nextData) {
      // Common node properties to check
      const commonProperties = ['label', 'status', 'type', 'result'];
      
      // Check if any common properties changed
      for (const prop of commonProperties) {
        if ((prevData as any)?.[prop] !== (nextData as any)?.[prop]) {
          return false;
        }
      }
      
      // Check if node changed position 
      // (need to re-render to update connectors even if data is the same)
      if (
        prev.xPos !== next.xPos || 
        prev.yPos !== next.yPos || 
        prev.dragging !== next.dragging
      ) {
        return false;
      }
    }
    
    // No significant changes detected
    return true;
  };
  
  // Define the memoized component with equality check
  const MemoComponent = React.memo(
    Component,
    propsAreEqual || defaultPropsAreEqual
  );
  
  // Return a wrapper function that ensures stable props
  return (props: NodeProps<T>) => {
    // Memoize the node data to maintain referential equality when possible
    const memoizedData = useMemo(() => props.data, [
      // Deep comparison of data properties to maintain reference equality
      JSON.stringify(props.data)
    ]);
    
    // Create a stable version of the props with memoized data
    const stableProps = useMemo(() => ({
      ...props,
      data: memoizedData
    }), [props.id, props.selected, props.dragging, props.xPos, props.yPos, memoizedData]);
    
    // Render the memoized component with stable props
    return <MemoComponent {...stableProps} />;
  };
}

// Helper function to create a memoized node type based on existing type
export function createMemoizedNodeType<T = any>(
  nodeTypeFunction: React.ComponentType<NodeProps<T>>
): React.ComponentType<NodeProps<T>> {
  return MemoizedReactFlowNode(nodeTypeFunction);
}