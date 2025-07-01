/**
 * Memoized versions of ReactFlow components for better performance
 */
import React from 'react';
import {
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap
} from 'reactflow';

/**
 * Memoized version of ReactFlow to prevent unnecessary re-renders
 */
export const MemoizedReactFlow = React.memo(ReactFlow);

/**
 * Memoized version of Background to prevent unnecessary re-renders
 */
export const MemoizedBackground = React.memo(Background);

/**
 * Memoized version of Controls to prevent unnecessary re-renders
 */
export const MemoizedControls = React.memo(Controls);

/**
 * Memoized version of MiniMap to prevent unnecessary re-renders
 */
export const MemoizedMiniMap = React.memo(MiniMap);