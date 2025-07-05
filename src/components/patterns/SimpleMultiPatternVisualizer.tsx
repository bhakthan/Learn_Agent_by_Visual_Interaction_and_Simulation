import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowsCounterClockwise, Play, ArrowsHorizontal, ChartLine, Table, Plus, X } from '@phosphor-icons/react';
import { PatternData, agentPatterns } from '@/lib/data/patterns';
import { useTheme } from '@/components/theme/ThemeProvider';

interface SimpleMultiPatternVisualizerProps {
  initialPatterns?: string[];
}

interface PatternFlowState {
  patternId: string;
  isAnimating: boolean;
  currentStep: number;
  activeNodes: Set<string>;
}

const SimpleMultiPatternVisualizer: React.FC<SimpleMultiPatternVisualizerProps> = ({ 
  initialPatterns 
}) => {
  const { theme } = useTheme();
  const defaultPatterns = initialPatterns || [agentPatterns[0]?.id, agentPatterns[1]?.id].filter(Boolean);
  
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>(defaultPatterns);
  const [viewMode, setViewMode] = useState<'individual' | 'comparison'>('individual');
  const [flowStates, setFlowStates] = useState<Record<string, PatternFlowState>>({});
  const [showPatternSelector, setShowPatternSelector] = useState(false);
  const [globalAnimation, setGlobalAnimation] = useState(false);

  // Get actual pattern data
  const selectedPatterns = agentPatterns.filter(pattern => 
    selectedPatternIds.includes(pattern.id)
  );

  // Create compact layout for multi-pattern view
  const createCompactLayout = (pattern: PatternData, containerWidth: number, containerHeight: number) => {
    const layout: Record<string, { x: number; y: number; width: number; height: number }> = {};
    const nodeWidth = 120;
    const nodeHeight = 70;
    
    if (!pattern.nodes) return layout;
    
    pattern.nodes.forEach((node, index) => {
      if (node.position) {
        // Scale down existing positions
        const scaleX = containerWidth / 1000;
        const scaleY = containerHeight / 600;
        layout[node.id] = {
          x: Math.max(10, Math.min(containerWidth - nodeWidth - 10, node.position.x * scaleX)),
          y: Math.max(10, Math.min(containerHeight - nodeHeight - 10, node.position.y * scaleY)),
          width: nodeWidth,
          height: nodeHeight
        };
      } else {
        // Simple grid layout
        const cols = Math.ceil(Math.sqrt(pattern.nodes.length));
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        layout[node.id] = {
          x: 20 + col * (nodeWidth + 20),
          y: 20 + row * (nodeHeight + 20),
          width: nodeWidth,
          height: nodeHeight
        };
      }
    });
    
    return layout;
  };

  // Create edge path for compact view
  const createCompactEdgePath = (fromId: string, toId: string, layout: Record<string, any>) => {
    const fromLayout = layout[fromId];
    const toLayout = layout[toId];
    
    if (!fromLayout || !toLayout) return '';
    
    const fromX = fromLayout.x + fromLayout.width / 2;
    const fromY = fromLayout.y + fromLayout.height / 2;
    const toX = toLayout.x + toLayout.width / 2;
    const toY = toLayout.y + toLayout.height / 2;
    
    // Straight line for compact view
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  };

  // Get node colors based on pattern and type
  const getCompactNodeColors = (patternId: string, nodeType: string, isActive: boolean) => {
    const patternColors = {
      'react-agent': '#3b82f6',
      'codeact-agent': '#16a34a', 
      'self-reflection': '#d97706',
      'agentic-rag': '#8b5cf6',
      'modern-tool-use': '#ec4899'
    };
    
    const baseColor = patternColors[patternId] || '#64748b';
    
    if (isActive) {
      return {
        bg: baseColor,
        border: baseColor,
        text: '#ffffff'
      };
    }
    
    return {
      bg: theme === 'dark' ? `${baseColor}20` : `${baseColor}10`,
      border: baseColor,
      text: theme === 'dark' ? '#ffffff' : '#000000'
    };
  };

  // Toggle pattern selection
  const togglePatternSelection = useCallback((patternId: string) => {
    setSelectedPatternIds(current => {
      if (current.includes(patternId)) {
        return current.filter(id => id !== patternId);
      }
      
      if (current.length >= 3) {
        return [...current.slice(0, 2), patternId];
      }
      
      return [...current, patternId];
    });
  }, []);

  // Start animation for specific pattern
  const startPatternAnimation = useCallback((patternId: string) => {
    setFlowStates(prev => ({
      ...prev,
      [patternId]: {
        patternId,
        isAnimating: true,
        currentStep: 0,
        activeNodes: new Set()
      }
    }));

    // Simple animation sequence
    const pattern = agentPatterns.find(p => p.id === patternId);
    if (!pattern?.nodes) return;

    let stepIndex = 0;
    const animateStep = () => {
      if (stepIndex >= pattern.nodes.length) {
        setFlowStates(prev => ({
          ...prev,
          [patternId]: { ...prev[patternId], isAnimating: false }
        }));
        return;
      }

      const nodeId = pattern.nodes[stepIndex].id;
      setFlowStates(prev => ({
        ...prev,
        [patternId]: {
          ...prev[patternId],
          currentStep: stepIndex,
          activeNodes: new Set([...prev[patternId]?.activeNodes || [], nodeId])
        }
      }));

      stepIndex++;
      setTimeout(animateStep, 1000);
    };

    animateStep();
  }, []);

  // Start global animation
  const startGlobalAnimation = useCallback(() => {
    setGlobalAnimation(true);
    selectedPatternIds.forEach((patternId, index) => {
      setTimeout(() => startPatternAnimation(patternId), index * 500);
    });
    
    setTimeout(() => setGlobalAnimation(false), selectedPatternIds.length * 1000 + 3000);
  }, [selectedPatternIds, startPatternAnimation]);

  // Reset all animations
  const resetAnimations = useCallback(() => {
    setFlowStates({});
    setGlobalAnimation(false);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Pattern Flow Comparison</span>
            <Badge variant="outline">{selectedPatterns.length} patterns</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPatternSelector(!showPatternSelector)}
            >
              <Plus size={14} />
              Select Patterns
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAnimations}
              disabled={globalAnimation}
            >
              <ArrowsCounterClockwise size={14} />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={startGlobalAnimation}
              disabled={globalAnimation || selectedPatterns.length === 0}
            >
              <Play size={14} />
              {globalAnimation ? 'Running...' : 'Start All'}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Compare multiple agent patterns side by side and see how they process information differently
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Pattern Selector */}
          {showPatternSelector && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">Available Patterns:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {agentPatterns.map(pattern => (
                  <Button
                    key={pattern.id}
                    variant={selectedPatternIds.includes(pattern.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePatternSelection(pattern.id)}
                    className="justify-start text-left h-auto p-2"
                  >
                    <div>
                      <div className="font-medium text-xs">{pattern.name}</div>
                      <div className="text-xs opacity-70">{pattern.id}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="individual" className="flex items-center gap-1">
                <ChartLine size={14} /> Individual View
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-1">
                <Table size={14} /> Comparison View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-4 mt-4">
              {selectedPatterns.map(pattern => {
                const layout = createCompactLayout(pattern, 700, 400);
                const flowState = flowStates[pattern.id];
                
                return (
                  <Card key={pattern.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{pattern.name}</h3>
                        <Badge variant="outline">{pattern.id}</Badge>
                        {selectedPatternIds.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPatternIds(prev => prev.filter(id => id !== pattern.id))}
                          >
                            <X size={12} />
                          </Button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startPatternAnimation(pattern.id)}
                        disabled={flowState?.isAnimating || globalAnimation}
                      >
                        <Play size={14} />
                        Simulate
                      </Button>
                    </div>
                    
                    <div className="relative border rounded-lg bg-gray-50 dark:bg-gray-900" style={{ height: '400px' }}>
                      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                        {/* Render edges */}
                        {pattern.edges?.map(edge => {
                          const path = createCompactEdgePath(edge.source, edge.target, layout);
                          const isActive = flowState?.activeNodes.has(edge.source) && flowState?.activeNodes.has(edge.target);
                          
                          return (
                            <path
                              key={edge.id}
                              d={path}
                              fill="none"
                              stroke={isActive ? '#3b82f6' : (theme === 'dark' ? '#64748b' : '#9ca3af')}
                              strokeWidth={isActive ? "3" : "2"}
                              markerEnd="url(#arrowhead)"
                              opacity={isActive ? 1 : 0.6}
                            />
                          );
                        })}
                        
                        <defs>
                          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill={theme === 'dark' ? '#64748b' : '#9ca3af'} />
                          </marker>
                        </defs>
                      </svg>
                      
                      {/* Render nodes */}
                      {pattern.nodes?.map(node => {
                        const nodeLayout = layout[node.id];
                        const isActive = flowState?.activeNodes.has(node.id);
                        const colors = getCompactNodeColors(pattern.id, node.data?.nodeType || 'default', isActive);
                        
                        return (
                          <div
                            key={node.id}
                            className="absolute rounded-lg border-2 p-2 transition-all duration-300"
                            style={{
                              left: nodeLayout.x,
                              top: nodeLayout.y,
                              width: nodeLayout.width,
                              height: nodeLayout.height,
                              backgroundColor: colors.bg,
                              borderColor: colors.border,
                              color: colors.text,
                              transform: isActive ? 'scale(1.05)' : 'scale(1)',
                              zIndex: isActive ? 10 : 1
                            }}
                          >
                            <div className="font-medium text-sm truncate">
                              {node.data?.label || node.id}
                            </div>
                            <div className="text-xs opacity-70 capitalize">
                              {node.data?.nodeType || 'agent'}
                            </div>
                            {isActive && (
                              <div className="absolute top-1 right-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">{pattern.description}</p>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="comparison" className="mt-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Side-by-Side Comparison</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedPatterns.map(pattern => {
                    const layout = createCompactLayout(pattern, 350, 300);
                    const flowState = flowStates[pattern.id];
                    
                    return (
                      <div key={pattern.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{pattern.name}</h4>
                          <Badge variant="outline" className="text-xs">{pattern.id}</Badge>
                        </div>
                        
                        <div className="relative border rounded bg-gray-50 dark:bg-gray-900" style={{ height: '300px' }}>
                          <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                            {pattern.edges?.map(edge => {
                              const path = createCompactEdgePath(edge.source, edge.target, layout);
                              const isActive = flowState?.activeNodes.has(edge.source) && flowState?.activeNodes.has(edge.target);
                              
                              return (
                                <path
                                  key={edge.id}
                                  d={path}
                                  fill="none"
                                  stroke={isActive ? '#3b82f6' : (theme === 'dark' ? '#64748b' : '#9ca3af')}
                                  strokeWidth={isActive ? "2" : "1"}
                                  opacity={isActive ? 1 : 0.6}
                                />
                              );
                            })}
                          </svg>
                          
                          {pattern.nodes?.map(node => {
                            const nodeLayout = layout[node.id];
                            const isActive = flowState?.activeNodes.has(node.id);
                            const colors = getCompactNodeColors(pattern.id, node.data?.nodeType || 'default', isActive);
                            
                            return (
                              <div
                                key={node.id}
                                className="absolute rounded border p-1 transition-all duration-300"
                                style={{
                                  left: nodeLayout.x,
                                  top: nodeLayout.y,
                                  width: nodeLayout.width * 0.8,
                                  height: nodeLayout.height * 0.8,
                                  backgroundColor: colors.bg,
                                  borderColor: colors.border,
                                  color: colors.text,
                                  fontSize: '10px',
                                  transform: isActive ? 'scale(1.1)' : 'scale(1)'
                                }}
                              >
                                <div className="font-medium truncate">
                                  {node.data?.label || node.id}
                                </div>
                                {isActive && (
                                  <div className="absolute top-0 right-0">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {pattern.nodes?.length || 0} nodes
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startPatternAnimation(pattern.id)}
                            disabled={flowState?.isAnimating || globalAnimation}
                            className="h-6 px-2 text-xs"
                          >
                            Simulate
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {selectedPatterns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowsHorizontal size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Select patterns to compare their flows side by side</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleMultiPatternVisualizer;
