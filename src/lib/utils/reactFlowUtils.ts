/**
 * Utility functions for ReactFlow
 */
import { setupErrorSuppression } from './stabilizeVisualization';

// Re-export helper functions
export { forceNodesVisible, fixReactFlowRendering } from './reactFlowFixUtils';

/**
 * Setup error handling for ReactFlow
 */
export function setupReactFlowErrorHandling() {
  // Use error suppression utility
  return setupErrorSuppression();
}

export default { setupReactFlowErrorHandling };