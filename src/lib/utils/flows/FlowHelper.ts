/**
 * FlowHelper - Helper functions for ReactFlow visualizations
 * Provides consistent utilities for calculating flow paths and animations
 */
import { Edge, Node } from 'reactflow';

// Types for flow messages
export interface FlowMessage {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: string;
  progress: number;
  complete?: boolean;
}

/**
 * Get the coordinates for a flow to travel along an edge
 */
export function calculateEdgePoints(
  source: Node,
  target: Node,
  sourceHandleId?: string,
  targetHandleId?: string
) {
  if (!source || !target) return null;
  
  // Default dimensions if not specified
  const sourceWidth = source.width || 150;
  const sourceHeight = source.height || 40;
  const targetWidth = target.width || 150;
  const targetHeight = target.height || 40;
  
  // Calculate center points for default case
  const sourceX = source.position.x + sourceWidth / 2;
  const sourceY = source.position.y + sourceHeight / 2;
  const targetX = target.position.x + targetWidth / 2;
  const targetY = target.position.y + targetHeight / 2;
  
  return { sourceX, sourceY, targetX, targetY };
}

/**
 * Find edge point coordinates based on edge ID and nodes
 */
export function findEdgePoints(edgeId: string, nodes: Node[], edges: Edge[]) {
  if (!nodes || !edges) return null;
  
  // Find the edge by ID
  const edge = edges.find(e => e.id === edgeId);
  if (!edge) return null;
  
  // Find source and target nodes
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  if (!sourceNode || !targetNode) return null;
  
  // Calculate the points
  return calculateEdgePoints(
    sourceNode, 
    targetNode,
    edge.sourceHandle || undefined,
    edge.targetHandle || undefined
  );
}

/**
 * Create a new flow message
 */
export function createFlow(
  source: string,
  target: string,
  content: string,
  type: string = 'message'
): FlowMessage {
  const id = `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const edgeId = `${source}-${target}`;
  
  return {
    id,
    edgeId,
    source,
    target,
    content,
    timestamp: Date.now(),
    type,
    progress: 0
  };
}

/**
 * Calculate the position of a flow indicator along an edge based on progress
 */
export function calculateFlowPosition(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  progress: number
) {
  // Ensure progress is between 0 and 1
  const safeProgress = Math.max(0, Math.min(1, progress));
  
  // Linear interpolation between source and target
  const x = sourceX + (targetX - sourceX) * safeProgress;
  const y = sourceY + (targetY - sourceY) * safeProgress;
  
  return { x, y };
}

/**
 * Get the color for a specific flow type
 */
export function getFlowTypeColor(
  type: string,
  isDarkMode: boolean = false
): { stroke: string; fill?: string; strokeWidth?: number } {
  switch (type) {
    case 'query':
      return {
        stroke: '#2563eb', // Blue
        strokeWidth: 2
      };
    case 'response':
      return {
        stroke: '#10b981', // Green
        strokeWidth: 2
      };
    case 'tool_call':
      return {
        stroke: '#d97706', // Amber
        strokeWidth: 1.5
      };
    case 'observation':
      return {
        stroke: '#7c3aed', // Violet
        strokeWidth: 1.5
      };
    case 'reflection':
      return {
        stroke: '#db2777', // Pink
        strokeWidth: 1.5
      };
    case 'plan':
      return {
        stroke: '#06b6d4', // Cyan
        strokeWidth: 1.5
      };
    case 'message':
      return {
        stroke: '#8b5cf6', // Purple
        strokeWidth: 1.5
      };
    case 'data':
      return {
        stroke: '#0284c7', // Light Blue
        strokeWidth: 1.5
      };
    case 'error':
      return {
        stroke: '#dc2626', // Red
        strokeWidth: 2
      };
    default:
      return {
        stroke: isDarkMode ? '#94a3b8' : '#64748b', // Gray
        strokeWidth: 1.5
      };
  }
}

/**
 * Truncate content for display in the UI
 */
export function truncateContent(content: string, maxLength: number = 30): string {
  if (!content || typeof content !== 'string') return '';
  if (content.length <= maxLength) return content;
  return `${content.substring(0, maxLength)}...`;
}