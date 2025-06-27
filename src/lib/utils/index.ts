// Import and re-export from dataFlowUtils
import {
  simulatePatternFlow,
  FlowMessage,
  DataFlowState,
  DataFlow,
  getDataFlowAnimationStyle,
  createDataFlow,
  resetDataFlow,
  getSpeedMultiplier,
  initialDataFlowState,
  getVisibleMessages,
  calculateActiveElements,
  getLatestMessages,
  truncateFlowContent,
  generateSampleFlowData,
  getNodeDataFlowParams
} from './dataFlowUtils';

// Import and re-export from algorithmVisualization
import {
  AlgorithmStep,
  AlgorithmVisualizationData
} from './algorithmVisualization';

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Named exports from dataFlowUtils
export {
  simulatePatternFlow,
  FlowMessage,
  DataFlowState,
  DataFlow,
  getDataFlowAnimationStyle,
  createDataFlow,
  resetDataFlow,
  getSpeedMultiplier,
  initialDataFlowState,
  getVisibleMessages,
  calculateActiveElements,
  getLatestMessages,
  truncateFlowContent,
  generateSampleFlowData,
  getNodeDataFlowParams
};

// Named exports from algorithmVisualization
export {
  AlgorithmStep,
  AlgorithmVisualizationData
};