/**
 * Standard Node Utilities for React Flow
 * This file provides consistent styling, positioning and appearance for ReactFlow nodes
 */

import { Node, Edge, Position } from 'reactflow';

/**
 * Standard node positioning and arrangement
 */
export const standardNodePositions = {
  user: { x: 50, y: 100 },
  input: { x: 50, y: 100 },
  agent: { x: 300, y: 100 },
  tool: { x: 300, y: 250 },
  environment: { x: 550, y: 250 },
  output: { x: 550, y: 100 },
  result: { x: 550, y: 100 },
  reflection: { x: 300, y: 400 },
  planner: { x: 150, y: 250 },
  evaluator: { x: 450, y: 400 },
};

/**
 * Get standard node style based on node type
 */
export function getStandardNodeStyle(nodeType: string, theme: 'light' | 'dark' = 'light') {
  // Base styles
  const baseStyle = {
    border: '1px solid',
    borderRadius: '8px',
    padding: '10px 15px',
    fontSize: '12px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    boxShadow: theme === 'dark' 
      ? '0 2px 5px rgba(0, 0, 0, 0.5)' 
      : '0 2px 5px rgba(0, 0, 0, 0.1)',
    minWidth: '120px',
    minHeight: '40px',
    backdropFilter: theme === 'dark' ? 'blur(3px)' : 'none',
    opacity: 1,
    willChange: 'transform',
    transform: 'translateZ(0)',
  };

  // Node type-specific styles
  switch (nodeType) {
    case 'user':
    case 'input':
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.7)',
      };
    case 'agent':
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.7)',
      };
    case 'tool':
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.7)',
      };
    case 'reflection':
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)',
        borderColor: 'rgba(236, 72, 153, 0.7)',
      };
    case 'environment':
    case 'output':
    case 'result':
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
        borderColor: 'rgba(139, 92, 246, 0.7)',
      };
    case 'planner':
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(22, 163, 74, 0.1)',
        borderColor: 'rgba(22, 163, 74, 0.7)',
      };
    case 'evaluator':
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)',
        borderColor: 'rgba(234, 179, 8, 0.7)',
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: theme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(100, 116, 139, 0.1)',
        borderColor: 'rgba(100, 116, 139, 0.7)',
      };
  }
}

/**
 * Get standard edge style based on type
 */
export function getStandardEdgeStyle(edgeType: string, theme: 'light' | 'dark' = 'light', animated: boolean = false) {
  // Base style
  const baseStyle = {
    strokeWidth: 1.5,
    stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)',
    strokeDasharray: animated ? '5,5' : 'none',
    animationName: animated ? 'dashdraw' : 'none',
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  };

  // Edge type-specific styles
  switch (edgeType) {
    case 'query':
      return {
        ...baseStyle,
        stroke: 'rgba(59, 130, 246, 0.9)',
      };
    case 'response':
      return {
        ...baseStyle,
        stroke: 'rgba(16, 185, 129, 0.9)',
      };
    case 'tool_call':
      return {
        ...baseStyle,
        stroke: 'rgba(245, 158, 11, 0.9)',
      };
    case 'observation':
      return {
        ...baseStyle,
        stroke: 'rgba(139, 92, 246, 0.9)',
      };
    case 'reflection':
      return {
        ...baseStyle,
        stroke: 'rgba(236, 72, 153, 0.9)',
      };
    case 'plan':
      return {
        ...baseStyle,
        stroke: 'rgba(22, 163, 74, 0.9)',
      };
    case 'error':
      return {
        ...baseStyle,
        stroke: 'rgba(239, 68, 68, 0.9)',
      };
    default:
      return baseStyle;
  }
}

/**
 * Create a standard node with consistent styling
 */
export function createStandardNode(
  id: string,
  type: string,
  label: string,
  position = { x: 0, y: 0 },
  data = {}
): Node {
  return {
    id,
    type: 'default',
    dragHandle: '.drag-handle',
    data: {
      label,
      nodeType: type,
      ...data,
    },
    className: `node-${type}`,
    position,
    style: getStandardNodeStyle(type),
  };
}

/**
 * Create a standard edge with consistent styling
 */
export function createStandardEdge(
  id: string,
  source: string,
  target: string,
  type: string = 'default',
  label: string = '',
  animated: boolean = false
): Edge {
  return {
    id,
    source,
    target,
    type: 'default',
    className: `edge-${type}`,
    label,
    animated,
    style: getStandardEdgeStyle(type, 'light', animated),
  };
}

// Remove the useStableNodeLayout hook from this utility file
// It needs to be moved to a proper React hook file

export default {
  getStandardNodeStyle,
  getStandardEdgeStyle,
  createStandardNode,
  createStandardEdge,
  standardNodePositions
};