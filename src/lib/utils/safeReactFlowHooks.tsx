import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ReactFlowProvider, Node, Edge } from 'reactflow';

/**
 * Custom hook to safely access ReactFlow functionality outside of the provider
 */
export function useSafeReactFlow() {
  const [isInitialized, setIsInitialized] = useState(false);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  const safelyFitView = useCallback(() => {
    // This is a stub function that will be replaced with actual implementation
    // when used with the ReactFlowProvider
    console.warn('fitView called outside ReactFlow context');
  }, []);

  return {
    flowContainerRef,
    isInitialized,
    fitView: safelyFitView,
    updateNodePositions: () => {},
    // Add other stub methods as needed
  };
}

/**
 * A wrapper component that properly provides ReactFlow context
 */
interface SafeReactFlowProps {
  nodes: Node[];
  edges: Edge[];
  children: React.ReactNode;
}

export const SafeReactFlow: React.FC<SafeReactFlowProps> = ({ nodes, edges, children }) => {
  return (
    <ReactFlowProvider>
      {children}
    </ReactFlowProvider>
  );
};

/**
 * A component that safely wraps any content that uses ReactFlow hooks
 */
export const ReactFlowSafeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <ReactFlowProvider>
      {children}
    </ReactFlowProvider>
  );
};