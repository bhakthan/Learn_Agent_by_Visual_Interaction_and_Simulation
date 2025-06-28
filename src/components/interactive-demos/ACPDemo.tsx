import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Play, ArrowsCounterClockwise } from "@phosphor-icons/react";
import { setupSafeReactFlowResize, resetReactFlowRendering } from '@/lib/utils/visualizationUtils';

// Visualization components
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
}

const ACPDemo = () => {
  const [activeDemo, setActiveDemo] = useState<'single' | 'multi'>('single');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Single-Agent Demo Nodes and Edges
  const singleAgentNodes: Node[] = [
    {
      id: 'client',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">ACP Client</div>
            <div className="text-xs text-muted-foreground">User Interface</div>
          </div>
        )
      },
      position: { x: 50, y: 100 },
      className: 'border-2 border-border bg-background rounded-md px-2 py-1',
    },
    {
      id: 'server',
      type: 'default',
      data: { 
        label: (
          <div className="bg-muted/50 p-1 rounded-md">
            <div className="font-semibold">ACP Server</div>
  // Reference for flow containers
  const flowContainerRef1 = useRef<HTMLDivElement>(null);
  const flowContainerRef2 = useRef<HTMLDivElement>(null);
  
  // Setup safe resize handling for ReactFlow instances
  useEffect(() => {
    // Apply to both flow containers with a delay between them
    if (flowContainerRef1.current) {
      resetReactFlowRendering(flowContainerRef1);
    }
    
    // Delay the second container's initialization to prevent conflicts
    const timeout = setTimeout(() => {
      if (flowContainerRef2.current) {
        resetReactFlowRendering(flowContainerRef2);
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, []);
          </div>
        )
      },
      position: { x: 400, y: 60 },
      className: 'border-2 border-border bg-background rounded-md px-2 py-1 min-w-[200px]',
    },
    {
      id: 'agent',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">Agent</div>
            <div className="text-xs text-muted-foreground">Task Processor</div>
          </div>
        )
      },
      position: { x: 425, y: 140 },
      parentNode: 'server',
      className: 'border-2 border-border bg-background rounded-md px-2 py-1',
    },
  ];

  const singleAgentEdges: Edge[] = [
    { 
      id: 'e-client-server', 
      source: 'client', 
      target: 'server', 
      label: 'REST',
      animated: isSimulationRunning,
      labelBgStyle: { fill: 'var(--muted)' },
      labelStyle: { fontSize: 12 },
    },
  ];

  // Multi-Agent Demo Nodes and Edges
  const multiAgentNodes: Node[] = [
    {
      id: 'client',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">ACP Client</div>
            <div className="text-xs text-muted-foreground">User Interface</div>
          </div>
        )
      },
      position: { x: 50, y: 150 },
      className: 'border-2 border-border bg-background rounded-md px-2 py-1',
    },
    {
      id: 'server',
      type: 'default',
      data: { 
        label: (
          <div className="bg-muted/50 p-1 rounded-md">
            <div className="font-semibold">ACP Server</div>
          </div>
        )
      },
      position: { x: 350, y: 60 },
      className: 'border-2 border-border bg-background rounded-md px-2 py-1 min-w-[350px]',
    },
    {
      id: 'agent1',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">Agent 1</div>
            <div className="text-xs text-muted-foreground">Task Coordinator</div>
          </div>
        )
      },
      position: { x: 100, y: 140 },
      parentNode: 'server',
      className: 'border-2 border-border bg-background rounded-md px-2 py-1',
    },
    {
      id: 'agent2',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">Agent 2</div>
            <div className="text-xs text-muted-foreground">Information Retrieval</div>
          </div>
        )
      },
      position: { x: 250, y: 140 },
      parentNode: 'server',
      className: 'border-2 border-border bg-background rounded-md px-2 py-1',
    },
    {
      id: 'agent3',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">Agent 3</div>
            <div className="text-xs text-muted-foreground">Task Processor</div>
          </div>
        )
      },
      position: { x: 400, y: 140 },
      parentNode: 'server',
      className: 'border-2 border-border bg-background rounded-md px-2 py-1',
    },
  ];

  const multiAgentEdges: Edge[] = [
    { 
      id: 'e-client-server', 
      source: 'client', 
      target: 'server', 
      label: 'REST',
      animated: isSimulationRunning,
      labelBgStyle: { fill: 'var(--muted)' },
      labelStyle: { fontSize: 12 },
    },
    {
      id: 'e-agent1-agent2',
      source: 'agent1',
      target: 'agent2',
      animated: isSimulationRunning && currentStep >= 2,
      style: { stroke: 'var(--secondary)' },
    },
    {
      id: 'e-agent2-agent3',
      source: 'agent2',
      target: 'agent3',
      animated: isSimulationRunning && currentStep >= 3,
      style: { stroke: 'var(--accent)' },
    },
    {
      id: 'e-agent1-agent3',
      source: 'agent1',
      target: 'agent3',
      animated: isSimulationRunning && currentStep >= 4,
      style: { stroke: 'var(--primary)' },
    },
  ];

  // Sample message flow for single agent demo
  const singleAgentMessages: Message[] = [
    {
      id: "1",
      from: "client",
      to: "server",
      content: "POST /agent/invoke\nRequest: \"Generate a summary of the quarterly report\"",
      timestamp: "00:00"
    },
    {
      id: "2", 
      from: "server",
      to: "agent",
      content: "Invoke agent with payload",
      timestamp: "00:01"
    },
    {
      id: "3",
      from: "agent",
      to: "server",
      content: "Process request and generate summary",
      timestamp: "00:02"
    },
    {
      id: "4",
      from: "server",
      to: "client",
      content: "HTTP 200 OK\nResponse: \"The quarterly report shows a 15% revenue increase with expanded market share in the Asia-Pacific region...\"",
      timestamp: "00:03"
    }
  ];

  // Sample message flow for multi-agent demo
  const multiAgentMessages: Message[] = [
    {
      id: "1",
      from: "client",
      to: "server",
      content: "POST /agents/invoke\nRequest: \"Analyze market trends and prepare a report\"",
      timestamp: "00:00"
    },
    {
      id: "2",
      from: "server",
      to: "agent1",
      content: "Route request to coordinator agent",
      timestamp: "00:01"
    },
    {
      id: "3",
      from: "agent1",
      to: "agent2",
      content: "Request data: \"Retrieve recent market data for analysis\"",
      timestamp: "00:02"
    },
    {
      id: "4",
      from: "agent2",
      to: "agent3",
      content: "Forward data: \"Market data retrieved, requesting detailed analysis\"",
      timestamp: "00:03"
    },
    {
      id: "5",
      from: "agent1",
      to: "agent3",
      content: "Request: \"Generate final report with visualizations\"",
      timestamp: "00:04"
    },
    {
      id: "6",
      from: "agent3",
      to: "agent1",
      content: "Response: \"Report generated with 3 key insights and 2 visualizations\"",
      timestamp: "00:05"
    },
    {
      id: "7",
      from: "agent1",
      to: "server",
      content: "Compiled final result with insights from all agents",
      timestamp: "00:06"
    },
    {
      id: "8",
      from: "server",
      to: "client",
      content: "HTTP 200 OK\nResponse: \"Market Analysis Report: 3 key trends identified with supporting data and visualizations...\"",
      timestamp: "00:07"
    }
  ];

  // Run the simulation - moved to useEffect
  const runSimulation = () => {
    setIsSimulationRunning(true);
    setCurrentStep(0);
    setMessages([]);
  };
  
  // Effect to handle simulation logic and cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSimulationRunning) {
      const messageSet = activeDemo === 'single' ? singleAgentMessages : multiAgentMessages;
      let step = 0;
      
      interval = setInterval(() => {
        if (step < messageSet.length) {
          setMessages(prev => [...prev, messageSet[step]]);
          setCurrentStep(prev => prev + 1);
          step++;
        } else {
          clearInterval(interval);
          setIsSimulationRunning(false);
        }
      }, 1500);
    }
    
    // Cleanup function
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulationRunning, activeDemo]);
  
  // Reset the simulation
  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setCurrentStep(0);
    setMessages([]);
  };

  // Handle node click
  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
  };

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="single" 
        value={activeDemo}
        onValueChange={(val) => {
          setActiveDemo(val as 'single' | 'multi');
          resetSimulation();
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single-Agent Demo</TabsTrigger>
          <TabsTrigger value="multi">Multi-Agent Demo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <div className="flex items-center justify-between my-4">
            <div>
              <h3 className="text-lg font-medium">Basic Single-Agent Communication</h3>
              <p className="text-sm text-muted-foreground">
                Direct communication between client and a single agent via ACP Server
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetSimulation}
                disabled={isSimulationRunning || messages.length === 0}
              >
                <ArrowsCounterClockwise className="mr-1" size={16} />
                Reset
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={runSimulation}
                disabled={isSimulationRunning}
              >
                <Play className="mr-1" size={16} />
                Run Simulation
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 border rounded-md overflow-hidden h-[350px]">
              <ReactFlow
                nodes={singleAgentNodes}
                edges={singleAgentEdges}
                onNodeClick={onNodeClick}
                fitView
                key="single-agent-flow"
              >
                <Background />
                <Controls />
              </ReactFlow>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted py-2 px-4 border-b">
                <h3 className="text-sm font-medium">Message Log</h3>
              </div>
              <div className="h-[308px] overflow-y-auto p-2">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div 
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-2"
                    >
                      <Card className={`overflow-hidden ${message.from === selectedNode || message.to === selectedNode ? 'border-primary' : ''}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold">{message.from}</span>
                              <span className="text-xs">→</span>
                              <span className="text-xs font-semibold">{message.to}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                          <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Run the simulation to see messages</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Single-Agent ACP Pattern</h3>
                  <p className="text-sm">
                    The simplest ACP deployment connects a client directly to a single agent via a REST
                    interface over HTTP. This pattern is ideal for direct communication with a single
                    specialized agent, lightweight setups with minimal infrastructure requirements,
                    development and debugging environments, and proof-of-concept implementations.
                  </p>
                  <p className="text-sm">
                    The ACP Server wraps the agent and exposes an HTTP endpoint, where the agent is invoked
                    and returns responses in the standardized ACP format.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="multi">
          <div className="flex items-center justify-between my-4">
            <div>
              <h3 className="text-lg font-medium">Multi-Agent Single Server</h3>
              <p className="text-sm text-muted-foreground">
                Multiple agents communicating through a central ACP Server
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetSimulation}
                disabled={isSimulationRunning || messages.length === 0}
              >
                <ArrowsCounterClockwise className="mr-1" size={16} />
                Reset
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={runSimulation}
                disabled={isSimulationRunning}
              >
                <Play className="mr-1" size={16} />
                Run Simulation
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 border rounded-md overflow-hidden h-[350px]">
              <ReactFlow
                nodes={multiAgentNodes}
                edges={multiAgentEdges}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background />
                <Controls />
              </ReactFlow>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted py-2 px-4 border-b">
                <h3 className="text-sm font-medium">Message Log</h3>
              </div>
              <div className="h-[308px] overflow-y-auto p-2">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div 
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-2"
                    >
                      <Card className={`overflow-hidden ${message.from === selectedNode || message.to === selectedNode ? 'border-primary' : ''}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-semibold">{message.from}</span>
                              <span className="text-xs">→</span>
                              <span className="text-xs font-semibold">{message.to}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                          <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Run the simulation to see messages</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Multi-Agent ACP Pattern</h3>
                  <p className="text-sm">
                    An ACP Server can host multiple agents behind a single HTTP endpoint. Each agent is
                    individually addressable through the server's routing mechanism, which uses agent
                    metadata to determine the appropriate handler.
                  </p>
                  <h4 className="text-md font-medium mt-4 mb-2">Benefits:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li className="text-sm">Resource efficiency - shared server infrastructure</li>
                    <li className="text-sm">Simplified deployment - single service to manage</li>
                    <li className="text-sm">Centralized logging and monitoring</li>
                    <li className="text-sm">Consistent authentication and authorization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ACPDemo;