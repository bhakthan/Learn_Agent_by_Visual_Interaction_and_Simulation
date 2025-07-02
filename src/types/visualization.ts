/**
 * Common types for visualization components
 */

import { Node, Edge } from 'reactflow';
import { DataFlowType } from '@/lib/utils/dataFlowUtils';
import { NodeType } from '@/lib/utils/visualizationTheme';

/**
 * Standard data flow message
 */
export interface DataFlowMessage {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: DataFlowType;
  progress: number;
  label?: string;
  complete?: boolean;
}

/**
 * Data flow message with transformation abilities
 */
export interface TransformableDataFlow extends DataFlowMessage {
  rawContent?: string;
  transformedContent?: string;
  transformStage?: 'raw' | 'processing' | 'transformed';
  transformationProgress?: number;
  metadata?: Record<string, any>;
}

/**
 * Standard node data interface
 */
export interface AgentNodeData {
  label: string;
  nodeType?: NodeType;
  status?: 'idle' | 'active' | 'success' | 'error' | 'processing' | null;
}

/**
 * Standard edge data interface
 */
export interface AgentEdgeData {
  label?: string;
  flowType?: DataFlowType;
  animated?: boolean;
}

/**
 * Edge point coordinates
 */
export interface EdgePoints {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

/**
 * Animation speed options
 */
export type SpeedOption = 'very-slow' | 'slow' | 'normal' | 'fast' | 'very-fast';
export const speedValues = {
  'very-slow': 0.3,
  'slow': 0.6,
  'normal': 1,
  'fast': 1.8,
  'very-fast': 3
};

/**
 * Animation mode options
 */
export type AnimationMode = 'auto' | 'step-by-step';

/**
 * Standard pattern for agent visualizations
 */
export interface VisualizationPattern {
  id: string;
  title: string;
  description: string;
  category: string;
  nodes: Node<AgentNodeData>[];
  edges: Edge<AgentEdgeData>[];
  nodeTypeMap: Record<string, NodeType>;
}

/**
 * Helper function to create node with standard typing
 */
export const createNode = (
  id: string,
  label: string,
  nodeType: NodeType,
  x: number,
  y: number
): Node<AgentNodeData> => ({
  id,
  type: 'agent',
  data: { 
    label,
    nodeType,
    status: null
  },
  position: { x, y }
});

/**
 * Helper function to create edge with standard typing
 */
export const createEdge = (
  id: string,
  source: string,
  target: string,
  label?: string,
  flowType: DataFlowType = 'message'
): Edge<AgentEdgeData> => ({
  id,
  source,
  target,
  label,
  animated: false,
  data: {
    flowType,
    label
  }
});