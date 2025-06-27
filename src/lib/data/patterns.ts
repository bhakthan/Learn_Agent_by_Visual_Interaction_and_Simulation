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
    whenToUse: "Use the ReAct pattern when your task requires the agent to gather external information and reason about it iteratively. It's ideal for complex inquiries that need multiple tool interactions, such as research questions, multi-step problem-solving, or scenarios where an agent needs to evaluate its actions and adjust its approach based on new information.",
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
    contextHistory.push("User query: " + query);

    // Available tools
    const tools = {
      search: async (query) => {
        return "Search results for \"" + query + "\": [simulated search results]";
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
      console.log("Cycle " + currentCycle + ": Reasoning...");
      
      const reasoningPrompt = "You are a ReAct agent that solves problems through cycles of reasoning and action.\n\nTask: " + query + "\n\nPrevious steps:\n" + contextHistory.join('\n') + "\n\nThink step by step about the problem. Either:\n1. Use a tool to gather more information by responding with:\n   Thought: <your reasoning>\n   Action: <tool_name>\n   Action Input: <tool input>\n   \n2. Or provide the final answer if you have enough information:\n   Thought: <your reasoning>\n   Final Answer: <your answer>";
      
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
        const actionMatch = reasoningResponse.match(/Action:(.*?)\n/);
        const actionInputMatch = reasoningResponse.match(/Action Input:(.*?)(?:\n|$)/s);
        
        if (actionMatch && actionInputMatch) {
          const toolName = actionMatch[1].trim();
          const toolInput = actionInputMatch[1].trim();
          
          // Step 2: Action phase - call the appropriate tool
          console.log("Cycle " + currentCycle + ": Taking action with tool \"" + toolName + "\"...");
          
          if (tools[toolName]) {
            const toolResult = await tools[toolName](toolInput);
            contextHistory.push("Observation: " + toolResult);
          } else {
            contextHistory.push("Observation: Error - Tool \"" + toolName + "\" not found.");
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
        const printMatch = code.match(/print\(([^)]+)\)/);
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
        "You are a CodeAct agent that solves problems by writing and executing Python code.\n\n" +
        "Task: " + query + "\n\n" +
        "Previous interactions:\n" + 
        contextHistory.join('\n\n') + "\n\n" +
        "Based on the current state, either:\n\n" +
        "1. Write Python code to make progress, formatted as:\n" +
        "   Thought: <your reasoning>\n" +
        "   Code:\n" +
        "   ```\n" +
        "   # Your Python code here\n" +
        "   ```\n\n" +
        "2. Or provide the final answer if you've solved the problem:\n" +
        "   Thought: <your reasoning>\n" +
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
      else if (agentResponse.includes("```")) {
        // Extract code block
        const codeMatch = agentResponse.match(/```\s*([\s\S]*?)\s*```/);
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
  }
];