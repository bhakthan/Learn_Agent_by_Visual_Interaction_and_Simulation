// Import and re-export from dataFlowUtils
import {
  simulatePatternFlow,
  BaseDataFlow,
  DataFlowType,
  getDataFlowAnimationStyle,
  createDataFlow,
  resetDataFlow,
  getSpeedMultiplier,
  setSpeedMultiplier,
  getNodeDataFlowParams,
  truncateFlowContent
} from './dataFlowUtils';

// Import and re-export from algorithmVisualization
import {
  AlgorithmStep,
  AlgorithmVisualizationData,
  getAlgorithmSpeedMultiplier
} from './algorithmVisualization';

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Import throttleResizeObserver from the specific util file to avoid circular dependencies
import { throttleResizeObserver } from './resizeObserverUtil';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Named exports from dataFlowUtils
export {
  simulatePatternFlow,
  BaseDataFlow,
  DataFlowType,
  getDataFlowAnimationStyle,
  createDataFlow,
  resetDataFlow,
  getSpeedMultiplier,
  setSpeedMultiplier,
  truncateFlowContent,
  getNodeDataFlowParams
};

// Named exports from algorithmVisualization
export {
  AlgorithmStep,
  AlgorithmVisualizationData,
  getAlgorithmSpeedMultiplier
};

// Export throttleResizeObserver from the util file
export { throttleResizeObserver };