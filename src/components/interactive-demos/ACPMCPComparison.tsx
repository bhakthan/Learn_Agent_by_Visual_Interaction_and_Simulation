import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Play, 
  ArrowsCounterClockwise, 
  CaretRight, 
  Info,
  ArrowsClockwise,
  ArrowsHorizontal
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import ProtocolWalkthrough from "./ProtocolWalkthrough";

interface Protocol {
  name: string;
  description: string;
  specification: string;
  keyFeatures: {
    title: string;
    description: string;
  }[];
  useCases: string[];
  implementation: string;
}

interface MessageExchange {
  id: string;
  protocolType: 'ACP' | 'MCP';
  title: string;
  description: string;
  messages: {
    id: string;
    from: string;
    to: string;
    content: string;
    metadata?: Record<string, any>;
    timestamp: string;
    notes?: string;
  }[];
}

const ACPMCPComparison = () => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'walkthrough'>('comparison');
  const [activeExchangeId, setActiveExchangeId] = useState<string>('simple_request');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<MessageExchange['messages']>([]);
  
  const protocols: Record<string, Protocol> = {
    acp: {
      name: "Agent Communication Protocol (ACP)",
      description: "An open protocol for agent interoperability that enables AI agents to communicate through a standardized RESTful API.",
      specification: "REST-based API with JSON message format",
      keyFeatures: [
        {
          title: "RESTful Interface",
          description: "Standard HTTP-based communication with clearly defined endpoints"
        },
        {
          title: "Multi-modal Support",
          description: "Handles text, images, audio, and other modalities"
        },
        {
          title: "Sync/Async Communication",
          description: "Supports both synchronous and asynchronous interaction patterns"
        },
        {
          title: "Server-based Architecture",
          description: "Centralized deployment model with agent discovery"
        }
      ],
      useCases: [
        "Cloud-hosted agent services",
        "Multi-agent orchestration",
        "User-facing applications with agent integration",
        "Enterprise-scale agent deployments"
      ],
      implementation: "Implemented through ACP server that hosts and manages agents with standardized endpoints"
    },
    mcp: {
      name: "ModelContextProtocol (MCP)",
      description: "A framework for standardizing how AI agents communicate, maintain context, and collaborate within conversation flows.",
      specification: "JSON message schema with context tracking",
      keyFeatures: [
        {
          title: "Context Preservation",
          description: "Maintains conversation history and state across agent interactions"
        },
        {
          title: "Metadata Enrichment",
          description: "Structured metadata for intent, confidence, and routing information"
        },
        {
          title: "Agent Handoff",
          description: "Seamless transfer of conversation control between agents"
        },
        {
          title: "Protocol Versioning",
          description: "Built-in versioning for backward compatibility"
        }
      ],
      useCases: [
        "Multi-agent conversations",
        "Context-aware agent systems",
        "Long-running conversations with state",
        "Specialized agent collaboration"
      ],
      implementation: "Integrated within message passing layer of agent systems"
    }
  };
  
  const messageExchanges: Record<string, MessageExchange> = {
    simple_request: {
      id: "simple_request",
      protocolType: 'ACP',
      title: "Basic Request/Response",
      description: "Simple synchronous request to an agent",
      messages: [
        {
          id: "1",
          from: "Client",
          to: "ACP Server",
          content: "POST /agent/invoke\nContent-Type: application/json\n\n{\n  \"input\": \"Generate a summary of the quarterly report\",\n  \"options\": {\n    \"timeout\": 30\n  }\n}",
          timestamp: "00:00",
          notes: "Standard HTTP request to the ACP endpoint"
        },
        {
          id: "2",
          from: "ACP Server",
          to: "Agent",
          content: "{ \"input\": \"Generate a summary of the quarterly report\" }",
          timestamp: "00:01",
          notes: "Server forwards request to appropriate agent"
        },
        {
          id: "3",
          from: "Agent",
          to: "ACP Server",
          content: "{ \"response\": \"The quarterly report shows 15% revenue increase...\" }",
          timestamp: "00:03",
          notes: "Agent processes request and returns response"
        },
        {
          id: "4",
          from: "ACP Server",
          to: "Client",
          content: "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  \"response\": \"The quarterly report shows 15% revenue increase...\",\n  \"metadata\": {\n    \"completionTime\": 2.5,\n    \"agentId\": \"summary-generator-v1\"\n  }\n}",
          timestamp: "00:04",
          notes: "Server formats response according to ACP specification"
        }
      ]
    },
    mcp_context: {
      id: "mcp_context",
      protocolType: 'MCP',
      title: "Context Preservation",
      description: "MCP maintaining context across multiple turns",
      messages: [
        {
          id: "1",
          from: "Client",
          to: "Agent1",
          content: "What were the top selling products last quarter?",
          timestamp: "00:00",
          notes: "Initial user query"
        },
        {
          id: "2",
          from: "Agent1",
          to: "Client",
          content: "The top selling products last quarter were smartphones (35%), laptops (28%), and tablets (15%).",
          metadata: {
            protocol: "MCP/1.0",
            contextId: "conv-123456",
            messageId: "msg-1",
            intent: "product_information",
            confidence: 0.92
          },
          timestamp: "00:01",
          notes: "Response with MCP metadata and context tracking"
        },
        {
          id: "3",
          from: "Client",
          to: "Agent1",
          content: "How does that compare to the previous year?",
          timestamp: "00:02",
          notes: "Follow-up query requiring context"
        },
        {
          id: "4",
          from: "Agent1",
          to: "Agent2",
          content: "Need historical comparison data for top selling products (smartphones, laptops, tablets).",
          metadata: {
            protocol: "MCP/1.0",
            contextId: "conv-123456", 
            messageId: "msg-2",
            parentMessageId: "msg-1",
            intent: "delegate_historical_analysis",
            targetAgent: "historical-data-specialist"
          },
          timestamp: "00:03",
          notes: "MCP handoff to specialized agent with context preservation"
        },
        {
          id: "5",
          from: "Agent2",
          to: "Agent1",
          content: "Compared to last year: smartphones +5%, laptops -2%, tablets +8%",
          metadata: {
            protocol: "MCP/1.0",
            contextId: "conv-123456",
            messageId: "msg-3",
            parentMessageId: "msg-2",
            intent: "historical_data_response",
            confidence: 0.95
          },
          timestamp: "00:04",
          notes: "Specialized agent response with maintained context"
        },
        {
          id: "6",
          from: "Agent1",
          to: "Client",
          content: "Compared to the previous year, smartphone sales increased by 5%, laptop sales decreased by 2%, and tablet sales increased by 8%.",
          metadata: {
            protocol: "MCP/1.0",
            contextId: "conv-123456",
            messageId: "msg-4",
            parentMessageId: "msg-3",
            intent: "comparison_information",
            confidence: 0.94
          },
          timestamp: "00:05",
          notes: "Final response to user with complete contextual understanding"
        }
      ]
    },
    acp_streaming: {
      id: "acp_streaming",
      protocolType: 'ACP',
      title: "Streaming Response",
      description: "ACP streaming response pattern",
      messages: [
        {
          id: "1",
          from: "Client",
          to: "ACP Server",
          content: "POST /agent/invoke\nContent-Type: application/json\n\n{\n  \"input\": \"Explain quantum computing\",\n  \"options\": {\n    \"stream\": true\n  }\n}",
          timestamp: "00:00",
          notes: "Request with streaming option enabled"
        },
        {
          id: "2",
          from: "ACP Server",
          to: "Agent",
          content: "{ \"input\": \"Explain quantum computing\", \"stream\": true }",
          timestamp: "00:01",
          notes: "Server forwards streaming request to agent"
        },
        {
          id: "3",
          from: "Agent",
          to: "ACP Server",
          content: "data: {\"chunk\": \"Quantum computing uses quantum\"}\n\ndata: {\"chunk\": \" mechanical phenomena to perform operations\"}\n\ndata: {\"chunk\": \" on data. Unlike classical computers,\"}\n\n...",
          timestamp: "00:02",
          notes: "Agent streams response in chunks"
        },
        {
          id: "4",
          from: "ACP Server",
          to: "Client",
          content: "HTTP/1.1 200 OK\nContent-Type: text/event-stream\n\ndata: {\"chunk\": \"Quantum computing uses quantum\"}\n\ndata: {\"chunk\": \" mechanical phenomena to perform operations\"}\n\ndata: {\"chunk\": \" on data. Unlike classical computers,\"}\n\n...",
          timestamp: "00:02",
          notes: "Server streams response to client in SSE format"
        }
      ]
    },
    protocol_comparison: {
      id: "protocol_comparison",
      protocolType: 'MCP',
      title: "Protocol Comparison",
      description: "Side-by-side comparison of ACP and MCP message formats",
      messages: [
        {
          id: "1",
          from: "Documentation",
          to: "Developer",
          content: "# ACP Message Example\n```json\n{\n  \"role\": \"user\",\n  \"content\": \"Generate a product description for eco-friendly water bottles\",\n  \"options\": {\n    \"temperature\": 0.7,\n    \"maxTokens\": 500\n  }\n}\n```",
          timestamp: "N/A",
          notes: "ACP focuses on HTTP-based communication with request/response format"
        },
        {
          id: "2",
          from: "Documentation",
          to: "Developer",
          content: "# MCP Message Example\n```json\n{\n  \"role\": \"agent\",\n  \"content\": \"I'll create a product description for eco-friendly water bottles.\",\n  \"metadata\": {\n    \"protocol\": \"MCP/1.0\",\n    \"contextId\": \"conv-abc123\",\n    \"messageId\": \"msg-456\",\n    \"parentMessageId\": \"msg-123\",\n    \"intent\": \"product_description_generation\",\n    \"confidence\": 0.85\n  }\n}\n```",
          timestamp: "N/A",
          notes: "MCP focuses on message structure with metadata for context tracking"
        },
        {
          id: "3",
          from: "Documentation",
          to: "Developer",
          content: "# Key Differences\n\n1. **Transport Layer**: ACP defines a REST API for communication, while MCP focuses on message format regardless of transport\n\n2. **Context Management**: MCP has explicit context tracking with IDs, ACP handles this at the server level\n\n3. **Deployment Model**: ACP specifies a server-based deployment, MCP is transport-agnostic\n\n4. **Metadata Structure**: MCP includes rich metadata in every message, ACP has simpler request/response format",
          timestamp: "N/A",
          notes: "The protocols serve complementary purposes in agent communication"
        }
      ]
    }
  };

  const runSimulation = () => {
    setIsSimulationRunning(true);
    setCurrentStep(0);
    setDisplayedMessages([]);
    
    const currentExchange = messageExchanges[activeExchangeId];
    let step = 0;
    
    const interval = setInterval(() => {
      if (step < currentExchange.messages.length) {
        setDisplayedMessages(prev => [...prev, currentExchange.messages[step]]);
        setCurrentStep(step + 1);
        step++;
      } else {
        clearInterval(interval);
        setIsSimulationRunning(false);
      }
    }, 2000);
  };
  
  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setCurrentStep(0);
    setDisplayedMessages([]);
  };

  const currentExchange = messageExchanges[activeExchangeId];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="comparison" onValueChange={(value) => setActiveTab(value as 'comparison' | 'walkthrough')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison">Protocol Comparison</TabsTrigger>
          <TabsTrigger value="walkthrough">Interactive Walkthrough</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison" className="mt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* ACP Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{protocols.acp.name}</CardTitle>
                  <Badge variant="outline" className="bg-primary/10">REST API</Badge>
                </div>
                <CardDescription>{protocols.acp.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Specification</h4>
                  <p className="text-sm text-muted-foreground">{protocols.acp.specification}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Key Features</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {protocols.acp.keyFeatures.map((feature, index) => (
                      <div key={index} className="rounded-md border border-border p-2">
                        <p className="font-medium text-sm">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Use Cases</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {protocols.acp.useCases.map((useCase, index) => (
                      <li key={index}>{useCase}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Learn more at <a href="https://agentcommunicationprotocol.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">agentcommunicationprotocol.dev</a>
                </p>
              </CardFooter>
            </Card>
            
            {/* MCP Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{protocols.mcp.name}</CardTitle>
                  <Badge variant="outline" className="bg-secondary/10">Message Format</Badge>
                </div>
                <CardDescription>{protocols.mcp.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Specification</h4>
                  <p className="text-sm text-muted-foreground">{protocols.mcp.specification}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Key Features</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {protocols.mcp.keyFeatures.map((feature, index) => (
                      <div key={index} className="rounded-md border border-border p-2">
                        <p className="font-medium text-sm">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">Use Cases</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {protocols.mcp.useCases.map((useCase, index) => (
                      <li key={index}>{useCase}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Protocol Integration Possibilities</CardTitle>
              <CardDescription>ACP and MCP can work together in complementary ways</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-dashed border-primary/30 rounded-md bg-primary/5">
                  <h3 className="text-md font-medium mb-2 flex items-center gap-2">
                    <ArrowsHorizontal className="text-primary" size={20} />
                    Complementary Protocols
                  </h3>
                  <p className="text-sm">
                    ACP provides the transport layer and RESTful interfaces that define how agents are deployed and accessed,
                    while MCP provides the message structure and context management that enables rich agent-to-agent communication.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-3 border border-border rounded-md">
                    <h4 className="text-sm font-medium mb-1">MCP Messages Over ACP Transport</h4>
                    <p className="text-xs text-muted-foreground">
                      MCP-structured messages can be transmitted through ACP's REST endpoints, combining
                      the deployment flexibility of ACP with the rich context management of MCP.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-border rounded-md">
                    <h4 className="text-sm font-medium mb-1">Hybrid Architecture</h4>
                    <p className="text-xs text-muted-foreground">
                      ACP can handle external system integration while MCP manages internal agent communication,
                      creating a comprehensive agent communication stack.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="walkthrough" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Protocol Message Exchange Patterns</h3>
              <p className="text-sm text-muted-foreground">
                Interactive demonstrations of how ACP and MCP handle different communication scenarios.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetSimulation}
                disabled={isSimulationRunning || displayedMessages.length === 0}
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
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-md border border-border space-y-2">
              <h3 className="font-medium">Message Exchange Patterns</h3>
              
              <div className="space-y-2 mt-4">
                {Object.values(messageExchanges).map((exchange) => (
                  <div 
                    key={exchange.id}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      activeExchangeId === exchange.id 
                        ? 'bg-accent/20 text-accent-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      setActiveExchangeId(exchange.id);
                      resetSimulation();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CaretRight 
                        size={16} 
                        className={activeExchangeId === exchange.id ? 'text-accent' : 'text-muted-foreground'}
                      />
                      <div>
                        <p className="font-medium text-sm">{exchange.title}</p>
                        <Badge variant="outline" className="text-xs mt-1 bg-muted">
                          {exchange.protocolType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2 border rounded-md">
              <div className="bg-muted p-3 flex items-center justify-between border-b">
                <div>
                  <h3 className="font-medium">{currentExchange.title}</h3>
                  <p className="text-xs text-muted-foreground">{currentExchange.description}</p>
                </div>
                <Badge className={currentExchange.protocolType === 'ACP' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}>
                  {currentExchange.protocolType}
                </Badge>
              </div>
              
              <ScrollArea className="h-[400px] p-4">
                <AnimatePresence>
                  {displayedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-center">
                      <div className="space-y-2">
                        <p className="text-muted-foreground">Run the simulation to see message exchange</p>
                        <AnimatePresence>
                          {isSimulationRunning && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex justify-center"
                            >
                              <ArrowsClockwise size={24} className="animate-spin text-muted-foreground" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {displayedMessages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="relative"
                        >
                          <div className="flex items-center gap-1 mb-1 text-sm">
                            <span className="font-medium">{message.from}</span>
                            <ArrowsHorizontal size={16} className="text-muted-foreground" />
                            <span className="font-medium">{message.to}</span>
                            {message.timestamp !== 'N/A' && (
                              <span className="text-xs text-muted-foreground ml-2">({message.timestamp})</span>
                            )}
                          </div>
                          
                          <Card className="overflow-hidden">
                            <CardContent className="p-3 ">
                              <pre className="text-xs whitespace-pre-wrap bg-muted/50 p-2 rounded-md overflow-x-auto">
                                {message.content}
                              </pre>
                              
                              {message.metadata && (
                                <div className="mt-2">
                                  <details className="text-xs">
                                    <summary className="cursor-pointer font-medium">Metadata</summary>
                                    <pre className="bg-muted/50 p-2 rounded-md mt-1 overflow-x-auto">
                                      {JSON.stringify(message.metadata, null, 2)}
                                    </pre>
                                  </details>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          {message.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="absolute top-0 right-0 p-1 text-muted-foreground hover:text-foreground">
                                    <Info size={16} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs max-w-[250px]">{message.notes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Animated Protocol Walkthrough</h3>
            <p className="text-sm text-muted-foreground mb-6">
              See how ACP and MCP can work together in a complete agent communication flow, from initial client 
              request through agent delegation and back to the final response.
            </p>
            
            <ProtocolWalkthrough />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>When to Use Each Protocol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-primary mb-2">Use ACP When</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Building RESTful agent services that need standardized endpoints</li>
                    <li>Implementing server-based agent architectures</li>
                    <li>Creating agent marketplaces or directories</li>
                    <li>Working with multi-modal data (images, audio, text)</li>
                    <li>Needing both streaming and non-streaming communication</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-secondary mb-2">Use MCP When</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Managing complex multi-turn conversations</li>
                    <li>Implementing agent handoffs that preserve context</li>
                    <li>Tracking conversation and task state across multiple agents</li>
                    <li>Needing rich metadata for message routing and intent recognition</li>
                    <li>Building transport-agnostic agent communication systems</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ACPMCPComparison;