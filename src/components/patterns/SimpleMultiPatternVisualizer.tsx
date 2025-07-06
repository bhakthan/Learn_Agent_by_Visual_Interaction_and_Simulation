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
  nodeSteps: Map<string, number>; // Track individual node step numbers
}

const SimpleMultiPatternVisualizer: React.FC<SimpleMultiPatternVisualizerProps> = ({ 
  initialPatterns 
}) => {
  const { theme } = useTheme();
  const defaultPatterns = initialPatterns || [agentPatterns[0]?.id, agentPatterns[1]?.id].filter(Boolean);
  
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>(defaultPatterns);
  const [viewMode, setViewMode] = useState<'individual' | 'comparison'>('comparison');
  const [flowStates, setFlowStates] = useState<Record<string, PatternFlowState>>({});
  const [showPatternSelector, setShowPatternSelector] = useState(false);
  const [globalAnimation, setGlobalAnimation] = useState(false);

  // Get actual pattern data
  const selectedPatterns = agentPatterns.filter(pattern => 
    selectedPatternIds.includes(pattern.id)
  );

  // Create a clean flow-based layout for pattern visualization
  const createFlowLayout = (pattern: PatternData, containerWidth: number, containerHeight: number) => {
    const layout: Record<string, { x: number; y: number; width: number; height: number }> = {};
    const nodeWidth = 100;
    const nodeHeight = 60;
    
    if (!pattern.nodes) return layout;
    
    const nodes = pattern.nodes;
    const padding = 20;
    const minSpacing = 25;
    
    // Calculate available space
    const availableWidth = containerWidth - (padding * 2);
    const availableHeight = containerHeight - (padding * 2);
    
    if (nodes.length === 1) {
      // Single node - center it
      layout[nodes[0].id] = {
        x: (containerWidth - nodeWidth) / 2,
        y: (containerHeight - nodeHeight) / 2,
        width: nodeWidth,
        height: nodeHeight
      };
    } else if (nodes.length <= 4) {
      // Small patterns - use a flowing horizontal layout with good spacing
      const totalNodeWidth = nodes.length * nodeWidth;
      const totalSpacing = Math.max(minSpacing * (nodes.length - 1), availableWidth - totalNodeWidth);
      const spacing = totalSpacing / (nodes.length - 1);
      
      nodes.forEach((node, index) => {
        const x = padding + index * (nodeWidth + spacing);
        // Add some vertical variation to make it more interesting
        const yOffset = index % 2 === 0 ? 0 : 20;
        const y = Math.max(padding, Math.min(availableHeight - nodeHeight + padding, (containerHeight - nodeHeight) / 2 + yOffset));
        
        layout[node.id] = {
          x: Math.max(padding, Math.min(containerWidth - nodeWidth - padding, x)),
          y: y,
          width: nodeWidth,
          height: nodeHeight
        };
      });
    } else {
      // Larger patterns - use a grid layout
      const cols = Math.min(3, Math.ceil(Math.sqrt(nodes.length)));
      const rows = Math.ceil(nodes.length / cols);
      
      const colSpacing = availableWidth / cols;
      const rowSpacing = availableHeight / rows;
      
      nodes.forEach((node, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        const x = padding + col * colSpacing + (colSpacing - nodeWidth) / 2;
        const y = padding + row * rowSpacing + (rowSpacing - nodeHeight) / 2;
        
        layout[node.id] = {
          x: Math.max(padding, Math.min(containerWidth - nodeWidth - padding, x)),
          y: Math.max(padding, Math.min(containerHeight - nodeHeight - padding, y)),
          width: nodeWidth,
          height: nodeHeight
        };
      });
    }
    
    return layout;
  };

  // Create curved path with directional indicators
  const createFlowEdgePath = (fromId: string, toId: string, layout: Record<string, any>) => {
    const fromLayout = layout[fromId];
    const toLayout = layout[toId];
    
    if (!fromLayout || !toLayout) return { path: '', arrowPath: '', midPoint: { x: 0, y: 0 } };
    
    // Calculate connection points from center of nodes
    const fromCenterX = fromLayout.x + fromLayout.width / 2;
    const fromCenterY = fromLayout.y + fromLayout.height / 2;
    const toCenterX = toLayout.x + toLayout.width / 2;
    const toCenterY = toLayout.y + toLayout.height / 2;
    
    // Calculate edge points on node boundaries
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { path: '', arrowPath: '', midPoint: { x: 0, y: 0 } };
    
    // Offset from center to edge of node
    const fromOffsetX = (dx / distance) * (fromLayout.width / 2);
    const fromOffsetY = (dy / distance) * (fromLayout.height / 2);
    const toOffsetX = (dx / distance) * (toLayout.width / 2);
    const toOffsetY = (dy / distance) * (toLayout.height / 2);
    
    const fromX = fromCenterX + fromOffsetX;
    const fromY = fromCenterY + fromOffsetY;
    const toX = toCenterX - toOffsetX;
    const toY = toCenterY - toOffsetY;
    
    // Create smooth curved path
    const controlOffset = Math.min(60, distance / 3);
    const controlX1 = fromX + controlOffset;
    const controlY1 = fromY;
    const controlX2 = toX - controlOffset;
    const controlY2 = toY;
    
    const path = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;
    
    // Calculate midpoint for directional indicator
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    
    // Create arrow indicator at midpoint
    const arrowAngle = Math.atan2(dy, dx);
    const arrowSize = 8;
    const arrowX1 = midX - arrowSize * Math.cos(arrowAngle - Math.PI / 6);
    const arrowY1 = midY - arrowSize * Math.sin(arrowAngle - Math.PI / 6);
    const arrowX2 = midX - arrowSize * Math.cos(arrowAngle + Math.PI / 6);
    const arrowY2 = midY - arrowSize * Math.sin(arrowAngle + Math.PI / 6);
    
    const arrowPath = `M ${midX} ${midY} L ${arrowX1} ${arrowY1} M ${midX} ${midY} L ${arrowX2} ${arrowY2}`;
    
    return { 
      path, 
      arrowPath, 
      midPoint: { x: midX, y: midY }
    };
  };

  // Extract pattern features for comparison
  const extractPatternFeatures = (pattern: PatternData) => {
    const features = {
      complexity: pattern.nodes?.length || 0,
      hasMemory: pattern.nodes?.some(node => node.data?.nodeType?.includes('memory')) || false,
      hasReflection: pattern.nodes?.some(node => node.data?.nodeType?.includes('reflection')) || false,
      hasTools: pattern.nodes?.some(node => node.data?.nodeType?.includes('tool')) || false,
      hasRAG: pattern.nodes?.some(node => node.data?.nodeType?.includes('rag')) || false,
      architecture: pattern.id.includes('react') ? 'ReAct' : 
                   pattern.id.includes('codeact') ? 'CodeAct' :
                   pattern.id.includes('reflection') ? 'Self-Reflection' :
                   pattern.id.includes('rag') ? 'RAG-based' : 'Custom',
      primaryCapability: pattern.name.split(' ')[0],
      nodeTypes: [...new Set(pattern.nodes?.map(n => n.data?.nodeType || 'agent') || [])],
      edgeCount: pattern.edges?.length || 0
    };
    
    return features;
  };

  // Get node colors with better distinction
  const getNodeColors = (patternId: string, nodeType: string, isActive: boolean) => {
    const patternColors = {
      'react-agent': { base: '#3b82f6', light: '#dbeafe' },
      'codeact-agent': { base: '#16a34a', light: '#dcfce7' },
      'self-reflection': { base: '#d97706', light: '#fef3c7' },
      'agentic-rag': { base: '#8b5cf6', light: '#f3e8ff' },
      'modern-tool-use': { base: '#ec4899', light: '#fdf2f8' }
    };
    
    const colors = patternColors[patternId] || { base: '#64748b', light: '#f1f5f9' };
    
    if (isActive) {
      return {
        bg: colors.base,
        border: colors.base,
        text: '#ffffff'
      };
    }
    
    return {
      bg: colors.light,
      border: colors.base,
      text: colors.base
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
        activeNodes: new Set(),
        nodeSteps: new Map()
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
      setFlowStates(prev => {
        const newNodeSteps = new Map(prev[patternId]?.nodeSteps || []);
        newNodeSteps.set(nodeId, stepIndex + 1); // Set individual node step number
        
        return {
          ...prev,
          [patternId]: {
            ...prev[patternId],
            currentStep: stepIndex + 1,
            activeNodes: new Set([...prev[patternId]?.activeNodes || [], nodeId]),
            nodeSteps: newNodeSteps
          }
        };
      });

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
                const layout = createFlowLayout(pattern, 800, 200);
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
                    
                    <div className="relative border rounded-lg bg-gray-50 dark:bg-gray-900" style={{ height: '250px' }}>
                      {/* No edge rendering - clean node-only visualization */}
                      
                      {/* Render nodes */}
                      {pattern.nodes?.map(node => {
                        const nodeLayout = layout[node.id];
                        const isActive = flowState?.activeNodes.has(node.id);
                        const colors = getNodeColors(pattern.id, node.data?.nodeType || 'default', isActive);
                        
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
                            {/* Show sequence number during simulation */}
                            {flowState?.isAnimating && isActive && (
                              <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {flowState.nodeSteps.get(node.id) || 0}
                              </div>
                            )}
                            {/* Simple active indicator */}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pattern Visualizations */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-semibold text-lg">Pattern Flow Visualization</h3>
                  {selectedPatterns.map(pattern => {
                    const layout = createFlowLayout(pattern, 600, 200);
                    const flowState = flowStates[pattern.id];
                    
                    return (
                      <Card key={pattern.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getNodeColors(pattern.id, 'default', false).border }}
                            />
                            <h4 className="font-medium">{pattern.name}</h4>
                            <Badge variant="outline" className="text-xs">{pattern.id}</Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startPatternAnimation(pattern.id)}
                            disabled={flowState?.isAnimating || globalAnimation}
                            className="h-7 px-3 text-xs"
                          >
                            <Play size={12} />
                            Run
                          </Button>
                        </div>
                        
                        <div className="relative border rounded-lg bg-gray-50 dark:bg-gray-900" style={{ height: '220px' }}>
                          {/* No edge rendering - clean node-only visualization */}
                          
                          {/* Render nodes */}
                          {pattern.nodes?.map((node, index) => {
                            const nodeLayout = layout[node.id];
                            const isActive = flowState?.activeNodes.has(node.id);
                            const colors = getNodeColors(pattern.id, node.data?.nodeType || 'default', isActive);
                            
                            return (
                              <div
                                key={node.id}
                                className="absolute rounded-lg border-2 p-2 transition-all duration-500"
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
                                <div className="font-medium text-xs truncate mb-1">
                                  {node.data?.label || node.id}
                                </div>
                                <div className="text-xs opacity-70 capitalize">
                                  {node.data?.nodeType || 'agent'}
                                </div>
                                {/* Show sequence number during simulation */}
                                {flowState?.isAnimating && isActive && (
                                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {flowState.nodeSteps.get(node.id) || 0}
                                  </div>
                                )}
                                {/* Node position indicator */}
                                <div className="text-xs text-right absolute bottom-1 right-1 opacity-50">
                                  {index + 1}
                                </div>
                                {/* Simple active indicator */}
                                {isActive && (
                                  <div className="absolute top-1 right-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          {pattern.description}
                        </div>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Feature Comparison Table */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Feature Comparison</CardTitle>
                      <CardDescription className="text-sm">
                        Key characteristics of selected patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedPatterns.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Table size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Select patterns to compare features</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Architecture Comparison */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Architecture Type</h4>
                            <div className="space-y-2">
                              {selectedPatterns.map(pattern => {
                                const features = extractPatternFeatures(pattern);
                                return (
                                  <div key={pattern.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getNodeColors(pattern.id, 'default', false).border }}
                                      />
                                      <span className="truncate">{pattern.name}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {features.architecture}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Complexity Comparison */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Complexity (Nodes)</h4>
                            <div className="space-y-2">
                              {selectedPatterns.map(pattern => {
                                const features = extractPatternFeatures(pattern);
                                return (
                                  <div key={pattern.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getNodeColors(pattern.id, 'default', false).border }}
                                      />
                                      <span className="truncate">{pattern.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <div className="w-12 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="h-2 rounded-full transition-all duration-300"
                                          style={{ 
                                            width: `${Math.min(100, (features.complexity / 8) * 100)}%`,
                                            backgroundColor: getNodeColors(pattern.id, 'default', false).border
                                          }}
                                        />
                                      </div>
                                      <span className="text-xs text-muted-foreground w-4">
                                        {features.complexity}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Capability Matrix */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Capabilities</h4>
                            <div className="space-y-3">
                              {['hasMemory', 'hasReflection', 'hasTools', 'hasRAG'].map(capability => (
                                <div key={capability} className="space-y-1">
                                  <div className="text-xs text-muted-foreground capitalize">
                                    {capability.replace('has', '').toLowerCase()}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {selectedPatterns.map(pattern => {
                                      const features = extractPatternFeatures(pattern);
                                      const hasCapability = features[capability as keyof typeof features] as boolean;
                                      return (
                                        <div 
                                          key={pattern.id}
                                          className={`w-4 h-4 rounded-sm flex items-center justify-center text-xs ${
                                            hasCapability ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                                          }`}
                                          title={`${pattern.name} ${hasCapability ? 'has' : 'lacks'} ${capability.replace('has', '').toLowerCase()}`}
                                        >
                                          {hasCapability ? '✓' : '−'}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Performance Indicators */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">Pattern Stats</h4>
                            <div className="space-y-2">
                              {selectedPatterns.map(pattern => {
                                const features = extractPatternFeatures(pattern);
                                return (
                                  <div key={pattern.id} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getNodeColors(pattern.id, 'default', false).border }}
                                      />
                                      <span className="text-xs font-medium">{pattern.name}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground ml-4">
                                      {features.complexity} nodes • {features.edgeCount} connections
                                    </div>
                                    <div className="text-xs text-muted-foreground ml-4">
                                      Types: {features.nodeTypes.join(', ')}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleMultiPatternVisualizer;
