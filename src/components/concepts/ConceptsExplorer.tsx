import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import A2ADemo from "../interactive-demos/A2ADemo"
import MCPDemo from "../interactive-demos/MCPDemo"
import ConceptDetails from "./ConceptDetails"
import { BookOpen } from "@phosphor-icons/react"

const ConceptsExplorer = () => {
  const [showDetails, setShowDetails] = useState({
    agents: false,
    a2a: false,
    mcp: false
  })

  const toggleDetails = (concept: 'agents' | 'a2a' | 'mcp') => {
    setShowDetails(prev => ({
      ...prev,
      [concept]: !prev[concept]
    }))
  }
  return (
    <div className="space-y-8">
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="a2a">Agent-to-Agent (A2A)</TabsTrigger>
          <TabsTrigger value="mcp">ModelContextProtocol (MCP)</TabsTrigger>
        </TabsList>
        <TabsContent value="agents" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>What are Azure AI Agents?</CardTitle>
              <CardDescription>Understanding the core concepts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Azure AI Agents are autonomous software entities built on Large Language Models (LLMs) that can perform tasks, 
                  make decisions, and interact with their environment without constant human supervision. They represent an evolution 
                  in AI capabilities, moving beyond passive response systems to active problem-solvers.
                </p>
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-semibold">Key Characteristics:</h4>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Autonomous decision-making based on goals and context</li>
                    <li>Ability to break down complex tasks into manageable steps</li>
                    <li>Tool usage to interact with external systems and data</li>
                    <li>Learning and adaptation based on feedback</li>
                    <li>Safety mechanisms and guardrails for responsible operation</li>
                  </ul>
                </div>
                <div className="py-4">
                  <h4 className="font-semibold mb-2">Architecture Components:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-primary">Foundation Models</h5>
                      <p className="text-sm">The underlying LLMs that provide reasoning, natural language understanding, and generation capabilities</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-primary">Planning System</h5>
                      <p className="text-sm">Components that break down goals into steps and adapt based on new information</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-primary">Tool Integration</h5>
                      <p className="text-sm">APIs and interfaces that allow agents to interact with external systems</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Learn More</Button>
              <Button onClick={() => toggleDetails('agents')} className="flex items-center gap-2">
                <BookOpen size={18} />
                {showDetails.agents ? 'Hide Details' : 'Show Detailed Content'}
              </Button>
            </CardFooter>
          </Card>
          
          {showDetails.agents && <ConceptDetails conceptId="agents" />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Capabilities</CardTitle>
                <CardDescription>What Azure AI Agents can do</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span> 
                    <span>Task decomposition and planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span> 
                    <span>Reasoning with memory and context tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span> 
                    <span>Multi-step decision making and problem solving</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span> 
                    <span>Tool use and API integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span> 
                    <span>Communication with humans and other agents</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Implementation Approaches</CardTitle>
                <CardDescription>Common ways to build Azure AI Agents</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span> 
                    <span>Function-calling with structured outputs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span> 
                    <span>ReAct (Reasoning and Acting) framework</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span> 
                    <span>Tool-augmented agents with API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span> 
                    <span>Agentic workflows with multiple specialized agents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span> 
                    <span>Azure AI SDK integration patterns</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="a2a" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent-to-Agent (A2A) Communication</CardTitle>
              <CardDescription>How agents collaborate and communicate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Agent-to-Agent (A2A) communication enables different AI agents to collaborate, share information, 
                  delegate tasks, and coordinate actions. This creates multi-agent systems capable of handling 
                  complex workflows and simulating specialized roles.
                </p>
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-semibold">A2A Communication Patterns:</h4>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Direct message passing with structured data formats</li>
                    <li>Centralized coordination through orchestrator agents</li>
                    <li>Event-based communication triggered by state changes</li>
                    <li>Shared memory and knowledge repositories</li>
                    <li>Protocol-based interaction frameworks (like MCP)</li>
                  </ul>
                </div>
                <div className="py-4">
                  <h4 className="font-semibold mb-2">A2A Interaction Models:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-accent">Hierarchical</h5>
                      <p className="text-sm">Manager-worker relationships where top-level agents delegate to specialized sub-agents</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-accent">Peer-to-Peer</h5>
                      <p className="text-sm">Equal-status agents that communicate directly to share information and coordinate</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-accent">Multi-Agent Debate</h5>
                      <p className="text-sm">Multiple agents discussing and refining solutions through structured dialogue</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-accent">Market-based</h5>
                      <p className="text-sm">Agents bidding for tasks based on capabilities and availability</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toggleDetails('a2a')} className="flex items-center gap-2">
                <BookOpen size={18} />
                {showDetails.a2a ? 'Hide Details' : 'Show Detailed Content'}
              </Button>
            </CardFooter>
          </Card>
          
          {showDetails.a2a && <ConceptDetails conceptId="a2a" />}
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Interactive A2A Demonstration</h2>
          <p className="text-muted-foreground mb-6">
            See how multiple specialized agents work together to complete complex tasks through structured communication.
          </p>
          
          <A2ADemo />
        </TabsContent>

        <TabsContent value="mcp" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>ModelContextProtocol (MCP)</CardTitle>
              <CardDescription>Standardized agent communication framework</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  ModelContextProtocol (MCP) is a framework for standardizing how AI agents communicate, 
                  maintain context, and collaborate. It provides structure for how agents share information, 
                  pass control, and maintain conversational or task state.
                </p>
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-semibold">Key MCP Components:</h4>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Message formats for agent-to-agent communication</li>
                    <li>Context management for maintaining conversation state</li>
                    <li>Control flow mechanisms for task delegation and handoff</li>
                    <li>Metadata standards for tracking message origins and purpose</li>
                    <li>Error handling and recovery procedures</li>
                  </ul>
                </div>
                <div className="py-4">
                  <h4 className="font-semibold mb-2">MCP Benefits:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-secondary">Interoperability</h5>
                      <p className="text-sm">Agents from different systems can communicate using common standards</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-secondary">Context Preservation</h5>
                      <p className="text-sm">Maintaining conversation history and state across agent interactions</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-secondary">Scalability</h5>
                      <p className="text-sm">Easier integration of new agents into existing systems</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toggleDetails('mcp')} className="flex items-center gap-2">
                <BookOpen size={18} />
                {showDetails.mcp ? 'Hide Details' : 'Show Detailed Content'}
              </Button>
            </CardFooter>
          </Card>
          
          {showDetails.mcp && <ConceptDetails conceptId="mcp" />}
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Interactive MCP Demonstration</h2>
          <p className="text-muted-foreground mb-6">
            See how the ModelContextProtocol enables structured communication between agents with context preservation.
          </p>
          
          <MCPDemo />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ConceptsExplorer