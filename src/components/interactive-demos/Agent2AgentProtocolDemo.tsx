import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  ArrowsCounterClockwise, 
  CaretRight, 
  ArrowsClockwise, 
  ArrowRight, 
  CheckCircle,
  Code,
  Info,
  ChatCircleDots,
  User
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeBlock from '@/components/ui/CodeBlock';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Step {
  id: number;
  title: string;
  description: string;
  from: string;
  to: string;
  content: string;
  protocolType: 'A2A' | 'MCP';
  codeExample?: string;
  explanation?: string;
}

const Agent2AgentProtocolDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  
  const steps: Step[] = [
    {
      id: 1,
      title: "User Query Initiation",
      description: "User sends a request to the Host Agent",
      from: "User",
      to: "Host Agent",
      content: "What's Google's stock price today?",
      protocolType: 'A2A',
      codeExample: `// Client-side query to Host Agent
const response = await fetch('https://host-agent.example.com/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: "What's Google's stock price today?"
  })
});`,
      explanation: "The user sends a natural language query to their personal Host Agent. This is the entry point for the A2A workflow, where the user's intent needs to be understood and routed appropriately."
    },
    {
      id: 2,
      title: "Host Agent Processing",
      description: "Host Agent processes the query and identifies the need for specialized information",
      from: "Host Agent",
      to: "Host Agent",
      content: "Hold on a sec, I know someone who can help with stock information...",
      protocolType: 'A2A',
      codeExample: `// Host Agent internal processing
async function processQuery(query) {
  // Analyze query to determine intent and required capabilities
  const intent = await analyzeIntent(query);
  
  if (intent.category === 'stock_information') {
    // Identify specialized agent from registry
    const stockAgent = await agentRegistry.findAgent({
      capability: 'stock_price',
      ticker: extractTicker(query) // Extracts "GOOGL" from query
    });
    
    return {
      needsSpecialistAgent: true,
      agentInfo: stockAgent,
      originalQuery: query
    };
  }
  
  // Other intent handling...
}`,
      explanation: "The Host Agent analyzes the user's query and determines it needs to delegate to a specialized agent. It consults its agent registry to find an agent with stock information capabilities."
    },
    {
      id: 3,
      title: "A2A Delegation",
      description: "Host Agent delegates to specialized Stock Info Agent",
      from: "Host Agent",
      to: "Stock Info Agent",
      content: "Please get Google's current stock price!",
      protocolType: 'A2A',
      codeExample: `// A2A task creation and delegation
const task = await a2a.createTask({
  agent: stockAgent.url,
  instruction: "Get current stock price for ticker GOOGL",
  metadata: {
    originalQuery: query,
    requiredFormat: "plain_text",
    priority: "standard"
  }
});

// A2A task has unique ID for tracking and state management
console.log(\`Task created with ID: \${task.id}, status: \${task.status}\`);`,
      explanation: "The Host Agent uses the A2A protocol to create a new task and delegate it to the Stock Info Agent. The A2A task includes the instruction, any necessary context, and metadata to help the specialist agent understand what's needed."
    },
    {
      id: 4,
      title: "Stock Agent Processing",
      description: "Stock Info Agent thinks about how to get the requested data",
      from: "Stock Info Agent",
      to: "Stock Info Agent",
      content: "Hold on a sec, I know a place to get this information...",
      protocolType: 'A2A',
      codeExample: `// Stock Info Agent internal processing
async function processStockPriceRequest(request) {
  const ticker = extractTicker(request.instruction); // Gets "GOOGL"
  
  // Determine which data source to use
  const dataSource = selectDataSource(ticker);
  
  // For this example, we'll use an MCP-enabled tool
  return {
    ticker,
    dataSource
  };
}`,
      explanation: "The Stock Info Agent processes the request and determines it needs to call an external tool to get the current stock price. It identifies which data source to use and prepares to make the call."
    },
    {
      id: 5,
      title: "MCP Tool Request",
      description: "Stock Info Agent contacts MCP Server for stock data",
      from: "Stock Info Agent",
      to: "MCP Stock Price Server",
      content: "Function_call: 'get_stock_price', args: {'symbol': 'GOOGL'}",
      protocolType: 'MCP',
      codeExample: `// MCP tool call from Stock Info Agent
const stockData = await mcp.callTool({
  name: "get_stock_price",
  parameters: {
    symbol: "GOOGL"
  },
  metadata: {
    requestId: generateRequestId(),
    timeout: 5000
  }
});`,
      explanation: "The Stock Info Agent uses the Model Context Protocol (MCP) to make a function call to a stock price data provider. MCP provides a standardized way to call external tools and functions."
    },
    {
      id: 6,
      title: "MCP Server Response",
      description: "MCP Server responds with stock price data",
      from: "MCP Stock Price Server",
      to: "Stock Info Agent",
      content: "Response: {'price': '174.92'} USD",
      protocolType: 'MCP',
      codeExample: `// MCP response handling
// Server-side response generation
function getStockPrice(parameters) {
  const { symbol } = parameters;
  
  // In a real implementation, this would call a financial data API
  // This is a simulated response
  return {
    price: "174.92",
    currency: "USD",
    timestamp: new Date().toISOString(),
    symbol: symbol
  };
}

// Stock Info Agent receives and processes the response
function handleStockPriceResponse(response) {
  const { price, currency, symbol } = response;
  return \`Current price for \${symbol}: \${price} \${currency}\`;
}`,
      explanation: "The MCP Server processes the function call, retrieves the requested stock price data, and returns a structured response to the Stock Info Agent. The MCP protocol ensures the response is in a predictable format that the agent can easily parse."
    },
    {
      id: 7,
      title: "A2A Response",
      description: "Stock Info Agent sends results back to Host Agent",
      from: "Stock Info Agent",
      to: "Host Agent",
      content: "Google stock is 174.92 USD",
      protocolType: 'A2A',
      codeExample: `// A2A task completion
await a2a.completeTask(task.id, {
  result: "Google stock is 174.92 USD",
  metadata: {
    dataSource: "financial_api",
    confidence: 0.98,
    timestamp: new Date().toISOString()
  }
});`,
      explanation: "Once the Stock Info Agent has the data it needs, it marks the A2A task as complete and sends the result back to the Host Agent. The A2A protocol handles this message routing and ensures the response gets back to the requesting agent."
    },
    {
      id: 8,
      title: "Host Response to User",
      description: "Host Agent delivers the answer to the user",
      from: "Host Agent",
      to: "User",
      content: "Google's stock price today is 174.92 USD",
      protocolType: 'A2A',
      codeExample: `// Host Agent formatting and sending final response to user
function formatResponse(stockInfo) {
  return \`Google's stock price today is \${stockInfo.result}\`;
}

// In a web application context
app.post('/query/response', (req, res) => {
  const { queryId, result } = req.body;
  const formattedResponse = formatResponse(result);
  
  // Send back to user's interface
  res.json({
    response: formattedResponse,
    queryId: queryId
  });
});`,
      explanation: "Finally, the Host Agent takes the response from the Stock Info Agent, formats it appropriately for the user, and delivers the answer to the original question. The entire process has been handled through a combination of A2A and MCP protocols working together seamlessly."
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isPlaying && currentStep < steps.length) {
      timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStep]);
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep, steps.length]);

  const resetDemo = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsPlaying(false);
  };

  const goToStep = (stepIndex: number) => {
    setIsPlaying(false);
    setCurrentStep(stepIndex);
    setCompletedSteps(prev => {
      const newCompleted = [...prev];
      for (let i = 0; i < stepIndex; i++) {
        if (!newCompleted.includes(i)) {
          newCompleted.push(i);
        }
      }
      return newCompleted;
    });
  };
  
  const getEntityColor = (entity: string) => {
    switch (entity) {
      case 'User': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Host Agent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Stock Info Agent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'MCP Stock Price Server': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getProtocolBadge = (protocol: 'A2A' | 'MCP') => {
    return (
      <Badge variant={protocol === 'A2A' ? 'default' : 'secondary'} className="ml-2">
        {protocol}
      </Badge>
    );
  };

  const getStepIcon = (step: Step) => {
    if (step.from === 'User' || step.to === 'User') {
      return <User size={20} />;
    } else if (step.protocolType === 'MCP') {
      return <Code size={20} />;
    } else {
      return <ChatCircleDots size={20} />;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Agent2Agent (A2A) Protocol Interactive Demo</CardTitle>
            <CardDescription>Visualizing the complete flow from user request to final answer</CardDescription>
          </div>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'visual' | 'code')}>
            <TabsList>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timeline Navigation */}
        <div className="relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
          <div className="flex justify-between relative">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="flex flex-col items-center cursor-pointer relative z-10"
                onClick={() => goToStep(index)}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === index 
                      ? 'bg-primary text-primary-foreground' 
                      : completedSteps.includes(index)
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {completedSteps.includes(index) ? (
                    <CheckCircle size={16} weight="fill" />
                  ) : (
                    (index + 1)
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground hidden md:block text-center">
                  <span className={currentStep === index ? 'text-primary font-medium' : ''}>
                    {step.title.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <TabsContent value="visual" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Visual Flow */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
                        <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
                      </div>
                      <Badge variant={steps[currentStep].protocolType === 'A2A' ? 'default' : 'secondary'}>
                        {steps[currentStep].protocolType} Protocol
                      </Badge>
                    </div>
                    
                    {/* Visual representation */}
                    <div className="h-64 border rounded-md bg-muted/20 relative flex items-center justify-center">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-8">
                        <div className={`p-4 rounded-lg ${getEntityColor(steps[currentStep].from)} border text-center`}>
                          <div className="font-semibold">{steps[currentStep].from}</div>
                        </div>
                        
                        <div className={`p-4 rounded-lg ${getEntityColor(steps[currentStep].to)} border text-center`}>
                          <div className="font-semibold">{steps[currentStep].to}</div>
                        </div>
                        
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute flex items-center justify-center w-full"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRight size={20} className="text-primary animate-pulse" />
                              <div className="bg-card border rounded-md p-3 shadow-sm max-w-md">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline" className={steps[currentStep].protocolType === 'A2A' ? 'bg-primary/10' : 'bg-secondary/10'}>
                                    {steps[currentStep].protocolType}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium">{steps[currentStep].content}</p>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => goToStep(Math.max(0, currentStep - 1))}
                          disabled={currentStep === 0 || isPlaying}
                        >
                          <CaretRight className="mr-1 rotate-180" size={16} />
                          Previous
                        </Button>
                        
                        {completedSteps.length === 0 ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                            onClick={() => setIsPlaying(true)}
                          >
                            <Play className="mr-2" size={16} />
                            START
                          </Button>
                        ) : (
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => setIsPlaying(!isPlaying)}
                            disabled={currentStep === steps.length - 1}
                          >
                            {isPlaying ? (
                              <>
                                <ArrowsClockwise className="mr-1 animate-spin" size={16} />
                                Playing...
                              </>
                            ) : (
                              <>
                                <Play className="mr-1" size={16} />
                                Play
                              </>
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => goToStep(Math.min(steps.length - 1, currentStep + 1))}
                          disabled={currentStep === steps.length - 1 || isPlaying}
                        >
                          Next
                          <CaretRight className="ml-1" size={16} />
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={resetDemo}
                      >
                        <ArrowsCounterClockwise className="mr-1" size={16} />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              {/* Step Details */}
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Step Explanation</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <ScrollArea className="h-[220px] pr-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <div className="mt-1">
                              <Info size={16} className="text-muted-foreground" />
                            </div>
                            <p className="text-sm">{steps[currentStep].explanation}</p>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex flex-col gap-1">
                            <h4 className="text-xs font-medium uppercase text-muted-foreground">Key Entities</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <div className={`px-2 py-0.5 rounded-md text-xs ${getEntityColor(steps[currentStep].from)}`}>
                                {steps[currentStep].from}
                              </div>
                              <ArrowRight size={14} className="text-muted-foreground" />
                              <div className={`px-2 py-0.5 rounded-md text-xs ${getEntityColor(steps[currentStep].to)}`}>
                                {steps[currentStep].to}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <h4 className="text-xs font-medium uppercase text-muted-foreground">Protocol</h4>
                            <div className="mt-1">
                              <Badge variant={steps[currentStep].protocolType === 'A2A' ? 'default' : 'secondary'}>
                                {steps[currentStep].protocolType === 'A2A' ? 'Agent2Agent (A2A)' : 'ModelContextProtocol (MCP)'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="pt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
                    <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
                  </div>
                  <Badge variant={steps[currentStep].protocolType === 'A2A' ? 'default' : 'secondary'}>
                    {steps[currentStep].protocolType} Protocol
                  </Badge>
                </div>
                
                <div className="bg-muted rounded-md p-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm overflow-x-auto font-mono"
                    >
                      <CodeBlock language="typescript">
                        {steps[currentStep].codeExample}
                      </CodeBlock>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => goToStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                    >
                      <CaretRight className="mr-1 rotate-180" size={16} />
                      Previous
                    </Button>
                    
                    {completedSteps.length === 0 ? (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                        onClick={() => {
                          setActiveTab('visual');
                          setTimeout(() => setIsPlaying(true), 100);
                        }}
                      >
                        <Play className="mr-2" size={16} />
                        START
                      </Button>
                    ) : null}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => goToStep(Math.min(steps.length - 1, currentStep + 1))}
                      disabled={currentStep === steps.length - 1}
                    >
                      Next
                      <CaretRight className="ml-1" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Explanation</CardTitle>
              </CardHeader>
              
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm">{steps[currentStep].explanation}</p>
                    </motion.div>
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </CardContent>
      
      <CardFooter className="border-t pt-6 flex justify-between">
        <div className="text-sm">
          <span className="font-medium">Current Protocol:</span> {steps[currentStep].protocolType === 'A2A' ? 'Agent2Agent (A2A)' : 'ModelContextProtocol (MCP)'}
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>A2A Protocol</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span>MCP Protocol</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Agent2AgentProtocolDemo;