/**
 * Visualization utilities for ReactFlow components
 */
import { Node, Edge } from 'reactflow';

/**
 * Reset the ReactFlow rendering to fix common issues
 * @param containerRef Reference to the container element
 */
export function resetReactFlowRendering(containerRef: React.RefObject<HTMLDivElement>) {
  if (!containerRef.current) return;
  
  // Force re-render ReactFlow with a size change
  setTimeout(() => {
    if (!containerRef.current) return;
    
    // Capture current scroll position to restore it after manipulation
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    
    // First set explicit height and width to prevent layout collapse
    const height = containerRef.current.offsetHeight;
    const width = containerRef.current.offsetWidth;
    containerRef.current.style.height = `${height}px`;
    containerRef.current.style.width = `${width}px`;
    
    // Trigger reflow
    const displayStyle = containerRef.current.style.display;
    containerRef.current.style.display = 'none';
    void containerRef.current.offsetHeight; // Force reflow
    containerRef.current.style.display = displayStyle;
    
    // Force hardware acceleration for better rendering
    containerRef.current.style.transform = 'translateZ(0)';
    containerRef.current.style.webkitBackfaceVisibility = 'hidden';
    containerRef.current.style.perspective = '1000';
    
    // Find ReactFlow components and ensure they're visible
    const reactFlowElements = containerRef.current.querySelectorAll('.react-flow__node, .react-flow__edge');
    reactFlowElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.transform = 'translateZ(0)';
      }
    });
    
    // Restore scroll position
    containerRef.current.scrollLeft = scrollLeft;
    containerRef.current.scrollTop = scrollTop;
    
    // Fix edge paths visibility
    const paths = containerRef.current.querySelectorAll('.react-flow__edge-path');
    paths.forEach((path) => {
      if (path instanceof SVGElement) {
        path.style.strokeWidth = '1.5px';
        path.style.opacity = '1';
      }
    });
  }, 100);
}

// Remove the useStableFlow hook from this utility file
// Hooks must be in React components or custom hooks

/**
 * Apply animation style to edges
 */
export function applyEdgeAnimations(edges: Edge[]): Edge[] {
  return edges.map(edge => {
    // Add animation to data flow edges
    if (edge.animated || 
        edge.className?.includes('tool_call') || 
        edge.className?.includes('query') || 
        edge.className?.includes('response')) {
      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: 2,
          strokeDasharray: '5,5',
          animation: 'dashdraw 1s linear infinite'
        }
      };
    }
    return edge;
  });
}

/**
 * Apply consistent styling to nodes based on their type
 */
export function applyNodeStyling(nodes: Node[], theme: 'light' | 'dark' = 'light'): Node[] {
  return nodes.map(node => {
    const nodeType = node.data?.nodeType || node.type || 'default';
    
    // Add styling based on node type
    const className = `node-${nodeType} ${node.className || ''}`;
    
    // Base style for all nodes
    const baseStyle = {
      border: '1px solid',
      borderRadius: '8px',
      padding: '10px 15px',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      boxShadow: theme === 'dark' 
        ? '0 2px 5px rgba(0, 0, 0, 0.5)' 
        : '0 2px 5px rgba(0, 0, 0, 0.1)',
      minWidth: '120px',
      minHeight: '40px',
      backdropFilter: theme === 'dark' ? 'blur(3px)' : 'none',
      visibility: 'visible',
      opacity: 1,
      ...(node.style || {}),
    };
    
    return {
      ...node,
      className,
      style: baseStyle
    };
  });
}

/**
 * Process nodes with enhanced styling and positioning
 */
export function processNodes(nodes: Node[], theme: 'light' | 'dark' = 'light'): Node[] {
  return nodes.map(node => {
    // Apply base styling
    const styledNode = applyNodeStyling([node], theme)[0];
    
    // Ensure node has proper positioning and is visible
    return {
      ...styledNode,
      draggable: true,
      style: {
        ...styledNode.style,
        visibility: 'visible',
        opacity: 1,
      }
    };
  });
}

/**
 * Process edges with consistent styling and animations
 */
export function processEdges(edges: Edge[], theme: 'light' | 'dark' = 'light'): Edge[] {
  return edges.map(edge => {
    const baseEdge = applyEdgeAnimations([edge])[0];
    
    // Apply theme-specific styling
    return {
      ...baseEdge,
      style: {
        ...baseEdge.style,
        stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined,
      }
    };
  });
}

/**
 * Normalize flow message data for visualization
 */
export function normalizeFlowMessage(message: any): any {
  // Ensure message has expected structure
  return {
    id: message.id || `msg-${Date.now()}`,
    type: message.type || 'default',
    content: message.content || '',
    ...message
  };
}

export default {
  resetReactFlowRendering,
  applyEdgeAnimations,
  applyNodeStyling,
  processNodes,
  processEdges,
  normalizeFlowMessage
};