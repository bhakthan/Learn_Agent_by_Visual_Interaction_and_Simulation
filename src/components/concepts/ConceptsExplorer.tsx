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
import { EnhancedTutorialButton, pagesSynopsis } from "../tutorial/EnhancedTutorialButton"
import { FloatingContextualHelp, useFloatingContextualHelp } from "../tutorial/FloatingContextualHelp"
import SmartPageAnalytics from "../tutorial/SmartPageAnalytics"
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
import MCPxA2AIntegrationFlow from "../visualization/MCPxA2AIntegrationFlow"
import EnlightenMeButton from "./EnlightenMeButton"

const ConceptsExplorer = () => {
  const [showDetails, setShowDetails] = useState({
    agents: false,
    a2a: false,
    mcp: false,
    acp: false
  })

  const { startTutorial, registerTutorial, hasCompletedTutorial } = useTutorialContext();
  const { isVisible, hideHelp, showHelp, toggleHelp } = useFloatingContextualHelp('core-concepts', 15000);

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
        <EnhancedTutorialButton
          hasCompleted={hasCompletedTutorial(conceptsExplorerTutorial.id)}
          onClick={() => startTutorial(conceptsExplorerTutorial.id)}
          tooltip="Learn about Core Concepts"
          pageSynopsis={pagesSynopsis['core-concepts']}
          showDetailedView={true}
        />
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="a2a">Agent-to-Agent (A2A)</TabsTrigger>
          <TabsTrigger value="mcp">ModelContextProtocol (MCP)</TabsTrigger>
          <TabsTrigger value="acp">ACP</TabsTrigger>
          <TabsTrigger value="mcpxa2a">MCP×A2A Integration</TabsTrigger>
          <TabsTrigger value="visualization">Flow Visualization</TabsTrigger>
          <TabsTrigger value="transformation">Data Transformation</TabsTrigger>
        </TabsList>
        <TabsContent value="agents" className="space-y-6 pt-6" data-section="agents-lifecycle">
          <Card className="relative">
            <EnlightenMeButton 
              title="Azure AI Agents" 
              conceptId="agents"
              description="Autonomous software entities built on Large Language Models (LLMs) that can perform tasks without constant human supervision"
              customPrompt="Explain Azure AI Agents in comprehensive detail, focusing on Microsoft's Azure AI Agent Service and Azure OpenAI integration. Cover: 1) What Azure AI Agents are and how they leverage Azure's ecosystem (Azure OpenAI, Azure AI Studio, Azure Functions), 2) Key architectural components including Azure AI Agent Service runtime, conversation management, and Azure-specific tool integrations, 3) Practical implementation using Azure AI SDK, Azure OpenAI API, and Azure AI Agent Service REST APIs, 4) Real-world examples like customer service agents using Azure Cognitive Services, research assistants with Azure AI Search integration, and workflow automation agents with Azure Logic Apps, 5) Best practices for deployment on Azure Container Apps, security with Azure Active Directory, and monitoring with Azure Application Insights, 6) How they differ from traditional chatbots by providing autonomous reasoning, multi-step planning, and persistent memory through Azure Cosmos DB or Azure SQL."
            />
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

        <TabsContent value="a2a" className="space-y-6 pt-6" data-section="a2a-communication">
          <Card className="relative">
            <EnlightenMeButton 
              title="Agent-to-Agent (A2A) Communication" 
              conceptId="a2a"
              customPrompt="Explain Agent-to-Agent (A2A) communication with specific focus on Google's A2A SDK and implementation frameworks. Cover: 1) Detailed overview of Google's Agent-to-Agent SDK, its architecture, and how it enables agent collaboration in Google Cloud environments, 2) A2A communication patterns including Google's agent card system for agent discovery and capability advertising, 3) Implementation details using Google A2A SDK APIs, agent registration, and message routing mechanisms, 4) Comparison with other agent communication frameworks like Microsoft's Multi-Agent Conversation framework in Azure AI, 5) Practical examples including Google Assistant agent delegation, Google Workspace automation agents, and Google Cloud AI agent orchestration, 6) Protocol standards including Google's agent communication protocols, message serialization formats, and error handling strategies, 7) Best practices for implementing A2A systems using Google Cloud Run, Google Kubernetes Engine, and integration with Google AI Platform, 8) Security considerations including Google Cloud IAM for agent authentication and authorization between agents."
            />
            <CardHeader>
              <CardTitle>Agent-to-Agent (A2A) Communication</CardTitle>
              <CardDescription>How agents collaborate and communicate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Agent-to-Agent (A2A) communication enables different AI agents to collaborate, share information, 
                  delegate tasks, and coordinate actions. This creates multi-agent systems capable of handling 
                  complex workflows and simulating specialized roles through standardized protocols.
                </p>
                
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 rounded-md border border-emerald-200 dark:border-emerald-800 mb-4">
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">🎯 Multi-Agent Systems (MAS) Advantages</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h5 className="font-medium text-emerald-800 dark:text-emerald-200 text-sm">Core Benefits</h5>
                      <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                        <li>• <strong>Distributed problem solving:</strong> Complex tasks split across specialized agents</li>
                        <li>• <strong>Scalability:</strong> Add agents dynamically based on workload</li>
                        <li>• <strong>Robustness:</strong> System continues if individual agents fail</li>
                        <li>• <strong>Diverse perspectives:</strong> Different agent personalities and capabilities</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-emerald-800 dark:text-emerald-200 text-sm">Enterprise Value</h5>
                      <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                        <li>• <strong>Specialization:</strong> Agents focused on specific domains</li>
                        <li>• <strong>Parallel processing:</strong> Multiple agents work simultaneously</li>
                        <li>• <strong>Resource optimization:</strong> Efficient task distribution</li>
                        <li>• <strong>Maintainability:</strong> Modular, composable architecture</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🚀 MCP×A2A Integration Framework</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    The cutting-edge MCP×A2A framework combines Model Context Protocol for agent-to-tool communication 
                    with A2A protocol for agent-to-agent coordination, creating a layered architecture for autonomous LLM-based agents.
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-semibold">Need for Standard Protocols:</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Collaboration among heterogeneous agents demands standardized communication protocols. 
                    Integration with external tools and APIs is essential for real-world applications.
                  </p>
                  <h4 className="font-semibold">Core A2A Communication Patterns:</h4>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li><strong>Agent Cards:</strong> JSON metadata defining agent capabilities, functions, and authentication requirements</li>
                    <li><strong>Task Management:</strong> Structured task creation, delegation, and lifecycle tracking with unique IDs</li>
                    <li><strong>Message Validation:</strong> Standardized request/response formats with error handling and recovery</li>
                    <li><strong>State Coordination:</strong> Distributed state management across multi-agent workflows</li>
                    <li><strong>Security Layer:</strong> OAuth2, JWT tokens, and TLS encryption for secure agent communication</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-md p-3">
                    <h5 className="font-medium text-accent flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Complementary to MCP
                    </h5>
                    <p className="text-sm">A2A handles agent↔agent communication while MCP manages agent↔tool interactions</p>
                  </div>
                  <div className="border border-border rounded-md p-3">
                    <h5 className="font-medium text-accent flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Enterprise Ready
                    </h5>
                    <p className="text-sm">Built-in security, scalability, and monitoring for production deployments</p>
                  </div>
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

        <TabsContent value="mcp" className="space-y-6 pt-6" data-section="mcp-protocol">
          <Card className="relative">
            <EnlightenMeButton 
              title="ModelContextProtocol (MCP)" 
              conceptId="mcp"
              customPrompt="Explain the ModelContextProtocol (MCP) with comprehensive detail on Anthropic's implementation and design philosophy. Cover: 1) Anthropic's MCP specification and how it addresses the challenges of connecting AI assistants (like Claude) with external data sources and tools, 2) Detailed architecture including MCP servers, MCP clients, and the JSON-RPC based communication protocol that Anthropic designed, 3) Anthropic's official MCP SDK implementations (Python, TypeScript) and how to build MCP servers using their frameworks, 4) Specific examples of Anthropic-endorsed MCP servers like their file system server, SQLite server, and web search server implementations, 5) How MCP enables Claude to access live data through standardized interfaces while maintaining security and context isolation, 6) Implementation patterns including Anthropic's recommendations for server discovery, capability advertisement, and resource management, 7) Integration with Anthropic Claude API and how MCP extends Claude's capabilities beyond its training data cutoff, 8) Best practices from Anthropic's documentation for building production MCP servers, error handling, and debugging MCP connections, 9) Comparison with other tool-calling approaches and why Anthropic chose this specific architecture for external tool integration."
            />
            <CardHeader>
              <CardTitle>ModelContextProtocol (MCP)</CardTitle>
              <CardDescription>Standardized agent communication framework</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  ModelContextProtocol (MCP) is a framework for standardizing how AI agents communicate with external tools and data sources, 
                  enabling seamless integration between LLM-based agents and specialized services. MCP serves as the bridge between 
                  agents and their environment, complementing A2A for comprehensive agent ecosystem architecture.
                </p>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 rounded-md border border-amber-200 dark:border-amber-800 mb-4">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">🔧 MCP Implementation Strategies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h5 className="font-medium text-amber-800 dark:text-amber-200 text-sm">Setup Steps</h5>
                      <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        <li>• <strong>Define Tool Descriptions:</strong> JSON schemas for functions</li>
                        <li>• <strong>Handle Function Calls:</strong> Parameter validation & execution</li>
                        <li>• <strong>Manage Context:</strong> Session/state tracking</li>
                        <li>• <strong>Implement Error Handling:</strong> Standard codes & recovery</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-amber-800 dark:text-amber-200 text-sm">Key Features</h5>
                      <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        <li>• <strong>Type Safety:</strong> JSON schema validation</li>
                        <li>• <strong>Streaming Support:</strong> Real-time data</li>
                        <li>• <strong>Resource Management:</strong> Cleanup protocols</li>
                        <li>• <strong>Capability Discovery:</strong> Dynamic negotiation</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 rounded-md border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">🏗️ Layered MCP×A2A Architecture</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    MCP operates in the Tool Integration Layer while A2A works in the Agent Management Layer, 
                    creating a complete stack from User Interface → Agent Management → Core Protocol → Tool Integration → Security.
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-semibold">MCP vs Traditional APIs - Key Differences:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div className="text-center">
                      <h5 className="font-medium text-sm mb-1">Scope</h5>
                      <p className="text-xs text-muted-foreground">APIs: Client-server</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">MCP: Agent ↔ Tool</p>
                    </div>
                    <div className="text-center">
                      <h5 className="font-medium text-sm mb-1">Interaction</h5>
                      <p className="text-xs text-muted-foreground">APIs: Request/response</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">MCP: Context-aware function calls</p>
                    </div>
                    <div className="text-center">
                      <h5 className="font-medium text-sm mb-1">State</h5>
                      <p className="text-xs text-muted-foreground">APIs: Stateless/session</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">MCP: Context/state tracked</p>
                    </div>
                  </div>
                  <h4 className="font-semibold mt-4">MCP Core Components (JSON-RPC Based):</h4>
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li><strong>Tool Descriptions:</strong> JSON schemas defining available functions, parameters, and expected outputs</li>
                    <li><strong>Function Calling:</strong> Standardized parameter validation, execution, and result conversion</li>
                    <li><strong>Context Management:</strong> Session tracking, state management, and conversation history</li>
                    <li><strong>Server Discovery:</strong> Dynamic tool registration and capability advertisement</li>
                    <li><strong>Error Handling:</strong> Standard error codes, recovery strategies, and graceful degradation</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-md p-3">
                    <h5 className="font-medium text-accent flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Agent ↔ Tool Focus
                    </h5>
                    <p className="text-sm">Specialized for connecting agents to external APIs, databases, and cloud services</p>
                  </div>
                  <div className="border border-border rounded-md p-3">
                    <h5 className="font-medium text-accent flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Type Safety
                    </h5>
                    <p className="text-sm">JSON schema validation ensures reliable tool integration with error prevention</p>
                  </div>
                </div>

                <div className="py-4">
                  <h4 className="font-semibold mb-2">MCP Implementation Benefits:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-accent">70% Code Reduction</h5>
                      <p className="text-sm">Frameworks like LangGraph reduce integration complexity significantly</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-accent">65% Faster Integration</h5>
                      <p className="text-sm">Standardized interfaces accelerate tool connection time</p>
                    </div>
                    <div className="border border-border rounded-md p-3">
                      <h5 className="font-medium text-accent">Enterprise Security</h5>
                      <p className="text-sm">Built-in OAuth2, TLS, and access control for production deployments</p>
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

        <TabsContent value="acp" className="space-y-6 pt-6" data-section="acp-protocol">
          <Card className="relative">
            <EnlightenMeButton 
              title="Agent Communication Protocol (ACP)" 
              conceptId="acp"
              customPrompt="Explain the Agent Communication Protocol (ACP) with focus on industry standards and multi-vendor implementations. Cover: 1) ACP as an open standard developed by the AI Alliance and other industry consortiums for agent interoperability across different platforms (Microsoft Azure AI, Google Cloud AI, Amazon Bedrock, etc.), 2) Technical specification including RESTful API design, OpenAPI schema definitions, and standardized agent capability discovery mechanisms, 3) Implementation examples across major cloud providers: Azure AI Agent Service ACP endpoints, Google Cloud AI Platform agent APIs, AWS Bedrock agent communication interfaces, and how they achieve cross-platform compatibility, 4) ACP's support for multi-modal communication (text, images, audio, video) and how different cloud providers implement media handling, 5) Deployment patterns including single-agent REST services, multi-agent orchestration servers, and federated agent networks spanning multiple cloud environments, 6) Real-world use cases like cross-platform agent collaboration (Azure agent calling Google agent), enterprise agent marketplaces, and hybrid cloud agent architectures, 7) Security and authentication mechanisms including OAuth 2.0 integration, API key management, and cross-domain agent verification, 8) Comparison with proprietary protocols and the benefits of standardization for enterprise adoption and vendor neutrality."
            />
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
          
          <Separator className="my-6" />
          
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              MCP×A2A Integration Framework
            </div>
          </h2>
          <p className="text-muted-foreground mb-6">
            Explore the cutting-edge framework that combines Model Context Protocol (MCP) for agent-to-tool communication 
            with Agent-to-Agent (A2A) protocol for agent coordination, enabling sophisticated autonomous LLM-based agent systems.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  Protocol Complementarity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-2">MCP Focus</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Agent ↔ External Tool communication</p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                    <li>• Tool invocation & API integration</li>
                    <li>• Data retrieval & automation</li>
                    <li>• JSON schema-based interfaces</li>
                  </ul>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-md">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-2">A2A Focus</h4>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Agent ↔ Agent communication</p>
                  <ul className="text-xs text-purple-600 dark:text-purple-400 mt-2 space-y-1">
                    <li>• Collaborative workflows</li>
                    <li>• Task delegation & coordination</li>
                    <li>• Agent cards & discovery</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  Layered Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded text-xs">
                    <strong>User Interface Layer:</strong> Multimodal content processing & UX negotiation
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded text-xs">
                    <strong>Agent Management Layer:</strong> Agent cards, registry, task management, discovery
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded text-xs">
                    <strong>Core Protocol Layer:</strong> A2A messaging, MCP content, artifact management
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded text-xs">
                    <strong>Tool Integration Layer:</strong> Function calling, schema validation, result handling
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded text-xs">
                    <strong>Security Layer:</strong> Authentication, authorization, encryption, access control
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                Real-World Implementation Results
              </CardTitle>
              <CardDescription>Performance improvements from MCP×A2A framework adoption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">70%</div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">Code Reduction</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">Using LangGraph framework</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">65%</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Faster Integration</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Tool integration time reduction</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">∞</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Scalability</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Dozens of agents coordination</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                Enterprise Use Cases
              </CardTitle>
              <CardDescription>Production applications of the MCP×A2A framework</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-sm">Recruitment Automation</h4>
                    <p className="text-xs text-muted-foreground">Screening agents use MCP for resume parsing, scheduling agents use MCP for calendar APIs, with A2A coordination</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-sm">Customer Support</h4>
                    <p className="text-xs text-muted-foreground">Multi-agent workflow: initial response → diagnosis → solution → escalation with MCP-CRM integration</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-sm">Code Review Systems</h4>
                    <p className="text-xs text-muted-foreground">Analysis, security, performance, and documentation agents with MCP connections to CI/CD tools</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-sm">Stock Information Systems</h4>
                    <p className="text-xs text-muted-foreground">Orchestrator plans calls, stock agents use MCP APIs, news agents scrape data, analysis agents synthesize</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mcpxa2a" className="space-y-6 pt-6" data-section="mcpxa2a-integration">
          <MCPxA2AIntegrationFlow />
        </TabsContent>
        
        <TabsContent value="visualization" className="space-y-6 pt-6">
          <Card className="relative">
            <EnlightenMeButton 
              title="Flow Visualization" 
              conceptId="flow-visualization"
              customPrompt="Explain flow visualization in AI agent systems with emphasis on Microsoft Azure AI Studio's visual designer and other professional visualization tools. Cover: 1) Azure AI Studio's flow visualization capabilities for building and debugging agent workflows, including visual representation of agent interactions, tool calls, and data transformations, 2) Different types of information flows in agent systems: conversational flows (user-agent-tool chains), data flows (input transformation pipelines), control flows (conditional agent routing), and error flows (exception handling paths), 3) Visualization techniques including Azure AI Studio's graphical workflow editor, real-time execution tracing, and performance monitoring dashboards, 4) Industry-standard visualization approaches like Microsoft Power BI integration for agent analytics, Azure Application Insights for agent telemetry visualization, and third-party tools like Langfuse, LangSmith, and Weights & Biases for agent flow tracking, 5) Best practices for creating effective flow visualizations including color coding for different message types, timeline visualization for agent interactions, and hierarchical views for complex multi-agent systems, 6) Practical applications in Azure environments including debugging agent workflows in Azure AI Studio, monitoring agent performance in production, and documenting agent architectures for stakeholders, 7) Integration with development tools like VS Code extensions for agent flow visualization and Azure DevOps for agent workflow CI/CD pipelines."
            />
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
          <Card className="relative">
            <EnlightenMeButton 
              title="Data Transformation Between Agents" 
              conceptId="data-transformation"
              customPrompt="Explain data transformation in AI agent systems with specific focus on Azure AI services and enterprise-grade transformation patterns. Cover: 1) Azure-specific data transformation capabilities including Azure AI Document Intelligence for parsing unstructured data, Azure Cognitive Services for media transformation (speech-to-text, image analysis), and Azure AI Search for semantic data enrichment between agents, 2) Common transformation patterns in Azure environments: JSON schema validation using Azure API Management, data format conversion through Azure Functions, content summarization via Azure OpenAI, and structured data extraction using Azure Form Recognizer, 3) Enterprise data transformation pipelines including Azure Data Factory for ETL between agent systems, Azure Event Hubs for real-time data streaming between agents, and Azure Service Bus for reliable message transformation and routing, 4) Advanced transformation techniques like prompt engineering for data restructuring, embedding generation for semantic similarity, vector database transformations using Azure Cosmos DB for MongoDB vCore or Azure AI Search vector indexes, 5) Implementation best practices including data validation schemas, transformation error handling, data lineage tracking through Azure Purview, and performance optimization for high-throughput agent systems, 6) Real-world examples including customer service agents transforming chat conversations into support tickets, research agents converting academic papers into structured knowledge graphs, and business intelligence agents transforming raw data into executive dashboards, 7) Security and compliance considerations including data encryption during transformation, PII detection and masking, and audit trails for data transformations in regulated industries."
            />
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

      {/* Floating Contextual Help */}
      <FloatingContextualHelp
        pageSynopsis={pagesSynopsis['core-concepts']}
        pageKey="core-concepts"
        isVisible={isVisible}
        onClose={hideHelp}
        onToggle={toggleHelp}
        onStartTutorial={() => startTutorial(conceptsExplorerTutorial.id)}
      />

      {/* Smart Page Analytics */}
      <SmartPageAnalytics
        pageKey="core-concepts"
        pageTitle="Core Concepts"
      />
    </div>
  );
}

export default ConceptsExplorer