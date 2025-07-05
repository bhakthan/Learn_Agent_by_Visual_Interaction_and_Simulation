import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import A2ADemo from "../interactive-demos/A2ADemo"
import MCPDemo from "../interactive-demos/MCPDemo"
import MCPVisualDemo from "../interactive-demos/MCPVisualDemo"
import SimpleACPDemo from "../interactive-demos/SimpleACPDemo"
import ACPMCPComparison from "../interactive-demos/ACPMCPComparison"
import Agent2AgentProtocolDemo from "../interactive-demos/Agent2AgentProtocolDemo"
import Agent2AgentProtocolExplainer from "./Agent2AgentProtocolExplainer"
import ConceptDetails from "./ConceptDetails"
import { BookOpen, BookmarkSimple, ArrowsHorizontal, Palette, MagicWand } from "@phosphor-icons/react"
import ReferenceSection from "../references/ReferenceSection"
import { TutorialButton } from "../tutorial/TutorialButton"
import { useTutorialContext } from "../tutorial/TutorialProvider"
import { conceptsExplorerTutorial } from "@/lib/tutorial"
import SimpleFlowDemo from "../visualization/SimpleFlowDemo"
import SimpleTransformDemo from "../visualization/SimpleTransformDemo"
import MCPArchitectureDiagram from "./MCPArchitectureDiagram"
import AgentLifecycleVisual from "./AgentLifecycleVisual"
import A2ACommunicationPatterns from "./A2ACommunicationPatterns"
import ACPProtocolStack from "./ACPProtocolStack"
import ProtocolComparison from "./ProtocolComparison"
import AgentCommunicationPlayground from "./AgentCommunicationPlayground"
import AgentPersonalityShowcase from "./AgentPersonalityShowcase"
import CodeToVisualMapper from "./CodeToVisualMapper"

