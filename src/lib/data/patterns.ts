export interface PatternNode {
  id: string
  type: string
  data: {
    label: string
    description?: string
    nodeType?: 'input' | 'llm' | 'output' | 'router' | 'tool' | 'aggregator' | 'evaluator' | 'planner' | 'executor'
  }
  position: { x: number; y: number }
}

export interface PatternEdge {
  id: string
  source: string
  target: string
  type?: string
  label?: string
  animated?: boolean
  style?: {
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: string
  }
}

export interface PatternData {
  id: string
  name: string
  description: string
  nodes: PatternNode[]
  edges: PatternEdge[]
  useCases: string[]
  codeExample: string
  implementation: string[]
}

export const agentPatterns: PatternData[] = [
  {
    id: 'model-context-protocol',
    name: 'Model Context Protocol (MCP)',
    description: 'A standardized communication framework between models and context systems that ensures efficient information exchange.',
    useCases: ['Enterprise Knowledge Management', 'Secure Data Access Patterns', 'Context-Aware Systems'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'User Query', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'context-system',
        type: 'default',
        data: { label: 'Context System', nodeType: 'tool' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'context-router',
        type: 'default',
        data: { label: 'Context Router', nodeType: 'router' },
        position: { x: 500, y: 150 }
      },
      {
        id: 'knowledge-store',
        type: 'default',
        data: { label: 'Knowledge Store', nodeType: 'tool' },
        position: { x: 700, y: 50 }
      },
      {
        id: 'security-filter',
        type: 'default',
        data: { label: 'Security Filter', nodeType: 'evaluator' },
        position: { x: 700, y: 150 }
      },
      {
        id: 'context-builder',
        type: 'default',
        data: { label: 'Context Builder', nodeType: 'aggregator' },
        position: { x: 900, y: 100 }
      },
      {
        id: 'llm',
        type: 'default',
        data: { label: 'LLM', nodeType: 'llm' },
        position: { x: 1100, y: 150 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Response', nodeType: 'output' },
        position: { x: 1300, y: 150 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'context-system', animated: true },
      { id: 'e2-3', source: 'context-system', target: 'context-router', animated: true },
      { id: 'e3-4', source: 'context-router', target: 'knowledge-store' },
      { id: 'e3-5', source: 'context-router', target: 'security-filter' },
      { id: 'e4-6', source: 'knowledge-store', target: 'context-builder' },
      { id: 'e5-6', source: 'security-filter', target: 'context-builder' },
      { id: 'e6-7', source: 'context-builder', target: 'llm', animated: true },
      { id: 'e7-8', source: 'llm', target: 'output', animated: true }
    ],
    codeExample: `// Model Context Protocol implementation
const executeMCP = async (userQuery: string) => {
  try {
    // Step 1: Context system processes the query
    console.log("Processing query through context system...");
    const contextRequest = {
      query: userQuery,
      sessionId: "session-123",
      permissions: ["docs:read", "knowledge:access"]
    };
    
    // Step 2: Context router determines what information sources to access
    console.log("Routing context request...");
    const routingResult = await determineContextSources(contextRequest);
    
    // Step 3: Retrieve information from knowledge stores with security filtering
    console.log("Retrieving information from authorized sources...");
    const knowledgeResults = await Promise.all(
      routingResult.sources.map(async (source) => {
        const rawData = await fetchFromKnowledgeStore(source, contextRequest.query);
        return await applySecurityFilter(rawData, contextRequest.permissions);
      })
    );
    
    // Step 4: Build a unified context
    console.log("Building unified context...");
    const unifiedContext = await buildContext(knowledgeResults, userQuery);
    
    // Step 5: Send query + context to LLM
    console.log("Generating response with LLM...");
    const response = await llm(\`
      User query: \${userQuery}
      
      Context information:
      \${unifiedContext}
      
      Generate a helpful response based on the provided context:
    \`);
    
    return {
      status: 'success',
      context: {
        sources: routingResult.sources,
        size: unifiedContext.length
      },
      response
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

// Helper functions
const determineContextSources = async (request) => {
  // Logic to determine which knowledge sources to query
  return {
    sources: ['documentation', 'knowledge-base', 'policies']
  };
};

const fetchFromKnowledgeStore = async (source, query) => {
  // Simulate knowledge retrieval
  return \`Information from \${source} related to "\${query}"\`;
};

const applySecurityFilter = async (data, permissions) => {
  // Apply security filtering to retrieved data
  if (permissions.includes('docs:read')) {
    return data;
  }
  return 'Access denied to this information';
};

const buildContext = async (results, query) => {
  // Combine multiple information sources into unified context
  return results.join('\\n\\n');
};`,
    implementation: [
      'Define standardized request and response formats for context exchanges',
      'Implement the context system with query analysis capabilities',
      'Create a routing mechanism to determine relevant knowledge sources',
      'Build security filters to enforce access permissions on retrieved data',
      'Develop a context builder to consolidate information from multiple sources',
      'Structure the system to handle asynchronous context retrieval operations',
      'Optimize context delivery to stay within LLM context windows',
      'Implement caching for frequently accessed contextual information'
    ]
  },
  {
    id: 'agent-to-agent',
    name: 'Agent to Agent (A2A)',
    description: 'A communication framework where AI agents collaborate by exchanging structured messages to solve complex problems.',
    useCases: ['Multi-agent Systems', 'Collaborative Task Solving', 'Expert Networks'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'Task Input', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'coordinator',
        type: 'default',
        data: { label: 'Coordinator Agent', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'agent1',
        type: 'default',
        data: { label: 'Research Agent', nodeType: 'llm' },
        position: { x: 600, y: 50 }
      },
      {
        id: 'agent2',
        type: 'default',
        data: { label: 'Analysis Agent', nodeType: 'llm' },
        position: { x: 600, y: 150 }
      },
      {
        id: 'agent3',
        type: 'default',
        data: { label: 'Critic Agent', nodeType: 'evaluator' },
        position: { x: 600, y: 250 }
      },
      {
        id: 'message-bus',
        type: 'default',
        data: { label: 'Message Bus', nodeType: 'aggregator' },
        position: { x: 450, y: 150 }
      },
      {
        id: 'synthesizer',
        type: 'default',
        data: { label: 'Synthesizer Agent', nodeType: 'llm' },
        position: { x: 800, y: 150 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Final Output', nodeType: 'output' },
        position: { x: 1000, y: 150 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'coordinator', animated: true },
      { id: 'e2-6', source: 'coordinator', target: 'message-bus', animated: true },
      { id: 'e6-3', source: 'message-bus', target: 'agent1', style: { strokeDasharray: '5, 5' } },
      { id: 'e6-4', source: 'message-bus', target: 'agent2', style: { strokeDasharray: '5, 5' } },
      { id: 'e6-5', source: 'message-bus', target: 'agent3', style: { strokeDasharray: '5, 5' } },
      { id: 'e3-6', source: 'agent1', target: 'message-bus', animated: true },
      { id: 'e4-6', source: 'agent2', target: 'message-bus', animated: true },
      { id: 'e5-6', source: 'agent3', target: 'message-bus', animated: true },
      { id: 'e6-7', source: 'message-bus', target: 'synthesizer', animated: true },
      { id: 'e7-8', source: 'synthesizer', target: 'output', animated: true }
    ],
    codeExample: `// Agent to Agent (A2A) implementation
const executeAgentToAgent = async (taskInput: string, maxRounds = 3) => {
  try {
    // Initialize message bus for inter-agent communication
    const messageBus = new MessageBus();
    
    // Step 1: Coordinator agent breaks down the task
    console.log("Coordinator agent analyzing task...");
    const coordinatorPrompt = \`
      You are a coordinator agent. Analyze this task and break it down:
      "\${taskInput}"
      
      Create structured subtasks for the following agents:
      1. Research Agent: Gathers relevant information
      2. Analysis Agent: Processes and analyzes data
      3. Critic Agent: Evaluates proposals and identifies issues
      
      Format your response as JSON with a "subtasks" array containing objects 
      with "agent" and "instruction" fields.
    \`;
    
    const coordinatorResponse = await llm(coordinatorPrompt, undefined, true);
    const subtasks = parseTasks(coordinatorResponse);
    
    // Publish initial subtasks to the message bus
    subtasks.forEach(task => {
      messageBus.publish({
        from: "coordinator",
        to: task.agent,
        messageType: "task",
        content: task.instruction
      });
    });
    
    // Step 2: Execute multiple rounds of agent interaction
    for (let round = 0; round < maxRounds; round++) {
      console.log(\`Starting interaction round \${round + 1}...\`);
      
      // Process messages for each agent
      await Promise.all([
        processAgentMessages("research", messageBus),
        processAgentMessages("analysis", messageBus),
        processAgentMessages("critic", messageBus)
      ]);
      
      // Check if we have enough information to synthesize
      if (messageBus.getMessagesByType("result").length >= 3) {
        break;
      }
    }
    
    // Step 3: Synthesize results
    console.log("Synthesizing final output...");
    const allMessages = messageBus.getAllMessages();
    const resultMessages = messageBus.getMessagesByType("result");
    
    const synthesizerPrompt = \`
      You are a synthesis agent. Create a comprehensive response based on the 
      work of multiple agents on this task: "\${taskInput}"
      
      Agent contributions:
      \${resultMessages.map(msg => \`${msg.from}: ${msg.content}\`).join('\\n\\n')}
      
      Synthesize these contributions into a cohesive final result.
    \`;
    
    const finalResult = await llm(synthesizerPrompt);
    
    return {
      status: 'success',
      rounds: maxRounds,
      messageCount: allMessages.length,
      result: finalResult
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

// Helper classes and functions
class MessageBus {
  messages = [];
  
  publish(message) {
    this.messages.push({
      ...message,
      id: \`msg-\${Date.now()}-\${this.messages.length}\`,
      timestamp: new Date().toISOString()
    });
    return message;
  }
  
  getMessagesFor(agent) {
    return this.messages.filter(msg => msg.to === agent || msg.to === "all");
  }
  
  getMessagesByType(type) {
    return this.messages.filter(msg => msg.messageType === type);
  }
  
  getAllMessages() {
    return [...this.messages];
  }
}

const processAgentMessages = async (agentType, messageBus) => {
  // Get messages addressed to this agent
  const messages = messageBus.getMessagesFor(agentType);
  if (messages.length === 0) return;
  
  // Create agent prompt based on message type
  let agentPrompt;
  
  switch(agentType) {
    case "research":
      agentPrompt = \`
        You are a research agent. Process these instructions and gather information:
        \${messages.map(msg => msg.content).join('\\n')}
        
        Provide your research findings in a structured format.
      \`;
      break;
    case "analysis":
      agentPrompt = \`
        You are an analysis agent. Process this data and provide insights:
        \${messages.map(msg => msg.content).join('\\n')}
        
        Provide your analytical conclusions.
      \`;
      break;
    case "critic":
      agentPrompt = \`
        You are a critic agent. Evaluate these proposals and identify issues:
        \${messages.map(msg => msg.content).join('\\n')}
        
        Provide constructive criticism and suggestions for improvement.
      \`;
      break;
  }
  
  // Generate agent response
  const agentResponse = await llm(agentPrompt);
  
  // Publish response to message bus
  messageBus.publish({
    from: agentType,
    to: "all",
    messageType: "result",
    content: agentResponse
  });
};

const parseTasks = (coordinatorOutput) => {
  try {
    if (typeof coordinatorOutput === 'string') {
      // Extract JSON from string if needed
      const match = coordinatorOutput.match(/\\{[\\s\\S]*\\}/);
      const json = match ? JSON.parse(match[0]) : { subtasks: [] };
      return json.subtasks || [];
    }
    return coordinatorOutput.subtasks || [];
  } catch (error) {
    console.error("Error parsing coordinator output:", error);
    return [
      { agent: "research", instruction: "Research this topic." },
      { agent: "analysis", instruction: "Analyze available information." },
      { agent: "critic", instruction: "Critique the approach and findings." }
    ];
  }
};`,
    implementation: [
      'Design a structured message format for inter-agent communication',
      'Implement a message bus system for reliable message exchange',
      'Create specialized agents with defined roles and responsibilities',
      'Build a coordinator agent to manage task delegation',
      'Develop protocols for handling message sequences and conversation flow',
      'Implement mechanisms for detecting and resolving conflicts between agents',
      'Create a synthesis system to combine contributions from multiple agents',
      'Add monitoring capabilities to track agent interactions and performance'
    ]
  },
  {
    id: 'prompt-chaining',
    name: 'Prompt Chaining',
    description: 'It decomposes a task into steps, where each LLM call processes the output of the previous one.',
    useCases: ['Chatbot Applications', 'Tool using AI Agents'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'Input', nodeType: 'input' },
        position: { x: 100, y: 100 }
      },
      {
        id: 'llm1',
        type: 'default',
        data: { label: 'LLM Call', nodeType: 'llm' },
        position: { x: 250, y: 100 }
      },
      {
        id: 'gate',
        type: 'default',
        data: { label: 'Gate', nodeType: 'router' },
        position: { x: 400, y: 100 }
      },
      {
        id: 'llm2',
        type: 'default',
        data: { label: 'LLM Call', nodeType: 'llm' },
        position: { x: 550, y: 50 }
      },
      {
        id: 'llm3',
        type: 'default',
        data: { label: 'LLM Call', nodeType: 'llm' },
        position: { x: 700, y: 50 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 850, y: 50 }
      },
      {
        id: 'fail',
        type: 'output',
        data: { label: 'Fail', nodeType: 'output' },
        position: { x: 550, y: 150 }
      },
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'llm1', animated: true },
      { id: 'e2-3', source: 'llm1', target: 'gate', animated: true },
      { id: 'e3-4', source: 'gate', target: 'llm2' },
      { id: 'e4-5', source: 'llm2', target: 'llm3' },
      { id: 'e5-6', source: 'llm3', target: 'output' },
      { id: 'e3-7', source: 'gate', target: 'fail' },
    ],
    codeExample: `// Prompt Chaining implementation
const executePromptChain = async (input: string) => {
  try {
    // First LLM call to process initial input
    const llmResult1 = await llm(\`Process this input: \${input}\`);
    
    // Gate logic - check if we should proceed or fail
    if (!validateResult(llmResult1)) {
      return { status: 'failed', reason: 'Validation failed' };
    }
    
    // Second LLM call using first result
    const llmResult2 = await llm(\`Further analyze: \${llmResult1}\`);
    
    // Third LLM call for final processing
    const llmResult3 = await llm(\`Generate final response based on: \${llmResult2}\`);
    
    return {
      status: 'success',
      result: llmResult3
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};`,
    implementation: [
      'Import the Azure AI SDK and set up authentication',
      'Create a function that takes an initial input parameter',
      'Define the first LLM call with appropriate prompt engineering',
      'Implement validation logic to determine if the process should continue',
      'Set up the second LLM call using the output from the first',
      'Create the third LLM call to generate the final output',
      'Handle errors and edge cases throughout the chain',
      'Return the final processed result'
    ]
  },
  {
    id: 'parallelization',
    name: 'Parallelization',
    description: 'Parallelization in LLMs involves sectioning tasks or running them multiple times for aggregated outputs.',
    useCases: ['Implementing guardrails', 'Automating Evals'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'Input', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'llm1',
        type: 'default',
        data: { label: 'LLM Call', nodeType: 'llm' },
        position: { x: 300, y: 50 }
      },
      {
        id: 'llm2',
        type: 'default',
        data: { label: 'LLM Call', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'llm3',
        type: 'default',
        data: { label: 'LLM Call', nodeType: 'llm' },
        position: { x: 300, y: 250 }
      },
      {
        id: 'aggregator',
        type: 'default',
        data: { label: 'Aggregator', nodeType: 'aggregator' },
        position: { x: 500, y: 150 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 700, y: 150 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'llm1', animated: true },
      { id: 'e1-3', source: 'input', target: 'llm2', animated: true },
      { id: 'e1-4', source: 'input', target: 'llm3', animated: true },
      { id: 'e2-5', source: 'llm1', target: 'aggregator' },
      { id: 'e3-5', source: 'llm2', target: 'aggregator' },
      { id: 'e4-5', source: 'llm3', target: 'aggregator' },
      { id: 'e5-6', source: 'aggregator', target: 'output', animated: true }
    ],
    codeExample: `// Parallelization implementation
const executeParallelLLMCalls = async (input: string) => {
  try {
    // Execute multiple LLM calls in parallel
    const [result1, result2, result3] = await Promise.all([
      llm(\`Process this input perspective 1: \${input}\`),
      llm(\`Process this input perspective 2: \${input}\`),
      llm(\`Process this input perspective 3: \${input}\`)
    ]);
    
    // Aggregate results
    const aggregatedResult = aggregateResults([result1, result2, result3]);
    
    return {
      status: 'success',
      individual: [result1, result2, result3],
      aggregated: aggregatedResult
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

const aggregateResults = (results) => {
  // Implementation of result aggregation logic
  // This could be a simple concatenation, a weighted average,
  // or another LLM call to synthesize the results
  return results.join('\\n\\n');
};`,
    implementation: [
      'Import the Azure AI SDK and set up authentication',
      'Define a function that takes an input parameter',
      'Create multiple prompt variations for different perspectives',
      'Use Promise.all to execute LLM calls in parallel',
      'Implement an aggregation function to combine results',
      'Consider different aggregation strategies based on use case',
      'Handle timeouts and errors for individual parallel calls',
      'Return both individual and aggregated results'
    ]
  },
  {
    id: 'orchestrator-worker',
    name: 'Orchestrator-Worker',
    description: 'A central LLM dynamically breaks down tasks, delegates them to worker LLMs to synthesize results.',
    useCases: ['Agentic RAG', 'Coding Agents'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'Input', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'orchestrator',
        type: 'default',
        data: { label: 'Orchestrator', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'worker1',
        type: 'default',
        data: { label: 'Worker 1', nodeType: 'llm' },
        position: { x: 500, y: 50 }
      },
      {
        id: 'worker2',
        type: 'default',
        data: { label: 'Worker 2', nodeType: 'llm' },
        position: { x: 500, y: 150 }
      },
      {
        id: 'worker3',
        type: 'default',
        data: { label: 'Worker 3', nodeType: 'llm' },
        position: { x: 500, y: 250 }
      },
      {
        id: 'synthesizer',
        type: 'default',
        data: { label: 'Synthesizer', nodeType: 'llm' },
        position: { x: 700, y: 150 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 900, y: 150 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'orchestrator', animated: true },
      { id: 'e2-3', source: 'orchestrator', target: 'worker1', style: { strokeDasharray: '5, 5' } },
      { id: 'e2-4', source: 'orchestrator', target: 'worker2', style: { strokeDasharray: '5, 5' } },
      { id: 'e2-5', source: 'orchestrator', target: 'worker3', style: { strokeDasharray: '5, 5' } },
      { id: 'e3-6', source: 'worker1', target: 'synthesizer' },
      { id: 'e4-6', source: 'worker2', target: 'synthesizer' },
      { id: 'e5-6', source: 'worker3', target: 'synthesizer' },
      { id: 'e6-7', source: 'synthesizer', target: 'output', animated: true }
    ],
    codeExample: `// Orchestrator-Worker implementation
const executeOrchestratorWorker = async (input: string) => {
  try {
    // Orchestrator breaks down the task
    const orchestratorResult = await llm(\`Break down this task into subtasks: \${input}\`);
    
    // Parse the subtasks
    const subtasks = parseSubtasks(orchestratorResult);
    
    // Assign subtasks to workers
    const workerResults = await Promise.all(
      subtasks.map(subtask => llm(\`Complete this subtask: \${subtask}\`))
    );
    
    // Synthesize the results
    const synthesizedResult = await llm(\`
      Synthesize these results into a coherent response:
      \${workerResults.map((result, i) => \`Result \${i+1}: \${result}\`).join('\\n')}
    \`);
    
    return {
      status: 'success',
      subtasks,
      workerResults,
      result: synthesizedResult
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

const parseSubtasks = (orchestratorOutput) => {
  // Logic to extract subtasks from the orchestrator's output
  // This could involve parsing JSON, splitting by newlines, etc.
  return orchestratorOutput.split('\\n')
    .filter(line => line.trim().startsWith('- '))
    .map(line => line.replace('- ', '').trim());
};`,
    implementation: [
      'Import the Azure AI SDK and set up authentication',
      'Create the orchestrator function to break down complex tasks',
      'Implement logic to parse subtasks from orchestrator output',
      'Create worker functions to process individual subtasks',
      'Build a synthesizer function to combine worker outputs',
      'Implement error handling and task coordination',
      'Add monitoring for subtask progress and failures',
      'Return the final synthesized result'
    ]
  },
  {
    id: 'evaluator-optimizer',
    name: 'Evaluator-Optimizer',
    description: 'Here one LLM call generates a output while another provides evaluation and feedback in a loop.',
    useCases: ['Data Science Agents', 'Real-Time data monitoring'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'Input', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'generator',
        type: 'default',
        data: { label: 'Generator', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'evaluator',
        type: 'default',
        data: { label: 'Evaluator', nodeType: 'evaluator' },
        position: { x: 500, y: 150 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 700, y: 150 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'generator', animated: true },
      { id: 'e2-3', source: 'generator', target: 'evaluator', label: 'Response' },
      { id: 'e3-4', source: 'evaluator', target: 'output', animated: true },
      { id: 'e3-2', source: 'evaluator', target: 'generator', animated: true, label: 'Rejected', style: { stroke: '#f43f5e', strokeWidth: 2 } }
    ],
    codeExample: `// Evaluator-Optimizer implementation
const executeEvaluatorOptimizer = async (input: string, maxAttempts = 3) => {
  try {
    let attempts = 0;
    let isAccepted = false;
    let generatedContent = '';
    let evaluationFeedback = '';
    
    while (!isAccepted && attempts < maxAttempts) {
      attempts++;
      
      // Generator creates content
      generatedContent = await llm(\`
        Generate content for: \${input}
        \${attempts > 1 ? \`Based on this feedback: \${evaluationFeedback}\` : ''}
      \`);
      
      // Evaluator assesses the content
      const evaluation = await llm(\`
        Evaluate this content for \${input}:
        ---
        \${generatedContent}
        ---
        Provide a score from 0-10 and specific feedback for improvement.
      \`);
      
      // Extract score and feedback
      const { score, feedback } = parseEvaluation(evaluation);
      evaluationFeedback = feedback;
      
      // Check if content meets quality threshold
      isAccepted = score >= 7;
      
      console.log(\`Attempt \${attempts}: Score \${score}/10\`);
    }
    
    return {
      status: isAccepted ? 'success' : 'partial_success',
      result: generatedContent,
      attempts,
      feedback: evaluationFeedback
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

const parseEvaluation = (evaluation) => {
  // Extract score (assuming format like "Score: 8/10")
  const scoreMatch = evaluation.match(/Score:?\\s*(\\d+)(?:\\/10)?/i);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  
  // Extract feedback (everything after "Feedback:" or similar)
  const feedbackMatch = evaluation.match(/Feedback:?\\s*(.+)$/is);
  const feedback = feedbackMatch ? feedbackMatch[1].trim() : '';
  
  return { score, feedback };
};`,
    implementation: [
      'Import the Azure AI SDK and set up authentication',
      'Create the generator function to produce initial content',
      'Implement the evaluator function with clear quality criteria',
      'Design a feedback loop with iteration count limits',
      'Set up a parsing mechanism for structured evaluation output',
      'Add logic to determine when content quality is sufficient',
      'Implement tracking for evaluation metrics across iterations',
      'Return the final content along with quality metrics'
    ]
  },
  {
    id: 'routing',
    name: 'Routing',
    description: 'It classifies an input and directs it to a specialized followup task. This workflow allows for separation of concerns.',
    useCases: ['Customer Support Agents', 'MAD (Multi-Agent Debate)'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'Input', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'router',
        type: 'default',
        data: { label: 'Router', nodeType: 'router' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'specialist1',
        type: 'default',
        data: { label: 'Specialist 1', nodeType: 'llm' },
        position: { x: 500, y: 50 }
      },
      {
        id: 'specialist2',
        type: 'default',
        data: { label: 'Specialist 2', nodeType: 'llm' },
        position: { x: 500, y: 150 }
      },
      {
        id: 'specialist3',
        type: 'default',
        data: { label: 'Specialist 3', nodeType: 'llm' },
        position: { x: 500, y: 250 }
      },
      {
        id: 'output1',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 700, y: 50 }
      },
      {
        id: 'output2',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 700, y: 150 }
      },
      {
        id: 'output3',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 700, y: 250 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'router', animated: true },
      { id: 'e2-3', source: 'router', target: 'specialist1', style: { strokeDasharray: '5, 5' } },
      { id: 'e2-4', source: 'router', target: 'specialist2', style: { strokeDasharray: '5, 5' } },
      { id: 'e2-5', source: 'router', target: 'specialist3', style: { strokeDasharray: '5, 5' } },
      { id: 'e3-6', source: 'specialist1', target: 'output1' },
      { id: 'e4-7', source: 'specialist2', target: 'output2' },
      { id: 'e5-8', source: 'specialist3', target: 'output3' }
    ],
    codeExample: `// Routing implementation
const executeRouting = async (input: string) => {
  try {
    // Router classifies the input
    const routingResult = await llm(\`
      Classify the following input into exactly ONE of these categories:
      1. Technical Support
      2. Billing Question
      3. General Inquiry
      
      Input: "\${input}"
      
      Category (respond with only the number):
    \`);
    
    // Clean and parse the routing result
    const category = parseInt(routingResult.trim().match(/\\d+/)?.[0] || '0', 10);
    
    // Route to the appropriate specialist
    let specialistResponse;
    let specialistType;
    
    switch (category) {
      case 1:
        specialistType = 'Technical Support';
        specialistResponse = await llm(\`
          You are a technical support specialist. Help with this issue:
          \${input}
        \`);
        break;
      case 2:
        specialistType = 'Billing Specialist';
        specialistResponse = await llm(\`
          You are a billing specialist. Address this question:
          \${input}
        \`);
        break;
      default:
        specialistType = 'Customer Service';
        specialistResponse = await llm(\`
          You are a customer service representative. Respond to this inquiry:
          \${input}
        \`);
        break;
    }
    
    return {
      status: 'success',
      category,
      specialistType,
      result: specialistResponse
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};`,
    implementation: [
      'Import the Azure AI SDK and set up authentication',
      'Create a router function that classifies incoming requests',
      'Define specialist functions for each routing category',
      'Implement clean routing logic with error handling',
      'Design prompts that clearly indicate specialist roles',
      'Add logging for routing decisions and specialist performance',
      'Support dynamic routing based on load or specialist availability',
      'Return results with metadata about the routing decision'
    ]
  },
  {
    id: 'autonomous-workflow',
    name: 'Autonomous Workflow',
    description: 'Agents are typically implemented as an LLM performing actions based on environmental feedback in a loop.',
    useCases: ['Autonomous Embodied Agents', 'Computer Using Agents (CUA)'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'Input', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'llm',
        type: 'default',
        data: { label: 'LLM Call', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'environment',
        type: 'default',
        data: { label: 'Environment', nodeType: 'tool' },
        position: { x: 500, y: 150 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 700, y: 150 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'llm', animated: true },
      { id: 'e2-3', source: 'llm', target: 'environment', animated: true, label: 'Action' },
      { id: 'e3-2', source: 'environment', target: 'llm', animated: true, label: 'Feedback' },
      { id: 'e3-4', source: 'environment', target: 'output' },
      { id: 'e2-4', source: 'llm', target: 'output', style: { strokeDasharray: '5, 5' }, label: 'Stop' }
    ],
    codeExample: `// Autonomous Workflow implementation
const executeAutonomousWorkflow = async (input: string, maxSteps = 10) => {
  try {
    let steps = 0;
    let isDone = false;
    let currentState = input;
    let history = [];
    
    // Track available environment tools
    const tools = {
      search: async (query) => {
        return \`Results for "\${query}": [simulated search results]\`;
      },
      calculate: (expression) => {
        try {
          return \`Result: \${eval(expression)}\`;
        } catch (err) {
          return \`Error calculating "\${expression}": \${err.message}\`;
        }
      },
      // Add more tools as needed
    };
    
    while (!isDone && steps < maxSteps) {
      steps++;
      
      // LLM decides next action
      const agentResponse = await llm(\`
        You are an autonomous agent solving a task.
        
        Current task: \${input}
        Current state: \${currentState}
        
        History:
        \${history.map(h => \`- \${h}\`).join('\\n')}
        
        Available tools:
        - search(query): Search for information
        - calculate(expression): Evaluate mathematical expressions
        
        Decide what to do next. Output must be in this JSON format:
        {
          "thought": "your reasoning",
          "action": "search OR calculate OR finish",
          "input": "tool input if action is a tool, or final answer if action is finish",
        }
      \`);
      
      // Parse the agent's response
      const decision = parseAgentDecision(agentResponse);
      history.push(\`Step \${steps}: \${decision.thought}\`);
      
      // Execute the chosen action
      if (decision.action === 'finish') {
        isDone = true;
        currentState = decision.input; // Final answer
      } else if (tools[decision.action]) {
        const toolResult = await tools[decision.action](decision.input);
        currentState = toolResult;
        history.push(\`Tool (\${decision.action}): \${toolResult}\`);
      } else {
        history.push(\`Error: Unknown action "\${decision.action}"\`);
      }
    }
    
    return {
      status: isDone ? 'success' : 'max_steps_reached',
      steps,
      history,
      result: currentState
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

const parseAgentDecision = (response) => {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse agent decision:', error);
  }
  
  // Fallback with default action
  return {
    thought: "Failed to parse decision",
    action: "finish",
    input: "I encountered an error and cannot continue."
  };
};`,
    implementation: [
      'Import the Azure AI SDK and set up authentication',
      'Define the environment interface with available tools',
      'Create a function for the main agent loop',
      'Implement LLM decision-making with structured output',
      'Build parsing logic for extracting decisions from LLM output',
      'Add tool execution functionality with proper error handling',
      'Implement a history tracking mechanism for context',
      'Include termination conditions and maximum step limits',
      'Return the final state and execution history'
    ]
  },
  {
    id: 'reflexion',
    name: 'Reflexion',
    description: 'It is an architecture designed to learn through verbal feedback and self-reflection.',
    useCases: ['Complex KPI Monitoring', 'Full-Stack App building agent'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'Input', nodeType: 'input' },
        position: { x: 100, y: 100 }
      },
      {
        id: 'responder',
        type: 'default',
        data: { label: 'Responder', nodeType: 'llm' },
        position: { x: 250, y: 100 }
      },
      {
        id: 'initialResponse',
        type: 'default',
        data: { label: 'Initial Response', nodeType: 'output' },
        position: { x: 400, y: 50 }
      },
      {
        id: 'revisor',
        type: 'default',
        data: { label: 'Revisor', nodeType: 'llm' },
        position: { x: 550, y: 150 }
      },
      {
        id: 'tools',
        type: 'default',
        data: { label: 'Execute Tools', nodeType: 'tool' },
        position: { x: 700, y: 100 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 400, y: 200 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'responder', animated: true },
      { id: 'e2-3', source: 'responder', target: 'initialResponse' },
      { id: 'e3-4', source: 'initialResponse', target: 'revisor', animated: true },
      { id: 'e4-5', source: 'revisor', target: 'tools', label: 'Revised Response' },
      { id: 'e5-4', source: 'tools', target: 'revisor', label: "'n' times" },
      { id: 'e5-6', source: 'tools', target: 'output', animated: true }
    ],
    codeExample: `// Reflexion implementation
const executeReflexion = async (input: string, maxIterations = 3) => {
  try {
    // Generate initial response
    const initialResponse = await llm(\`
      Respond to this request: \${input}
    \`);
    
    let currentResponse = initialResponse;
    let iterations = 0;
    let feedback = '';
    
    while (iterations < maxIterations) {
      iterations++;
      
      // Self-reflection and revision
      const reflection = await llm(\`
        You are a self-critical AI. Review this response:
        ---
        Request: \${input}
        Response: \${currentResponse}
        ---
        
        Provide specific criticism and suggestions for improvement.
        What's missing? What could be clearer? What assumptions were made?
      \`);
      
      // Generate improved response based on reflection
      const revisedResponse = await llm(\`
        Original request: \${input}
        
        Your previous response: \${currentResponse}
        
        Self-reflection feedback: \${reflection}
        
        Write an improved response incorporating the feedback.
      \`);
      
      feedback = reflection;
      currentResponse = revisedResponse;
      
      // Check if revision is substantially different
      const differenceCheck = await llm(\`
        Compare these two responses:
        
        Original: \${initialResponse}
        Revised: \${currentResponse}
        
        On a scale of 0-10, how significantly has the response improved?
        Respond with just the number.
      \`);
      
      const improvementScore = parseInt(differenceCheck.match(/\\d+/)?.[0] || '0', 10);
      
      // If improvement is minimal, break the loop
      if (improvementScore < 3 && iterations > 1) {
        break;
      }
    }
    
    return {
      status: 'success',
      initialResponse,
      finalResponse: currentResponse,
      iterations,
      feedback
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};`,
    implementation: [
      'Import the Azure AI SDK and set up authentication',
      'Create a function to generate the initial response',
      'Build a self-reflection component to critically analyze responses',
      'Implement a revision process based on reflection feedback',
      'Add iteration limiting and improvement measurement',
      'Design prompts that encourage critical thinking',
      'Track the evolution of responses across iterations',
      'Implement tools for verification and fact-checking',
      'Return both initial and final responses with improvement metrics'
    ]
  },
  {
    id: 'plan-and-execute',
    name: 'Plan and Execute',
    description: 'An agent generates subtasks, specialized agents solve them, and results are sent back to the planner.',
    useCases: ['Business Process Automation', 'Data Pipeline Orchestration'],
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'Input', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'planner',
        type: 'default',
        data: { label: 'Planner', nodeType: 'planner' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'taskList',
        type: 'default',
        data: { label: 'Task Lists', nodeType: 'output' },
        position: { x: 500, y: 50 }
      },
      {
        id: 'agent',
        type: 'default',
        data: { label: 'Single Task Agents', nodeType: 'llm' },
        position: { x: 500, y: 250 }
      },
      {
        id: 'tools',
        type: 'default',
        data: { label: 'Tools', nodeType: 'tool' },
        position: { x: 700, y: 250 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 300, y: 300 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'input', target: 'planner', animated: true },
      { id: 'e2-3', source: 'planner', target: 'taskList', label: 'Generate Tasks' },
      { id: 'e3-4', source: 'taskList', target: 'agent', label: 'Assign Tasks' },
      { id: 'e4-5', source: 'agent', target: 'tools', animated: true },
      { id: 'e5-2', source: 'tools', target: 'planner', animated: true, label: 'Update Task', style: { strokeDasharray: '5, 5' } },
      { id: 'e2-6', source: 'planner', target: 'output', animated: true, label: 'Replan' }
    ],
    codeExample: `// Plan and Execute implementation
const executePlanAndExecute = async (input: string) => {
  try {
    // Planning phase
    const planningResult = await llm(\`
      You are a task planning AI.
      For the following task, create a step-by-step plan with 3-5 clear subtasks.
      Each subtask should be specific and actionable.
      
      Task: \${input}
      
      Format your response as JSON:
      {
        "plan": "overall strategy",
        "subtasks": [
          {"id": "1", "description": "subtask 1", "status": "pending"},
          {"id": "2", "description": "subtask 2", "status": "pending"}
        ]
      }
    \`);
    
    // Parse the plan
    const planObj = parseJSON(planningResult);
    let plan = planObj.plan;
    let subtasks = planObj.subtasks;
    
    // Track results for each subtask
    const subtaskResults = {};
    
    // Execute each subtask
    for (const subtask of subtasks) {
      // Update subtask status
      subtask.status = 'in_progress';
      
      // Execute the subtask with a specialized agent
      const subtaskResult = await executeSubtask(subtask.description);
      subtaskResults[subtask.id] = subtaskResult;
      
      // Update subtask status
      subtask.status = 'completed';
      
      // Check if we need to replan based on new information
      const shouldReplan = await checkIfReplanNeeded(plan, subtasks, subtaskResults);
      if (shouldReplan) {
        // Generate updated plan
        const replanResult = await llm(\`
          You are a task planning AI.
          You need to update your plan based on new information.
          
          Original task: \${input}
          Current plan: \${plan}
          Completed subtasks and results:
          \${Object.entries(subtaskResults).map(([id, result]) => 
            \`- Subtask \${id}: \${subtasks.find(s => s.id === id).description}\\n  Result: \${result}\`
          ).join('\\n')}
          
          Create an updated plan with remaining and new subtasks.
          Format your response as JSON:
          {
            "plan": "updated strategy",
            "subtasks": [
              {"id": "X", "description": "subtask X", "status": "pending"}
            ]
          }
        \`);
        
        // Update plan and subtasks
        const updatedPlanObj = parseJSON(replanResult);
        plan = updatedPlanObj.plan;
        
        // Merge existing completed tasks with new tasks
        const completedTaskIds = subtasks.filter(s => s.status === 'completed').map(s => s.id);
        subtasks = [
          ...subtasks.filter(s => s.status === 'completed'),
          ...updatedPlanObj.subtasks.filter(s => !completedTaskIds.includes(s.id))
        ];
      }
    }
    
    // Final synthesis
    const finalResult = await llm(\`
      Synthesize the results of these subtasks into a comprehensive response:
      
      Original task: \${input}
      Plan: \${plan}
      
      Subtasks and results:
      \${Object.entries(subtaskResults).map(([id, result]) => 
        \`- Subtask \${id}: \${subtasks.find(s => s.id === id).description}\\n  Result: \${result}\`
      ).join('\\n')}
    \`);
    
    return {
      status: 'success',
      plan,
      subtasks,
      subtaskResults,
      result: finalResult
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

const executeSubtask = async (subtaskDescription) => {
  // Execute a single subtask using appropriate agent and tools
  return await llm(\`Execute this specific task: \${subtaskDescription}\`);
};

const checkIfReplanNeeded = async (plan, subtasks, results) => {
  // Check if we need to replan based on subtask results
  // For simplicity, randomly decide to replan 20% of the time
  return Math.random() < 0.2;
};

const parseJSON = (jsonString) => {
  try {
    // Extract JSON from response
    const jsonMatch = jsonString.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse JSON:', error);
  }
  
  // Return default structure if parsing fails
  return { 
    plan: "Default plan due to parsing error", 
    subtasks: [{ id: "1", description: "Review the original task", status: "pending" }]
  };
};`,
    implementation: [
      'Import the Azure AI SDK and set up authentication',
      'Create a planning component that breaks tasks into subtasks',
      'Design a subtask execution engine with specialized agents',
      'Implement a task tracking system for monitoring progress',
      'Build a replanning mechanism for adaptive workflows',
      'Create a result synthesis component for final output',
      'Add error handling and recovery strategies',
      'Implement tools access for subtask execution',
      'Support dependencies between subtasks in planning'
    ]
  }
];