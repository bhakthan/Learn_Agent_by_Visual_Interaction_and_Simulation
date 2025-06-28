import { ReactNode, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { resetReactFlowRendering } from '@/lib/utils/resizeObserverUtils'

interface ReactFlowWrapperProps {
  children: ReactNode
}

/**
 * A wrapper component to ensure all ReactFlow instances have the required provider
 * and properly handle ResizeObserver errors
 */
const ReactFlowWrapper = ({ children }: ReactFlowWrapperProps) => {
  // Add effect to handle reactflow-specific resize events
  useEffect(() => {
    // Create handler for content-resize events
    const handleContentResize = (e: Event) => {
      // Use RAF to safely schedule flow updates
      requestAnimationFrame(() => {
        // Dispatch a specific event for ReactFlow components
        window.dispatchEvent(new CustomEvent('flow-resize', {
          detail: {
            timestamp: Date.now(),
            source: e instanceof CustomEvent ? e.detail?.source : 'unknown'
          }
        }));
      });
    };
    
    // Create handler for flow stability events
    const handleFlowStabilize = () => {
      // Find all ReactFlow containers
      const containers = document.querySelectorAll('.react-flow-wrapper');
      containers.forEach(container => {
        // Apply our robust reset function to each container
        resetReactFlowRendering({ current: container as HTMLElement });
      });
    };
    
    // Listen for content resize events
    window.addEventListener('content-resize', handleContentResize);
    
    // Listen for our custom stabilization event
    window.addEventListener('flow-force-stabilize', handleFlowStabilize);
    
    return () => {
      window.removeEventListener('content-resize', handleContentResize);
      window.removeEventListener('flow-force-stabilize', handleFlowStabilize);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <div className="react-flow-wrapper w-full h-full">
        <ReactFlowProvider>{children}</ReactFlowProvider>
      </div>
    </ErrorBoundary>
  )
}

export default ReactFlowWrapper
