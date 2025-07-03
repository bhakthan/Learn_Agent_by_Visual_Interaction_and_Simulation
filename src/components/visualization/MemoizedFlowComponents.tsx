import React from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
} from 'reactflow';

/**
 * Memoized ReactFlow component
 */
export const MemoizedReactFlow = React.memo(ReactFlow);

/**
 * Memoized Background component
 */
export const MemoizedBackground = React.memo(({ color, gap, size, style }: {
  color?: string;
  gap?: number;
  size?: number;
  style?: React.CSSProperties;
}) => (
  <Background
    variant={BackgroundVariant.Dots}
    color={color}
    gap={gap}
    size={size}
    style={style}
  />
));

/**
 * Memoized Controls component
 */
export const MemoizedControls = React.memo(({ className }: {
  className?: string;
}) => (
  <Controls className={className} />
));

/**
 * Memoized MiniMap component
 */
export const MemoizedMiniMap = React.memo(({
  nodeStrokeWidth,
  nodeColor,
  style
}: {
  nodeStrokeWidth?: number;
  nodeColor?: string | ((node: any) => string);
  style?: React.CSSProperties;
}) => (
  <MiniMap
    nodeStrokeWidth={nodeStrokeWidth}
    nodeColor={nodeColor}
    style={style}
  />
));

MemoizedBackground.displayName = 'MemoizedBackground';
MemoizedControls.displayName = 'MemoizedControls';
MemoizedMiniMap.displayName = 'MemoizedMiniMap';
MemoizedReactFlow.displayName = 'MemoizedReactFlow';