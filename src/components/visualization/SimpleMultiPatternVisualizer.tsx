import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, ArrowsClockwise, DotsSixVertical } from "@phosphor-icons/react";
import { agentPatterns } from '@/lib/data/patterns';
import { useTheme } from '@/components/theme/ThemeProvider';

interface SimpleMultiPatternVisualizerProps {
  initialPatterns: string[];
}

interface PatternLayout {
  pattern: any;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FlowConnection {
  id: string;
  from: string;
  to: string;
  progress: number;
  active: boolean;
  message: string;
}

const SimpleMultiPatternVisualizer: React.FC<SimpleMultiPatternVisualizerProps> = ({ 
  initialPatterns 
}) => {
  const { theme } = useTheme();
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(initialPatterns);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flowConnections, setFlowConnections] = useState<FlowConnection[]>([]);
  const [activePatterns, setActivePatterns] = useState<Set<string>>(new Set());
  
  const patterns = agentPatterns.filter(p => selectedPatterns.includes(p.id));
  
  // Create layout for patterns - same as SimplePatternFlow
  const createLayout = useCallback(() => {
    const containerWidth = 1000;
    const containerHeight = 600;
    const patternWidth = 200;
    const patternHeight = 150;
    
    // Simple grid layout - same as SimplePatternFlow
    const cols = Math.ceil(Math.sqrt(selectedPatterns.length));
    const rows = Math.ceil(selectedPatterns.length / cols);
    
    return selectedPatterns.map((patternId, index) => {
      const pattern = patterns.find(p => p.id === patternId);
      if (!pattern) return null;
      
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      return {
        pattern,
        x: (col * (containerWidth / cols)) + (containerWidth / cols - patternWidth) / 2,
        y: (row * (containerHeight / rows)) + (containerHeight / rows - patternHeight) / 2,
        width: patternWidth,
        height: patternHeight
      };
    }).filter(Boolean);
  }, [selectedPatterns, patterns]);
  
  const patternLayouts = useMemo(() => createLayout(), [createLayout]);
  
  // Create connections between patterns
  const createConnections = useCallback(() => {
    const connections: FlowConnection[] = [];
    
    for (let i = 0; i < patternLayouts.length - 1; i++) {
      const fromPattern = patternLayouts[i];
      const toPattern = patternLayouts[i + 1];
      
      if (fromPattern && toPattern) {
        connections.push({
          id: `connection-${i}`,
          from: fromPattern.pattern.id,
          to: toPattern.pattern.id,
          progress: 0,
          active: false,
          message: `Data flow from ${fromPattern.pattern.name} to ${toPattern.pattern.name}`
        });
      }
    }
    
    return connections;
  }, [patternLayouts]);
  
  // Create edge path between patterns - same as SimplePatternFlow
  const createConnectionPath = (fromId: string, toId: string) => {
    const fromLayout = patternLayouts.find(p => p?.pattern.id === fromId);
    const toLayout = patternLayouts.find(p => p?.pattern.id === toId);
    
    if (!fromLayout || !toLayout) return '';
    
    const fromX = fromLayout.x + fromLayout.width / 2;
    const fromY = fromLayout.y + fromLayout.height / 2;
    const toX = toLayout.x + toLayout.width / 2;
    const toY = toLayout.y + toLayout.height / 2;
    
    // Simple curved path
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const controlY = midY - 30;
    
    return `M ${fromX} ${fromY} Q ${midX} ${controlY} ${toX} ${toY}`;
  };
  
  // Start multi-pattern simulation
  const startSimulation = useCallback(() => {
    setIsAnimating(true);
    setActivePatterns(new Set());
    
    const connections = createConnections();
    setFlowConnections(connections);
    
    // Animate patterns one by one
    let currentIndex = 0;
    
    const animateNext = () => {
      if (currentIndex >= patternLayouts.length) {
        setIsAnimating(false);
        setActivePatterns(new Set());
        return;
      }
      
      const currentPattern = patternLayouts[currentIndex];
      if (!currentPattern) return;
      
      // Activate current pattern
      setActivePatterns(prev => new Set([...prev, currentPattern.pattern.id]));
      
      // Animate connection to next pattern
      if (currentIndex < patternLayouts.length - 1) {
        const connection = connections[currentIndex];
        if (connection) {
          setFlowConnections(prev => prev.map(c => 
            c.id === connection.id ? { ...c, active: true, progress: 0 } : c
          ));
          
          // Animate connection progress
          let progress = 0;
          const animateConnection = () => {
            progress += 0.05;
            if (progress <= 1) {
              setFlowConnections(prev => prev.map(c => 
                c.id === connection.id ? { ...c, progress } : c
              ));
              setTimeout(animateConnection, 50);
            } else {
              setFlowConnections(prev => prev.map(c => 
                c.id === connection.id ? { ...c, active: false, progress: 1 } : c
              ));
            }
          };
          animateConnection();
        }
      }
      
      currentIndex++;
      setTimeout(animateNext, 2000);
    };
    
    animateNext();
  }, [patternLayouts, createConnections]);
  
  // Reset simulation
  const resetSimulation = useCallback(() => {
    setIsAnimating(false);
    setFlowConnections([]);
    setActivePatterns(new Set());
  }, []);
  
  // Toggle pattern selection
  const togglePattern = (patternId: string) => {
    if (isAnimating) return;
    
    setSelectedPatterns(prev => 
      prev.includes(patternId) 
        ? prev.filter(id => id !== patternId)
        : [...prev, patternId]
    );
  };
  
