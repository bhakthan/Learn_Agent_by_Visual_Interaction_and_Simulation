import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, ArrowsCounterClockwise, Pause, ArrowRight, Info } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, { 
  Background, 
  Controls, 
  ReactFlowProvider,
  useNodesState, 
  useEdgesState,
  MarkerType,
  NodeTypes,
  EdgeTypes,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node components
const CustomNode = ({ data }: any) => {
  return (
    <div className={`px-4 py-2 rounded-md shadow-md border ${
      data.type === 'user' ? 'bg-background border-muted-foreground/30' :
      data.type === 'agent' ? 'bg-primary/10 border-primary/30' :
      data.type === 'server' ? 'bg-secondary/10 border-secondary/30' :
      data.type === 'llm' ? 'bg-accent/10 border-accent/30' :
      data.type === 'tool' ? 'bg-destructive/10 border-destructive/30' :
      'bg-card border-border'
    }`}>
      <div className="font-medium text-sm">{data.label}</div>
      {data.description && (
        <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
      )}
    </div>
  );
};

// Custom edge with animated marker
const AnimatedEdge = ({ id, sourceX, sourceY, targetX, targetY, label, style, data }: any) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Start animation when the edge is marked as active
    if (data?.active) {
      setIsAnimating(true);
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [data?.active]);

  const edgePath = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`;
  
  return (
    <g>
      <path
        id={id}
        className={`react-flow__edge-path ${isAnimating ? 'stroke-primary stroke-2' : ''}`}
        d={edgePath}
        style={style}
      />
      {label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: '10px' }}
            startOffset="50%"
            textAnchor="middle"
            className="fill-muted-foreground"
          >
            {label}
          </textPath>
        </text>
      )}
    </g>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

// MCP flow simulation steps
interface SimulationStep {
  id: number;
  description: string;
  activeEdges: string[];
  activeNodes: string[];
  messages: {
    from: string;
    to: string;
    content: string;
    metadata?: Record<string, any>;
  }[];
}

const MCPVisualDemo = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState('visualization');
  const [autoPlay, setAutoPlay] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initial nodes for MCP visualization
  const initialNodes = [
    {
      id: 'user',
      type: 'custom',
      position: { x: 50, y: 150 },
      data: { 
        label: 'User', 
        type: 'user',
        description: 'Human providing query' 
      },
    },
    {
      id: 'agent',
      type: 'custom',
      position: { x: 250, y: 150 },
      data: { 
        label: 'Agent', 
        type: 'agent',
        description: 'Host with MCP client' 
      },
    },
    {
      id: 'mcp_client',
      type: 'custom',
      position: { x: 250, y: 50 },
      data: { 
        label: 'MCP Client', 
        type: 'agent',
        description: 'Manages MCP communication' 
      },
    },
    {
      id: 'mcp_server',
      type: 'custom',
      position: { x: 450, y: 50 },
      data: { 
        label: 'MCP Server', 
        type: 'server',
        description: 'Provides tools & resources' 
      },
    },
    {
      id: 'llm',
      type: 'custom',
      position: { x: 450, y: 250 },
      data: { 
        label: 'LLM', 
        type: 'llm',
        description: 'Large Language Model' 
      },
    },
    {
      id: 'tools',
      type: 'custom',
      position: { x: 650, y: 50 },
      data: { 
        label: 'Tools', 
        type: 'tool',
        description: 'APIs, Databases, Websites' 
      },
    },
  ];
  
  // Initial edges for MCP visualization
  const initialEdges = [
    {
      id: 'e-user-agent',
      source: 'user',
      target: 'agent',
      type: 'animated',
      label: 'Query',
      animated: false,
      data: { active: false }
    },
    {
      id: 'e-agent-user',
      source: 'agent',
      target: 'user',
      type: 'animated',
      label: 'Answer',
      animated: false,
      data: { active: false }
    },
    {
      id: 'e-agent-mcp-client',
      source: 'agent',
      target: 'mcp_client',
      type: 'animated',
      animated: false,
      data: { active: false }
    },
    {
      id: 'e-mcp-client-agent',
      source: 'mcp_client',
      target: 'agent',
      type: 'animated',
      animated: false,
      data: { active: false }
    },
    {
      id: 'e-mcp-client-mcp-server',
      source: 'mcp_client',
      target: 'mcp_server',
      type: 'animated',
      label: 'List/Execute Tools',
      animated: false,
      data: { active: false }
    },
    {
      id: 'e-mcp-server-mcp-client',
      source: 'mcp_server',
      target: 'mcp_client',
      type: 'animated',
      animated: false,
      data: { active: false }
    },
    {
      id: 'e-mcp-server-tools',
      source: 'mcp_server',
      target: 'tools',
      type: 'animated',
      animated: false,
      data: { active: false }
    },
    {
      id: 'e-tools-mcp-server',
      source: 'tools',
      target: 'mcp_server',
      type: 'animated',
      animated: false,
      data: { active: false }
    },
    {
      id: 'e-agent-llm',
      source: 'agent',
      target: 'llm',
      type: 'animated',
      label: 'Choose Tools',
      animated: false,
      data: { active: false }
    },
    {
      id: 'e-llm-agent',
      source: 'llm',
      target: 'agent',
      type: 'animated',
      label: 'Generate Answer',
      animated: false,
      data: { active: false }
    },
  ];
  
  // Simulation steps that will be played
  const simulationSteps: SimulationStep[] = [
    {
      id: 1,
      description: "User submits a query to the Agent",
      activeEdges: ['e-user-agent'],
      activeNodes: ['user', 'agent'],
      messages: [
        {
          from: "User",
          to: "Agent",
          content: "What's the weather like in Seattle today?"
        }
      ]
    },
    {
      id: 2,
      description: "Agent consults the LLM to determine required tools",
      activeEdges: ['e-agent-llm'],
      activeNodes: ['agent', 'llm'],
      messages: [
        {
          from: "Agent",
          to: "LLM",
          content: "What tools do I need to answer a query about Seattle weather?"
        }
      ]
    },
    {
      id: 3,
      description: "LLM recommends using a weather tool",
      activeEdges: ['e-llm-agent'],
      activeNodes: ['llm', 'agent'],
      messages: [
        {
          from: "LLM",
          to: "Agent",
          content: "You should use the weather tool to get current weather data for Seattle."
        }
      ]
    },
    {
      id: 4,
      description: "Agent contacts the MCP Client to access tools",
      activeEdges: ['e-agent-mcp-client'],
      activeNodes: ['agent', 'mcp_client'],
      messages: [
        {
          from: "Agent",
          to: "MCP Client",
          content: "I need to access the weather tool"
        }
      ]
    },
    {
      id: 5,
      description: "MCP Client requests available tools from MCP Server",
      activeEdges: ['e-mcp-client-mcp-server'],
      activeNodes: ['mcp_client', 'mcp_server'],
      messages: [
        {
          from: "MCP Client",
          to: "MCP Server",
          content: "List available tools",
          metadata: {
            "protocol": "MCP/1.0",
            "request_type": "list_tools"
          }
        }
      ]
    },
    {
      id: 6,
      description: "MCP Server returns list of available tools",
      activeEdges: ['e-mcp-server-mcp-client'],
      activeNodes: ['mcp_server', 'mcp_client'],
      messages: [
        {
          from: "MCP Server",
          to: "MCP Client",
          content: "Available tools: weather, calculator, search",
          metadata: {
            "protocol": "MCP/1.0",
            "response_type": "tool_list",
            "tools": [
              {"name": "weather", "description": "Get weather information"},
              {"name": "calculator", "description": "Perform calculations"},
              {"name": "search", "description": "Search for information"}
            ]
          }
        }
      ]
    },
    {
      id: 7,
      description: "MCP Client requests to execute the weather tool",
      activeEdges: ['e-mcp-client-mcp-server'],
      activeNodes: ['mcp_client', 'mcp_server'],
      messages: [
        {
          from: "MCP Client",
          to: "MCP Server",
          content: "Execute weather tool for Seattle",
          metadata: {
            "protocol": "MCP/1.0",
            "request_type": "execute_tool",
            "tool_name": "weather",
            "parameters": {"location": "Seattle"}
          }
        }
      ]
    },
    {
      id: 8,
      description: "MCP Server accesses external weather API",
      activeEdges: ['e-mcp-server-tools'],
      activeNodes: ['mcp_server', 'tools'],
      messages: [
        {
          from: "MCP Server",
          to: "Weather API",
          content: "GET /api/weather?location=Seattle"
        }
      ]
    },
    {
      id: 9,
      description: "Weather API returns data to MCP Server",
      activeEdges: ['e-tools-mcp-server'],
      activeNodes: ['tools', 'mcp_server'],
      messages: [
        {
          from: "Weather API",
          to: "MCP Server",
          content: "{'temperature': 65, 'condition': 'Cloudy', 'humidity': 72}"
        }
      ]
    },
    {
      id: 10,
      description: "MCP Server returns weather data to MCP Client",
      activeEdges: ['e-mcp-server-mcp-client'],
      activeNodes: ['mcp_server', 'mcp_client'],
      messages: [
        {
          from: "MCP Server",
          to: "MCP Client",
          content: "Weather in Seattle: 65°F, Cloudy, 72% humidity",
          metadata: {
            "protocol": "MCP/1.0",
            "response_type": "tool_result",
            "tool_name": "weather",
            "result": {
              "temperature": 65,
              "condition": "Cloudy",
              "humidity": 72
            }
          }
        }
      ]
    },
    {
      id: 11,
      description: "MCP Client passes weather data to Agent",
      activeEdges: ['e-mcp-client-agent'],
      activeNodes: ['mcp_client', 'agent'],
      messages: [
        {
          from: "MCP Client",
          to: "Agent",
          content: "Weather in Seattle: 65°F, Cloudy, 72% humidity"
        }
      ]
    },
    {
      id: 12,
      description: "Agent consults LLM to generate a response",
      activeEdges: ['e-agent-llm'],
      activeNodes: ['agent', 'llm'],
      messages: [
        {
          from: "Agent",
          to: "LLM",
          content: "Generate a response about Seattle weather based on this data: 65°F, Cloudy, 72% humidity"
        }
      ]
    },
    {
      id: 13,
      description: "LLM generates formatted response",
      activeEdges: ['e-llm-agent'],
      activeNodes: ['llm', 'agent'],
      messages: [
        {
          from: "LLM",
          to: "Agent",
          content: "In Seattle today, it's currently 65°F and cloudy with 72% humidity. You might want to bring a light jacket if you're going outside."
        }
      ]
    },
    {
      id: 14,
      description: "Agent delivers response to User",
      activeEdges: ['e-agent-user'],
      activeNodes: ['agent', 'user'],
      messages: [
        {
          from: "Agent",
          to: "User",
          content: "In Seattle today, it's currently 65°F and cloudy with 72% humidity. You might want to bring a light jacket if you're going outside."
        }
      ]
    }
  ];
  
  // Set up nodes and edges with React Flow hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Reset edges to inactive state
  const resetEdges = useCallback(() => {
    setEdges(prevEdges => 
      prevEdges.map(edge => ({
        ...edge,
        animated: false,
        data: { ...edge.data, active: false }
      }))
    );
  }, [setEdges]);
  
  // Reset the simulation
  const resetSimulation = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(null);
    resetEdges();
  }, [resetEdges]);
  
  // Update nodes and edges based on current step
  useEffect(() => {
    if (currentStep !== null) {
      const step = simulationSteps[currentStep];
      
      // Update edges - set active edges for this step
      setEdges(prevEdges => 
        prevEdges.map(edge => ({
          ...edge,
          animated: step.activeEdges.includes(edge.id),
          data: { ...edge.data, active: step.activeEdges.includes(edge.id) }
        }))
      );
      
      // Update nodes - highlight active nodes
      setNodes(prevNodes =>
        prevNodes.map(node => ({
          ...node,
          style: step.activeNodes.includes(node.id) 
            ? { boxShadow: '0 0 8px 2px rgba(var(--primary), 0.6)' } 
            : {}
        }))
      );
      
      // Auto-advance to next step if autoPlay is enabled
      if (isRunning && autoPlay && !isPaused) {
        timerRef.current = setTimeout(() => {
          if (currentStep < simulationSteps.length - 1) {
            setCurrentStep(prev => (prev !== null ? prev + 1 : 0));
          } else {
            setIsRunning(false);
          }
        }, 3000); // 3 seconds between steps
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentStep, isRunning, autoPlay, isPaused, setEdges, setNodes, simulationSteps]);
  
  // Start the simulation
  const startSimulation = useCallback(() => {
    try {
      resetEdges();
      setIsRunning(true);
      setIsPaused(false);
      setCurrentStep(0);
    } catch (error) {
      console.error("Error starting simulation:", error);
    }
  }, [resetEdges]);
  
  // Pause/Resume simulation
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);
  
  // Move to next step manually
  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev === null) return 0;
      if (prev < simulationSteps.length - 1) return prev + 1;
      return prev;
    });
  }, [simulationSteps.length]);
  
  // Current step data
  const currentStepData = currentStep !== null ? simulationSteps[currentStep] : null;
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ModelContextProtocol (MCP) Visual Demo</CardTitle>
            <CardDescription>
              Interactive visualization showing how MCP connects agents, tools, and services
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-full bg-primary/10 p-2">
                  <Info size={16} className="text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This visualization shows how MCP enables communication between
                  AI agents and external tools/resources through a standardized protocol
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visualization">Visual Flow</TabsTrigger>
            <TabsTrigger value="messages">Message Exchange</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualization" className="mt-4 space-y-4">
            <div style={{ height: '500px' }} className="border rounded-md">
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  attributionPosition="bottom-right"
                >
                  <svg>
                    <defs>
                      <marker
                        id="mcp-arrow"
                        viewBox="0 0 10 10"
                        refX="5"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-muted-foreground" />
                      </marker>
                    </defs>
                  </svg>
                  <Background />
                  <Controls />
                  <Panel position="top-left" className="bg-card/90 p-2 rounded shadow-sm border border-border">
                    {currentStepData ? (
                      <div className="text-sm">
                        <span className="font-medium">Step {currentStepData.id}/{simulationSteps.length}:</span>{' '}
                        <span className="text-muted-foreground">{currentStepData.description}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Press "Start Simulation" to begin
                      </div>
                    )}
                  </Panel>
                </ReactFlow>
              </ReactFlowProvider>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={startSimulation}
                  disabled={isRunning && !isPaused}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Play size={16} />
                  Start
                </Button>
                
                {isRunning && (
                  <Button
                    onClick={togglePause}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {isPaused ? (
                      <>
                        <Play size={16} />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause size={16} />
                        Pause
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  onClick={nextStep}
                  disabled={!isRunning || currentStep === simulationSteps.length - 1}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ArrowRight size={16} />
                  Next Step
                </Button>
                
                <Button
                  onClick={resetSimulation}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ArrowsCounterClockwise size={16} />
                  Reset
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={autoPlay}
                    onChange={() => setAutoPlay(!autoPlay)}
                    className="rounded"
                  />
                  Auto-advance
                </label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="messages" className="mt-4 space-y-4">
            <div className="border rounded-md p-4 bg-muted/30 h-[500px] overflow-y-auto">
              {currentStepData ? (
                <div className="space-y-4">
                  <div className="bg-card p-3 rounded-md shadow-sm border border-border">
                    <div className="text-sm font-medium flex items-center justify-between">
                      <span>Step {currentStepData.id}: {currentStepData.description}</span>
                      <Badge variant="outline">{currentStepData.id}/{simulationSteps.length}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <AnimatePresence>
                      {currentStepData.messages.map((message, idx) => (
                        <motion.div
                          key={`${currentStepData.id}-${idx}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-card rounded-md shadow-sm border border-border overflow-hidden"
                        >
                          <div className="bg-muted/50 px-3 py-2 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{message.from}</span>
                              <ArrowRight size={14} />
                              <span className="font-medium text-sm">{message.to}</span>
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            
                            {message.metadata && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <div className="text-xs font-medium text-muted-foreground mb-1">Metadata:</div>
                                <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(message.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Press "Start Simulation" to see message exchange</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={startSimulation}
                  disabled={isRunning && !isPaused}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Play size={16} />
                  Start
                </Button>
                
                {isRunning && (
                  <Button
                    onClick={togglePause}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {isPaused ? (
                      <>
                        <Play size={16} />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause size={16} />
                        Pause
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  onClick={nextStep}
                  disabled={!isRunning || currentStep === simulationSteps.length - 1}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ArrowRight size={16} />
                  Next Step
                </Button>
                
                <Button
                  onClick={resetSimulation}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ArrowsCounterClockwise size={16} />
                  Reset
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">MCP Key Components</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-md shadow-sm border border-border">
              <h4 className="font-medium text-primary mb-2">Host (Client-side)</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>User-facing application (e.g., chat interface)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Contains an MCP client for server connections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Presents results to the user</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card p-4 rounded-md shadow-sm border border-border">
              <h4 className="font-medium text-secondary mb-2">Server (Tool Provider)</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Provides capabilities to AI applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Registers and manages tools, resources, and prompts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Enforces permissions and security</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-card p-4 rounded-md shadow-sm border border-border">
              <h4 className="font-medium text-accent mb-2">Resource Types</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Tools:</strong> Executable functions (weather, calculator)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Resources:</strong> Read-only data sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Prompts:</strong> Templates for conversation scenarios</span>
                </li>
              </ul>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            MCP standardizes how AI applications and tools communicate, eliminating the need to build custom 
            connections between each model and tool. This creates a more scalable, secure, and efficient ecosystem.
          </p>
          
          <p className="text-sm text-muted-foreground">
            Learn more at <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">modelcontextprotocol.io</a> and explore the <a href="https://github.com/microsoft/mcp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft MCP GitHub repository</a>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MCPVisualDemo;