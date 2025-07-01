import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, PuzzlePiece, Wrench, Gear, BracketsCurly, Code } from "@phosphor-icons/react";

const Agent2AgentProtocolExplainer = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>A Beginner's Guide to Agent2Agent (A2A) Protocol</CardTitle>
          <CardDescription>Understanding how AI agents communicate and collaborate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <p>
              The Agent2Agent (A2A) Protocol is a framework that enables different AI agents to communicate, delegate tasks, 
              and collaborate, even when built by different teams with different technologies. It solves the critical challenge 
              of agent interoperability.
            </p>

            <p>
              Think of A2A as the standardized language and rules that allow agents to work together effectively - 
              similar to how HTTP enables different websites to communicate across the internet.
            </p>
          </div>
          
          <Separator />
          
          <Tabs defaultValue="core-principles">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="core-principles">Core Principles</TabsTrigger>
              <TabsTrigger value="building-blocks">Building Blocks</TabsTrigger>
              <TabsTrigger value="a2a-vs-mcp">A2A vs MCP</TabsTrigger>
              <TabsTrigger value="workflow">Complete Workflow</TabsTrigger>
            </TabsList>
            
            <TabsContent value="core-principles" className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold mb-3">The Five Core Principles of A2A</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-primary">
                        <Wrench size={18} weight="duotone" />
                      </div>
                      <CardTitle className="text-base">Simple</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm">
                    <p>
                      Built on familiar web standards like HTTP, making it easy for developers to implement without 
                      learning entirely new technologies. This reduces the barrier to entry for creating interoperable agents.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-primary">
                        <Gear size={18} weight="duotone" />
                      </div>
                      <CardTitle className="text-base">Enterprise Ready</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm">
                    <p>
                      Includes built-in solutions for security, privacy, and audit logging. A2A addresses real-world 
                      business requirements from the start rather than treating them as afterthoughts.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-primary">
                        <ArrowRight size={18} weight="duotone" />
                      </div>
                      <CardTitle className="text-base">Async First</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm">
                    <p>
                      Designed for asynchronous communication where agents can submit tasks without waiting for 
                      immediate responses. This is ideal for long-running jobs or workflows requiring human approval.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-primary">
                        <BracketsCurly size={18} weight="duotone" />
                      </div>
                      <CardTitle className="text-base">Modality Agnostic</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm">
                    <p>
                      Supports various communication formats beyond text, including interactive forms, 
                      audio streams, and embedded content. Agents can use the best format for each specific task.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="py-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-primary">
                        <PuzzlePiece size={18} weight="duotone" />
                      </div>
                      <CardTitle className="text-base">Opaque Execution</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm">
                    <p>
                      A critical concept where an agent using another agent's services doesn't need to know <em>how</em> it works 
                      internally - only <em>what</em> it can do and how to ask. This preserves each agent's autonomy and privacy, 
                      keeping internal logic protected while enabling collaboration.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="building-blocks" className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold mb-3">Core Building Blocks of A2A</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">The Agent Card</CardTitle>
                    <CardDescription>An agent's digital business card</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      The Agent Card is a standardized metadata file (usually JSON) that an agent publishes to advertise its capabilities.
                      It tells other agents who it is, what it does, and how to contact it.
                    </p>
                    
                    <div className="bg-muted rounded-md p-4">
                      <p className="text-xs mb-2 font-medium">Example Agent Card:</p>
                      <pre className="text-xs overflow-x-auto">
{`{
  "name": "StockInfoAgent",
  "description": "Provides current stock price information.",
  "url": "http://stock-info.example.com/a2a",
  "provider": { "organization": "ABCorp" },
  "version": "1.0.0",
  "skills": [
    {
      "id": "get_stock_price_skill",
      "name": "Get Stock Price",
      "description": "Retrieves current stock price for a company"
    }
  ]
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">A2A Workflow Components</CardTitle>
                    <CardDescription>Tasks, Messages, and Artifacts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-md p-4 bg-muted/20">
                        <h4 className="font-medium mb-2">Tasks</h4>
                        <p className="text-sm">
                          The fundamental unit of work. A client agent initiates a <strong>task</strong> when it wants 
                          another agent to do something. Each task has a unique ID and is stateful, meaning you can 
                          check its status (working, completed, failed) over time.
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-4 bg-muted/20">
                        <h4 className="font-medium mb-2">Messages</h4>
                        <p className="text-sm">
                          Within a task, agents communicate using <strong>messages</strong>. These can be instructions, 
                          status updates, or requests for more information. This ongoing dialogue enables complex, 
                          back-and-forth collaboration.
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-4 bg-muted/20">
                        <h4 className="font-medium mb-2">Artifacts</h4>
                        <p className="text-sm">
                          When a task is finished, the final, unchangeable result is delivered as an <strong>artifact</strong>. 
                          This could be a piece of text, a file, or structured data.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="a2a-vs-mcp" className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold mb-3">Understanding A2A vs. MCP</h3>
              
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary">A2A Protocol</Badge>
                        <span className="text-sm font-medium">Agent-to-Agent Communication</span>
                      </div>
                      
                      <div className="p-4 rounded-md bg-primary/5 border border-primary/10 text-sm">
                        <p>
                          <strong>Purpose:</strong> Enables collaboration between autonomous agents.
                        </p>
                        <p className="mt-2">
                          <strong>Analogy:</strong> Like a manager delegating a complex project to a team member.
                          The communication is about the goal and the progress.
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Focuses on agent discovery and collaboration</li>
                          <li>Handles task delegation and status tracking</li>
                          <li>Provides a framework for agent coordination</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-secondary/20 text-secondary">MCP Protocol</Badge>
                        <span className="text-sm font-medium">Model-Tool Interaction</span>
                      </div>
                      
                      <div className="p-4 rounded-md bg-secondary/5 border border-secondary/10 text-sm">
                        <p>
                          <strong>Purpose:</strong> Standardizes how an agent uses a specific tool or function.
                        </p>
                        <p className="mt-2">
                          <strong>Analogy:</strong> Like a mechanic using a standardized wrench to turn a bolt.
                          The interaction is a direct, predictable function call.
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Defines function calling formats</li>
                          <li>Standardizes tool interfaces</li>
                          <li>Creates consistency across model providers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-md bg-muted border">
                    <h4 className="font-medium mb-2">Complementary Protocols</h4>
                    <p className="text-sm">
                      A2A and MCP are not competitors; they are complementary. An agent might use A2A to coordinate 
                      with another agent, and then that second agent might use MCP to call a specific tool it needs 
                      to complete its task.
                    </p>
                    
                    <div className="flex items-center gap-2 mt-4 text-sm">
                      <Code size={16} className="text-primary" />
                      <p className="font-medium">Example: A2A delegates to agent, agent uses MCP to call tool</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="workflow" className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold mb-3">Complete A2A Workflow Example</h3>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <p className="text-sm">
                      Let's see how A2A and MCP work together in a real-world scenario when a user asks:
                      <span className="block mt-1 px-3 py-1 bg-muted rounded-md font-medium">
                        "What's Google's stock price right now?"
                      </span>
                    </p>
                    
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        <div className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">Step 1</Badge>
                            <h4 className="font-medium">User Query to Host Agent</h4>
                          </div>
                          <p className="text-sm mb-2">
                            The user asks their personal Host Agent for Google's current stock price.
                          </p>
                          <div className="flex gap-2 text-sm">
                            <div className="font-medium">User:</div>
                            <div>What's Google's stock price today?</div>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">Step 2</Badge>
                            <h4 className="font-medium">Host Agent Analysis</h4>
                          </div>
                          <p className="text-sm mb-2">
                            The Host Agent analyzes the query and realizes it doesn't have direct access to stock data.
                            It needs to delegate this task to a specialized agent.
                          </p>
                          <div className="flex gap-2 text-sm">
                            <div className="font-medium">Host Agent:</div>
                            <div>Hold on a sec, I know someone who can help with stock information...</div>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-primary/20 text-primary">Step 3: A2A</Badge>
                            <h4 className="font-medium">A2A Delegation to Specialist</h4>
                          </div>
                          <p className="text-sm mb-2">
                            The Host Agent consults its agent registry and delegates the task to a specialized Stock Info Agent using the A2A protocol.
                          </p>
                          <div className="flex gap-2 text-sm">
                            <div className="font-medium">Host Agent:</div>
                            <div className="flex items-center gap-1">
                              <ArrowRight size={16} />
                              <div>Stock Info Agent: "Please get Google's current stock price!"</div>
                            </div>
                          </div>
                          <div className="bg-muted p-2 rounded-md mt-2 text-xs">
                            <pre className="whitespace-pre-wrap">
{`// A2A Task Creation
{
  "taskId": "task-123456",
  "instruction": "Get current stock price for ticker GOOGL",
  "options": {
    "priority": "normal",
    "timeout": 30
  }
}`}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">Step 4</Badge>
                            <h4 className="font-medium">Stock Agent Analysis</h4>
                          </div>
                          <p className="text-sm mb-2">
                            The Stock Info Agent receives the task and determines it needs to call an external service
                            to get the current stock price.
                          </p>
                          <div className="flex gap-2 text-sm">
                            <div className="font-medium">Stock Info Agent:</div>
                            <div>Hold on a sec, I know a place to get this information...</div>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-secondary/20 text-secondary">Step 5: MCP</Badge>
                            <h4 className="font-medium">MCP Tool Call</h4>
                          </div>
                          <p className="text-sm mb-2">
                            The Stock Info Agent uses the ModelContextProtocol (MCP) to make a direct function call to a stock price tool.
                          </p>
                          <div className="flex gap-2 text-sm">
                            <div className="font-medium">Stock Info Agent:</div>
                            <div className="flex items-center gap-1">
                              <ArrowRight size={16} />
                              <div>MCP Stock Price Server: Function_call: "get_stock_price", args: {"{'symbol': 'GOOGL'}"}</div>
                            </div>
                          </div>
                          <div className="bg-muted p-2 rounded-md mt-2 text-xs">
                            <pre className="whitespace-pre-wrap">
{`// MCP Function Call
{
  "function": "get_stock_price",
  "parameters": {
    "symbol": "GOOGL"
  }
}`}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-secondary/20 text-secondary">Step 6: MCP</Badge>
                            <h4 className="font-medium">MCP Data Return</h4>
                          </div>
                          <p className="text-sm mb-2">
                            The MCP server fetches the price and returns structured data to the Stock Info Agent.
                          </p>
                          <div className="flex gap-2 text-sm">
                            <div className="font-medium">MCP Server:</div>
                            <div className="flex items-center gap-1">
                              <ArrowRight size={16} />
                              <div>Stock Info Agent: Response: {"{'price': '174.92', 'currency': 'USD'}"}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-primary/20 text-primary">Step 7: A2A</Badge>
                            <h4 className="font-medium">A2A Response to Host</h4>
                          </div>
                          <p className="text-sm mb-2">
                            The Stock Info Agent marks the A2A task as complete and returns the result to the Host Agent.
                          </p>
                          <div className="flex gap-2 text-sm">
                            <div className="font-medium">Stock Info Agent:</div>
                            <div className="flex items-center gap-1">
                              <ArrowRight size={16} />
                              <div>Host Agent: "Google stock is 174.92 USD"</div>
                            </div>
                          </div>
                          <div className="bg-muted p-2 rounded-md mt-2 text-xs">
                            <pre className="whitespace-pre-wrap">
{`// A2A Task Completion
{
  "taskId": "task-123456",
  "status": "completed",
  "result": "Google stock is 174.92 USD",
  "metadata": {
    "dataSource": "financial_api",
    "timestamp": "2023-06-15T14:32:45Z"
  }
}`}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">Step 8</Badge>
                            <h4 className="font-medium">Host Response to User</h4>
                          </div>
                          <p className="text-sm mb-2">
                            The Host Agent receives the A2A artifact and presents the information to the user.
                          </p>
                          <div className="flex gap-2 text-sm">
                            <div className="font-medium">Host Agent:</div>
                            <div className="flex items-center gap-1">
                              <ArrowRight size={16} />
                              <div>User: "Google's stock price today is 174.92 USD"</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                    
                    <div className="p-4 border border-dashed border-primary/30 rounded-md bg-primary/5">
                      <h4 className="font-medium mb-2">Key Takeaways</h4>
                      <ul className="text-sm space-y-1">
                        <li>A2A handled the high-level agent coordination and task delegation</li>
                        <li>MCP handled the specific function call to get the stock data</li>
                        <li>Both protocols worked together to solve the user's request</li>
                        <li>Each agent maintained its autonomy while collaborating effectively</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agent2AgentProtocolExplainer;