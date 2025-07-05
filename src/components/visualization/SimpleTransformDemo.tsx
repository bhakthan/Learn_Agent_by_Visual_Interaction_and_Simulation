import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowsCounterClockwise, Play, Stop, Lightning, Gear, Plus, Minus } from '@phosphor-icons/react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface SimpleTransformDemoProps {}

interface TransformStep {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  description: string;
  type: 'input' | 'transform' | 'output' | 'decision' | 'parallel';
  status: 'idle' | 'processing' | 'complete' | 'error';
  data?: any;
}

interface DataFlow {
  id: string;
  from: string;
  to: string;
  progress: number;
  active: boolean;
  data: any;
  transformType: 'filter' | 'map' | 'reduce' | 'validate' | 'format';
}

interface TransformScenario {
  id: string;
  name: string;
  description: string;
  steps: Omit<TransformStep, 'status'>[];
  flows: Omit<DataFlow, 'progress' | 'active'>[];
  inputData: any;
}

const SimpleTransformDemo: React.FC<SimpleTransformDemoProps> = () => {
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('data-pipeline');
  const [speed, setSpeed] = useState(1);
  const [showDataFlow, setShowDataFlow] = useState(true);
  const [activeSteps, setActiveSteps] = useState<Set<string>>(new Set());
  const [animatedFlows, setAnimatedFlows] = useState<DataFlow[]>([]);
  const [transformResults, setTransformResults] = useState<Record<string, any>>({});

  // Transform scenarios
  const scenarios: TransformScenario[] = [
    {
      id: 'data-pipeline',
      name: 'Data Processing Pipeline',
      description: 'Transform raw data through multiple processing steps',
      inputData: [
        { id: 1, name: 'John Doe', age: 30, email: 'john@example.com', score: 85 },
        { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', score: 92 },
        { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com', score: 78 }
      ],
      steps: [
        { id: 'input', x: 50, y: 150, width: 140, height: 100, title: 'Raw Data', description: 'User records', type: 'input' },
        { id: 'validate', x: 220, y: 150, width: 140, height: 100, title: 'Validate', description: 'Check data quality', type: 'transform' },
        { id: 'filter', x: 390, y: 100, width: 140, height: 100, title: 'Filter', description: 'Age > 25', type: 'transform' },
        { id: 'enrich', x: 390, y: 200, width: 140, height: 100, title: 'Enrich', description: 'Add categories', type: 'transform' },
        { id: 'aggregate', x: 560, y: 150, width: 140, height: 100, title: 'Aggregate', description: 'Calculate metrics', type: 'transform' },
        { id: 'output', x: 730, y: 150, width: 140, height: 100, title: 'Results', description: 'Final output', type: 'output' }
      ],
      flows: [
        { id: 'f1', from: 'input', to: 'validate', data: 'raw_data', transformType: 'validate' },
        { id: 'f2', from: 'validate', to: 'filter', data: 'clean_data', transformType: 'filter' },
        { id: 'f3', from: 'validate', to: 'enrich', data: 'clean_data', transformType: 'map' },
        { id: 'f4', from: 'filter', to: 'aggregate', data: 'filtered_data', transformType: 'reduce' },
        { id: 'f5', from: 'enrich', to: 'aggregate', data: 'enriched_data', transformType: 'reduce' },
        { id: 'f6', from: 'aggregate', to: 'output', data: 'final_results', transformType: 'format' }
      ]
    },
    {
      id: 'agent-workflow',
      name: 'Agent Task Workflow',
      description: 'Multi-step agent reasoning and execution',
      inputData: { query: 'Analyze market trends for AI companies', context: 'financial analysis' },
      steps: [
        { id: 'input', x: 50, y: 200, width: 120, height: 80, title: 'Query', description: 'User request', type: 'input' },
        { id: 'plan', x: 200, y: 200, width: 120, height: 80, title: 'Plan', description: 'Break down task', type: 'transform' },
        { id: 'research', x: 350, y: 120, width: 120, height: 80, title: 'Research', description: 'Gather data', type: 'transform' },
        { id: 'analyze', x: 350, y: 200, width: 120, height: 80, title: 'Analyze', description: 'Process info', type: 'transform' },
        { id: 'synthesize', x: 350, y: 280, width: 120, height: 80, title: 'Synthesize', description: 'Combine results', type: 'transform' },
        { id: 'output', x: 500, y: 200, width: 120, height: 80, title: 'Response', description: 'Final answer', type: 'output' }
      ],
      flows: [
        { id: 'f1', from: 'input', to: 'plan', data: 'query', transformType: 'map' },
        { id: 'f2', from: 'plan', to: 'research', data: 'subtasks', transformType: 'map' },
        { id: 'f3', from: 'plan', to: 'analyze', data: 'subtasks', transformType: 'map' },
        { id: 'f4', from: 'plan', to: 'synthesize', data: 'subtasks', transformType: 'map' },
        { id: 'f5', from: 'research', to: 'output', data: 'findings', transformType: 'reduce' },
        { id: 'f6', from: 'analyze', to: 'output', data: 'insights', transformType: 'reduce' },
        { id: 'f7', from: 'synthesize', to: 'output', data: 'summary', transformType: 'reduce' }
      ]
    },
    {
      id: 'parallel-processing',
      name: 'Parallel Processing',
      description: 'Concurrent data transformation branches',
      inputData: { documents: ['doc1.pdf', 'doc2.pdf', 'doc3.pdf'], format: 'pdf' },
      steps: [
        { id: 'input', x: 50, y: 200, width: 120, height: 80, title: 'Documents', description: 'Source files', type: 'input' },
        { id: 'split', x: 200, y: 200, width: 120, height: 80, title: 'Split', description: 'Distribute work', type: 'decision' },
        { id: 'extract1', x: 350, y: 120, width: 120, height: 80, title: 'Extract Text', description: 'OCR process', type: 'parallel' },
        { id: 'extract2', x: 350, y: 200, width: 120, height: 80, title: 'Extract Meta', description: 'Metadata', type: 'parallel' },
        { id: 'extract3', x: 350, y: 280, width: 120, height: 80, title: 'Extract Images', description: 'Image data', type: 'parallel' },
        { id: 'merge', x: 500, y: 200, width: 120, height: 80, title: 'Merge', description: 'Combine results', type: 'transform' },
        { id: 'output', x: 650, y: 200, width: 120, height: 80, title: 'Structured', description: 'Final format', type: 'output' }
      ],
      flows: [
        { id: 'f1', from: 'input', to: 'split', data: 'documents', transformType: 'map' },
        { id: 'f2', from: 'split', to: 'extract1', data: 'doc_batch_1', transformType: 'map' },
        { id: 'f3', from: 'split', to: 'extract2', data: 'doc_batch_2', transformType: 'map' },
        { id: 'f4', from: 'split', to: 'extract3', data: 'doc_batch_3', transformType: 'map' },
        { id: 'f5', from: 'extract1', to: 'merge', data: 'text_data', transformType: 'reduce' },
        { id: 'f6', from: 'extract2', to: 'merge', data: 'meta_data', transformType: 'reduce' },
        { id: 'f7', from: 'extract3', to: 'merge', data: 'image_data', transformType: 'reduce' },
        { id: 'f8', from: 'merge', to: 'output', data: 'structured_data', transformType: 'format' }
      ]
    }
  ];

  const currentScenarioData = scenarios.find(s => s.id === currentScenario) || scenarios[0];

  // Get step colors based on type and status
  const getStepColors = (type: string, status: string) => {
    const baseColors = {
      input: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
      transform: { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
      output: { bg: '#fce7f3', border: '#ec4899', text: '#be185d' },
      decision: { bg: '#fef3c7', border: '#d97706', text: '#92400e' },
      parallel: { bg: '#e0e7ff', border: '#6366f1', text: '#4338ca' }
    };

    const statusOverrides = {
      processing: { bg: '#3b82f6', border: '#1d4ed8', text: '#ffffff' },
      complete: { bg: '#16a34a', border: '#15803d', text: '#ffffff' },
      error: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' }
    };

    if (status !== 'idle' && statusOverrides[status]) {
      return statusOverrides[status];
    }

    const colors = baseColors[type] || baseColors.transform;
    
    if (theme === 'dark') {
      // Dark mode: use darker backgrounds with light text
      const darkColors = {
        input: { bg: '#1e3a8a', border: '#3b82f6', text: '#dbeafe' },
        transform: { bg: '#14532d', border: '#22c55e', text: '#dcfce7' },
        output: { bg: '#be185d', border: '#ec4899', text: '#fce7f3' },
        decision: { bg: '#92400e', border: '#f59e0b', text: '#fef3c7' },
        parallel: { bg: '#4338ca', border: '#6366f1', text: '#e0e7ff' }
      };
      return darkColors[type] || darkColors.transform;
    }
    
    return colors;
  };

  // Create SVG path for flows
  const createFlowPath = (flow: any) => {
    const fromStep = currentScenarioData.steps.find(s => s.id === flow.from);
    const toStep = currentScenarioData.steps.find(s => s.id === flow.to);
    
    if (!fromStep || !toStep) return '';
    
    const fromX = fromStep.x + fromStep.width;
    const fromY = fromStep.y + fromStep.height / 2;
    const toX = toStep.x;
    const toY = toStep.y + toStep.height / 2;
    
    // Create smooth curve
    const midX = (fromX + toX) / 2;
    const controlY = fromY + (toY - fromY) * 0.5 + (Math.random() - 0.5) * 20; // Add slight randomness
    
    return `M ${fromX} ${fromY} Q ${midX} ${controlY} ${toX} ${toY}`;
  };

  // Simulate data transformation
  const simulateTransform = (stepId: string, inputData: any, transformType: string) => {
    // Simulate different transformation types
    switch (transformType) {
      case 'filter':
        return Array.isArray(inputData) ? inputData.filter(item => item.age > 25) : inputData;
      case 'map':
        return Array.isArray(inputData) ? inputData.map(item => ({ ...item, category: 'user' })) : { ...inputData, processed: true };
      case 'reduce':
        return Array.isArray(inputData) ? { count: inputData.length, avgScore: inputData.reduce((sum, item) => sum + item.score, 0) / inputData.length } : inputData;
      case 'validate':
        return inputData; // In real scenario, this would validate data
      case 'format':
        return { formatted: true, data: inputData, timestamp: new Date().toISOString() };
      default:
        return inputData;
    }
  };

  // Start simulation
  const startSimulation = useCallback(() => {
    setIsAnimating(true);
    setActiveSteps(new Set());
    setTransformResults({});
    
    const flows = currentScenarioData.flows.map(flow => ({
      ...flow,
      progress: 0,
      active: false
    }));
    setAnimatedFlows(flows);
    
    // Process steps in order
    let currentData = currentScenarioData.inputData;
    let stepIndex = 0;
    
    const processStep = () => {
      if (stepIndex >= currentScenarioData.steps.length) {
        setIsAnimating(false);
        return;
      }
      
      const step = currentScenarioData.steps[stepIndex];
      setActiveSteps(prev => new Set([...prev, step.id]));
      
      // Simulate processing time
      setTimeout(() => {
        // Find and animate outgoing flows
        const outgoingFlows = flows.filter(f => f.from === step.id);
        
        outgoingFlows.forEach(flow => {
          setAnimatedFlows(prev => prev.map(f => 
            f.id === flow.id ? { ...f, active: true, progress: 0 } : f
          ));
          
          // Animate flow progress
          let progress = 0;
          const animateFlow = () => {
            progress += 0.1;
            if (progress <= 1) {
              setAnimatedFlows(prev => prev.map(f => 
                f.id === flow.id ? { ...f, progress } : f
              ));
              setTimeout(animateFlow, 50 / speed);
            } else {
              setAnimatedFlows(prev => prev.map(f => 
                f.id === flow.id ? { ...f, active: false, progress: 1 } : f
              ));
              
              // Apply transformation
              const transformedData = simulateTransform(flow.to, currentData, flow.transformType);
              setTransformResults(prev => ({ ...prev, [flow.to]: transformedData }));
            }
          };
          setTimeout(animateFlow, 200);
        });
        
        stepIndex++;
        setTimeout(processStep, 1500 / speed);
      }, 800 / speed);
    };
    
    processStep();
  }, [currentScenarioData, speed]);

  const resetSimulation = useCallback(() => {
    setIsAnimating(false);
    setActiveSteps(new Set());
    setAnimatedFlows([]);
    setTransformResults({});
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Transformation Sequences</span>
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
              {isAnimating ? 'Processing...' : 'Start Transform'}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Visualize how data flows through transformation pipelines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label htmlFor="scenario">Scenario:</Label>
              <Select value={currentScenario} onValueChange={setCurrentScenario}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch checked={showDataFlow} onCheckedChange={setShowDataFlow} />
                <Label>Show Data Flow</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label>Speed:</Label>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  max={3}
                  min={0.5}
                  step={0.5}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {currentScenarioData.description}
          </p>
          
          <div className="relative border rounded-lg p-4 bg-gray-50 dark:bg-gray-900" style={{ height: '400px' }}>
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={theme === 'dark' ? '#64748b' : '#374151'} />
                </marker>
                <marker id="arrow-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>
              
              {/* Render flows */}
              {currentScenarioData.flows.map(flow => {
                const animatedFlow = animatedFlows.find(af => af.id === flow.id);
                const path = createFlowPath(flow);
                
                return (
                  <g key={flow.id}>
                    <path
                      d={path}
                      fill="none"
                      stroke={theme === 'dark' ? '#64748b' : '#374151'}
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                      opacity={0.5}
                    />
                    {animatedFlow?.active && (
                      <path
                        d={path}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="6,3"
                        strokeDashoffset={-animatedFlow.progress * 30}
                        markerEnd="url(#arrow-active)"
                        opacity={0.9}
                      />
                    )}
                    {/* Flow type label */}
                    {showDataFlow && (
                      <text
                        x={currentScenarioData.steps.find(s => s.id === flow.from)?.x + 60}
                        y={currentScenarioData.steps.find(s => s.id === flow.from)?.y - 5}
                        fontSize="12"
                        fill={theme === 'dark' ? '#e2e8f0' : '#64748b'}
                        textAnchor="middle"
                      >
                        {flow.transformType}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* Render steps */}
            {currentScenarioData.steps.map(step => {
              const isActive = activeSteps.has(step.id);
              const status = isActive ? 'processing' : 'idle';
              const colors = getStepColors(step.type, status);
              const result = transformResults[step.id];
              
              return (
                <div
                  key={step.id}
                  className="absolute rounded-lg border-2 p-3 transition-all duration-300 cursor-pointer hover:shadow-lg"
                  style={{
                    left: step.x,
                    top: step.y,
                    width: step.width,
                    height: step.height,
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    zIndex: isActive ? 10 : 1
                  }}
                >
                  <div className="font-semibold text-sm mb-1">
                    {step.title}
                  </div>
                  <div className="text-xs opacity-75 mb-1">
                    {step.description}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {step.type}
                  </Badge>
                  {isActive && (
                    <div className="absolute top-1 right-1">
                      <Lightning size={10} className="animate-pulse" />
                    </div>
                  )}
                  {result && (
                    <div className="absolute -bottom-8 left-0 right-0 text-xs bg-black/80 text-white p-1 rounded opacity-75">
                      Data: {typeof result === 'object' ? JSON.stringify(result).substring(0, 20) + '...' : result}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Transform results */}
          {Object.keys(transformResults).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Transformation Results:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(transformResults).map(([stepId, result]) => {
                  const step = currentScenarioData.steps.find(s => s.id === stepId);
                  return (
                    <div key={stepId} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{step?.title}:</div>
                      <pre className="text-xs overflow-hidden">
                        {JSON.stringify(result, null, 1).substring(0, 100)}
                        {JSON.stringify(result).length > 100 && '...'}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleTransformDemo;
