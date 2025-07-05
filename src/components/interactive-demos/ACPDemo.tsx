import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, ArrowsCounterClockwise } from "@phosphor-icons/react";
import { resetReactFlowRendering } from '@/lib/utils/visualizationUtils';
// import { fixReactFlowRendering } from '@/lib/utils/flows/visualizationFix'; // No longer needed

// Import the StandardFlowVisualizer
import StandardFlowVisualizerWithProvider, { StandardFlowMessage } from '../visualization/StandardFlowVisualizer';

// Visualization components
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
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
  const [flowMessages, setFlowMessages] = useState<StandardFlowMessage[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Function to convert messages to flow messages
  const convertToFlowMessages = (messages: Message[], nodeMap: Record<string, string>) => {
    return messages.map((msg, index) => ({
      id: `flow-${msg.id}`,
      edgeId: `${msg.from}-${msg.to}`,
      source: nodeMap[msg.from] || msg.from,
      target: nodeMap[msg.to] || msg.to,
      content: msg.content,
      type: 'message' as any,
      progress: index / (messages.length - 1), // Progress from 0 to 1
      label: msg.content.split('\n')[0],
      complete: false
    }));
  };
  
  // Reference for flow containers
  const flowContainerRef1 = useRef<HTMLDivElement>(null);
  const flowContainerRef2 = useRef<HTMLDivElement>(null);
  
  // Simple animation state for visual feedback
  const [simulationProgress, setSimulationProgress] = useState(0);
  
  // Simple status indicator - no node/edge manipulation
  
  // Disabled: These useEffect calls were causing node repositioning after initial render
  // Since we're now using StableFlowContainer, these DOM manipulations are not needed
  
  // // Setup safe resize handling for ReactFlow instances
  // useEffect(() => {
  //   // Apply to both flow containers with a delay between them
  //   if (flowContainerRef1.current) {
  //     resetReactFlowRendering(flowContainerRef1);
  //   }
  //   
  //   // Delay the second container's initialization to prevent conflicts
  //   const timeout = setTimeout(() => {
  //     if (flowContainerRef2.current) {
  //       resetReactFlowRendering(flowContainerRef2);
  //     }
  //   }, 500);
  //   
  //   return () => clearTimeout(timeout);
  // }, []);

  // // Force ReactFlow to render properly after tab switch
  // useEffect(() => {
  //   // Only apply fixes when NOT running simulation to prevent re-centering
  //   if (!isSimulationRunning) {
  //     const timer = setTimeout(() => {
  //       const container = activeDemo === 'single' 
  //         ? flowContainerRef1.current 
  //         : flowContainerRef2.current;
  //       
  //       if (container) {
  //         fixReactFlowRendering(container);
  //         
  //         // Only trigger resize for tab switching, not during simulation
  //         window.dispatchEvent(new Event('resize'));
  //         
  //         // Additional fix: Force all ReactFlow elements to be visible and properly positioned
  //         const reactFlowEls = container.querySelectorAll('.react-flow');
  //         reactFlowEls.forEach(el => {
  //           if (el instanceof HTMLElement) {
  //             el.style.height = '100%';
  //             el.style.width = '100%';
  //             el.style.position = 'relative';
  //           }
  //         });
  //       }
  //     }, 100);
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [activeDemo, isSimulationRunning]);

  // Single-Agent Demo Nodes - static positions (memoized)
  const singleAgentNodes: Node[] = useMemo(() => [
    {
      id: 'client',
      type: 'default',
      data: { 
        label: 'ACP Client'
      },
      position: { x: 100, y: 200 },
      style: {
        background: 'var(--background)',
        border: '2px solid var(--border)',
        borderRadius: '6px',
        padding: '12px',
        minWidth: '120px',
        fontSize: '14px',
        fontWeight: '500'
      }
    },
    {
      id: 'server',
      type: 'default',
      data: { 
        label: 'ACP Server'
      },
      position: { x: 400, y: 100 },
      style: {
        background: 'var(--muted)',
        border: '2px solid var(--border)',
        borderRadius: '6px',
        padding: '12px',
        minWidth: '200px',
        fontSize: '14px',
        fontWeight: '500'
      }
    },
    {
      id: 'agent',
      type: 'default',
      data: { 
        label: 'Agent'
      },
      position: { x: 450, y: 200 },
      style: {
        background: 'var(--background)',
        border: '2px solid var(--border)',
        borderRadius: '6px',
        padding: '12px',
        minWidth: '100px',
        fontSize: '14px',
        fontWeight: '500'
      }
    },
  ], []);

  const singleAgentEdges: Edge[] = useMemo(() => [
    { 
      id: 'e-client-server', 
      source: 'client', 
      target: 'server', 
      label: 'REST',
      style: {
        stroke: 'var(--primary)',
        strokeWidth: 2
      },
      labelStyle: { 
        fontSize: 12, 
        fontWeight: 500,
        fill: 'var(--foreground)'
      },
      labelBgStyle: { 
        fill: 'var(--background)',
        stroke: 'var(--border)',
        strokeWidth: 1
      }
    },
  ], []);

  // Multi-Agent Demo Nodes - static positions (memoized)
  const multiAgentNodes: Node[] = useMemo(() => [
    {
      id: 'client',
      type: 'default',
      data: { 
        label: 'ACP Client'
      },
      position: { x: 100, y: 250 },
      style: {
        background: 'var(--background)',
        border: '2px solid var(--border)',
        borderRadius: '6px',
        padding: '12px',
        minWidth: '120px',
        fontSize: '14px',
        fontWeight: '500'
      }
    },
    {
      id: 'server',
      type: 'default',
      data: { 
        label: 'ACP Server'
      },
      position: { x: 350, y: 100 },
      style: {
        background: 'var(--muted)',
        border: '2px solid var(--border)',
        borderRadius: '6px',
        padding: '12px',
        minWidth: '350px',
        fontSize: '14px',
        fontWeight: '500'
      }
    },
    {
      id: 'agent1',
      type: 'default',
      data: { 
        label: 'Agent 1'
      },
      position: { x: 300, y: 200 },
      style: {
        background: 'var(--background)',
        border: '2px solid var(--border)',
        borderRadius: '6px',
        padding: '12px',
        minWidth: '100px',
        fontSize: '14px',
        fontWeight: '500'
      }
    },
    {
      id: 'agent2',
      type: 'default',
      data: { 
        label: 'Agent 2'
      },
      position: { x: 450, y: 200 },
      style: {
        background: 'var(--background)',
        border: '2px solid var(--border)',
        borderRadius: '6px',
        padding: '12px',
        minWidth: '100px',
        fontSize: '14px',
        fontWeight: '500'
      }
    },
    {
      id: 'agent3',
      type: 'default',
      data: { 
        label: 'Agent 3'
      },
      position: { x: 600, y: 200 },
      style: {
        background: 'var(--background)',
        border: '2px solid var(--border)',
        borderRadius: '6px',
        padding: '12px',
        minWidth: '100px',
        fontSize: '14px',
        fontWeight: '500'
      }
    },
  ], []);

  const multiAgentEdges: Edge[] = useMemo(() => [
    { 
      id: 'e-client-server', 
      source: 'client', 
      target: 'server', 
      label: 'REST',
      style: {
        stroke: 'var(--primary)',
        strokeWidth: 2
      },
      labelStyle: { 
        fontSize: 12, 
        fontWeight: 500,
        fill: 'var(--foreground)'
      },
      labelBgStyle: { 
        fill: 'var(--background)',
        stroke: 'var(--border)',
        strokeWidth: 1
      }
    },
    {
      id: 'e-agent1-agent2',
      source: 'agent1',
      target: 'agent2',
      style: { 
        stroke: 'var(--secondary)',
        strokeWidth: 2
      },
    },
    {
      id: 'e-agent2-agent3',
      source: 'agent2',
      target: 'agent3',
      style: { 
        stroke: 'var(--accent)',
        strokeWidth: 2
      },
    },
    {
      id: 'e-agent1-agent3',
      source: 'agent1',
      target: 'agent3',
      style: { 
        stroke: 'var(--primary)',
        strokeWidth: 2
      },
    },
  ], []);

  // Sample message flow for single agent demo
  const singleAgentMessages: Message[] = [
    {
      id: "1",
      from: "client",
      to: "server",
      content: "Request: \"Generate a summary of the quarterly report\"",
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
      content: "Request: \"Analyze market trends and prepare a report\"",
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
    
    // Removed ReactFlow rendering fixes - StableFlowContainer handles this properly
    // setTimeout(() => {
    //   const container = activeDemo === 'single' 
    //     ? flowContainerRef1.current 
    //     : flowContainerRef2.current;
    //   
    //   if (container) {
    //     fixReactFlowRendering(container);
    //     
    //     // Force ReactFlow to recalculate layout - but don't trigger fitView
    //     const reactFlowInstance = container.querySelector('.react-flow');
    //     if (reactFlowInstance instanceof HTMLElement) {
    //       reactFlowInstance.style.height = '100%';
    //       reactFlowInstance.style.width = '100%';
    //       reactFlowInstance.style.position = 'relative';
    //       reactFlowInstance.style.display = 'block';
    //     }
    //     
    //     // Don't trigger resize during simulation to prevent re-centering
    //   }
    // }, 100);
  };
  
  // Effect to handle simulation logic and cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSimulationRunning) {
      const messageSet = activeDemo === 'single' ? singleAgentMessages : multiAgentMessages;
      let step = 0;
      
      // Define node mapping based on active demo
      const nodeMap = activeDemo === 'single' 
        ? { client: 'client', server: 'server', agent: 'agent' } 
        : { client: 'client', server: 'server', agent1: 'agent1', agent2: 'agent2', agent3: 'agent3' };
      
      // Initialize flow messages with an empty array
      setFlowMessages([]);
      
      // Create a function to process each message in sequence
      const processNextMessage = () => {
        if (step < messageSet.length) {
          const newMsg = messageSet[step];
          
          // Add message to log
          setMessages(prev => [...prev, newMsg]);
          
          // Convert all messages up to current step to flow messages
          const currentMessages = messageSet.slice(0, step + 1);
          setFlowMessages(convertToFlowMessages(currentMessages, nodeMap));
          
          // Update step counter
          setCurrentStep(step + 1);
          step++;
          
          // Schedule the next message
          interval = setTimeout(processNextMessage, 1500);
        } else {
          clearInterval(interval);
          setIsSimulationRunning(false);
        }
      };
      
      // Start with a short delay
      setTimeout(() => {
        // Don't force render or resize during simulation to prevent re-centering
        // Just start the message processing without visual interference
        processNextMessage();
      }, 300);
    }
    
    // Cleanup function
    return () => {
      if (interval) clearTimeout(interval);
    };
  }, [isSimulationRunning, activeDemo]);
  
  // Reset the simulation
  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setCurrentStep(0);
    setMessages([]);
    setFlowMessages([]);
  };

  // Handle node click (memoized)
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
  }, [selectedNode]);

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
            <div className="md:col-span-2 border rounded-md h-[500px]" ref={flowContainerRef1}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={singleAgentNodes}
                  edges={singleAgentEdges}
                  onNodeClick={onNodeClick}
                  fitView={false}
                  preventScrolling={true}
                  panOnDrag={false}
                  panOnScroll={false}
                  zoomOnScroll={false}
                  zoomOnPinch={false}
                  zoomOnDoubleClick={false}
                  defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  proOptions={{ hideAttribution: true }}
                  minZoom={0.8}
                  maxZoom={0.8}
                >
                  <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                  <Controls />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted py-2 px-4 border-b">
                <h3 className="text-sm font-medium">Message Log</h3>
              </div>
              <div className="h-[458px] overflow-y-auto p-2">
                {messages.map((message) => (
                  <div 
                    key={message.id}
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
                  </div>
                ))}
                
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
            <div className="md:col-span-2 border rounded-md h-[500px]" ref={flowContainerRef2}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={multiAgentNodes}
                  edges={multiAgentEdges}
                  onNodeClick={onNodeClick}
                  fitView={false}
                  preventScrolling={true}
                  panOnDrag={false}
                  panOnScroll={false}
                  zoomOnScroll={false}
                  zoomOnPinch={false}
                  zoomOnDoubleClick={false}
                  defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  proOptions={{ hideAttribution: true }}
                  minZoom={0.7}
                  maxZoom={0.7}
                >
                  <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                  <Controls />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted py-2 px-4 border-b">
                <h3 className="text-sm font-medium">Message Log</h3>
              </div>
              <div className="h-[458px] overflow-y-auto p-2">
                {messages.map((message) => (
                  <div 
                    key={message.id}
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
                  </div>
                ))}
                
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