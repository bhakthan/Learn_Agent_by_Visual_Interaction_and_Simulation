# ReactFlow Components Guide

This document provides guidance on using ReactFlow components in our application.

## Optimized Components

### OptimizedFlowContainer

The `OptimizedFlowContainer` is the recommended component for all ReactFlow visualizations. It provides consistent behavior and appearance across the application.

```tsx
import { OptimizedFlowContainer, ReactFlowProvider } from '@/components/visualization';

// Example usage
const MyComponent = () => {
  return (
    <ReactFlowProvider>
      <OptimizedFlowContainer
        title="My Flow Visualization" // Optional title
        description="This shows data flow between components" // Optional description
        nodes={myNodes}
        edges={myEdges}
        flows={dataFlows} // Optional data flows
        nodeTypes={nodeTypes} // Custom node types
        showControls={true}
        autoFitView={true}
        className="border rounded-md"
        style={{ height: '400px' }}
      />
    </ReactFlowProvider>
  );
};
```

### Utility Hooks

#### useOptimizedReactFlow

This hook provides a stable API for ReactFlow with consistent behavior and error handling.

```tsx
import { useOptimizedReactFlow } from '@/lib/hooks/useOptimizedReactFlow';

const MyComponent = () => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    updateNodeData,
    onNodesChange,
    onEdgesChange,
    fitView,
    isReady
  } = useOptimizedReactFlow(initialNodes, initialEdges, {
    autoFitView: true,
    fitViewPadding: 0.2,
    enableStabilization: true
  });
  
  // Use these in your ReactFlow component
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
};
```

#### useStableReactFlow

This hook prevents ResizeObserver errors and provides stability enhancements.

```tsx
import { useStableReactFlow } from '@/lib/hooks/useStableReactFlow';

const MyComponent = () => {
  const {
    containerRef,
    fitView,
    resetStability,
    applyStabilityFixes,
    isReady
  } = useStableReactFlow({
    fitViewOnResize: true,
    preventResizeErrors: true
  });
  
  return (
    <div ref={containerRef} className="w-full h-full">
      <ReactFlow /* ... */ />
    </div>
  );
};
```

## Debugging ReactFlow Issues

If you encounter issues with ReactFlow visualizations, use these debugging tools:

```javascript
// In browser console:

// Diagnose ReactFlow issues
window.reactFlowDebug.diagnose();

// Fix visibility issues
window.reactFlowDebug.fix();

// Force-show all ReactFlow nodes
window.reactFlowDebug.forceShow();
```

## Common Issues and Solutions

### Invisible Nodes or Edges

If nodes or edges are not visible:

1. Use the OptimizedFlowContainer component
2. Make sure nodes have correct style properties:
   ```tsx
   const nodes = initialNodes.map(node => ({
     ...node,
     style: {
       ...node.style,
       opacity: 1,
       visibility: 'visible',
       display: 'block'
     }
   }));
   ```

### ResizeObserver Loop Errors

These errors are handled automatically by our utilities. If you still encounter them:

1. Wrap your component with ReactFlowProvider
2. Use the useStableReactFlow hook
3. Set explicit heights on container elements

### Layout Issues

If the layout looks wrong:

1. Set explicit dimensions on container elements
2. Use the fitView method after nodes change
3. Make sure nodes have position data

## Best Practices

1. Always wrap ReactFlow components with ReactFlowProvider
2. Use OptimizedFlowContainer for consistent behavior
3. Set explicit dimensions on containers
4. Apply transform: translateZ(0) to enable hardware acceleration
5. Use memo and callback hooks for performance