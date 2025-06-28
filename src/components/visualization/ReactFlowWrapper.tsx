import { ReactNode, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import { ErrorBoundary } from '@/components/ui/error-boundary'

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
    
    // Listen for content resize events
    window.addEventListener('content-resize', handleContentResize);
    
    return () => {
      window.removeEventListener('content-resize', handleContentResize);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </ErrorBoundary>
  )
}

export default ReactFlowWrapper