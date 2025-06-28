import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play,
  Pause,
  ArrowsCounterClockwise,
  CaretRight,
  CaretLeft
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

interface ProtocolMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  protocolType: 'ACP' | 'MCP';
  timestamp: number;
}

interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  messages: ProtocolMessage[];
  activeEdges: string[];
}

const ProtocolWalkthrough = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<ProtocolMessage[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
  
  const steps: ProtocolStep[] = [
    {
      id: "request_init",
      title: "1. Request Initiation",
      description: "Client initiates a request to the agent system",
      messages: [
        {
          id: "msg-1",
          from: "client",
          to: "acpServer",
          content: "Request: Generate a report on sales trends",
          protocolType: 'ACP',
          timestamp: 0
        }
      ],
      activeEdges: ["client-acpServer"]
    },
    {
      id: "acp_routing",
      title: "2. ACP Server Routing",
      description: "ACP server routes the request to appropriate agent",
      messages: [
        {
          id: "msg-2",
          from: "acpServer",
          to: "agent1",
          content: "Request forwarded with ACP metadata",
          protocolType: 'ACP',
          timestamp: 1000
        }
      ],
      activeEdges: ["acpServer-agent1"]
    },
    {
      id: "mcp_context",
      title: "3. MCP Context Management",
      description: "Agent processes request within MCP context framework",
      messages: [
        {
          id: "msg-3",
          from: "agent1",
          to: "agent1",
          content: "Processing with MCP context tracking",
          protocolType: 'MCP',
          timestamp: 2000
        }
      ],
      activeEdges: []
    },
    {
      id: "agent_delegation",
      title: "4. Agent Delegation",
      description: "Agent delegates subtask with MCP metadata",
      messages: [
        {
          id: "msg-4",
          from: "agent1",
          to: "agent2",
          content: "Delegated task with preserved context",
          protocolType: 'MCP',
          timestamp: 3000
        }
      ],
      activeEdges: ["agent1-agent2"]
    },
    {
      id: "agent_response",
      title: "5. Agent Response",
      description: "Second agent responds with results",
      messages: [
        {
          id: "msg-5",
          from: "agent2",
          to: "agent1",
          content: "Task results with maintained context",
          protocolType: 'MCP',
          timestamp: 4000
        }
      ],
      activeEdges: ["agent2-agent1"]
    },
    {
      id: "acp_response",
      title: "6. ACP Response",
      description: "Response returned via ACP server",
      messages: [
        {
          id: "msg-6",
          from: "agent1",
          to: "acpServer",
          content: "Final result compiled",
          protocolType: 'ACP',
          timestamp: 5000
        },
        {
          id: "msg-7",
          from: "acpServer",
          to: "client",
          content: "HTTP response with results",
          protocolType: 'ACP',
          timestamp: 6000
        }
      ],
      activeEdges: ["agent1-acpServer", "acpServer-client"]
    }
  ];
  
  const nodes: Node[] = [
    {
      id: 'client',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">Client</div>
            <div className="text-xs text-muted-foreground">Application</div>
          </div>
        )
      },
      position: { x: 50, y: 100 },
      className: `border-2 border-border bg-background rounded-md px-2 py-1 transition-all duration-300 ${
        highlightedNodes.includes('client') ? 'border-primary shadow-lg shadow-primary/20' : ''
      }`,
    },
    {
      id: 'acpServer',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">ACP Server</div>
            <div className="text-xs text-muted-foreground">Protocol Handler</div>
          </div>
        )
      },
      position: { x: 250, y: 100 },
      className: `border-2 border-border bg-background rounded-md px-2 py-1 transition-all duration-300 ${
        highlightedNodes.includes('acpServer') ? 'border-primary shadow-lg shadow-primary/20' : ''
      }`,
    },
    {
      id: 'agent1',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">Coordinator Agent</div>
            <div className="text-xs text-muted-foreground">Request Handler</div>
          </div>
        )
      },
      position: { x: 450, y: 50 },
      className: `border-2 border-border bg-background rounded-md px-2 py-1 transition-all duration-300 ${
        highlightedNodes.includes('agent1') ? 'border-secondary shadow-lg shadow-secondary/20' : ''
      }`,
    },
    {
      id: 'agent2',
      type: 'default',
      data: { 
        label: (
          <div>
            <div className="font-semibold">Specialist Agent</div>
            <div className="text-xs text-muted-foreground">Task Processor</div>
          </div>
        )
      },
      position: { x: 450, y: 150 },
      className: `border-2 border-border bg-background rounded-md px-2 py-1 transition-all duration-300 ${
        highlightedNodes.includes('agent2') ? 'border-secondary shadow-lg shadow-secondary/20' : ''
      }`,
    }
  ];
  
  const edges: Edge[] = [
    {
      id: 'client-acpServer',
      source: 'client',
      target: 'acpServer',
      label: 'ACP Request',
      labelBgStyle: { fill: 'var(--muted)' },
      labelStyle: { fontSize: 10 },
      animated: highlightedEdges.includes('client-acpServer'),
      style: { stroke: highlightedEdges.includes('client-acpServer') ? 'var(--primary)' : 'var(--border)' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: highlightedEdges.includes('client-acpServer') ? 'var(--primary)' : 'var(--border)',
      },
    },
    {
      id: 'acpServer-agent1',
      source: 'acpServer',
      target: 'agent1',
      label: 'ACP Routing',
      labelBgStyle: { fill: 'var(--muted)' },
      labelStyle: { fontSize: 10 },
      animated: highlightedEdges.includes('acpServer-agent1'),
      style: { stroke: highlightedEdges.includes('acpServer-agent1') ? 'var(--primary)' : 'var(--border)' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: highlightedEdges.includes('acpServer-agent1') ? 'var(--primary)' : 'var(--border)',
      },
    },
    {
      id: 'agent1-agent2',
      source: 'agent1',
      target: 'agent2',
      label: 'MCP Message',
      labelBgStyle: { fill: 'var(--muted)' },
      labelStyle: { fontSize: 10 },
      animated: highlightedEdges.includes('agent1-agent2'),
      style: { stroke: highlightedEdges.includes('agent1-agent2') ? 'var(--secondary)' : 'var(--border)' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: highlightedEdges.includes('agent1-agent2') ? 'var(--secondary)' : 'var(--border)',
      },
    },
    {
      id: 'agent2-agent1',
      source: 'agent2',
      target: 'agent1',
      label: 'MCP Message',
      labelBgStyle: { fill: 'var(--muted)' },
      labelStyle: { fontSize: 10 },
      animated: highlightedEdges.includes('agent2-agent1'),
      style: { stroke: highlightedEdges.includes('agent2-agent1') ? 'var(--secondary)' : 'var(--border)' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: highlightedEdges.includes('agent2-agent1') ? 'var(--secondary)' : 'var(--border)',
      },
    },
    {
      id: 'agent1-acpServer',
      source: 'agent1',
      target: 'acpServer',
      label: 'ACP Response',
      labelBgStyle: { fill: 'var(--muted)' },
      labelStyle: { fontSize: 10 },
      animated: highlightedEdges.includes('agent1-acpServer'),
      style: { stroke: highlightedEdges.includes('agent1-acpServer') ? 'var(--primary)' : 'var(--border)' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: highlightedEdges.includes('agent1-acpServer') ? 'var(--primary)' : 'var(--border)',
      },
    },
    {
      id: 'acpServer-client',
      source: 'acpServer',
      target: 'client',
      label: 'ACP Response',
      labelBgStyle: { fill: 'var(--muted)' },
      labelStyle: { fontSize: 10 },
      animated: highlightedEdges.includes('acpServer-client'),
      style: { stroke: highlightedEdges.includes('acpServer-client') ? 'var(--primary)' : 'var(--border)' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: highlightedEdges.includes('acpServer-client') ? 'var(--primary)' : 'var(--border)',
      },
    }
  ];
  
  // Handle step transition
  useEffect(() => {
    let messageTimerId: NodeJS.Timeout | null = null;
    let stepTimerId: NodeJS.Timeout | null = null;

    if (isPlaying) {
      const currentStep = steps[currentStepIndex];
      
      if (currentMessageIndex < currentStep.messages.length) {
        messageTimerId = setTimeout(() => {
          const message = currentStep.messages[currentMessageIndex];
          
          // Add message to display
          setDisplayedMessages(prev => [...prev, message]);
          
          // Highlight nodes involved in this message
          setHighlightedNodes([message.from, message.to]);
          
          // Advance to next message
          setCurrentMessageIndex(prev => prev + 1);
        }, 1000);
        
        // Update active edges
        setHighlightedEdges(currentStep.activeEdges);
      } else {
        // We've shown all messages for this step
        
        // If there are more steps, move to the next one after a delay
        if (currentStepIndex < steps.length - 1) {
          stepTimerId = setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
            setCurrentMessageIndex(0);
          }, 2000);
        } else {
          // We've completed all steps
          setIsPlaying(false);
        }
      }
    }

    // Cleanup function to clear any active timers
    return () => {
      if (messageTimerId) clearTimeout(messageTimerId);
      if (stepTimerId) clearTimeout(stepTimerId);
    };
  }, [isPlaying, currentStepIndex, currentMessageIndex, steps.length]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setCurrentMessageIndex(0);
    setDisplayedMessages([]);
    setHighlightedNodes([]);
    setHighlightedEdges([]);
  };
  
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setIsPlaying(false);
      
      // Calculate messages to keep
      const messagesFromPreviousSteps = steps
        .slice(0, currentStepIndex - 1)
        .reduce((acc, step) => acc + step.messages.length, 0);
      
      // Keep only messages from steps before the previous step
      setDisplayedMessages(prev => prev.slice(0, messagesFromPreviousSteps));
      
      // Go to previous step
      setCurrentStepIndex(prev => prev - 1);
      setCurrentMessageIndex(0);
      
      // Update highlighted elements based on previous step
      const previousStep = steps[currentStepIndex - 1];
      setHighlightedEdges(previousStep.activeEdges);
      
      if (previousStep.messages.length > 0) {
        const lastMessage = previousStep.messages[0]; // Start with first message of the step
        setHighlightedNodes([lastMessage.from, lastMessage.to]);
      } else {
        setHighlightedNodes([]);
      }
    }
  };
  
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setIsPlaying(false);
      
      // Skip any remaining messages in current step
      const currentStep = steps[currentStepIndex];
      
      if (currentMessageIndex < currentStep.messages.length) {
        const remainingMessages = currentStep.messages.slice(currentMessageIndex);
        setDisplayedMessages(prev => [...prev, ...remainingMessages]);
      }
      
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
      setCurrentMessageIndex(0);
      
      // Update highlighted elements based on next step
      const nextStep = steps[currentStepIndex + 1];
      setHighlightedEdges(nextStep.activeEdges);
      
      // Clear highlighted nodes until next message is processed
      setHighlightedNodes([]);
    }
  };
  
  const currentStep = steps[currentStepIndex];
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{currentStep.title}</h3>
              <p className="text-muted-foreground text-sm">{currentStep.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={currentStepIndex >= 3 && currentStepIndex <= 4 ? 'bg-secondary/10' : 'bg-primary/10'}>
                {currentStepIndex >= 3 && currentStepIndex <= 4 ? 'MCP Phase' : 'ACP Phase'}
              </Badge>
              <div className="text-sm">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden" style={{ height: 300 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              attributionPosition="bottom-right"
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handlePreviousStep}
                disabled={currentStepIndex === 0 || isPlaying}
              >
                <CaretLeft className="mr-1" size={14} />
                Previous
              </Button>
              
              <Button 
                variant={isPlaying ? "secondary" : "default"}
                size="sm"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-1" size={14} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1" size={14} />
                    Play
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={handleNextStep}
                disabled={currentStepIndex === steps.length - 1 || isPlaying}
              >
                Next
                <CaretRight className="ml-1" size={14} />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={displayedMessages.length === 0}
            >
              <ArrowsCounterClockwise className="mr-1" size={14} />
              Reset
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Message Log</h4>
            
            <div className="border rounded-md p-3 h-[200px] overflow-y-auto">
              {displayedMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">Press Play to start the protocol walkthrough</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                    >
                      <Badge variant="outline" className={message.protocolType === 'ACP' ? 'bg-primary/10' : 'bg-secondary/10'}>
                        {message.protocolType}
                      </Badge>
                      <div>
                        <div className="text-xs">
                          <span className="font-medium">{message.from}</span>
                          <span className="px-2">→</span>
                          <span className="font-medium">{message.to}</span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>ACP Communication</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span>MCP Communication</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProtocolWalkthrough;