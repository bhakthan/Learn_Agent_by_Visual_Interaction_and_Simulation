import React from 'react';
import { ReactFlowProvider } from 'reactflow';

/**
 * A wrapper component that ensures ReactFlow hooks are always used within ReactFlowProvider
 * This helps prevent the "Should have a queue" error that occurs when hooks are used conditionally
 */
const ReactFlowWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
};

export default ReactFlowWrapper;