  // Get pattern colors
  const getPatternColors = (patternId: string, isActive: boolean) => {
    const colorMap = {
      'react-agent': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
      'codeact-agent': { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
      'self-reflection': { bg: '#fef3c7', border: '#d97706', text: '#92400e' },
      'agentic-rag': { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca' },
      'modern-tool-use': { bg: '#fce7f3', border: '#ec4899', text: '#be185d' }
    };
    
    if (theme === 'dark') {
      const darkColors = {
        'react-agent': { bg: '#1e3a8a', border: '#3b82f6', text: '#93c5fd' },
        'codeact-agent': { bg: '#14532d', border: '#16a34a', text: '#86efac' },
        'self-reflection': { bg: '#451a03', border: '#d97706', text: '#fed7aa' },
        'agentic-rag': { bg: '#312e81', border: '#6366f1', text: '#c7d2fe' },
        'modern-tool-use': { bg: '#831843', border: '#ec4899', text: '#f9a8d4' }
      };
      const colors = darkColors[patternId] || { bg: '#1e293b', border: '#64748b', text: '#cbd5e1' };
      
      if (isActive) {
        return { bg: '#1d4ed8', border: '#60a5fa', text: '#ffffff' };
      }
      return colors;
    }
    
    const colors = colorMap[patternId] || { bg: '#f8fafc', border: '#64748b', text: '#475569' };
    
    if (isActive) {
      return { bg: '#3b82f6', border: '#1d4ed8', text: '#ffffff' };
    }
    
    return colors;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Multi-Pattern Flow Visualization</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              disabled={isAnimating}
            >
              <ArrowsClockwise size={14} />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={startSimulation}
              disabled={isAnimating || selectedPatterns.length < 2}
            >
              <Play size={14} />
              {isAnimating ? 'Running...' : 'Start Flow'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Pattern selection */}
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium mr-2">Select Patterns:</span>
            {agentPatterns.map(pattern => (
              <label key={pattern.id} className="flex items-center gap-1 cursor-pointer">
                <Checkbox
                  checked={selectedPatterns.includes(pattern.id)}
                  onCheckedChange={() => togglePattern(pattern.id)}
                  disabled={isAnimating}
                />
                <span className="text-sm">{pattern.name}</span>
              </label>
            ))}
          </div>
          
          {/* Visualization */}
          <div className="relative border rounded-lg p-6 bg-gray-50 dark:bg-gray-900" style={{ height: '700px' }}>
            <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
              {/* Render connections */}
              {flowConnections.map(connection => {
                const path = createConnectionPath(connection.from, connection.to);
                
                return (
                  <g key={connection.id}>
                    {/* Base connection */}
                    <path
                      d={path}
                      fill="none"
                      stroke={theme === 'dark' ? '#374151' : '#d1d5db'}
                      strokeWidth="2"
                      markerEnd="url(#connection-arrow)"
                    />
                    {/* Animated connection */}
                    {connection.active && (
                      <path
                        d={path}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="10,5"
                        strokeDashoffset={-connection.progress * 50}
                        opacity={0.8}
                        markerEnd="url(#connection-arrow-active)"
                      />
                    )}
                  </g>
                );
              })}
              
              {/* Arrow markers */}
              <defs>
                <marker id="connection-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={theme === 'dark' ? '#374151' : '#d1d5db'} />
                </marker>
                <marker id="connection-arrow-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>
            </svg>
            
            {/* Render patterns */}
            {patternLayouts.map(layout => {
              if (!layout) return null;
              
              const isActive = activePatterns.has(layout.pattern.id);
              const colors = getPatternColors(layout.pattern.id, isActive);
              
              return (
                <div
                  key={layout.pattern.id}
                  className="absolute rounded-xl border-2 p-4 transition-all duration-500 cursor-pointer hover:shadow-xl"
                  style={{
                    left: layout.x,
                    top: layout.y,
                    width: layout.width,
                    height: layout.height,
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    zIndex: isActive ? 10 : 1,
                    boxShadow: isActive 
                      ? '0 20px 40px -12px rgba(0, 0, 0, 0.25)' 
                      : '0 4px 12px -2px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="font-bold text-lg mb-2 leading-tight">
                    {layout.pattern.name}
                  </div>
                  <div className="text-sm opacity-75 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {layout.pattern.id}
                    </Badge>
                  </div>
                  <div className="text-xs opacity-70 leading-relaxed line-clamp-4">
                    {layout.pattern.description}
                  </div>
                  
                  {isActive && (
                    <>
                      <div className="absolute top-3 right-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                      <div className="absolute inset-0 rounded-xl border-2 border-blue-400 animate-pulse opacity-30 pointer-events-none" />
                    </>
                  )}
                </div>
              );
            })}
            
            {/* Status indicator */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/10 rounded-full px-4 py-2 text-sm">
                <DotsSixVertical size={14} />
                {isAnimating ? 
                  'Visualizing data flow between selected patterns...' : 
                  selectedPatterns.length < 2 
                    ? 'Select at least 2 patterns to see multi-pattern flow'
                    : 'Click "Start Flow" to see how patterns work together'
                }
              </div>
            </div>
          </div>
          
          {/* Selected patterns info */}
          {selectedPatterns.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Selected Patterns ({selectedPatterns.length}):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patterns.map(pattern => (
                  <div key={pattern.id} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ 
                      backgroundColor: getPatternColors(pattern.id, false).border 
                    }} />
                    <span className="font-medium">{pattern.name}</span>
                    <span className="text-muted-foreground">({pattern.id})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleMultiPatternVisualizer;
