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
  category?: string
  nodes: PatternNode[]
  edges: PatternEdge[]
  useCases: string[]
  codeExample: string
  pythonCodeExample?: string // Made optional as not all patterns have it
  implementation: string[]
  whenToUse?: string
  advantages?: string[]
}

export const agentPatterns: PatternData[] = [
  {
    id: 'react-agent',
    name: 'ReAct Agent',
    description: 'A reasoning and acting framework where an agent alternates between reasoning (using LLMs) and acting (using tools like Google or email).',
    category: 'Core',
    useCases: ['Multi-Step Problem Solving', 'Research Tasks', 'Information Gathering'],
    whenToUse: 'Use the ReAct pattern when your task requires the agent to gather external information and reason about it iteratively. It\'s ideal for complex inquiries that need multiple tool interactions, such as research questions, multi-step problem-solving, or scenarios where an agent needs to evaluate its actions and adjust its approach based on new information.',
    nodes: [
      {
        id: 'input',
        type: 'input',
        data: { label: 'User Query', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'llm1',
        type: 'default',
        data: { label: 'LLM 1 (Reason)', nodeType: 'llm' },
        position: { x: 300, y: 100 }
      },
      {
        id: 'tools',
        type: 'default',
        data: { label: 'Tools', nodeType: 'tool' },
        position: { x: 500, y: 100 }
      },
      {
        id: 'llm2',
        type: 'default',
        data: { label: 'LLM 2 (Act)', nodeType: 'llm' },
        position: { x: 300, y: 200 }
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
      { id: 'e2-3', source: 'llm1', target: 'tools', animated: true, label: 'Reason' },
      { id: 'e3-4', source: 'tools', target: 'llm2', animated: true },
      { id: 'e4-2', source: 'llm2', target: 'llm1', animated: true, label: 'Action' },
      { id: 'e2-5', source: 'llm1', target: 'output', animated: true }
    ],
    codeExample: `// ReAct Agent implementation
const executeReAct = async (query: string, maxCycles = 5) => {
  try {
    let currentCycle = 0;
    let done = false;
    let contextHistory = [];
    let finalAnswer = '';

    // Add initial query to context
    contextHistory.push(\`User query: \${query}\`);

    // Available tools
    const tools = {
      search: async (query) => {
        return "Search results for \\"" + query + "\\": [simulated search results]";
      },
      calculate: (expression) => {
        try {
          return "Calculation result: " + eval(expression);
        } catch (error) {
          return "Error in calculation: " + error.message;
        }
      },
      lookup: (entity) => {
        return "Information about " + entity + ": [simulated encyclopedia entry]";
      }
    };

    while (!done && currentCycle < maxCycles) {
      currentCycle++;
      
      // Step 1: Reasoning phase
      console.log(\`Cycle \${currentCycle}: Reasoning...\`);
      
      const reasoningPrompt = \`
        You are a ReAct agent that solves problems through cycles of reasoning and action.
        
        Task: \${query}
        
        Previous steps:
        \${contextHistory.join('\\n')}
        
        Think step by step about the problem. Either:
        1. Use a tool to gather more information by responding with:
           Thought: <your reasoning>
           Action: <tool_name>
           Action Input: <tool input>
           
        2. Or provide the final answer if you have enough information:
           Thought: <your reasoning>
           Final Answer: <your answer>
      \`;
      
      const reasoningResponse = await llm(reasoningPrompt);
      contextHistory.push(reasoningResponse);
      
      // Parse the reasoning response
      if (reasoningResponse.includes('Final Answer:')) {
        // Extract the final answer
        const answerMatch = reasoningResponse.match(/Final Answer:(.*?)$/s);
        if (answerMatch) {
          finalAnswer = answerMatch[1].trim();
          done = true;
        }
      } else {
        // Extract tool call
        const actionMatch = reasoningResponse.match(/Action:(.*?)\\n/);
        const actionInputMatch = reasoningResponse.match(/Action Input:(.*?)(?:\\n|$)/s);
        
        if (actionMatch && actionInputMatch) {
          const toolName = actionMatch[1].trim();
          const toolInput = actionInputMatch[1].trim();
          
          // Step 2: Action phase - call the appropriate tool
          console.log(\`Cycle \${currentCycle}: Taking action with tool "\\\${toolName}"...\`);
          
          if (tools[toolName]) {
            const toolResult = await tools[toolName](toolInput);
            contextHistory.push(\`Observation: \${toolResult}\`);
          } else {
            contextHistory.push(\`Observation: Error - Tool "\\\${toolName}" not found.\`);
          }
        }
      }
    }
    
    return {
      status: done ? 'success' : 'max_cycles_reached',
      cycles: currentCycle,
      result: finalAnswer || 'No final answer reached.',
      history: contextHistory
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};`,
    pythonCodeExample: `# ReAct Agent implementation
import openai
import json
from typing import Dict, List, Any, Optional, Union

class ReActAgent:
    def __init__(self, client, model: str = "gpt-4"):
        self.client = client
        self.model = model
        
    async def execute(self, query: str, max_cycles: int = 5) -> Dict[str, Any]:
        """Execute the ReAct agent to solve a problem through reasoning and action cycles."""
        try:
            current_cycle = 0
            done = False
            context_history = []
            final_answer = ""
            
            # Add initial query to context
            context_history.append(f"User query: {query}")
            
            # Available tools
            tools = {
                "search": self._search_tool,
                "calculate": self._calculate_tool,
                "lookup": self._lookup_tool
            }
            
            while not done and current_cycle < max_cycles:
                current_cycle += 1
                
                # Step 1: Reasoning phase
                print(f"Cycle {current_cycle}: Reasoning...")
                
                reasoning_prompt = f"""
                You are a ReAct agent that solves problems through cycles of reasoning and action.
                
                Task: {query}
                
                Previous steps:
                {chr(10).join(context_history)}
                
                Think step by step about the problem. Either:
                1. Use a tool to gather more information by responding with:
                   Thought: <your reasoning>
                   Action: <tool_name>
                   Action Input: <tool input>
                   
                2. Or provide the final answer if you have enough information:
                   Thought: <your reasoning>
                   Final Answer: <your answer>
                """
                
                reasoning_response = await self._llm_call(reasoning_prompt)
                context_history.append(reasoning_response)
                
                # Parse the reasoning response
                if "Final Answer:" in reasoning_response:
                    # Extract the final answer
                    answer_parts = reasoning_response.split("Final Answer:")
                    if len(answer_parts) > 1:
                        final_answer = answer_parts[1].strip()
                        done = True
                else:
                    # Extract tool call
                    action_match = None
                    action_input_match = None
                    
                    for line in reasoning_response.split('\\n'):
                        if line.startswith("Action:"):
                            action_match = line.replace("Action:", "").strip()
                        elif line.startswith("Action Input:"):
                            action_input_match = line.replace("Action Input:", "").strip()
                    
                    if action_match and action_input_match:
                        tool_name = action_match
                        tool_input = action_input_match
                        
                        # Step 2: Action phase - call the appropriate tool
                        print(f'Cycle {current_cycle}: Taking action with tool "{tool_name}"...')
                        
                        if tool_name in tools:
                            tool_result = await tools[tool_name](tool_input)
                            context_history.append(f"Observation: {tool_result}")
                        else:
                            context_history.append(f'Observation: Error - Tool "{tool_name}" not found.')
            
            return {
                "status": "success" if done else "max_cycles_reached",
                "cycles": current_cycle,
                "result": final_answer if final_answer else "No final answer reached.",
                "history": context_history
            }
            
        except Exception as error:
            return {"status": "failed", "reason": str(error)}
    
    async def _llm_call(self, prompt: str) -> str:
        """Call the LLM with the given prompt."""
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    
    async def _search_tool(self, query: str) -> str:
        """Simulate web search results."""
        return f'Search results for "{query}": [simulated search results]'
    
    async def _calculate_tool(self, expression: str) -> str:
        """Calculate mathematical expressions."""
        try:
            result = eval(expression)
            return "Calculation result: " + str(result)
        except Exception as error:
            return "Error in calculation: " + str(error)
    
    async def _lookup_tool(self, entity: str) -> str:
        """Look up information about an entity."""
        return f"Information about {entity}: [simulated encyclopedia entry]"

# Example usage
async def main():
    client = openai.AsyncOpenAI()  # Initialize with your API key
    agent = ReActAgent(client)
    result = await agent.execute("What is the capital of France and what is its population?")
    print(json.dumps(result, indent=2))

# Run the example
# import asyncio
# asyncio.run(main())
`,
    implementation: [
      'Import necessary libraries and set up environment',
      'Define available tools that the agent can use (search, calculate, etc.)',
      'Create the main ReAct loop that alternates between reasoning and acting',
      'Implement parsing logic to extract actions from LLM output',
      'Build a context tracking system to maintain conversation history',
      'Add termination conditions to know when the answer is found',
      'Implement error handling and maximum cycle limitations',
      'Format the final response with relevant context'
    ]
  },
  {
    id: 'codeact-agent',
    name: 'CodeAct Agent',
    description: 'Allows agents to autonomously execute Python code instead of using JSON, enabling them to handle complex tasks more efficiently.',
    category: 'Core',
    useCases: ['Complex Computational Tasks', 'Data Analysis', 'Algorithmic Problem Solving'],
    whenToUse: 'Select the CodeAct pattern when your tasks involve complex computations, data manipulation, or algorithmic problem solving that would benefit from actual code execution. It\'s particularly valuable for data science workflows, mathematical computations, and situations where the agent needs to process structured data dynamically rather than relying on pre-defined API calls.',
    nodes: [
      {
        id: 'user',
        type: 'input',
        data: { label: 'User', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'agent',
        type: 'default',
        data: { label: 'Agent', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'think',
        type: 'default',
        data: { label: 'Think', nodeType: 'llm' },
        position: { x: 400, y: 250 }
      },
      {
        id: 'codeact',
        type: 'default',
        data: { label: 'CodeAct', nodeType: 'tool' },
        position: { x: 500, y: 150 }
      },
      {
        id: 'environment',
        type: 'default',
        data: { label: 'Environment', nodeType: 'tool' },
        position: { x: 700, y: 150 }
      },
      {
        id: 'result',
        type: 'output',
        data: { label: 'Result', nodeType: 'output' },
        position: { x: 300, y: 50 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'user', target: 'agent', animated: true, label: 'Query' },
      { id: 'e2-3', source: 'agent', target: 'think' },
      { id: 'e3-2', source: 'think', target: 'agent' },
      { id: 'e2-4', source: 'agent', target: 'codeact', animated: true, label: 'Action' },
      { id: 'e4-5', source: 'codeact', target: 'environment' },
      { id: 'e5-2', source: 'environment', target: 'agent', label: 'Observation', animated: true },
      { id: 'e2-6', source: 'agent', target: 'result', animated: true }
    ],
    codeExample: `// CodeAct Agent implementation
const executeCodeAct = async (query, maxCycles = 5) => {
  try {
    let currentCycle = 0;
    let done = false;
    let contextHistory = [];
    let finalResult = '';

    // Simulate Python code execution environment
    const executeCode = async (code) => {
      console.log("Executing Python code (simulated):");
      console.log(code);
      
      // This is a simulation - in a real implementation, this would execute Python code
      // and return the results. For this example, we'll return a simulated result.
      
      if (code.includes('import')) {
        if (code.includes('numpy') || code.includes('pandas')) {
          return "Library imported successfully.";
        }
      }
      
      if (code.includes('print(')) {
        const printMatch = code.match(/print\\(([^)]+)\\)/);
        if (printMatch) {
          return "Output: " + printMatch[1];
        }
      }
      
      if (code.includes('def ')) {
        return "Function defined successfully.";
      }
      
      // Default simulated response
      return "Code executed. Result: [simulated output based on the provided code]";
    };

    // Add the initial query to context
    contextHistory.push("User query: " + query);

    while (!done && currentCycle < maxCycles) {
      currentCycle++;
      
      // Generate agent response
      const agentPrompt = 
        "You are a CodeAct agent that solves problems by writing and executing Python code.\\n\\n" +
        "Task: " + query + "\\n\\n" +
        "Previous interactions:\\n" + 
        contextHistory.join('\\n\\n') + "\\n\\n" +
        "Based on the current state, either:\\n\\n" +
        "1. Write Python code to make progress, formatted as:\\n" +
        "   Thought: <your reasoning>\\n" +
        "   Code:\\n" +
        "   code block:\\n" +
        "   # Your Python code here\\n" +
        "   end code\\n\\n" +
        "2. Or provide the final answer if you've solved the problem:\\n" +
        "   Thought: <your reasoning>\\n" +
        "   Final Answer: <your answer>";
      
      const agentResponse = await llm(agentPrompt);
      contextHistory.push("Agent: " + agentResponse);
      
      // Check if the response contains a final answer
      if (agentResponse.includes('Final Answer:')) {
        const answerMatch = agentResponse.match(/Final Answer:(.*?)$/s);
        if (answerMatch) {
          finalResult = answerMatch[1].trim();
          done = true;
        }
      } 
      // Check if the response contains code
      else if (agentResponse.includes("\`\`\`")) {
        // Extract code block
        const codeMatch = agentResponse.match(/\`\`\`\\s*([\\s\\S]*?)\\s*\`\`\`/);
        if (codeMatch) {
          const code = codeMatch[1].trim();
          
          // Execute the code (simulated)
          const executionResult = await executeCode(code);
          
          // Add the observation to the history
          contextHistory.push("Observation: " + executionResult);
        }
      }
    }
    
    return {
      status: done ? 'success' : 'max_cycles_reached',
      cycles: currentCycle,
      result: finalResult || 'No final result reached.',
      history: contextHistory
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};`,
    implementation: [
      'Set up a secure Python code execution environment',
      'Create an agent interface that can generate Python code',
      'Implement code extraction and parsing from LLM output',
      'Build a feedback mechanism to return execution results to the agent',
      'Add context tracking to maintain the conversation and code history',
      'Implement appropriate safeguards and limitations on code execution',
      'Create termination conditions for task completion',
      'Format the final result with relevant outputs and explanations'
    ]
  },
  {
    id: 'self-reflection',
    name: 'Self-Reflection',
    description: 'An agent that self-evaluates its outputs, using feedback to identify errors, and iteratively improves via learning or critiques.',
    category: 'Advanced',
    useCases: ['Content Generation', 'Decision Making', 'Problem Solving'],
    whenToUse: 'Implement Self-Reflection when output quality and accuracy are critical, especially for high-stakes content generation or complex reasoning tasks. This pattern is particularly valuable when generating content that requires factual accuracy, logical consistency, and comprehensive coverage of a topic, as it enables the agent to identify and correct its own errors through iterative improvement.',
    nodes: [
      {
        id: 'user',
        type: 'input',
        data: { label: 'User', nodeType: 'input' },
        position: { x: 100, y: 100 }
      },
      {
        id: 'main-llm',
        type: 'default',
        data: { label: 'Main LLM', nodeType: 'llm' },
        position: { x: 300, y: 100 }
      },
      {
        id: 'memory',
        type: 'default',
        data: { label: 'Memory', nodeType: 'tool' },
        position: { x: 200, y: 200 }
      },
      {
        id: 'tools',
        type: 'default',
        data: { label: 'Tools', nodeType: 'tool' },
        position: { x: 300, y: 250 }
      },
      {
        id: 'first-draft',
        type: 'default',
        data: { label: 'First Draft', nodeType: 'output' },
        position: { x: 500, y: 100 }
      },
      {
        id: 'critique',
        type: 'default',
        data: { label: 'Critique', nodeType: 'llm' },
        position: { x: 500, y: 250 }
      },
      {
        id: 'generator',
        type: 'default',
        data: { label: 'Generator', nodeType: 'llm' },
        position: { x: 100, y: 300 }
      },
      {
        id: 'result',
        type: 'output',
        data: { label: 'Result', nodeType: 'output' },
        position: { x: 100, y: 200 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'user', target: 'main-llm', animated: true, label: 'Query' },
      { id: 'e2-3', source: 'main-llm', target: 'memory', animated: true },
      { id: 'e2-4', source: 'main-llm', target: 'tools' },
      { id: 'e2-5', source: 'main-llm', target: 'first-draft', animated: true },
      { id: 'e5-6', source: 'first-draft', target: 'critique', animated: true },
      { id: 'e6-7', source: 'critique', target: 'generator', label: 'No' },
      { id: 'e7-2', source: 'generator', target: 'main-llm', animated: true },
      { id: 'e6-8', source: 'critique', target: 'result', label: 'Yes', animated: true }
    ],
    codeExample: `// Self-Reflection implementation
const executeSelfReflection = async (query: string, maxRevisions = 3) => {
  try {
    let revisions = 0;
    let currentResponse = '';
    let isAccepted = false;
    let reflectionHistory = [];
    
    // Initial response generation
    console.log("Generating initial response...");
    currentResponse = await llm(\`
      Provide a comprehensive response to this query:
      "\\\${query}"
    \`);
    
    reflectionHistory.push({
      version: 'initial',
      content: currentResponse,
      reflection: null
    });
    
    while (!isAccepted && revisions < maxRevisions) {
      revisions++;
      
      // Self-reflection/critique phase
      console.log(\`Performing self-reflection round \${revisions}...\`);
      const reflection = await llm(\`
        You are a critical evaluator. Analyze this response to the query:
        
        Query: "\\\${query}"
        
        Response:
        \${currentResponse}
        
        Provide a thorough critique identifying:
        1. Factual errors or inaccuracies
        2. Logical inconsistencies or gaps in reasoning
        3. Missing important perspectives or information
        4. Clarity and structure issues
        
        Then rate the response from 1-10 and decide if it needs revision.
        
        Format your response as:
        Critique: <your detailed critique>
        Score: <1-10>
        Needs Revision: <Yes/No>
      \`);
      
      // Parse the reflection results
      const scoreMatch = reflection.match(/Score:\\s*(\\d+)/i);
      const needsRevisionMatch = reflection.match(/Needs Revision:\\s*(Yes|No)/i);
      
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      const needsRevision = needsRevisionMatch 
        ? needsRevisionMatch[1].toLowerCase() === 'yes' 
        : score < 7;
      
      reflectionHistory.push({
        version: \`revision-\${revisions}\`,
        content: currentResponse,
        reflection: reflection,
        score: score
      });
      
      if (!needsRevision || score >= 8) {
        isAccepted = true;
        break;
      }
      
      // Generate improved version based on self-reflection
      console.log(\`Generating revision \${revisions} based on self-reflection...\`);
      currentResponse = await llm(\`
        You are tasked with improving a response based on self-critique.
        
        Original query: "\\\${query}"
        
        Previous response:
        \${currentResponse}
        
        Self-critique:
        \${reflection}
        
        Please provide an improved response that addresses all the issues identified in the critique.
      \`);
    }
    
    return {
      status: 'success',
      query: query,
      finalResponse: currentResponse,
      revisions: revisions,
      accepted: isAccepted,
      history: reflectionHistory
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};`,
    implementation: [
      'Create a main response generation function',
      'Implement a self-critique mechanism with specific evaluation criteria',
      'Design a scoring system to evaluate response quality',
      'Build an iterative improvement loop based on self-feedback',
      'Add a memory component to track changes over iterations',
      'Implement termination criteria based on quality thresholds',
      'Create logging for the self-improvement process',
      'Format the final output with quality metrics'
    ]
  },
  {
    id: 'agentic-rag',
    name: 'Agentic RAG',
    description: 'AI agents retrieving and evaluating relevant data to generate context-aware and well-reasoned output using memory and tools.',
    category: 'Advanced',
    useCases: ['Enterprise Knowledge Management', 'Research Analysis', 'Expert Systems'],
    whenToUse: 'Use Agentic RAG when you need to ground AI responses in specific knowledge bases or documents with high accuracy and relevance. This pattern is ideal for enterprise applications requiring access to proprietary information, expert systems that need domain-specific knowledge, or any context where responses must be based on authoritative sources rather than the LLM\'s pre-trained knowledge.',
    nodes: [
      {
        id: 'user',
        type: 'input',
        data: { label: 'User', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'agent',
        type: 'default',
        data: { label: 'Agent', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'tools',
        type: 'default',
        data: { label: 'Tools', nodeType: 'tool' },
        position: { x: 500, y: 100 }
      },
      {
        id: 'vector-search',
        type: 'default',
        data: { label: 'Vector Search', nodeType: 'tool' },
        position: { x: 500, y: 150 }
      },
      {
        id: 'vector-db',
        type: 'default',
        data: { label: 'Vector DB', nodeType: 'tool' },
        position: { x: 700, y: 150 }
      },
      {
        id: 'generator',
        type: 'default',
        data: { label: 'Generator', nodeType: 'llm' },
        position: { x: 300, y: 250 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 100, y: 250 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'user', target: 'agent', animated: true, label: 'Query' },
      { id: 'e2-3', source: 'agent', target: 'tools', animated: true },
      { id: 'e2-4', source: 'agent', target: 'vector-search', animated: true },
      { id: 'e4-5', source: 'vector-search', target: 'vector-db', animated: true },
      { id: 'e5-2', source: 'vector-db', target: 'agent', style: { strokeDasharray: '5, 5' } },
      { id: 'e2-6', source: 'agent', target: 'generator', animated: true },
      { id: 'e6-7', source: 'generator', target: 'output', animated: true }
    ],
    codeExample: `// Agentic RAG implementation
const executeAgenticRAG = async (query) => {
  try {
    // Simulated vector database and retrieval system
    const vectorDB = {
      search: async (query, topK = 3) => {
        console.log(\`Searching vector DB for: \${query}\`);
        // Simulate retrieving relevant chunks
        return [
          {
            content: \`Relevant information about \${query} - Part 1\`,
            source: "document1.pdf",
            score: 0.92
          },
          {
            content: \`Related context for \${query} - Part 2\`,
            source: "document2.pdf",
            score: 0.85
          },
          {
            content: \`Additional information related to \${query} - Part 3\`,
            source: "document3.pdf",
            score: 0.79
          }
        ].slice(0, topK);
      }
    };
    
    // Additional tools available to the agent
    const tools = {
      webSearch: async (subQuery) => {
        return \`Web search results for "\\\${subQuery}": [simulated web results]\`;
      },
      calculateRelevance: (chunk, query) => {
        // Simulate scoring relevance between a chunk and the query
        return { 
          score: 0.7 + Math.random() * 0.3,
          reasoning: \`This chunk addresses key aspects of "\\\${query}"\`
        };
      }
    };
    
    // Step 1: Query analysis
    console.log("Analyzing query...");
    const queryAnalysis = await llm(\`
      Analyze this query to identify key information needs and search terms:
      "\\\${query}"
      
      Provide:
      1. Core information need
      2. Key entities or concepts
      3. 2-3 specific search queries to find relevant information
      4. Any ambiguities that need clarification
      
      Format as JSON.
    \`, undefined, true);
    
    // Parse the query analysis
    const analysisObj = typeof queryAnalysis === 'string' 
      ? JSON.parse(queryAnalysis.match(/\\{[\\s\\S]*\\}/)[0])
      : queryAnalysis;
    
    // Step 2: Retrieve relevant information
    console.log("Retrieving relevant information...");
    const searchQueries = analysisObj.searchQueries || [query];
    
    // Execute multiple searches to gather diverse information
    const retrievalResults = await Promise.all(
      searchQueries.map(sq => vectorDB.search(sq))
    );
    
    // Flatten and deduplicate results
    const allChunks = [];
    const seenContent = new Set();
    
    retrievalResults.flat().forEach(chunk => {
      if (!seenContent.has(chunk.content)) {
        seenContent.add(chunk.content);
        allChunks.push(chunk);
      }
    });
    
    // Step 3: Evaluate and filter retrieved information
    console.log("Evaluating retrieved information...");
    const evaluatedChunks = allChunks.map(chunk => {
      const relevanceScore = tools.calculateRelevance(chunk.content, query);
      return {
        ...chunk,
        evaluatedScore: relevanceScore.score,
        evaluationReasoning: relevanceScore.reasoning
      };
    });
    
    // Sort by evaluation score and take top results
    const topChunks = evaluatedChunks
      .sort((a, b) => b.evaluatedScore - a.evaluatedScore)
      .slice(0, 5);
    
    // Step 4: Generate a comprehensive response
    console.log("Generating comprehensive response...");
    const responseContext = topChunks
      .map(function(chunk) { 
        return \`Source: \${chunk.source} (Score: \${chunk.evaluatedScore.toFixed(2)})\\n\${chunk.content}\`;
      })
      .join('\\n\\n');
    
    const response = await llm(\`
      You are an AI assistant with access to retrieved information.
      
      User query: "\\\${query}"
      
      Retrieved information:
      \${responseContext}
      
      Generate a comprehensive, accurate response based on the retrieved information.
      Include citations to sources when appropriate.
      If the retrieved information doesn't sufficiently answer the query, acknowledge the limitations.
    \`);
    
    return {
      status: 'success',
      query: query,
      result: response,
      retrievedChunks: topChunks,
      analysisResults: analysisObj
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};`,
    implementation: [
      'Set up vector database integration for knowledge retrieval',
      'Create query analysis functionality to identify key information needs',
      'Implement multi-query retrieval to gather diverse relevant information',
      'Build an evaluation system to assess and rank retrieved content',
      'Design a response generator that incorporates retrieved context',
      'Add citation and attribution capabilities for source tracking',
      'Implement relevance scoring for retrieved chunks',
      'Create logging and monitoring for retrieval effectiveness'
    ]
  },
  {
    id: 'modern-tool-use',
    name: 'Modern Tool Use',
    description: 'Enables agents to leverage tools like Kagi Search, AWS and others using MCP for enhanced functionality with minimal code execution.',
    useCases: ['API Integration', 'Multi-modal Tasks', 'Data Processing'],
    whenToUse: 'Apply Modern Tool Use when your agent needs secure and standardized access to external APIs and services without requiring direct code execution. This pattern is particularly beneficial for production environments where security and reliability are paramount, or when integrating with a diverse set of external tools through a consistent interface.',
    nodes: [
      {
        id: 'query',
        type: 'input',
        data: { label: 'Query', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'agent',
        type: 'default',
        data: { label: 'Agent', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'mcp-server1',
        type: 'default',
        data: { label: 'MCP Server 1', nodeType: 'tool' },
        position: { x: 450, y: 100 }
      },
      {
        id: 'mcp-server2',
        type: 'default',
        data: { label: 'MCP Server 2', nodeType: 'tool' },
        position: { x: 450, y: 200 }
      },
      {
        id: 'api1',
        type: 'default',
        data: { label: 'API', nodeType: 'tool' },
        position: { x: 600, y: 100 }
      },
      {
        id: 'api2',
        type: 'default',
        data: { label: 'API', nodeType: 'tool' },
        position: { x: 600, y: 200 }
      },
      {
        id: 'search-kagi',
        type: 'default',
        data: { label: 'Search (Kagi)', nodeType: 'tool' },
        position: { x: 750, y: 100 }
      },
      {
        id: 'cloud-aws',
        type: 'default',
        data: { label: 'Cloud (AWS)', nodeType: 'tool' },
        position: { x: 750, y: 200 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Output', nodeType: 'output' },
        position: { x: 500, y: 300 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'query', target: 'agent', animated: true },
      { id: 'e2-3', source: 'agent', target: 'mcp-server1', animated: true },
      { id: 'e2-4', source: 'agent', target: 'mcp-server2', animated: true },
      { id: 'e3-5', source: 'mcp-server1', target: 'api1', animated: true },
      { id: 'e4-6', source: 'mcp-server2', target: 'api2', animated: true },
      { id: 'e5-7', source: 'api1', target: 'search-kagi', animated: true },
      { id: 'e6-8', source: 'api2', target: 'cloud-aws', animated: true },
      { id: 'e2-9', source: 'agent', target: 'output', animated: true }
    ],
    codeExample: `// Modern Tool Use implementation
const executeModernToolUse = async (query: string) => {
  try {
    // Simulate MCP-enabled tools
    const tools = {
      kagiSearch: async (searchQuery) => {
        console.log(\`Performing Kagi search for: "\\\${searchQuery}"\`);
        // Simulate Kagi search results
        return {
          results: [
            {
              title: \`Search result 1 for "\\\${searchQuery}"\`,
              snippet: \`Relevant information about \${searchQuery}...\`,
              url: \`https://example.com/result1\`
            },
            {
              title: \`Search result 2 for "\\\${searchQuery}"\`,
              snippet: \`Additional information related to \${searchQuery}...\`,
              url: \`https://example.com/result2\`
            }
          ]
        };
      },
      
      awsService: async (service, action, params) => {
        console.log(\`Accessing AWS \${service} with action \${action}\`);
        // Simulate AWS service response
        return {
          service: service,
          action: action,
          result: \`Simulated response from AWS \${service} \${action}\`,
          timestamp: new Date().toISOString()
        };
      }
    };
    
    // MCP protocol handler - manages tool access
    const mcpHandler = async (toolRequest) => {
      // Validate and process the request through MCP protocol
      console.log(\`MCP processing request for tool: \${toolRequest.tool}\`);
      
      // Apply security and access control
      const securityCheck = true; // Simplified - would be actual validation in production
      
      if (!securityCheck) {
        return { status: 'denied', reason: 'Access control restriction' };
      }
      
      // Route to appropriate tool
      switch (toolRequest.tool) {
        case 'kagi_search':
          return await tools.kagiSearch(toolRequest.parameters.query);
        case 'aws':
          return await tools.awsService(
            toolRequest.parameters.service,
            toolRequest.parameters.action,
            toolRequest.parameters.params
          );
        default:
          return { status: 'error', reason: \`Unknown tool: \${toolRequest.tool}\` };
      }
    };
    
    // Step 1: Analyze the query to determine required tools
    const queryAnalysis = await llm(\`
      Analyze this user query to determine which tools might help answer it:
      "\\\${query}"
      
      Available tools:
      - kagi_search: Performs web search using Kagi
      - aws: Interacts with AWS services
      
      Respond with a JSON object listing the tools needed and why.
    \`, undefined, true);
    
    // Parse tool requirements
    const toolRequirements = typeof queryAnalysis === 'string'
      ? JSON.parse(queryAnalysis.match(/\\{[\\s\\S]*\\}/)[0])
      : queryAnalysis;
    
    // Step 2: Execute tool requests through MCP
    const toolResults = {};
    
    // Process each required tool
    for (const tool of (toolRequirements.tools || [])) {
      console.log(\`Processing tool request for: \${tool.name}\`);
      
      // Create MCP-compliant tool request
      const mcpRequest = {
        tool: tool.name,
        parameters: tool.parameters,
        context: {
          user_query: query,
          purpose: tool.reason
        }
      };
      
      // Process through MCP protocol
      toolResults[tool.name] = await mcpHandler(mcpRequest);
    }
    
    // Step 3: Generate response using tool outputs
    const toolOutputsText = Object.entries(toolResults)
      .map(function(entry) {
        const toolName = entry[0];
        const result = entry[1];
        return toolName + " result: " + JSON.stringify(result, null, 2);
      })
      .join('\\n\\n');
    
    const response = await llm("Using the following tool results, provide a comprehensive answer to the user's query.\\n\\nQuery: \\"" + query + "\\"\\n\\nTool Results:\\n" + toolOutputsText + "\\n\\nGenerate a helpful response that synthesizes the information from these tools.");
    
    return {
      status: 'success',
      query: query,
      result: response,
      toolsUsed: Object.keys(toolResults),
      toolResults: toolResults
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};`,
    implementation: [
      'Set up MCP protocol handler for standardized tool communication',
      'Create interfaces for various external tools and APIs',
      'Build security and access control mechanisms',
      'Implement query analysis to determine required tools',
      'Create tool request formatting and routing',
      'Design response synthesis using multiple tool outputs',
      'Add error handling and fallback mechanisms',
      'Implement logging and monitoring for tool usage'
    ]
  },
  {
    id: 'model-context-protocol',
    name: 'Model Context Protocol (MCP)',
    description: 'A standardized communication framework between models and context systems that ensures efficient information exchange.',
    category: 'Core',
    useCases: ['Enterprise Knowledge Management', 'Secure Data Access Patterns', 'Context-Aware Systems'],
    whenToUse: 'Implement MCP when building enterprise-grade AI systems that require standardized, secure access to contextual information across various sources. This pattern is essential for applications handling sensitive data, requiring fine-grained access controls, or needing to integrate multiple knowledge sources while maintaining security boundaries and efficient context delivery.',
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
  return "Information from " + source + " related to \\"" + query + "\\"";
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
    category: 'Core',
    useCases: ['Multi-agent Systems', 'Collaborative Task Solving', 'Expert Networks'],
    whenToUse: 'Use Agent to Agent (A2A) when tackling problems that benefit from specialized expertise across multiple domains or require parallelized problem-solving. This approach is ideal for complex tasks where breaking work into specialized roles improves overall quality, such as projects requiring research, analysis, critique, and synthesis working together in a coordinated manner.',
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
      "\\\${taskInput}"
      
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
      work of multiple agents on this task: "\\\${taskInput}"
      
      Agent contributions:
      \${resultMessages.map(function(message) { 
        return \`\\\${message.from}: \\\${message.content}\`;
      }).join('\\n\\n')}
      
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
    return this.messages.filter(message => message.to === agent || message.to === "all");
  }
  
  getMessagesByType(type) {
    return this.messages.filter(message => message.messageType === type);
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
        \${messages.map(message => message.content).join('\\n')}
        
        Provide your research findings in a structured format.
      \`;
      break;
    case "analysis":
      agentPrompt = \`
        You are an analysis agent. Process this data and provide insights:
        \${messages.map(message => message.content).join('\\n')}
        
        Provide your analytical conclusions.
      \`;
      break;
    case "critic":
      agentPrompt = \`
        You are a critic agent. Evaluate these proposals and identify issues:
        \${messages.map(message => message.content).join('\\n')}
        
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
    whenToUse: 'Employ Prompt Chaining when a complex task naturally breaks down into sequential subtasks where each step depends on the previous one\'s output. This pattern works well for structured workflows like data transformation, step-by-step reasoning, or content refinement processes where the output of each stage serves as input to the next step in a clear linear progression.',
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
    whenToUse: 'Choose Parallelization when multiple perspectives on the same task can improve output quality, reliability, or creativity. This pattern is particularly valuable for evaluation scenarios, detecting biases, implementing guardrails for safety, or situations where aggregating multiple independent approaches leads to more robust, balanced, or comprehensive results.',
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
const executeParallelLLMCalls = async (input) => {
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
    whenToUse: 'Implement the Orchestrator-Worker pattern for complex tasks that benefit from centralized coordination but require specialized processing of subtasks. This architecture is ideal when you need to maintain a coherent strategy across multiple specialized operations, such as in complex coding tasks, document analysis projects, or situations requiring consistent oversight with distributed execution.',
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
      \${workerResults.map(function(result, i) { 
        return \`Result \${i+1}: \${result}\`;
      }).join('\\n')}
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
    whenToUse: 'Use the Evaluator-Optimizer pattern when content quality must meet specific, objective criteria before being finalized. This approach works well for applications requiring rigorous quality control, such as content that must adhere to style guides, meet factual accuracy standards, or satisfy complex constraints that can be evaluated systematically through an objective review process.',
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
  const feedbackMatch = evaluation.match(/Feedback:\\s*(.+)$/is);
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
    category: 'Core',
    useCases: ['Customer Support Agents', 'MAD (Multi-Agent Debate)'],
    whenToUse: 'Deploy the Routing pattern when building systems that handle diverse query types requiring different expertise or processing approaches. This pattern excels in applications like customer support where inquiries span technical, billing, and general questions, or in content management systems where different content types require specialized handling by the most appropriate agent or workflow.',
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
      
      Input: "\\\${input}"
      
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
    whenToUse: 'Implement Autonomous Workflow when creating agents that need to interact repeatedly with their environment to accomplish goals, making decisions based on continuous feedback. This pattern is ideal for scenarios requiring adaptive decision-making in changing environments, such as virtual assistants that navigate interfaces, data exploration tools that adjust their approach based on findings, or agents that need to learn from their actions.',
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
        return \`Results for "\\\${query}": [simulated search results]\`;
      },
      calculate: (expression) => {
        try {
          return \`Result: \${eval(expression)}\`;
        } catch (err) {
          return \`Error calculating "\\\${expression}": \${err.message}\`;
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
        \${history.map(function(h) { 
          return \`- \${h}\`;
        }).join('\\n')}
        
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
      } else if (decision.action && tools[decision.action]) {
        const toolResult = await tools[decision.action](decision.input);
        currentState = toolResult;
        history.push(\`Tool (\${decision.action}): \${toolResult}\`);
      } else {
        const actionName = decision.action || 'undefined';
        history.push(\`Error: Unknown action "\\\${actionName}"\`);
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
      const parsed = JSON.parse(jsonMatch[0]);
      // Ensure all required properties exist
      return {
        thought: parsed.thought || "No thought provided",
        action: parsed.action || "finish",
        input: parsed.input || ""
      };
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
    whenToUse: 'Choose Reflexion when building systems that need to iteratively improve through introspection about their reasoning process rather than just their outputs. This pattern is especially valuable for complex problem-solving that benefits from metacognitive analysis, such as debugging code, developing strategic plans, or analyzing decision-making processes where understanding the "why" behind conclusions is as important as the conclusions themselves.',
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
    whenToUse: 'Apply Plan and Execute when working on complex tasks requiring strategic planning followed by systematic execution with the ability to adapt the plan as new information emerges. This pattern is particularly effective for project-like tasks with multiple interdependent steps, business process automation, or any scenario requiring a thoughtful, structured approach with the flexibility to adjust course based on intermediate results.',
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
          \${Object.entries(subtaskResults).map(function(entry) {
            const id = entry[0];
            const result = entry[1];
            const subtaskDesc = subtasks.find(function(s) { return s.id === id; }).description;
            return \`- Subtask \${id}: \${subtaskDesc}\\n  Result: \${result}\`;
          }).join('\\n')}
          
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
      \${Object.entries(subtaskResults).map(function(entry) {
        const id = entry[0];
        const result = entry[1];
        const subtaskDesc = subtasks.find(function(s) { return s.id === id; }).description;
        return \`- Subtask \${id}: \${subtaskDesc}\\n  Result: \${result}\`;
      }).join('\\n')}
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
  },
  // New pattern: Computer Using Agent (CUA)
  {
    id: 'computer-using-agent',
    name: 'Computer Using Agent (CUA)',
    description: 'Agents that can interact with computer interfaces, browser automation, and operating systems to perform tasks on behalf of users.',
    category: 'Specialized',
    useCases: ['Desktop Automation', 'Web Navigation and Interaction', 'Multi-application Workflows'],
    whenToUse: 'Deploy Computer Using Agents when you need to automate tasks that typically require human interaction with graphical interfaces, websites, or operating systems. This pattern is ideal for automating repetitive workflows across multiple applications, interacting with legacy systems lacking APIs, or creating assistants that can demonstrate procedures visually by manipulating actual software interfaces rather than just providing instructions.',
    nodes: [
      {
        id: 'user',
        type: 'input',
        data: { label: 'User', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'agent',
        type: 'default',
        data: { label: 'CUA Agent', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'perception',
        type: 'default',
        data: { label: 'Perception Module', nodeType: 'tool' },
        position: { x: 500, y: 100 }
      },
      {
        id: 'planning',
        type: 'default',
        data: { label: 'Planning Module', nodeType: 'planner' },
        position: { x: 500, y: 200 }
      },
      {
        id: 'action',
        type: 'default',
        data: { label: 'Action Module', nodeType: 'tool' },
        position: { x: 700, y: 150 }
      },
      {
        id: 'computer',
        type: 'default',
        data: { label: 'Computer System', nodeType: 'tool' },
        position: { x: 900, y: 150 }
      },
      {
        id: 'result',
        type: 'output',
        data: { label: 'Task Result', nodeType: 'output' },
        position: { x: 500, y: 300 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'user', target: 'agent', animated: true, label: 'Task Request' },
      { id: 'e2-3', source: 'agent', target: 'perception', animated: true },
      { id: 'e2-4', source: 'agent', target: 'planning', animated: true },
      { id: 'e3-5', source: 'perception', target: 'action' },
      { id: 'e4-5', source: 'planning', target: 'action' },
      { id: 'e5-6', source: 'action', target: 'computer', animated: true, label: 'Execution' },
      { id: 'e6-3', source: 'computer', target: 'perception', animated: true, label: 'Screen State' },
      { id: 'e5-7', source: 'action', target: 'result', animated: true },
      { id: 'e2-7', source: 'agent', target: 'result', animated: true }
    ],
    codeExample: `// Computer Using Agent (CUA) implementation
const executeComputerUsingAgent = async (taskRequest: string) => {
  try {
    console.log("Initializing Computer Using Agent for task:", taskRequest);
    
    // Initialize the CUA components
    const perception = new ScreenPerceptionModule();
    const planning = new ActionPlanningModule();
    const action = new ComputerActionModule();
    
    let taskComplete = false;
    let currentState = null;
    let maxIterations = 15;
    let iterations = 0;
    let actionHistory = [];
    
    // Initial screen state capture
    currentState = await perception.captureScreenState();
    
    while (!taskComplete && iterations < maxIterations) {
      iterations++;
      
      // Step 1: Analyze current screen state
      const screenAnalysis = await llm(\`
        You are a computer-using agent that can see and interact with a computer screen.
        Analyze the current screen state and identify UI elements:
        
        Current screen: \${currentState.description}
        Task: \${taskRequest}
        
        Previous actions: \${actionHistory.length > 0 ? actionHistory.join('\\n') : 'None'}
        
        Provide a detailed description of what you see and what elements are relevant to the task.
      \`);
      
      // Step 2: Generate action plan
      const actionPlan = await planning.generatePlan(taskRequest, currentState, screenAnalysis);
      
      // Step 3: Decide on next action
      const nextAction = await llm(\`
        Based on the current screen state and your task, determine the next action:
        
        Task: \${taskRequest}
        Current screen state: \${currentState.description}
        Screen analysis: \${screenAnalysis}
        Action plan: \${actionPlan}
        
        Choose ONE specific action from these options:
        1. CLICK(element_id)
        2. TYPE(element_id, "text")
        3. SCROLL(direction)
        4. TAB()
        5. ENTER()
        6. WAIT()
        7. COMPLETE()
        
        Respond with only the action in the format above.
      \`);
      
      // Parse the chosen action
      const actionMatch = nextAction.match(/([A-Z]+)\\((.*)\\)/);
      if (actionMatch) {
        const actionType = actionMatch[1];
        const actionParams = actionMatch[2].split(',').map(p => p.trim().replace(/"/g, ''));
        
        // Record the action
        actionHistory.push(\`\${iterations}. \${nextAction}\`);
        
        // Check if task is complete
        if (actionType === 'COMPLETE') {
          taskComplete = true;
          continue;
        }
        
        // Step 4: Execute action
        await action.executeAction(actionType, actionParams);
        
        // Step 5: Update perception with new screen state
        currentState = await perception.captureScreenState();
      } else {
        actionHistory.push(\`\${iterations}. Invalid action format: \${nextAction}\`);
      }
    }
    
    // Final status report
    const taskSummary = await llm(\`
      Summarize the task completion process:
      
      Task: \${taskRequest}
      Actions performed:
      \${actionHistory.join('\\n')}
      
      Final screen state: \${currentState.description}
      
      Did the task complete successfully? What was the result?
    \`);
    
    return {
      status: taskComplete ? 'success' : 'incomplete',
      iterations,
      actions: actionHistory,
      summary: taskSummary
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

// Simulated modules (would be replaced with actual implementations)
class ScreenPerceptionModule {
  async captureScreenState() {
    // In a real implementation, this would take a screenshot
    // and analyze it using computer vision
    return {
      description: "Simulated screen state with application windows, buttons, and text fields",
      elements: [
        { id: "btn-1", type: "button", text: "Submit", bounds: {x: 100, y: 200, width: 80, height: 30} },
        { id: "input-1", type: "text-field", value: "", bounds: {x: 100, y: 150, width: 200, height: 30} }
      ]
    };
  }
}

class ActionPlanningModule {
  async generatePlan(task, screenState, analysis) {
    // In a real implementation, this would use planning algorithms
    // to generate a sequence of actions
    return "1. Identify the main input field\\n2. Enter the required information\\n3. Click the submit button\\n4. Verify the result";
  }
}

class ComputerActionModule {
  async executeAction(actionType, params) {
    // In a real implementation, this would control mouse, keyboard, etc.
    console.log(\`Executing \${actionType} with params \${params.join(', ')}\`);
    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
}`,
    implementation: [
      'Set up screen perception and analysis using computer vision',
      'Create UI element detection and recognition capabilities',
      'Build a planning system for multi-step computer tasks',
      'Implement mouse and keyboard control mechanisms',
      'Design prompt engineering for accurate UI interaction',
      'Create feedback loops between perception and action',
      'Implement error recovery for failed UI interactions',
      'Add task verification to confirm successful completion',
      'Build screen state representation for LLM reasoning'
    ]
  },
  // New pattern: Deep Researcher Agent
  {
    id: 'deep-researcher',
    name: 'Deep Researcher Agent',
    description: 'An agent specialized in conducting thorough research by exploring multiple sources, synthesizing information, and providing in-depth analysis.',
    category: 'Specialized',
    useCases: ['Academic Research', 'Competitive Analysis', 'Literature Review', 'Market Research'],
    whenToUse: 'Use Deep Researcher Agents when projects require comprehensive information gathering, fact-checking across multiple sources, and synthesis of findings into coherent analysis. This pattern is particularly valuable for academic research, competitive intelligence, literature reviews, or any task where the thoroughness of investigation, balanced consideration of multiple perspectives, and proper citation of sources are essential to producing trustworthy results.',
    nodes: [
      {
        id: 'query',
        type: 'input',
        data: { label: 'Research Query', nodeType: 'input' },
        position: { x: 100, y: 200 }
      },
      {
        id: 'planner',
        type: 'default',
        data: { label: 'Research Planner', nodeType: 'planner' },
        position: { x: 300, y: 200 }
      },
      {
        id: 'explorer',
        type: 'default',
        data: { label: 'Source Explorer', nodeType: 'tool' },
        position: { x: 500, y: 100 }
      },
      {
        id: 'extractor',
        type: 'default',
        data: { label: 'Information Extractor', nodeType: 'llm' },
        position: { x: 500, y: 200 }
      },
      {
        id: 'validator',
        type: 'default',
        data: { label: 'Fact Validator', nodeType: 'evaluator' },
        position: { x: 500, y: 300 }
      },
      {
        id: 'knowledge',
        type: 'default',
        data: { label: 'Knowledge Base', nodeType: 'tool' },
        position: { x: 700, y: 200 }
      },
      {
        id: 'synthesizer',
        type: 'default',
        data: { label: 'Research Synthesizer', nodeType: 'llm' },
        position: { x: 900, y: 200 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Research Report', nodeType: 'output' },
        position: { x: 1100, y: 200 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'query', target: 'planner', animated: true },
      { id: 'e2-3', source: 'planner', target: 'explorer', animated: true },
      { id: 'e2-4', source: 'planner', target: 'extractor', animated: true },
      { id: 'e2-5', source: 'planner', target: 'validator', animated: true },
      { id: 'e3-4', source: 'explorer', target: 'extractor', animated: true },
      { id: 'e4-5', source: 'extractor', target: 'validator' },
      { id: 'e5-6', source: 'validator', target: 'knowledge', animated: true },
      { id: 'e6-7', source: 'knowledge', target: 'synthesizer', animated: true },
      { id: 'e7-8', source: 'synthesizer', target: 'output', animated: true },
      { id: 'e5-3', source: 'validator', target: 'explorer', label: 'More Sources Needed' },
      { id: 'e6-4', source: 'knowledge', target: 'extractor', label: 'Knowledge Gap' }
    ],
    codeExample: `// Deep Researcher Agent implementation
const executeDeepResearcher = async (researchQuery: string) => {
  try {
    console.log("Initializing Deep Researcher Agent for query:", researchQuery);
    
    // Step 1: Research Planning
    const researchPlan = await llm(\`
      You are a research planning AI.
      
      Research Query: "\\\${researchQuery}"
      
      Create a comprehensive research plan to explore this topic. Include:
      1. Key aspects to investigate
      2. Potential information sources
      3. Research questions to answer
      4. Types of evidence to look for
      5. Potential biases to be aware of
      
      Format as JSON with these fields.
    \`, undefined, true);
    
    // Parse the research plan
    const plan = typeof researchPlan === 'string' 
      ? JSON.parse(researchPlan.match(/\\{[\\s\\S]*\\}/)[0])
      : researchPlan;
    
    // Step 2: Source Exploration
    console.log("Exploring sources based on research plan...");
    const sources = await exploreInformationSources(researchQuery, plan.aspects, plan.sources);
    
    // Step 3: Information Extraction from each source
    console.log("Extracting information from sources...");
    const extractedInfo = await Promise.all(
      sources.map(source => extractInformation(source, plan.questions))
    );
    
    // Step 4: Fact Validation
    console.log("Validating extracted information...");
    const validatedInfo = await validateInformation(extractedInfo, plan.biases);
    
    // Check if additional sources are needed
    if (validatedInfo.needsMoreSources) {
      console.log("Additional sources needed. Exploring deeper...");
      const additionalSources = await exploreInformationSources(
        researchQuery, 
        [...plan.aspects, ...validatedInfo.additionalAspects],
        validatedInfo.suggestedSources
      );
      
      const additionalInfo = await Promise.all(
        additionalSources.map(source => extractInformation(source, validatedInfo.additionalQuestions))
      );
      
      validatedInfo.validatedData = [
        ...validatedInfo.validatedData,
        ...(await validateInformation(additionalInfo, plan.biases)).validatedData
      ];
    }
    
    // Step 5: Build Knowledge Base
    console.log("Building research knowledge base...");
    const knowledgeBase = organizeKnowledgeBase(validatedInfo.validatedData);
    
    // Step 6: Research Synthesis
    console.log("Synthesizing research findings...");
    const synthesis = await llm(\`
      You are a research synthesis AI. Create a comprehensive research report based on the following:
      
      Research Query: "\\\${researchQuery}"
      
      Research Findings:
      \${JSON.stringify(knowledgeBase, null, 2)}
      
      Synthesize these findings into a well-structured research report with:
      1. Executive summary
      2. Key findings organized by theme
      3. Supporting evidence
      4. Counterpoints and limitations
      5. Conclusions
      6. Implications and applications
      7. Areas for further research
    \`);
    
    return {
      status: 'success',
      query: researchQuery,
      plan: plan,
      sources: sources.length,
      knowledgePoints: knowledgeBase.facts.length,
      report: synthesis
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

// Helper functions
async function exploreInformationSources(query, aspects, suggestedSources) {
  // Simulate source exploration - in a real implementation, this would
  // search through databases, web APIs, academic repositories, etc.
  return aspects.map(aspect => {
    return {
      title: \`Source on \${aspect}\`,
      content: \`Simulated content about \${aspect} related to \${query}\`,
      relevance: 0.7 + Math.random() * 0.3
    };
  });
}

async function extractInformation(source, questions) {
  // Simulate information extraction - in a real implementation,
  // this would use NLP techniques to extract relevant information
  return {
    source: source.title,
    findings: questions.map(q => {
      return {
        question: q,
        answer: \`Simulated answer to "\\\${q}" based on source \${source.title}\`,
        confidence: 0.6 + Math.random() * 0.4
      };
    })
  };
}

async function validateInformation(extractedInfoArray, potentialBiases) {
  // Simulate fact validation - in a real implementation,
  // this would cross-reference information across sources
  const validatedData = extractedInfoArray.flatMap(info => 
    info.findings.filter(f => f.confidence > 0.7)
  );
  
  // Determine if more sources are needed
  const coverageGaps = Math.random() > 0.5;
  
  return {
    validatedData,
    needsMoreSources: coverageGaps,
    additionalAspects: coverageGaps ? ["Additional aspect 1", "Additional aspect 2"] : [],
    additionalQuestions: coverageGaps ? ["Additional question 1?", "Additional question 2?"] : [],
    suggestedSources: coverageGaps ? ["Suggested additional source type 1", "Suggested additional source type 2"] : []
  };
}

function organizeKnowledgeBase(validatedData) {
  // Organize validated information into a structured knowledge base
  return {
    facts: validatedData.map((item, index) => ({
      id: \`fact-\${index + 1}\`,
      statement: item.answer,
      source: item.source,
      confidence: item.confidence
    })),
    themes: [
      "Simulated Theme 1",
      "Simulated Theme 2",
      "Simulated Theme 3"
    ],
    relationships: [
      {
        type: "supports",
        fact1: "fact-1",
        fact2: "fact-2"
      }
    ]
  };
}`,
    implementation: [
      'Create a research planning system for topic exploration',
      'Build source discovery and retrieval mechanisms',
      'Implement information extraction from diverse content formats',
      'Design fact validation through cross-referencing and triangulation',
      'Create a structured knowledge base to organize research findings',
      'Build a system for detecting knowledge gaps and exploring further',
      'Implement bias detection and mitigation strategies',
      'Design research synthesis capabilities with proper citation',
      'Add research quality metrics and confidence scoring'
    ]
  },
  // New pattern: Voice Agents
  {
    id: 'voice-agent',
    name: 'Voice Agents',
    description: 'Specialized agents that process speech input, understand natural language, and respond with synthesized speech in a conversational manner.',
    category: 'Specialized',
    useCases: ['Voice Assistants', 'Call Center Automation', 'Accessibility Applications', 'In-Car Systems'],
    whenToUse: 'Implement Voice Agents when building applications requiring hands-free interaction, accessibility for users with visual or motor impairments, or natural conversation through speech. This pattern is essential for voice assistants, call center automation, in-vehicle applications, or any context where typing is impractical and the interaction benefits from the nuance, tone, and accessibility that voice communication provides.',
    nodes: [
      {
        id: 'voice',
        type: 'input',
        data: { label: 'Voice Input', nodeType: 'input' },
        position: { x: 100, y: 150 }
      },
      {
        id: 'stt',
        type: 'default',
        data: { label: 'Speech-to-Text', nodeType: 'tool' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'nlu',
        type: 'default',
        data: { label: 'NLU', nodeType: 'llm' },
        position: { x: 500, y: 100 }
      },
      {
        id: 'dialog',
        type: 'default',
        data: { label: 'Dialog Manager', nodeType: 'llm' },
        position: { x: 500, y: 200 }
      },
      {
        id: 'context',
        type: 'default',
        data: { label: 'Context Memory', nodeType: 'tool' },
        position: { x: 700, y: 100 }
      },
      {
        id: 'nlg',
        type: 'default',
        data: { label: 'NLG', nodeType: 'llm' },
        position: { x: 700, y: 200 }
      },
      {
        id: 'tts',
        type: 'default',
        data: { label: 'Text-to-Speech', nodeType: 'tool' },
        position: { x: 900, y: 150 }
      },
      {
        id: 'output',
        type: 'output',
        data: { label: 'Voice Output', nodeType: 'output' },
        position: { x: 1100, y: 150 }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'voice', target: 'stt', animated: true },
      { id: 'e2-3', source: 'stt', target: 'nlu', animated: true },
      { id: 'e2-4', source: 'stt', target: 'dialog', animated: true },
      { id: 'e3-5', source: 'nlu', target: 'context', animated: true },
      { id: 'e4-6', source: 'dialog', target: 'nlg', animated: true },
      { id: 'e5-4', source: 'context', target: 'dialog', animated: true },
      { id: 'e5-6', source: 'context', target: 'nlg' },
      { id: 'e6-7', source: 'nlg', target: 'tts', animated: true },
      { id: 'e7-8', source: 'tts', target: 'output', animated: true }
    ],
    codeExample: `// Voice Agent implementation
const executeVoiceAgent = async (voiceInput: ArrayBuffer) => { // In real use, this would be audio data
  try {
    console.log("Processing voice input...");
    
    // Step 1: Speech-to-Text
    const speechToText = new SpeechToTextService();
    const transcribedText = await speechToText.transcribe(voiceInput);
    
    console.log(\`Transcribed text: "\\\${transcribedText}"\`);
    
    // Step 2: Natural Language Understanding
    const nluResult = await llm(\`
      You are a natural language understanding system.
      Analyze this user utterance:
      
      "\\\${transcribedText}"
      
      Extract the following in JSON format:
      1. intent: The user's primary intent
      2. entities: Any key entities or parameters
      3. sentiment: The user's emotional state or sentiment
      4. confidence: Your confidence level in this interpretation (0-1)
    \`, undefined, true);
    
    // Parse NLU result
    const nlu = typeof nluResult === 'string'
      ? JSON.parse(nluResult.match(/\\{[\\s\\S]*\\}/)[0])
      : nluResult;
    
    // Step 3: Context Management
    const contextManager = new ConversationContextManager();
    await contextManager.updateContext({
      userInput: transcribedText,
      nluResult: nlu,
      timestamp: new Date().toISOString()
    });
    
    const conversationContext = await contextManager.getContext();
    
    // Step 4: Dialog Management
    const dialogResponse = await llm(\`
      You are a conversational voice assistant.
      
      User's transcribed input: "\\\${transcribedText}"
      
      NLU analysis:
      - Intent: \${nlu.intent}
      - Entities: \${JSON.stringify(nlu.entities)}
      - Sentiment: \${nlu.sentiment}
      
      Conversation history:
      \${conversationContext.history.map(function(entry, index) { 
        return \`[\\\${index + 1}] User: \\\${entry.userInput} → Assistant: \\\${entry.agentResponse || ''}\`; 
      }).join('\\n')}
      
      Generate a natural, conversational response that:
      1. Addresses the user's intent
      2. Is appropriate for voice conversation (concise, clear)
      3. Maintains appropriate conversational flow
      4. If action is needed, clearly indicates what action is being taken
      
      Response:
    \`);
    
    // Step 5: Natural Language Generation
    const nlgResponse = await llm(\`
      You are a natural language generation system for a voice assistant.
      
      Raw response: "\\\${dialogResponse}"
      
      User sentiment: \${nlu.sentiment}
      
      Refine this response to be:
      1. Optimized for speech synthesis (proper pauses, emphasis)
      2. Appropriate length for voice (not too verbose)
      3. Natural-sounding with proper prosody markers
      
      Refined response for voice synthesis:
    \`);
    
    // Update context with agent response
    await contextManager.updateContext({
      agentResponse: nlgResponse
    });
    
    // Step 6: Text-to-Speech Synthesis
    const textToSpeech = new TextToSpeechService();
    const speechOutput = await textToSpeech.synthesize(nlgResponse);
    
    return {
      status: 'success',
      transcription: transcribedText,
      nluAnalysis: nlu,
      textResponse: nlgResponse,
      audioResponse: 'base64-encoded-audio-data' // Simulated output (would be actual audio in real implementation)
    };
  } catch (error) {
    return { status: 'failed', reason: error.message };
  }
};

// Simulated supporting services
class SpeechToTextService {
  async transcribe(audioData) {
    // In a real implementation, this would call Azure Speech Services API
    return "Hello, what's the weather forecast for Seattle tomorrow?";
  }
}

class ConversationContextManager {
  context = {
    history: [],
    sessionData: {},
    userPreferences: {}
  };
  
  async updateContext(newData) {
    // Update conversation history
    if (newData.userInput || newData.agentResponse) {
      const lastEntry = this.context.history.length > 0 
        ? this.context.history[this.context.history.length - 1] 
        : {};
      
      if (newData.userInput) {
        this.context.history.push({
          userInput: newData.userInput,
          nluResult: newData.nluResult,
          timestamp: newData.timestamp
        });
      } else if (newData.agentResponse && this.context.history.length > 0) {
        this.context.history[this.context.history.length - 1].agentResponse = newData.agentResponse;
      }
    }
    
    // Keep history size manageable
    if (this.context.history.length > 10) {
      this.context.history = this.context.history.slice(-10);
    }
  }
  
  async getContext() {
    return this.context;
  }
}

class TextToSpeechService {
  async synthesize(text) {
    // In a real implementation, this would call Azure Neural Voice API
    return Buffer.from("simulated-audio-data");
  }
}`,
    implementation: [
      'Integrate Azure Speech-to-Text for voice recognition',
      'Build natural language understanding with intent recognition',
      'Create a context management system for conversation history',
      'Implement dialog management for conversational flow',
      'Design natural language generation optimized for speech',
      'Integrate Azure Neural TTS for high-quality speech synthesis',
      'Add voice activity detection and endpointing',
      'Implement interruption handling and barge-in capability',
      'Design acoustic echo cancellation for device integration'
    ]
  }
];