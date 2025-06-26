/**
 * Debug examples for step-by-step code execution
 * These provide detailed debugging information for interactive visualization
 */

interface DebuggerStep {
  lineNumbers: number[];
  variables: Record<string, any>;
  output?: string;
  explanation: string;
}

interface DebugExample {
  code: string;
  language: 'typescript' | 'python';
  steps: DebuggerStep[];
}

interface PatternDebugExamples {
  [patternId: string]: {
    typescript?: DebugExample;
    python?: DebugExample;
  }
}

export const debugExamples: PatternDebugExamples = {
  'react': {
    typescript: {
      language: 'typescript',
      code: `// ReAct pattern implementation
const reactAgent = async (query: string) => {
  // Initialize context array to track interaction
  const contextHistory = [];
  contextHistory.push(\`Query: \${query}\`);
  
  // Step 1: Generate reasoning about the task
  const thinkingPrompt = \`
    Task: \${query}
    Think step by step about how to solve this.
  \`;
  const thoughts = await llm(thinkingPrompt);
  contextHistory.push(\`Reasoning: \${thoughts}\`);
  
  // Step 2: Determine appropriate action
  const action = "calculate_distance";
  const actionInput = {
    x1: 0, y1: 0, 
    x2: 3, y2: 4
  };
  contextHistory.push(\`Action: \${action}(\${JSON.stringify(actionInput)})\`);
  
  // Step 3: Execute the action
  const executeAction = (action, input) => {
    if (action === "calculate_distance") {
      const { x1, y1, x2, y2 } = input;
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    return null;
  };
  
  const observation = executeAction(action, actionInput);
  contextHistory.push(\`Observation: \${observation}\`);
  
  // Step 4: Generate final response
  const responsePrompt = \`
    Task: \${query}
    Context: \${contextHistory.join('\\n')}
    Provide a final answer based on the observation.
  \`;
  
  const finalResponse = await llm(responsePrompt);
  return finalResponse;
};`,
      steps: [
        {
          lineNumbers: [0, 1],
          variables: {
            'function': 'reactAgent',
            'parameters': 'query: string'
          },
          explanation: 'Define the ReAct agent function that takes a user query as input.'
        },
        {
          lineNumbers: [2, 3, 4],
          variables: {
            'query': '"Calculate distance between two points"',
            'contextHistory': '["Query: Calculate distance between two points"]'
          },
          output: 'Initializing ReAct agent with query...',
          explanation: 'Initialize the context array and add the user query to track the interaction history.'
        },
        {
          lineNumbers: [6, 7, 8, 9, 10, 11],
          variables: {
            'thinkingPrompt': 'Task: Calculate distance between two points\nThink step by step about how to solve this.'
          },
          output: 'Generating reasoning step...',
          explanation: 'Create a prompt to generate reasoning about how to solve the problem.'
        },
        {
          lineNumbers: [12],
          variables: {
            'thoughts': 'To calculate the distance between two points, I need to use the Pythagorean theorem. If the points are (x1,y1) and (x2,y2), then the distance is sqrt((x2-x1)^2 + (y2-y1)^2).'
          },
          output: 'LLM response: Generated reasoning about distance calculation',
          explanation: 'The language model generates reasoning about how to approach the problem using the Pythagorean theorem.'
        },
        {
          lineNumbers: [13],
          variables: {
            'contextHistory': '["Query: Calculate distance between two points", "Reasoning: To calculate the distance between two points..."]'
          },
          explanation: 'Add the reasoning to the context history to maintain the agent\'s thought process.'
        },
        {
          lineNumbers: [16, 17, 18, 19, 20],
          variables: {
            'action': '"calculate_distance"',
            'actionInput': '{x1: 0, y1: 0, x2: 3, y2: 4}'
          },
          explanation: 'Based on the reasoning, determine the appropriate action to take and its inputs.'
        },
        {
          lineNumbers: [21],
          variables: {
            'contextHistory': '["Query: Calculate distance...", "Reasoning: To calculate...", "Action: calculate_distance({"x1":0,"y1":0,"x2":3,"y2":4})"]'
          },
          explanation: 'Add the chosen action and its inputs to the context history.'
        },
        {
          lineNumbers: [23, 24, 25, 26, 27, 28, 29, 30],
          variables: {
            'executeAction': 'function(action, input)'
          },
          explanation: 'Define a function to execute the chosen action based on its type and inputs.'
        },
        {
          lineNumbers: [32],
          variables: {
            'observation': '5'
          },
          output: 'Executing action: calculate_distance...\nResult: 5',
          explanation: 'Execute the action to calculate the distance between points (0,0) and (3,4), getting result 5.'
        },
        {
          lineNumbers: [33],
          variables: {
            'contextHistory': '[...previous items..., "Observation: 5"]'
          },
          explanation: 'Add the observation (result of the action) to the context history.'
        },
        {
          lineNumbers: [36, 37, 38, 39, 40, 41],
          variables: {
            'responsePrompt': 'Task: Calculate distance between two points\nContext: Query: Calculate...\nReasoning: To calculate...\nAction: calculate_distance...\nObservation: 5\nProvide a final answer based on the observation.'
          },
          explanation: 'Create a prompt for generating the final response based on all the gathered context.'
        },
        {
          lineNumbers: [43],
          variables: {
            'finalResponse': 'The distance between the points (0,0) and (3,4) is 5 units.'
          },
          output: 'LLM response: Generated final answer',
          explanation: 'The language model generates a final response using all the context collected throughout the ReAct process.'
        },
        {
          lineNumbers: [44],
          variables: {
            'return value': 'The distance between the points (0,0) and (3,4) is 5 units.'
          },
          output: 'ReAct agent execution complete',
          explanation: 'Return the final response to the user, completing the ReAct pattern execution.'
        }
      ]
    },
    
    python: {
      language: 'python',
      code: `def react_agent(query, max_steps=3):
    """ReAct pattern implementation in Python"""
    # Initialize context
    context = []
    context.append(f"Query: {query}")
    
    # Step 1: Generate reasoning
    thinking_prompt = f"""
    Task: {query}
    Think step by step about how to solve this.
    """
    thoughts = llm(thinking_prompt)
    context.append(f"Reasoning: {thoughts}")
    
    # Step 2: Determine action
    action = "calculate_distance"
    action_input = {
        "x1": 0, "y1": 0,
        "x2": 3, "y2": 4
    }
    context.append(f"Action: {action}({action_input})")
    
    # Step 3: Execute action
    def execute_action(action_name, params):
        if action_name == "calculate_distance":
            x1, y1 = params["x1"], params["y1"]
            x2, y2 = params["x2"], params["y2"]
            import math
            distance = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
            return distance
        return None
    
    observation = execute_action(action, action_input)
    context.append(f"Observation: {observation}")
    
    # Step 4: Generate final response
    response_prompt = f"""
    Task: {query}
    Context:
    {context}
    Provide a final answer based on the observation.
    """
    
    final_response = llm(response_prompt)
    return final_response`,
      steps: [
        {
          lineNumbers: [0, 1],
          variables: {
            'function': 'react_agent',
            'parameters': 'query, max_steps=3'
          },
          explanation: 'Define the ReAct agent function with query input and optional max_steps parameter.'
        },
        {
          lineNumbers: [2, 3, 4],
          variables: {
            'query': '"Calculate distance between two points"',
            'max_steps': '3',
            'context': '["Query: Calculate distance between two points"]'
          },
          output: 'Initializing ReAct agent...',
          explanation: 'Initialize the context list and add the user query to it.'
        },
        {
          lineNumbers: [6, 7, 8, 9, 10],
          variables: {
            'thinking_prompt': 'Task: Calculate distance between two points\nThink step by step about how to solve this.'
          },
          explanation: 'Create a prompt for the LLM to generate reasoning about the problem.'
        },
        {
          lineNumbers: [11],
          variables: {
            'thoughts': 'To calculate distance between two points (x1,y1) and (x2,y2), I need to use the distance formula derived from the Pythagorean theorem: sqrt((x2-x1)^2 + (y2-y1)^2)'
          },
          output: 'LLM thinking about how to solve the problem...',
          explanation: 'The language model provides reasoning about using the Pythagorean theorem to calculate distance.'
        },
        {
          lineNumbers: [12],
          variables: {
            'context': '["Query: Calculate distance between two points", "Reasoning: To calculate distance..."]'
          },
          explanation: 'Add the reasoning to the context history.'
        },
        {
          lineNumbers: [14, 15, 16, 17, 18],
          variables: {
            'action': '"calculate_distance"',
            'action_input': '{"x1": 0, "y1": 0, "x2": 3, "y2": 4}'
          },
          explanation: 'Based on the reasoning, determine the appropriate action and its inputs.'
        },
        {
          lineNumbers: [19],
          variables: {
            'context': '["Query: Calculate distance...", "Reasoning: To calculate...", "Action: calculate_distance(...)"]'
          },
          explanation: 'Add the chosen action to the context history.'
        },
        {
          lineNumbers: [21, 22, 23, 24, 25, 26, 27, 28],
          variables: {
            'execute_action': 'function(action_name, params)'
          },
          explanation: 'Define a helper function to execute the chosen action.'
        },
        {
          lineNumbers: [30],
          variables: {
            'observation': '5.0'
          },
          output: 'Calculating distance: sqrt((3-0)^2 + (4-0)^2) = 5.0',
          explanation: 'Execute the action to calculate the distance between points (0,0) and (3,4).'
        },
        {
          lineNumbers: [31],
          variables: {
            'context': '[...previous items..., "Observation: 5.0"]'
          },
          explanation: 'Add the observation (result of the action) to the context.'
        },
        {
          lineNumbers: [33, 34, 35, 36, 37, 38, 39],
          variables: {
            'response_prompt': 'Task: Calculate distance between two points\nContext:\n["Query: ...", "Reasoning: ...", "Action: ...", "Observation: 5.0"]\nProvide a final answer based on the observation.'
          },
          explanation: 'Create a prompt for generating the final response based on the context.'
        },
        {
          lineNumbers: [41],
          variables: {
            'final_response': 'The distance between the points (0,0) and (3,4) is 5.0 units.'
          },
          output: 'Generating final response...',
          explanation: 'The language model generates a final answer using the collected context.'
        },
        {
          lineNumbers: [42],
          variables: {
            'return value': 'The distance between the points (0,0) and (3,4) is 5.0 units.'
          },
          output: 'ReAct agent execution complete',
          explanation: 'Return the final response to the user.'
        }
      ]
    }
  },
  
  'codeact': {
    typescript: {
      language: 'typescript',
      code: `// CodeAct agent implementation in TypeScript
const codeActAgent = async (query: string, maxIter = 3) => {
  // Setup execution environment
  const executeCode = async (code: string): Promise<string> => {
    console.log("Executing code:", code);
    
    // This is a simplified simulation of code execution
    // A real implementation would use a secure sandbox
    try {
      if (code.includes("factorial")) {
        // Simulate factorial calculation
        return "Function defined successfully. Example: factorial(5) = 120";
      }
      return "Code executed successfully";
    } catch (error) {
      return \`Execution error: \${error.message}\`;
    }
  };
  
  // Initialize
  let iterations = 0;
  let isDone = false;
  let finalCode = "";
  let context = [\`User query: \${query}\`];
  
  // Main loop
  while (!isDone && iterations < maxIter) {
    iterations++;
    
    // Generate code with LLM
    const codePrompt = \`
      You are a coding assistant. Write code to solve:
      \${query}
      \${iterations > 1 ? 'Previous attempts: ' + context.join('\\n') : ''}
      Write a complete solution as code.
    \`;
    
    const response = await llm(codePrompt);
    context.push(\`Iteration \${iterations}: \${response}\`);
    
    // Extract code from response
    const codeMatch = response.match(/\`\`\`(?:javascript|js|typescript|ts)?([\s\S]*?)\`\`\`/);
    
    if (codeMatch) {
      const code = codeMatch[1].trim();
      
      // Execute the code
      const executionResult = await executeCode(code);
      context.push(\`Execution result: \${executionResult}\`);
      
      // Check if the result is satisfactory
      if (!executionResult.includes("error")) {
        finalCode = code;
        isDone = true;
      }
    }
  }
  
  return {
    iterations,
    successful: isDone,
    code: finalCode,
    executionHistory: context
  };
};`,
      steps: [
        {
          lineNumbers: [0, 1, 2],
          variables: {
            'function': 'codeActAgent',
            'parameters': 'query: string, maxIter = 3'
          },
          explanation: 'Define the CodeAct agent function with query input and maximum iterations parameter.'
        },
        {
          lineNumbers: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          variables: {
            'executeCode': 'function(code: string): Promise<string>',
          },
          explanation: 'Define the code execution environment that will run the generated code safely.'
        },
        {
          lineNumbers: [17, 18, 19, 20, 21],
          variables: {
            'query': '"Write a function to calculate factorial"',
            'iterations': '0',
            'isDone': 'false',
            'finalCode': '""',
            'context': '["User query: Write a function to calculate factorial"]'
          },
          output: 'Initializing CodeAct agent...',
          explanation: 'Initialize variables to track the state of the execution process.'
        },
        {
          lineNumbers: [23, 24],
          variables: {
            'iterations': '1'
          },
          explanation: 'Start the main iteration loop and increment the iteration counter.'
        },
        {
          lineNumbers: [26, 27, 28, 29, 30, 31, 32],
          variables: {
            'codePrompt': 'You are a coding assistant. Write code to solve:\nWrite a function to calculate factorial\n\nWrite a complete solution as code.'
          },
          output: 'Generating code solution...',
          explanation: 'Create a prompt for the LLM to generate code that solves the problem.'
        },
        {
          lineNumbers: [34],
          variables: {
            'response': '```javascript\nfunction factorial(n) {\n  if (n === 0 || n === 1) {\n    return 1;\n  } else {\n    return n * factorial(n - 1);\n  }\n}\n```'
          },
          output: 'LLM generated code solution',
          explanation: 'The language model generates code for a factorial function using recursion.'
        },
        {
          lineNumbers: [35],
          variables: {
            'context': '["User query: Write a function to calculate factorial", "Iteration 1: ```javascript\nfunction factorial(n) {...}```"]'
          },
          explanation: 'Add the LLM\'s response to the context history.'
        },
        {
          lineNumbers: [37, 38],
          variables: {
            'codeMatch': 'Array(2) ["```javascript\nfunction factorial(n) {...}```", "function factorial(n) {...}"]'
          },
          explanation: 'Extract the actual code from the LLM\'s response by matching the code block.'
        },
        {
          lineNumbers: [40, 41],
          variables: {
            'code': 'function factorial(n) {\n  if (n === 0 || n === 1) {\n    return 1;\n  } else {\n    return n * factorial(n - 1);\n  }\n}'
          },
          explanation: 'Get the clean code without the markdown code block delimiters.'
        },
        {
          lineNumbers: [43, 44],
          variables: {
            'executionResult': 'Function defined successfully. Example: factorial(5) = 120'
          },
          output: 'Executing code:\nfunction factorial(n) {\n  if (n === 0 || n === 1) {\n    return 1;\n  } else {\n    return n * factorial(n - 1);\n  }\n}',
          explanation: 'Execute the generated code in the simulated environment to test it.'
        },
        {
          lineNumbers: [45],
          variables: {
            'context': '[...previous items..., "Execution result: Function defined successfully. Example: factorial(5) = 120"]'
          },
          explanation: 'Add the execution result to the context history.'
        },
        {
          lineNumbers: [47, 48, 49, 50, 51],
          variables: {
            'finalCode': 'function factorial(n) {\n  if (n === 0 || n === 1) {\n    return 1;\n  } else {\n    return n * factorial(n - 1);\n  }\n}',
            'isDone': 'true'
          },
          explanation: 'Since the execution was successful, save the code and mark the process as done.'
        },
        {
          lineNumbers: [54, 55, 56, 57, 58, 59, 60],
          variables: {
            'return value': '{iterations: 1, successful: true, code: "function factorial(n) {...}", executionHistory: [...]}',
          },
          output: 'CodeAct agent execution complete',
          explanation: 'Return the final result with the generated code and execution history.'
        }
      ]
    }
  }
};

/**
 * Get debug steps for a specific pattern and language
 */
export function getDebugExample(patternId: string, language: 'typescript' | 'python') {
  return debugExamples[patternId]?.[language];
}