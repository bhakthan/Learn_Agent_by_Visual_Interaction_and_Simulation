import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Stop, ArrowsCounterClockwise, Palette, Gear } from '@phosphor-icons/react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface SimpleFlowDemoProps {}

interface FlowNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: 'user' | 'agent' | 'tool' | 'memory' | 'output';
  active: boolean;
  description?: string;
}

interface FlowEdge {
  id: string;
  from: string;
  to: string;
  progress: number;
  active: boolean;
  message?: string;
}

interface FlowPreset {
  id: string;
  name: string;
  description: string;
  nodes: Omit<FlowNode, 'active'>[];
  edges: Omit<FlowEdge, 'progress' | 'active'>[];
}

const SimpleFlowDemo: React.FC<SimpleFlowDemoProps> = () => {
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPreset, setCurrentPreset] = useState('basic');
  const [showGrid, setShowGrid] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [colorScheme, setColorScheme] = useState('default');
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [animatedEdges, setAnimatedEdges] = useState<FlowEdge[]>([]);

  // Flow presets
  const flowPresets: FlowPreset[] = [
    {
      id: 'basic',
      name: 'Basic Agent Flow',
      description: 'Simple user → agent → tool → response pattern',
      nodes: [
        { id: 'user', x: 50, y: 200, width: 160, height: 100, label: 'User Input', type: 'user', description: 'User provides query' },
        { id: 'agent', x: 300, y: 200, width: 160, height: 100, label: 'AI Agent', type: 'agent', description: 'Processes and reasons' },
        { id: 'tool', x: 550, y: 200, width: 160, height: 100, label: 'Tool/API', type: 'tool', description: 'External data source' },
        { id: 'output', x: 800, y: 200, width: 160, height: 100, label: 'Response', type: 'output', description: 'Final answer' }
      ],
      edges: [
        { id: 'e1', from: 'user', to: 'agent', message: 'query' },
        { id: 'e2', from: 'agent', to: 'tool', message: 'tool call' },
        { id: 'e3', from: 'tool', to: 'agent', message: 'data' },
        { id: 'e4', from: 'agent', to: 'output', message: 'response' }
      ]
    },
    {
      id: 'multi-agent',
      name: 'Multi-Agent Collaboration',
      description: 'Multiple agents working together',
      nodes: [
        { id: 'user', x: 50, y: 250, width: 140, height: 80, label: 'User', type: 'user' },
        { id: 'coordinator', x: 250, y: 150, width: 140, height: 80, label: 'Coordinator', type: 'agent' },
        { id: 'researcher', x: 450, y: 100, width: 140, height: 80, label: 'Researcher', type: 'agent' },
        { id: 'analyst', x: 450, y: 200, width: 140, height: 80, label: 'Analyst', type: 'agent' },
        { id: 'writer', x: 450, y: 300, width: 140, height: 80, label: 'Writer', type: 'agent' },
        { id: 'output', x: 650, y: 200, width: 140, height: 80, label: 'Final Output', type: 'output' }
      ],
      edges: [
        { id: 'e1', from: 'user', to: 'coordinator', message: 'request' },
        { id: 'e2', from: 'coordinator', to: 'researcher', message: 'research task' },
        { id: 'e3', from: 'coordinator', to: 'analyst', message: 'analyze task' },
        { id: 'e4', from: 'coordinator', to: 'writer', message: 'write task' },
        { id: 'e5', from: 'researcher', to: 'output', message: 'findings' },
        { id: 'e6', from: 'analyst', to: 'output', message: 'analysis' },
        { id: 'e7', from: 'writer', to: 'output', message: 'content' }
      ]
    },
    {
      id: 'memory',
      name: 'Memory-Enhanced Agent',
      description: 'Agent with memory and learning capabilities',
      nodes: [
        { id: 'user', x: 50, y: 200, width: 140, height: 80, label: 'User', type: 'user' },
        { id: 'agent', x: 250, y: 200, width: 140, height: 80, label: 'Smart Agent', type: 'agent' },
        { id: 'memory', x: 250, y: 50, width: 140, height: 80, label: 'Memory Store', type: 'memory' },
        { id: 'tool', x: 450, y: 200, width: 140, height: 80, label: 'Tools', type: 'tool' },
        { id: 'output', x: 650, y: 200, width: 140, height: 80, label: 'Response', type: 'output' }
      ],
      edges: [
        { id: 'e1', from: 'user', to: 'agent', message: 'query' },
        { id: 'e2', from: 'agent', to: 'memory', message: 'retrieve context' },
        { id: 'e3', from: 'memory', to: 'agent', message: 'past context' },
        { id: 'e4', from: 'agent', to: 'tool', message: 'tool call' },
        { id: 'e5', from: 'tool', to: 'agent', message: 'data' },
        { id: 'e6', from: 'agent', to: 'memory', message: 'store result' },
        { id: 'e7', from: 'agent', to: 'output', message: 'response' }
      ]
    }
  ];

  const currentPresetData = flowPresets.find(p => p.id === currentPreset) || flowPresets[0];

  // Color schemes
  const colorSchemes = {
    default: {
      user: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
      agent: { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
      tool: { bg: '#fef3c7', border: '#d97706', text: '#92400e' },
      memory: { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca' },
      output: { bg: '#fce7f3', border: '#ec4899', text: '#be185d' }
    },
    professional: {
      user: { bg: '#f1f5f9', border: '#475569', text: '#334155' },
      agent: { bg: '#f8fafc', border: '#64748b', text: '#475569' },
      tool: { bg: '#fafafa', border: '#737373', text: '#525252' },
      memory: { bg: '#f9fafb', border: '#6b7280', text: '#4b5563' },
      output: { bg: '#f7f8f8', border: '#71717a', text: '#52525b' }
    },
    vibrant: {
      user: { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' },
      agent: { bg: '#f0fdf4', border: '#22c55e', text: '#16a34a' },
      tool: { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' },
      memory: { bg: '#f3e8ff', border: '#a855f7', text: '#9333ea' },
      output: { bg: '#ecfdf5', border: '#10b981', text: '#059669' }
    }
  };

  const getNodeColors = (type: string, isActive: boolean) => {
    const scheme = colorSchemes[colorScheme] || colorSchemes.default;
    const colors = scheme[type] || scheme.agent;
    
    if (isActive) {
      return {
        bg: theme === 'dark' ? '#1d4ed8' : '#3b82f6',
        border: theme === 'dark' ? '#60a5fa' : '#1d4ed8',
        text: '#ffffff'
      };
    }
    
    if (theme === 'dark') {
      // Dark mode: use darker backgrounds with light text
      const darkColors = {
        user: { bg: '#1e3a8a', border: '#3b82f6', text: '#dbeafe' },
        agent: { bg: '#14532d', border: '#22c55e', text: '#dcfce7' },
        tool: { bg: '#92400e', border: '#f59e0b', text: '#fef3c7' },
        memory: { bg: '#4338ca', border: '#6366f1', text: '#e0e7ff' },
        output: { bg: '#be185d', border: '#ec4899', text: '#fce7f3' }
      };
      return darkColors[type] || darkColors.agent;
    }
    
    return colors;
  };

  // Create SVG path for edges
  const createEdgePath = (edge: any) => {
    const fromNode = currentPresetData.nodes.find(n => n.id === edge.from);
    const toNode = currentPresetData.nodes.find(n => n.id === edge.to);
    
    if (!fromNode || !toNode) return '';
    
    const fromX = fromNode.x + fromNode.width;
    const fromY = fromNode.y + fromNode.height / 2;
    const toX = toNode.x;
    const toY = toNode.y + toNode.height / 2;
    
    // Create curved path
    const midX = (fromX + toX) / 2;
    const controlY = fromY + (toY - fromY) * 0.5;
    
    return `M ${fromX} ${fromY} Q ${midX} ${controlY} ${toX} ${toY}`;
  };

  // Start simulation
  const startSimulation = useCallback(() => {
    setIsAnimating(true);
    setActiveNodes(new Set());
    
    const edges = currentPresetData.edges.map(edge => ({
      ...edge,
      progress: 0,
      active: false
    }));
    setAnimatedEdges(edges);
    
    // Simulate flow through nodes
    const nodes = currentPresetData.nodes;
    let currentStep = 0;
    
    const animateStep = () => {
      if (currentStep >= nodes.length) {
        setIsAnimating(false);
        return;
      }
      
      const node = nodes[currentStep];
      setActiveNodes(prev => new Set([...prev, node.id]));
      
      // Animate outgoing edges
      const outgoingEdges = edges.filter(e => e.from === node.id);
      outgoingEdges.forEach(edge => {
        setAnimatedEdges(prev => prev.map(e => 
          e.id === edge.id ? { ...e, active: true, progress: 0 } : e
        ));
        
        // Animate edge progress
        let progress = 0;
        const animateEdge = () => {
          progress += 0.1;
          if (progress <= 1) {
            setAnimatedEdges(prev => prev.map(e => 
              e.id === edge.id ? { ...e, progress } : e
            ));
            setTimeout(animateEdge, 100);
          } else {
            setAnimatedEdges(prev => prev.map(e => 
              e.id === edge.id ? { ...e, active: false, progress: 1 } : e
            ));
          }
        };
        setTimeout(animateEdge, 500);
      });
      
      currentStep++;
      setTimeout(animateStep, 2000);
    };
    
    animateStep();
  }, [currentPresetData]);

  const resetSimulation = useCallback(() => {
    setIsAnimating(false);
    setActiveNodes(new Set());
    setAnimatedEdges([]);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Interactive Flow Visualization</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              disabled={isAnimating}
            >
              <ArrowsCounterClockwise size={14} />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={startSimulation}
              disabled={isAnimating}
            >
              <Play size={14} />
              {isAnimating ? 'Running...' : 'Start Demo'}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Explore different agent flow patterns with customizable visualizations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="customize">
              <Palette size={14} className="mr-1" />
              Customize
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Gear size={14} className="mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo" className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="preset">Flow Pattern:</Label>
              <Select value={currentPreset} onValueChange={setCurrentPreset}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {flowPresets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {currentPresetData.description}
            </p>
            
            <div className="relative border rounded-lg p-4 bg-gray-50 dark:bg-gray-900" style={{ height: '500px' }}>
              {showGrid && (
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme === 'dark' ? '#374151' : '#d1d5db'} strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}
              
              <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill={theme === 'dark' ? '#64748b' : '#374151'} />
                  </marker>
                  <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>
                </defs>
                
                {/* Render edges */}
                {currentPresetData.edges.map(edge => {
                  const animatedEdge = animatedEdges.find(ae => ae.id === edge.id);
                  const path = createEdgePath(edge);
                  
                  return (
                    <g key={edge.id}>
                      <path
                        d={path}
                        fill="none"
                        stroke={theme === 'dark' ? '#64748b' : '#374151'}
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                        opacity={0.6}
                      />
                      {animatedEdge?.active && (
                        <path
                          d={path}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray="8,4"
                          strokeDashoffset={-animatedEdge.progress * 40}
                          markerEnd="url(#arrowhead-active)"
                          opacity={0.9}
                        />
                      )}
                      {/* Edge label */}
                      {edge.message && (
                        <text
                          x={currentPresetData.nodes.find(n => n.id === edge.from)?.x + 50}
                          y={currentPresetData.nodes.find(n => n.id === edge.from)?.y + 40}
                          fontSize="12"
                          fill={theme === 'dark' ? '#e2e8f0' : '#64748b'}
                          textAnchor="middle"
                        >
                          {edge.message}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              
              {/* Render nodes */}
              {currentPresetData.nodes.map(node => {
                const isActive = activeNodes.has(node.id);
                const colors = getNodeColors(node.type, isActive);
                
                return (
                  <div
                    key={node.id}
                    className="absolute rounded-lg border-2 p-3 transition-all duration-300 cursor-pointer hover:shadow-lg"
                    style={{
                      left: node.x,
                      top: node.y,
                      width: node.width,
                      height: node.height,
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      color: colors.text,
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      zIndex: isActive ? 10 : 1
                    }}
                  >
                    <div className="font-semibold text-sm">
                      {node.label}
                    </div>
                    <div className="text-xs opacity-75 capitalize">
                      {node.type}
                    </div>
                    {node.description && (
                      <div className="text-xs opacity-60 mt-1">
                        {node.description}
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="customize" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="colorScheme">Color Scheme:</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="vibrant">Vibrant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="grid" checked={showGrid} onCheckedChange={setShowGrid} />
                  <Label htmlFor="grid">Show Grid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="minimap" checked={showMiniMap} onCheckedChange={setShowMiniMap} />
                  <Label htmlFor="minimap">Show Mini Map</Label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <h4 className="font-medium mb-2">About This Demo:</h4>
              <p>
                This interactive visualization demonstrates different agent flow patterns using SVG-based rendering 
                for reliable performance. You can customize the appearance and explore various pre-built patterns 
                to understand how different agent architectures work.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SimpleFlowDemo;
