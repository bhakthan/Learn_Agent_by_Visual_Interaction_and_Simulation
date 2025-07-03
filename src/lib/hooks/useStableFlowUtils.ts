/**
 * Hook to help maintain stable flow rendering
 */
import { useCallback, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { resetReactFlowRendering } from '../utils/visualizationUtils';

export function useStableFlow(containerRef: React.RefObject<HTMLDivElement>) {
  const reactFlowInstance = useReactFlow();
  
  // Function to reset flow rendering
  const resetFlow = useCallback(() => {
    resetReactFlowRendering(containerRef);
  }, [containerRef]);
  
  // Function to fit view properly
  const fitView = useCallback(() => {
    if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
      try {
        setTimeout(() => {
          reactFlowInstance.fitView({
            padding: 0.2,
            includeHiddenNodes: true,
            minZoom: 0.5,
            maxZoom: 1.5
          });
        }, 50);
      } catch (e) {
        console.error("Error in fitView:", e);
      }
    }
  }, [reactFlowInstance]);
  
  // Apply fixes on mount and resize
  useEffect(() => {
    resetFlow();
    fitView();
    
    const handleResize = () => {
      resetFlow();
      setTimeout(fitView, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Apply additional fixes for visibility issues
    const fixVisibility = () => {
      if (!containerRef.current) return;
      
      const nodes = containerRef.current.querySelectorAll('.react-flow__node');
      const edges = containerRef.current.querySelectorAll('.react-flow__edge');
      
      nodes.forEach(node => {
        if (node instanceof HTMLElement) {
          node.style.visibility = 'visible';
          node.style.opacity = '1';
        }
      });
      
      edges.forEach(edge => {
        if (edge instanceof HTMLElement) {
          edge.style.visibility = 'visible';
          edge.style.opacity = '1';
          
          const paths = edge.querySelectorAll('path');
          paths.forEach(path => {
            path.setAttribute('stroke-opacity', '1');
            path.setAttribute('visibility', 'visible');
          });
        }
      });
    };
    
    // Apply fixes multiple times to ensure they take effect
    setTimeout(fixVisibility, 200);
    setTimeout(fixVisibility, 500);
    setTimeout(fixVisibility, 1000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resetFlow, fitView]);
  
  return {
    resetFlow,
    fitView,
    containerRef
  };
}

export default useStableFlow;