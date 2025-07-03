/**
 * Utility functions for ReactFlow
 */
import { setupErrorSuppression } from './stabilizeVisualization';
import { fixReactFlowRendering as fixRenderingInternal, resetReactFlowRendering as resetRendering } from './reactFlowFixUtils';
import { Instance as ReactFlowInstance } from 'reactflow';

// Re-export helper functions
export { forceNodesVisible } from './reactFlowFixUtils';
export { resetReactFlowRendering } from './visualizationUtils';

// Re-export fixReactFlowRendering with the same interface
export const fixReactFlowRendering = fixRenderingInternal;

/**
 * Setup error handling for ReactFlow
 */
export function setupReactFlowErrorHandling() {
  // Use error suppression utility
  return setupErrorSuppression();
}

export default { setupReactFlowErrorHandling };