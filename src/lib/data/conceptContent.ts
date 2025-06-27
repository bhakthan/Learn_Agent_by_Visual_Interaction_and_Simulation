// Educational content for Azure AI Agent concepts
export interface ConceptContent {
  id: string;
  name: string;
  description: string;
  keyFeatures: string[];
  applicationAreas: string[];
  technicalDetails: string;
  implementationConsiderations: string[];
  examples: {
    title: string;
    description: string;
    codeSnippet?: string;
  }[];
}

export const conceptContents: ConceptContent[] = [
  {
    id: 'agents',
    name: 'Azure AI Agents',
    description: `
      Azure AI Agents are autonomous software entities that leverage Large Language Models (LLMs) to perform complex tasks
      through reasoning, planning, and tool interaction. They go beyond simple prompt-response patterns by maintaining state,
      planning multi-step actions, and adapting to new information.
      
      Agents operate with varying degrees of autonomy, from simple reactive behaviors to sophisticated planning and self-improvement.
      They can be integrated into applications using the Azure AI SDK, providing a framework for building intelligent systems that
      can solve problems with minimal human supervision.
    `,
    keyFeatures: [
      "Goal-directed behavior that maintains focus on completing specified objectives",
      "Agentic planning with the ability to break complex problems into manageable steps",
      "Tool use capabilities to interact with external systems, APIs, and data sources",
      "Memory and context tracking to maintain state throughout multi-step processes",
      "Reasoning capabilities to handle ambiguous or complex situations",
      "Error recovery with the ability to detect issues and adapt plans",
      "Communication in natural language with humans and other agents"
    ],
    applicationAreas: [
      "Customer service automation",
      "Content creation and editing",
      "Data analysis and insights generation",
      "Process automation and workflow management",
      "Research and information synthesis",
      "Personal assistance and productivity",
      "Software development assistance",
      "Educational tutoring and guidance"
    ],
    technicalDetails: `
      Azure AI Agents are built on Azure OpenAI Service models like GPT-4, with added components for planning,
      tool usage, and state management. Typical implementation approaches include:
      
      1. Function calling with structured outputs - Using Azure OpenAI function calling to enable agents to interact with tools
      2. ReAct (Reasoning + Acting) - Interleaving reasoning steps with actions
      3. Tool-augmented agents - Integrating with external APIs and services
      4. Planning frameworks - Adding explicit planning capabilities (like Plan-and-Execute pattern)
      
      The Azure AI SDK provides abstractions that simplify agent implementation, including prompt templates,
      tool definitions, and state management utilities.
    `,
    implementationConsiderations: [
      "Prompt engineering is crucial for guiding agent behavior and reasoning",
      "Tool design should include clear descriptions, input validation, and error handling",
      "Consider security implications of giving agents access to external systems",
      "Implement appropriate guardrails and safety mechanisms",
      "Plan for handling failures, edge cases, and unexpected situations",
      "Balance autonomy with appropriate human oversight",
      "Consider computational costs and latency requirements"
    ],
    examples: [
      {
        title: "Basic Agent Definition",
        description: "Defining a simple agent with tool access",
        codeSnippet: `
import { Agent } from "@azure/ai-agent";

// Define tools the agent can use
const tools = [
  {
    name: "search",
    description: "Search for information on the internet",
    parameters: {
      query: {
        type: "string",
        description: "Search query"
      }
    },
    execute: async ({ query }) => {
      // Implementation of search functionality
      return { results: [...] };
    }
  }
];

// Create the agent
const agent = new Agent({
  model: "gpt-4",
  tools,
  instructions: "You are a helpful assistant that can search for information."
});

// Run the agent with a user query
const result = await agent.run("What's the weather like in Seattle?");
        `
      },
      {
        title: "Agent with Planning",
        description: "Agent that creates and executes plans",
        codeSnippet: `
// Define a planning agent
const planningAgent = new PlanningAgent({
  model: "gpt-4",
  tools,
  instructions: \`
    You are an assistant that creates and executes plans.
    1. Analyze the user's request
    2. Break it down into steps
    3. Execute each step using available tools
    4. Provide a complete solution
  \`
});

// Run the agent with a complex task
const result = await planningAgent.run(
  "Research the latest AI trends, summarize them, and create a presentation outline"
);
        `
      }
    ]
  },
  {
    id: 'a2a',
    name: 'Agent-to-Agent (A2A) Communication',
    description: `
      Agent-to-Agent (A2A) communication enables multiple AI agents to work together, sharing information,
      delegating tasks, and coordinating actions. This approach allows complex systems to be built from
      simpler, specialized agents that each handle specific aspects of a problem.
      
      A2A systems can be organized in various topologies, from hierarchical structures with manager and
      worker agents to peer networks where agents communicate directly with each other. These communication
      patterns enable more sophisticated behaviors than any single agent could achieve alone.
    `,
    keyFeatures: [
      "Message passing with structured formats for reliable information exchange",
      "Role specialization allowing agents to focus on specific capabilities",
      "Task delegation from manager agents to specialized worker agents",
      "Collaborative problem-solving through agent teams",
      "Shared memory and knowledge bases for collective intelligence",
      "Communication protocols for standardized interactions",
      "Conflict resolution mechanisms for handling disagreements"
    ],
    applicationAreas: [
      "Complex workflow automation",
      "Multi-domain question answering",
      "Collaborative content creation",
      "Simulated organizations and systems",
      "Distributed problem-solving",
      "Decision support with multiple perspectives",
      "Competitive or adversarial simulations"
    ],
    technicalDetails: `
      A2A communication typically involves:
      
      1. Message formats - Structured data formats for exchanging information
      2. Routing mechanisms - Determining which agent(s) should receive messages
      3. State tracking - Maintaining conversation and task state across multiple agents
      4. Role definitions - Clear specifications of each agent's responsibilities
      5. Coordination protocols - Rules for how agents interact and collaborate
      
      Modern A2A systems often use JSON for message passing, with each message containing metadata about the
      sender, recipient, purpose, and conversation context. More sophisticated systems may implement formal
      communication protocols like ModelContextProtocol (MCP).
    `,
    implementationConsiderations: [
      "Design clear communication interfaces between agents",
      "Consider message size limitations due to context windows",
      "Implement error handling for failed communications",
      "Plan for efficiency in multi-agent architectures",
      "Design effective coordination strategies",
      "Consider security implications of agent-to-agent communication",
      "Implement debugging tools for tracking inter-agent messages"
    ],
    examples: [
      {
        title: "Basic A2A Communication",
        description: "Simple message passing between two agents",
        codeSnippet: `
// Define two agents
const researchAgent = new Agent({
  model: "gpt-4",
  instructions: "You research information and provide detailed facts."
});

const summarizerAgent = new Agent({
  model: "gpt-4",
  instructions: "You summarize detailed information into concise points."
});

// Implement communication between agents
async function processInformation(query) {
  // First agent researches
  const researchResult = await researchAgent.run(query);
  
  // Format message for the second agent
  const message = {
    from: "researchAgent",
    content: researchResult,
    instruction: "Summarize this research into 3-5 key points"
  };
  
  // Second agent summarizes
  const summary = await summarizerAgent.run(JSON.stringify(message));
  
  return summary;
}
        `
      },
      {
        title: "Multi-Agent Team",
        description: "A team of specialized agents coordinated by a manager",
        codeSnippet: `
// Create specialized worker agents
const agents = {
  researcher: new Agent({ instructions: "Research facts about topics" }),
  analyst: new Agent({ instructions: "Analyze data and identify patterns" }),
  writer: new Agent({ instructions: "Create well-written content" })
};

// Create a coordinator agent
const coordinator = new Agent({
  instructions: \`
    You coordinate a team of specialized agents.
    - researcher: Good at finding information
    - analyst: Good at analyzing data
    - writer: Good at creating content
    Decide which agent(s) to use for each task.
  \`
});

// Implement the coordination flow
async function teamProcess(request) {
  // Coordinator plans the workflow
  const plan = await coordinator.run(\`
    Request: "\${request}"
    Create a plan specifying which agents should handle which parts.
  \`);
  
  // Parse the plan and execute steps
  const parsedPlan = parsePlan(plan);
  const results = {};
  
  for (const step of parsedPlan.steps) {
    const agentName = step.agent;
    const instruction = step.instruction;
    
    // Include previous results in context
    const context = JSON.stringify(results);
    const agentInput = \`
      Instruction: \${instruction}
      Previous results: \${context}
    \`;
    
    // Execute step with appropriate agent
    results[step.id] = await agents[agentName].run(agentInput);
  }
  
  // Final synthesis by coordinator
  return coordinator.run(\`
    Synthesize these results into a final response:
    \${JSON.stringify(results)}
  \`);
}
        `
      }
    ]
  },
  {
    id: 'mcp',
    name: 'ModelContextProtocol (MCP)',
    description: `
      ModelContextProtocol (MCP) is a standardized framework for structured communication between AI agents.
      It defines how agents exchange messages, maintain shared context, and manage conversational state.
      MCP provides conventions that enable more reliable and consistent agent interactions.
      
      At its core, MCP addresses the challenges of context management, message formatting, and state tracking
      in multi-agent systems. It ensures that agents can effectively collaborate across different implementations
      and platforms, maintaining coherent conversations and workflows.

      The protocol was designed to solve common problems in AI systems related to context retention, message history management,
      and effective agent collaboration. MCP is transport-agnostic, focusing on message structure and context handling
      rather than the specific communication channels used.
    `,
    keyFeatures: [
      "Standardized message format with metadata for tracking and routing",
      "Context management to maintain conversation history across interactions",
      "Role specification for defining agent capabilities and responsibilities",
      "Control flow mechanisms for handling handoffs between agents",
      "Error handling and recovery procedures",
      "Interoperability between different agent implementations",
      "Extension mechanisms for domain-specific requirements",
      "Transport-agnostic design that works with various communication protocols"
    ],
    applicationAreas: [
      "Enterprise systems with multiple specialized agents",
      "Open agent ecosystems with third-party contributions",
      "Long-running conversations with agent transitions",
      "Systems requiring auditability of agent interactions",
      "Cross-platform agent integration",
      "Collaborative agent teams with complex workflows",
      "Multi-turn complex reasoning tasks"
    ],
    technicalDetails: `
      A typical MCP message includes:
      
      1. Message ID and thread ID for tracking
      2. Sender and recipient information
      3. Role specifications
      4. Content (the actual message payload)
      5. Metadata (timestamps, version info, etc.)
      6. Context references (links to previous messages or external context)
      
      MCP implementations often include libraries for message construction, validation, and processing.
      The protocol can be implemented at various levels of completeness depending on the application's needs,
      from simple message formatting to full context management systems.
    `,
    implementationConsiderations: [
      "Choose an appropriate level of protocol complexity for your needs",
      "Implement robust message validation and error handling",
      "Consider storage requirements for maintaining conversation history",
      "Design for graceful handling of context window limitations",
      "Ensure security of sensitive information in message contexts",
      "Plan for version compatibility as the protocol evolves",
      "Consider performance implications of context tracking"
    ],
    examples: [
      {
        title: "Basic MCP Message Structure",
        description: "Example of a simple MCP message following the specification",
        codeSnippet: `
// Example MCP message format
const mcpMessage = {
  // Core protocol information
  protocol: "mcp-0.1",
  
  // Message metadata
  message_id: "msg_123456789",
  parent_id: "msg_previous_id",
  trace_id: "trace_abc123",
  
  // Message content
  role: "assistant",
  content: "Here are the key facts about the topic you requested...",
  
  // Context handling
  context: {
    current: {
      conversation_id: "conv_xyz789",
      turn: 3
    },
    references: [
      { id: "msg_previous_id", role: "user" }
    ]
  },
  
  // Message properties
  properties: {
    created_at: "2023-06-25T14:35:12Z",
    model: "gpt-4",
    temperature: 0.7,
    intent: "information_retrieval"
  }
};

// Sending the message to another agent
await sendMcpMessage(recipientAgent, mcpMessage);
        `
      },
      {
        title: "MCP Context Management",
        description: "Implementing an MCP context manager for conversation tracking",
        codeSnippet: `
// MCP context manager implementation
class McpContextManager {
  private contexts = new Map();
  
  // Store context for a conversation
  storeContext(conversationId, contextData) {
    const existingContext = this.contexts.get(conversationId) || {
      messages: [],
      turn: 0,
      metadata: {}
    };
    
    this.contexts.set(conversationId, {
      ...existingContext,
      ...contextData,
      lastUpdated: Date.now()
    });
  }
  
  // Add message to context history
  addMessage(conversationId, message) {
    const context = this.contexts.get(conversationId) || {
      messages: [],
      turn: 0,
      metadata: {}
    };
    
    // Add message to history and increment turn counter
    const updatedContext = {
      ...context,
      messages: [...context.messages, message],
      turn: context.turn + 1,
      lastUpdated: Date.now()
    };
    
    this.contexts.set(conversationId, updatedContext);
    return updatedContext;
  }
  
  // Get context for a conversation
  getContext(conversationId) {
    return this.contexts.get(conversationId) || {
      messages: [],
      turn: 0,
      metadata: {}
    };
  }
  
  // Create a new MCP message with appropriate context
  createMessage(conversationId, role, content, properties = {}) {
    const context = this.getContext(conversationId);
    const messageId = \`msg_\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}\`;
    
    // Get parent message ID if available
    const parentId = context.messages.length > 0 
      ? context.messages[context.messages.length - 1].message_id
      : null;
    
    // Create message following MCP specification
    const message = {
      protocol: "mcp-0.1",
      message_id: messageId,
      parent_id: parentId,
      trace_id: \`trace_\${conversationId}\`,
      role,
      content,
      context: {
        current: {
          conversation_id: conversationId,
          turn: context.turn
        },
        references: parentId ? [{ id: parentId }] : []
      },
      properties: {
        created_at: new Date().toISOString(),
        ...properties
      }
    };
    
    // Store the message in context
    this.addMessage(conversationId, message);
    
    return message;
  }
}
        `
      }
    ]
  },
  {
    id: 'acp',
    name: 'Agent Communication Protocol (ACP)',
    description: `
      The Agent Communication Protocol (ACP) is an open standard for agent interoperability that solves the 
      growing challenge of connecting AI agents, applications, and humans. It addresses the fragmentation that 
      occurs when agents are built in isolation across different frameworks, teams, and infrastructures.
      
      ACP provides a standardized RESTful API for agent communication that supports multiple modalities, both 
      synchronous and asynchronous communication patterns, streaming interactions, stateful and stateless 
      operation, agent discovery, and long-running tasks.
    `,
    keyFeatures: [
      "Open protocol design for universal agent connectivity",
      "RESTful API for standardized communication endpoints",
      "Multi-modal support for text, images, audio, and more",
      "Synchronous and asynchronous communication patterns",
      "Streaming capability for real-time responses",
      "Stateful and stateless operational models",
      "Agent discovery mechanisms for finding available agents"
    ],
    applicationAreas: [
      "Enterprise agent ecosystems with multiple specialized agents",
      "Cross-platform agent interoperability",
      "Multi-agent systems that span organizational boundaries",
      "Agent marketplaces for discoverable agent services",
      "Hybrid human-AI collaborative systems",
      "Long-running agent tasks with persistent state",
      "Distributed agent networks with central coordination"
    ],
    technicalDetails: `
      ACP is implemented as a RESTful API with standard endpoints for agent operations. The primary patterns include:

      1. Single-Agent Pattern: A client connects directly to a single agent via REST interface over HTTP. This is ideal for direct communication with specialized agents, lightweight setups, development environments, and proof-of-concept implementations.

      2. Multi-Agent Single Server Pattern: An ACP Server hosts multiple agents behind a single HTTP endpoint. Each agent is individually addressable through the server's routing mechanism using agent metadata.

      The protocol's message format includes:
      - Agent identification and metadata
      - Request parameters and context
      - Response data with multiple modality support
      - State tracking for multi-turn interactions
      - Error handling and status reporting
    `,
    implementationConsiderations: [
      "Determine whether a single-agent or multi-agent pattern best fits your use case",
      "Consider authentication and authorization mechanisms for agent access",
      "Plan for logging and monitoring of agent interactions",
      "Implement appropriate error handling and retry strategies",
      "Decide on stateful vs. stateless operation based on requirements",
      "Consider deployment options: serverless functions, containers, or dedicated servers",
      "Plan for scaling with increasing agent load and complexity"
    ],
    examples: [
      {
        title: "Basic ACP Client-Server Interaction",
        description: "Simple client-server interaction using ACP",
        codeSnippet: `
// Client-side code to communicate with an ACP server
async function callAgent(query) {
  // Standard ACP endpoint for agent invocation
  const response = await fetch('https://acp-server.example.com/agent/invoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: query,
      parameters: {
        temperature: 0.7,
        max_tokens: 500
      }
    })
  });
  
  // Handle the ACP-formatted response
  const result = await response.json();
  return result.output;
}

// Example usage
const result = await callAgent("Analyze the quarterly sales data");
console.log(result);
        `
      },
      {
        title: "Multi-Agent ACP Server Configuration",
        description: "Setting up an ACP server with multiple agents",
        codeSnippet: `
// Server-side code for multi-agent ACP implementation
import express from 'express';
import { ACPServer } from 'acp-server';

const app = express();
app.use(express.json());

// Configure the ACP server with multiple agents
const acpServer = new ACPServer({
  agents: [
    {
      id: 'research-agent',
      name: 'Research Specialist',
      description: 'Agent specialized in data research and analysis',
      handler: async (request) => {
        // Agent implementation for research tasks
        const { input } = request;
        // Process the request and generate research results
        return {
          output: 'Research results: ...',
          metadata: {
            process_time: 1.2,
            confidence: 0.95
          }
        };
      }
    },
    {
      id: 'content-agent',
      name: 'Content Creator',
      description: 'Agent specialized in content generation',
      handler: async (request) => {
        // Agent implementation for content creation
        const { input } = request;
        // Generate content based on input
        return {
          output: 'Generated content: ...',
          metadata: {
            word_count: 250,
            tone: 'informative'
          }
        };
      }
    }
  ]
});

// Set up ACP endpoints
app.post('/agent/invoke', (req, res) => {
  // Route the request to the appropriate agent based on metadata
  const { agent_id } = req.body;
  acpServer.handleRequest(agent_id, req.body)
    .then(result => res.json(result))
    .catch(error => res.status(500).json({ error: error.message }));
});

app.listen(3000, () => {
  console.log('ACP Server running on port 3000');
});
        `
      }
    ]
  }
];