const ConceptsExplorer = () => {
  const [showDetails, setShowDetails] = useState({
    agents: false,
    a2a: false,
    mcp: false,
    acp: false
  })

  const { startTutorial, registerTutorial, hasCompletedTutorial } = useTutorialContext();

  // Register the concepts tutorial
  useEffect(() => {
    registerTutorial(conceptsExplorerTutorial.id, conceptsExplorerTutorial);
  }, [registerTutorial]);

  const toggleDetails = (concept: 'agents' | 'a2a' | 'mcp' | 'acp') => {
    setShowDetails(prev => ({
      ...prev,
      [concept]: !prev[concept]
    }))
  }
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Core Concepts</h1>
        <TutorialButton
          hasCompleted={hasCompletedTutorial(conceptsExplorerTutorial.id)}
          onClick={() => startTutorial(conceptsExplorerTutorial.id)}
          tooltip="Learn about Core Concepts"
        />
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="a2a">Agent-to-Agent (A2A)</TabsTrigger>
          <TabsTrigger value="mcp">ModelContextProtocol (MCP)</TabsTrigger>
          <TabsTrigger value="acp">ACP</TabsTrigger>
          <TabsTrigger value="visualization">Flow Visualization</TabsTrigger>
          <TabsTrigger value="transformation">Data Transformation</TabsTrigger>
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
              <Button variant="outline" onClick={() => toggleDetails('agents')}>Learn More</Button>
              <Button onClick={() => toggleDetails('agents')} className="flex items-center gap-2">
                <BookOpen size={18} />
                {showDetails.agents ? 'Hide Details' : 'Show Detailed Content'}
              </Button>
            </CardFooter>
          </Card>
          
          {showDetails.agents && <ConceptDetails conceptId="agents" />}
          
          {/* References section for Agents */}
          <ReferenceSection type="concept" itemId="agents" />

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
          
          {/* Agent Lifecycle Visualization */}
          <AgentLifecycleVisual autoPlay={false} />
          
          {/* Agent Personality Showcase */}
          <AgentPersonalityShowcase />
          
          {/* Code-to-Visual Pattern Mapper */}
          <CodeToVisualMapper />
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
          
          {/* References section for A2A */}
          <ReferenceSection type="concept" itemId="a2a" />
          
          {/* A2A Communication Patterns */}
          <A2ACommunicationPatterns />
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Agent2Agent (A2A) Protocol In-Depth</h2>
          <p className="text-muted-foreground mb-6">
            Comprehensive understanding of how A2A protocol enables agent communication and collaboration.
          </p>
          
          <Agent2AgentProtocolExplainer />
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Interactive A2A Protocol Visualization</h2>
          <p className="text-muted-foreground mb-6">
            Step through the complete flow from user query to final answer, exploring how A2A and MCP protocols work together.
          </p>
          
          <Agent2AgentProtocolDemo />
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Agent Collaboration Demo</h2>
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
                  pass control, and maintain conversational or task state across interactions.
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
                      <h5 className="font-medium text-accent">Interoperability</h5>
                      <p className="text-sm">Agents from different systems can communicate using common standards</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-accent">Context Preservation</h5>
                      <p className="text-sm">Maintaining conversation history and state across agent interactions</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-accent">Scalability</h5>
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
          
          {/* References section for MCP */}
          <ReferenceSection type="concept" itemId="mcp" />
          
          {/* MCP Architecture Diagram */}
          <MCPArchitectureDiagram />
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Interactive MCP Demonstrations</h2>
          <p className="text-muted-foreground mb-6">
            See how the ModelContextProtocol enables structured communication between agents with context preservation.
          </p>
          
          <MCPVisualDemo />
          
          {/* Interactive Agent Communication Playground */}
          <AgentCommunicationPlayground />
          
          <h3 className="text-xl font-semibold tracking-tight mb-4 mt-8">Message Exchange Demo</h3>
          <p className="text-muted-foreground mb-6">
            Explore how MCP metadata and context tracking works in a conversational agent scenario.
          </p>
          
          <MCPDemo />
        </TabsContent>

        <TabsContent value="acp" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Communication Protocol (ACP)</CardTitle>
              <CardDescription>Open standard for agent interoperability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The Agent Communication Protocol (ACP) is an open protocol for agent interoperability that solves
                  the growing challenge of connecting AI agents, applications, and humans. It enables agents built
                  across different frameworks, teams, and infrastructures to communicate effectively.
                </p>
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-semibold">Key ACP Features:</h4>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Standardized RESTful API for agent communication</li>
                    <li>Support for all forms of modality (text, images, audio, etc.)</li>
                    <li>Both synchronous and asynchronous communication patterns</li>
                    <li>Streaming interactions for real-time responses</li>
                    <li>Stateful and stateless operation models</li>
                    <li>Online and offline agent discovery mechanisms</li>
                    <li>Long-running task support with state persistence</li>
                  </ul>
                </div>
                <div className="py-4">
                  <h4 className="font-semibold mb-2">ACP Deployment Patterns:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-primary">Single-Agent Pattern</h5>
                      <p className="text-sm">Simple client-server deployment connecting directly to a single agent via REST</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-primary">Multi-Agent Server</h5>
                      <p className="text-sm">Server hosts multiple agents with shared infrastructure and centralized routing</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toggleDetails('acp')} className="flex items-center gap-2">
                <BookOpen size={18} />
                {showDetails.acp ? 'Hide Details' : 'Show Detailed Content'}
              </Button>
            </CardFooter>
          </Card>
          
          {showDetails.acp && <ConceptDetails conceptId="acp" />}
          
          {/* References section for ACP */}
          <ReferenceSection type="concept" itemId="acp" />
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Interactive ACP Demonstration</h2>
          <p className="text-muted-foreground mb-6">
            Explore how the Agent Communication Protocol enables standardized communication between clients and agents.
          </p>
          
          <SimpleACPDemo />
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            <div className="flex items-center gap-2">
              <ArrowsHorizontal size={24} className="text-primary" />
              ACP and MCP Protocol Comparison
            </div>
          </h2>
          <p className="text-muted-foreground mb-6">
            Compare the Agent Communication Protocol (ACP) with ModelContextProtocol (MCP) to understand their 
            differences, similarities, and how they can work together in agent communication architectures.
          </p>
          
          <ACPMCPComparison />
        </TabsContent>
        
        <TabsContent value="visualization" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette size={24} className="text-primary" />
                Customizable Flow Visualization
              </CardTitle>
              <CardDescription>
                Customize and experiment with data flow visualization between agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Flow visualization helps understand the communication patterns between agents, tools, and other components.
                This interactive demo allows you to customize colors for different message types and see how data flows
                through the agent system in real-time.
              </p>
            </CardContent>
          </Card>
          
          <SimpleFlowDemo />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Understanding Flow Types</CardTitle>
              <CardDescription>Different types of communication in agent systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Information Flow Types</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400">•</span> 
                      <div>
                        <span className="font-medium">Query:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Requests for information or action from user or agent</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 dark:text-green-400">•</span> 
                      <div>
                        <span className="font-medium">Response:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Information returned after processing a query</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 dark:text-amber-400">•</span> 
                      <div>
                        <span className="font-medium">Tool Call:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Requests to external tools or APIs</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 dark:text-purple-400">•</span> 
                      <div>
                        <span className="font-medium">Observation:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Data collected from environment or tools</span>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Cognitive Flow Types</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 dark:text-pink-400">•</span> 
                      <div>
                        <span className="font-medium">Reflection:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Agent's internal analysis and self-critique</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 dark:text-emerald-400">•</span> 
                      <div>
                        <span className="font-medium">Plan:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Strategic steps created by the agent</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 dark:text-yellow-400">•</span> 
                      <div>
                        <span className="font-medium">Data:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Raw information passed between components</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 dark:text-red-400">•</span> 
                      <div>
                        <span className="font-medium">Error:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Problems or exceptions during processing</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transformation" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MagicWand size={24} className="text-primary" weight="fill" />
                Data Transformation Between Agents
              </CardTitle>
              <CardDescription>
                Visualize how data is transformed as it flows between different agents and components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                As data moves between agents in a multi-agent system, it undergoes various transformations based on
                the agent's role, capabilities, and the communication protocol. This interactive visualization 
                demonstrates these transformations across different agent interaction patterns.
              </p>
            </CardContent>
          </Card>
          
          <SimpleTransformDemo />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Data Transformation Types</CardTitle>
              <CardDescription>Common transformations that occur between agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Input Transformations</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400">•</span> 
                      <div>
                        <span className="font-medium">Query Parsing:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Converting natural language to structured intent</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 dark:text-green-400">•</span> 
                      <div>
                        <span className="font-medium">Protocol Formatting:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Wrapping data in protocol-specific structures</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 dark:text-amber-400">•</span> 
                      <div>
                        <span className="font-medium">Task Decomposition:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Breaking complex requests into subtasks</span>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Output Transformations</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 dark:text-pink-400">•</span> 
                      <div>
                        <span className="font-medium">Result Synthesis:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Combining outputs from multiple sources</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 dark:text-emerald-400">•</span> 
                      <div>
                        <span className="font-medium">Format Conversion:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Changing data structure (JSON to text, etc.)</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 dark:text-yellow-400">•</span> 
                      <div>
                        <span className="font-medium">Summarization:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Condensing complex data into key points</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 dark:text-purple-400">•</span> 
                      <div>
                        <span className="font-medium">Enhancement:</span> 
                        <span className="text-sm text-muted-foreground ml-2">Adding context, examples, or visualizations</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 bg-muted p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Key Benefits of Data Transformation Visualization</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span> 
                    <span>Improved understanding of how agents process and modify information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span> 
                    <span>Debugging tool to identify where transformations may cause information loss</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span> 
                    <span>Design aid for planning complex agent interactions and workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span> 
                    <span>Educational resource for understanding multi-agent systems</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ConceptsExplorer