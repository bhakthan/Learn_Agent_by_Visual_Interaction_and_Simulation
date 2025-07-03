import { useState, useEffect, useRef, useCallback } from 'react';
import { useReactFlow, Node, Edge, Viewport } from 'reactflow';
import { 
  AdaptiveLayoutManager, 
  calculateOptimalViewport
} from '../utils/adaptiveNodePositioning';

interface UseAdaptiveFlowOptions {
  fitViewOnInit?: boolean;
  fitViewOnResize?: boolean;
  fitViewPadding?: number;
  preserveViewport?: boolean;
  nodeSpacing?: number;
  avoidEdgeOverlap?: boolean;
  adaptOnNodesChange?: boolean;
  stabilizationDelay?: number;
  disableResponsiveScaling?: boolean;
}

/**
 * React hook for adaptive ReactFlow node positioning
 * Automatically optimizes node positions to prevent layout shifts and improve visualization
 */
export function useAdaptiveFlow<NodeData = any>({
  fitViewOnInit = true,
  fitViewOnResize = true,
  fitViewPadding = 0.2,
  preserveViewport = false,
  nodeSpacing = 150,
  avoidEdgeOverlap = true,
  adaptOnNodesChange = false,
  stabilizationDelay = 300,
  disableResponsiveScaling = false
}: UseAdaptiveFlowOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutManager = useRef<AdaptiveLayoutManager>(new AdaptiveLayoutManager());
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Get ReactFlow instance
  const {
    fitView,
    setViewport,
    getNodes,
    getEdges,
    setNodes,
    setEdges
  } = useReactFlow();
  
  // Function to measure container size
  const measureContainer = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setContainerSize({ width, height });
      }
    }
  }, []);
  
  // Initialize layout manager with current nodes/edges
  const initializeLayout = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    
    if (nodes.length > 0) {
      layoutManager.current.setOriginalLayout(nodes, edges);
    }
  }, [getNodes, getEdges]);
  
  // Function to optimize layout
  const optimizeLayout = useCallback((forceUpdate = false) => {
    // Skip if responsive scaling is disabled
    if (disableResponsiveScaling && !forceUpdate) return;
    
    const nodes = getNodes();
    const edges = getEdges();
    
    if (nodes.length === 0) return;
    
    // Set original layout if not already set
    if (!layoutManager.current.getCurrentLayout()) {
      layoutManager.current.setOriginalLayout(nodes, edges);
    }
    
    // Update layout based on current container size
    if (containerSize.width > 0 && containerSize.height > 0) {
      const optimizedLayout = layoutManager.current.updateLayout(
        containerSize.width,
        containerSize.height,
        {
          spacing: nodeSpacing,
          padding: fitViewPadding * Math.min(containerSize.width, containerSize.height),
          preserveRelativePositions: true,
        }
      );
      
      if (optimizedLayout) {
        // Apply optimized node positions
        setNodes(optimizedLayout.nodes);
        
        // Apply optimized edge paths if enabled
        if (avoidEdgeOverlap) {
          setEdges(optimizedLayout.edges);
        }
      }
    }
  }, [
    containerSize, 
    getNodes, 
    getEdges, 
    setNodes, 
    setEdges, 
    nodeSpacing, 
    fitViewPadding, 
    avoidEdgeOverlap,
    disableResponsiveScaling
  ]);
  
  // Function to ensure viewport shows all nodes
  const optimizeViewport = useCallback(() => {
    if (!fitViewOnResize || preserveViewport) return;
    
    // Get current nodes
    const nodes = getNodes();
    if (nodes.length === 0) return;
    
    if (containerSize.width > 0 && containerSize.height > 0) {
      // Calculate optimal viewport
      const viewport = calculateOptimalViewport(nodes, containerSize.width, containerSize.height, {
        padding: fitViewPadding * Math.min(containerSize.width, containerSize.height),
        minZoom: 0.5,
        maxZoom: 2
      });
      
      // Apply viewport
      setViewport(viewport);
    } else {
      // Fallback to fitView if container size not available
      fitView({ padding: fitViewPadding, includeHiddenNodes: true });
    }
  }, [
    containerSize, 
    getNodes, 
    fitView, 
    setViewport, 
    fitViewOnResize, 
    preserveViewport,
    fitViewPadding
  ]);
  
  // Reset to original layout
  const resetLayout = useCallback(() => {
    const original = layoutManager.current.resetLayout();
    if (original) {
      setNodes(original.nodes);
      setEdges(original.edges);
      
      // Re-optimize viewport after layout reset
      setTimeout(() => {
        optimizeViewport();
      }, 50);
    }
  }, [setNodes, setEdges, optimizeViewport]);
  
  // Function to safely fit view
  const safelyFitView = useCallback(() => {
    try {
      fitView({
        padding: fitViewPadding,
        includeHiddenNodes: true
      });
    } catch (error) {
      console.debug('Failed to fit view (suppressed)');
    }
  }, [fitView, fitViewPadding]);
  
  // Apply adaptive layout on resize
  useEffect(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return;
    
    const resizeTimerRef = setTimeout(() => {
      optimizeLayout();
      
      // After layout is optimized, update viewport if needed
      if (fitViewOnResize && !preserveViewport) {
        setTimeout(optimizeViewport, 50);
      }
    }, stabilizationDelay);
    
    return () => clearTimeout(resizeTimerRef);
  }, [containerSize, optimizeLayout, optimizeViewport, fitViewOnResize, preserveViewport, stabilizationDelay]);
  
  // Set up resize observer for container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Initial measurement
    measureContainer();
    
    // Set up ResizeObserver
    let resizeObserver: ResizeObserver;
    try {
      resizeObserver = new ResizeObserver((entries) => {
        // Use requestAnimationFrame to batch updates
        requestAnimationFrame(() => {
          if (entries[0]) {
            const { width, height } = entries[0].contentRect;
            if (width > 0 && height > 0) {
              setContainerSize({ width, height });
            }
          }
        });
      });
      
      resizeObserver.observe(container);
    } catch (error) {
      // Fallback to window resize event if ResizeObserver fails
      console.debug('ResizeObserver not available, using window resize event');
      window.addEventListener('resize', measureContainer);
    }
    
    return () => {
      if (resizeObserver) {
        try {
          resizeObserver.disconnect();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      window.removeEventListener('resize', measureContainer);
    };
  }, [measureContainer]);
  
  // Initialize on mount
  useEffect(() => {
    // Allow layout to render first
    const initTimer = setTimeout(() => {
      initializeLayout();
      
      // Apply initial optimization
      const optimizeTimer = setTimeout(() => {
        optimizeLayout(true);
        
        // Apply initial fit view if enabled
        if (fitViewOnInit) {
          const fitTimer = setTimeout(safelyFitView, 100);
          return () => clearTimeout(fitTimer);
        }
      }, stabilizationDelay);
      
      return () => clearTimeout(optimizeTimer);
    }, 100);
    
    return () => clearTimeout(initTimer);
  }, [initializeLayout, optimizeLayout, safelyFitView, fitViewOnInit, stabilizationDelay]);
  
  // Monitor for layout changes from external sources
  useEffect(() => {
    if (!adaptOnNodesChange) return;
    
    // Set up a timer to check for changes
    const intervalId = setInterval(() => {
      const currentLayout = layoutManager.current.getCurrentLayout();
      if (!currentLayout) return;
      
      const currentNodes = getNodes();
      
      // Check if nodes have been manually repositioned
      let hasPositionChanges = false;
      if (currentNodes.length === currentLayout.nodes.length) {
        for (let i = 0; i < currentNodes.length; i++) {
          const currentNode = currentNodes[i];
          const storedNode = currentLayout.nodes.find(n => n.id === currentNode.id);
          
          if (storedNode && 
              (Math.abs(currentNode.position.x - storedNode.position.x) > 5 || 
               Math.abs(currentNode.position.y - storedNode.position.y) > 5)) {
            hasPositionChanges = true;
            break;
          }
        }
      }
      
      // If positions have changed, update the layout manager
      if (hasPositionChanges) {
        layoutManager.current.setOriginalLayout(currentNodes, getEdges());
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [getNodes, getEdges, adaptOnNodesChange]);
  
  return {
    containerRef,
    optimizeLayout,
    resetLayout,
    optimizeViewport,
    containerSize
  };
}