import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, ArrowsCounterClockwise, Pause, ArrowRight, Info } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from '@/components/ui/scroll-area';
import MCPArchitectureDiagram from '@/components/concepts/MCPArchitectureDiagram';

// Simplified version without ReactFlow to avoid rendering issues

// MCP flow simulation steps
interface SimulationStep {
  id: number;
  description: string;
  nodeHighlights: string[];
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
  const [selectedTab, setSelectedTab] = useState('messages');
  const [autoPlay, setAutoPlay] = useState(true);
  
  // Simulation steps that will be played
  const simulationSteps: SimulationStep[] = [
    {
      id: 1,
      description: "User submits a query to the Agent",
      nodeHighlights: ['user', 'agent'],
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
      nodeHighlights: ['agent', 'llm'],
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
      nodeHighlights: ['llm', 'agent'],
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
      nodeHighlights: ['agent', 'mcp_client'],
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
      nodeHighlights: ['mcp_client', 'mcp_server'],
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
      nodeHighlights: ['mcp_server', 'mcp_client'],
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
      nodeHighlights: ['mcp_client', 'mcp_server'],
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
      nodeHighlights: ['mcp_server', 'tools'],
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
      nodeHighlights: ['tools', 'mcp_server'],
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
      nodeHighlights: ['mcp_server', 'mcp_client'],
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
      nodeHighlights: ['mcp_client', 'agent'],
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
      nodeHighlights: ['agent', 'llm'],
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
      nodeHighlights: ['llm', 'agent'],
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
      nodeHighlights: ['agent', 'user'],
      messages: [
        {
          from: "Agent",
          to: "User",
          content: "In Seattle today, it's currently 65°F and cloudy with 72% humidity. You might want to bring a light jacket if you're going outside."
        }
      ]
    }
  ];
  
  // Reset the simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(null);
  };
  
  // Start the simulation
  const startSimulation = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);
    
    if (autoPlay) {
      advanceSimulation();
    }
  };
  
  // Pause/Resume simulation
  const togglePause = () => {
    setIsPaused(prev => !prev);
    
    if (isPaused && autoPlay) {
      advanceSimulation();
    }
  };
  
  // Function to handle auto-advancing the simulation
  const advanceSimulation = () => {
    if (!isPaused && currentStep !== null && currentStep < simulationSteps.length - 1) {
      setTimeout(() => {
        if (!isPaused) {
          setCurrentStep(prev => {
            if (prev !== null && prev < simulationSteps.length - 1) {
              return prev + 1;
            }
            return prev;
          });
          
          if (currentStep < simulationSteps.length - 2) {
            advanceSimulation();
          } else {
            setIsRunning(false);
          }
        }
      }, 3000);
    }
  };
  
  // Move to next step manually
  const nextStep = () => {
    if (currentStep !== null && currentStep < simulationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === null) {
      setCurrentStep(0);
    }
  };
  
  // Current step data
  const currentStepData = currentStep !== null ? simulationSteps[currentStep] : null;
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ModelContextProtocol (MCP) Demo</CardTitle>
            <CardDescription>
              Demonstration showing how MCP connects agents, tools, and services
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
                  This demonstration shows how MCP enables structured communication between
                  AI agents and external tools/resources.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diagram">MCP Architecture</TabsTrigger>
            <TabsTrigger value="messages">Message Exchange</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagram" className="mt-4 space-y-4">
            <div className="border rounded-md p-4 bg-muted/20">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium mb-2">Model Context Protocol Architecture</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive visualization of MCP components and their relationships
                </p>
              </div>
              
              <MCPArchitectureDiagram autoPlay={isRunning} />
            </div>
          </TabsContent>
          
          <TabsContent value="messages" className="mt-4 space-y-4">
            <div className="border rounded-md p-4 bg-muted/30 h-[400px]">
              <ScrollArea className="h-full">
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
                                  <div className="text-xs font-medium text-muted-foreground mb-1">MCP Metadata:</div>
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
                      <p>Press "Start Demo" to see message exchange</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
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
                  Start Demo
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
                  disabled={!isRunning || (currentStep !== null && currentStep === simulationSteps.length - 1)}
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