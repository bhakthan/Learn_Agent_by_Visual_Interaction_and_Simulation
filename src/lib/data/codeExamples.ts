/**
 * Collection of code execution examples for interactive demonstrations
 * These examples can be used with the InteractiveCodeExecution component
 */

interface CodeBlockExecution {
  code: string;
  explanation: string;
  output?: string;
  variableState?: Record<string, string>;
  duration?: number;
}

interface PatternExecutionExamples {
  [patternId: string]: {
    typescript?: {
      description: string;
      blocks: CodeBlockExecution[];
    };
    python?: {
      description: string;
      blocks: CodeBlockExecution[];
    };
  };
}

export const codeExecutionExamples: PatternExecutionExamples = {
  'react': {
    typescript: {
      description: 'The ReAct pattern combines reasoning and acting in an iterative process to solve complex tasks.',
      blocks: [
        {
          code: `// Initialize ReAct agent function
const executeReAct = async (query: string) => {
  // Initialize state
  const contextHistory = [];
  
  // Step 1: Add user query to context
  contextHistory.push(\`User Query: \${query}\`);`,
          explanation: 'We begin by initializing the ReAct agent with our query and an empty context history array.',
          variableState: {
            'query': '"Calculate distance between two points"',
            'contextHistory': '[]'
          },
          duration: 1000
        },
        {
          code: `  // Step 2: Generate thoughts about how to approach the problem
  const thinkingPrompt = \`
    You are an AI assistant using the ReAct pattern to solve problems.
    Query: \${query}
    
    Think step-by-step about how to solve this problem.
  \`;
  
  const thoughts = await llm(thinkingPrompt);
  contextHistory.push(\`Thoughts: \${thoughts}\`);`,
          explanation: 'The agent first reasons about the problem before taking any actions.',
          output: 'Thinking about how to calculate distance between two points...',
          variableState: {
            'thoughts': 'To calculate distance between two points, I need their coordinates. Then I can apply the Pythagorean theorem.',
            'contextHistory': '["User Query: Calculate distance between two points", "Thoughts: To calculate distance..."]'
          },
          duration: 1500
        },
        {
          code: `  // Step 3: Determine action based on reasoning
  const action = 'calculate_distance';
  const actionInput = {
    x1: 0, y1: 0,
    x2: 3, y2: 4
  };
  
  contextHistory.push(\`Action: \${action}(\${JSON.stringify(actionInput)})\`);`,
          explanation: 'Based on its thinking, the agent decides on an action to take.',
          variableState: {
            'action': 'calculate_distance',
            'actionInput': '{x1: 0, y1: 0, x2: 3, y2: 4}'
          },
          duration: 1200
        },
        {
          code: `  // Step 4: Execute the determined action and get observation
  const executeAction = (action, input) => {
    if (action === 'calculate_distance') {
      const { x1, y1, x2, y2 } = input;
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    return null;
  };
  
  const observation = executeAction(action, actionInput);
  contextHistory.push(\`Observation: \${observation}\`);`,
          explanation: 'The agent executes the action and observes the result.',
          output: 'Executing action: calculate_distance...\nResult: 5',
          variableState: {
            'observation': '5',
            'contextHistory': '["User Query: ...", "Thoughts: ...", "Action: ...", "Observation: 5"]'
          },
          duration: 1800
        },
        {
          code: `  // Step 5: Generate final response using the observation
  const responsePrompt = \`
    You are an AI assistant solving a problem.
    
    Context:
    \${contextHistory.join('\\n')}
    
    Based on the above context, provide a clear final answer to the original query.
  \`;
  
  const response = await llm(responsePrompt);
  
  return response;
};`,
          explanation: 'Finally, the agent generates a comprehensive response based on all context gathered through the process.',
          output: 'Generating final response...',
          variableState: {
            'response': 'The distance between the points (0,0) and (3,4) is 5 units.'
          },
          duration: 2000
        }
      ]
    },
    python: {
      description: 'ReAct pattern implementation showing reasoning and action cycles in Python',
      blocks: [
        {
          code: `def react_agent(query, max_iterations=3):
    """
    ReAct pattern: Reasoning and Acting in an iterative loop
    """
    context = []
    context.append(f"Query: {query}")`,
          explanation: 'Initialize the ReAct agent with the user query and create an empty context list to track the interaction.',
          variableState: {
            'query': '"Calculate distance between two points"',
            'context': '[]',
            'max_iterations': '3'
          },
          duration: 1000
        },
        {
          code: `    # First reasoning step
    thinking_prompt = f"""
    You are an AI assistant using the ReAct pattern.
    Query: {query}
    
    Think step-by-step about how to solve this problem.
    """
    
    thoughts = llm(thinking_prompt)
    context.append(f"Thoughts: {thoughts}")`,
          explanation: 'The agent first reasons about the problem by thinking through the steps needed to solve it.',
          output: 'Generating reasoning about calculating distance between points...',
          variableState: {
            'thoughts': 'For calculating distance between two points (x1,y1) and (x2,y2), I need to use the Pythagorean theorem: d = sqrt((x2-x1)^2 + (y2-y1)^2)'
          },
          duration: 1500
        },
        {
          code: `    # Determine action based on reasoning
    action = "calc_distance"
    action_input = {
        "x1": 0, "y1": 0,
        "x2": 3, "y2": 4
    }
    
    context.append(f"Action: {action}({action_input})")`,
          explanation: 'Based on its reasoning, the agent determines which action to take and the necessary inputs.',
          variableState: {
            'action': 'calc_distance',
            'action_input': '{"x1": 0, "y1": 0, "x2": 3, "y2": 4}'
          },
          duration: 1000
        },
        {
          code: `    # Execute the action
    def execute_action(action_name, params):
        if action_name == "calc_distance":
            x1, y1 = params["x1"], params["y1"]
            x2, y2 = params["x2"], params["y2"]
            distance = ((x2 - x1)**2 + (y2 - y1)**2)**0.5
            return distance
        return None
        
    observation = execute_action(action, action_input)
    context.append(f"Observation: {observation}")`,
          explanation: 'The agent executes the action and records the observation.',
          output: 'Distance calculated: 5.0',
          variableState: {
            'observation': '5.0'
          },
          duration: 1800
        },
        {
          code: `    # Generate final response
    response_prompt = f"""
    You are an AI assistant solving a problem.
    
    Context:
    {chr(10).join(context)}
    
    Based on the above context, provide a clear final answer.
    """
    
    response = llm(response_prompt)
    return response`,
          explanation: 'The agent generates a final response based on the complete context including reasoning, actions, and observations.',
          output: 'The distance between points (0,0) and (3,4) is 5 units.',
          variableState: {
            'response': 'The distance between points (0,0) and (3,4) is 5 units.'
          },
          duration: 2000
        }
      ]
    }
  },
  
  'codeact': {
    typescript: {
      description: 'The CodeAct pattern involves generating, executing, and refining code to solve problems.',
      blocks: [
        {
          code: `const executeCodeAct = async (query: string, maxCycles = 3) => {
  // Initialize state
  let currentCycle = 0;
  let done = false;
  let contextHistory = [];
  let finalResult = '';

  // Simulate Python code execution environment
  const executeCode = async (code: string) => {
    console.log("Executing Python code (simulated):");
    console.log(code);
    
    // This is a simulation - in a real implementation,
    // this would execute Python code and return the results
    
    // Return simulated result based on code content
    if (code.includes('factorial')) {
      return "Function defined successfully.";
    }
    return "Code executed.";
  };`,
          explanation: 'Initialize the CodeAct agent with support for generating and executing Python code.',
          variableState: {
            'query': '"Write a function to calculate factorial"',
            'maxCycles': '3',
            'currentCycle': '0',
            'done': 'false',
            'contextHistory': '[]'
          },
          duration: 1500
        },
        {
          code: `  // Add the initial query to context
  contextHistory.push(\`User query: \${query}\`);

  // Begin CodeAct loop
  while (!done && currentCycle < maxCycles) {
    currentCycle++;
    
    // Generate agent response with code
    const agentPrompt = \`
      You are a CodeAct agent that solves problems by writing Python code.
      
      Task: \${query}
      
      Previous interactions:
      \${contextHistory.join('\\n\\n')}
      
      Write Python code to solve this problem.
    \`;`,
          explanation: 'The agent begins processing the query and prepares to generate code.',
          output: 'Starting CodeAct cycle 1...',
          variableState: {
            'currentCycle': '1',
            'contextHistory': '["User query: Write a function to calculate factorial"]'
          },
          duration: 1200
        },
        {
          code: `    // LLM generates code solution
    const agentResponse = await llm(agentPrompt);
    contextHistory.push(\`Agent: \${agentResponse}\`);
    
    // Extract code block from response
    const codeMatch = agentResponse.match(/\`\`\`python\\s*([\\s\\S]*?)\\s*\`\`\`/);
    
    if (codeMatch) {
      const code = codeMatch[1].trim();
      
      // Execute the code
      const executionResult = await executeCode(code);
      contextHistory.push(\`Observation: \${executionResult}\`);`,
          explanation: 'The agent generates Python code and executes it.',
          output: 'Code generated:\n```python\ndef factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n```',
          variableState: {
            'agentResponse': 'Here\'s a recursive function to calculate factorial:\n```python\ndef factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n```',
            'code': 'def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)'
          },
          duration: 2000
        },
        {
          code: `      // Test the code with an example
      const testPrompt = \`
        You are testing the following Python code:
        
        \${code}
        
        Evaluate if this code correctly solves the task: \${query}
        If there are any bugs or improvements needed, explain them.
        Otherwise, state that the code works correctly.
      \`;
      
      const evaluation = await llm(testPrompt);
      contextHistory.push(\`Evaluation: \${evaluation}\`);
      
      // Check if code is satisfactory
      if (evaluation.toLowerCase().includes('works correctly')) {
        done = true;
        finalResult = code;
      }`,
          explanation: 'The agent evaluates the generated code to check for correctness.',
          output: 'Executing code...\nCode executed. Function defined successfully.',
          variableState: {
            'executionResult': 'Function defined successfully.',
            'evaluation': 'The code works correctly. It handles the base cases (n=0 and n=1) and uses recursion correctly for other values.',
            'done': 'true'
          },
          duration: 1800
        },
        {
          code: `  }
  
  // Return final result
  return {
    status: done ? 'success' : 'max_cycles_reached',
    cycles: currentCycle,
    code: finalResult,
    history: contextHistory
  };
};`,
          explanation: 'The agent completes execution and returns the final result with history.',
          output: 'CodeAct execution complete: Successfully generated factorial function',
          variableState: {
            'finalResult': 'def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)',
            'return value': '{status: "success", cycles: 1, code: "def factorial(n):\n    ..."}' 
          },
          duration: 1000
        }
      ]
    }
  },
  
  'self-reflection': {
    typescript: {
      description: 'The Self-Reflection pattern allows agents to evaluate and improve their own responses.',
      blocks: [
        {
          code: `const selfReflectionAgent = async (query: string, maxReflections = 2) => {
  // Initialize state
  let currentReflection = 0;
  let bestResponse = '';
  let responseQuality = 0;
  let reflectionHistory = [];
  
  // Add initial query
  reflectionHistory.push(\`Query: \${query}\`);`,
          explanation: 'Initialize a self-reflection agent that can evaluate and improve its responses.',
          variableState: {
            'query': '"Explain how quantum computing differs from classical computing"',
            'maxReflections': '2',
            'currentReflection': '0',
            'reflectionHistory': '[]'
          },
          duration: 1000
        },
        {
          code: `  // Initial response generation
  const initialPrompt = \`
    You are an AI assistant answering a user's question.
    
    Question: \${query}
    
    Provide a clear, accurate, and comprehensive response.
  \`;
  
  const initialResponse = await llm(initialPrompt);
  bestResponse = initialResponse;
  reflectionHistory.push(\`Initial response: \${initialResponse}\`);`,
          explanation: 'The agent generates its first response to the query.',
          output: 'Generating initial response...',
          variableState: {
            'initialResponse': 'Quantum computing leverages quantum bits or qubits that can exist in multiple states simultaneously due to superposition, unlike classical bits that are either 0 or 1...',
            'bestResponse': 'Quantum computing leverages quantum bits or qubits that can exist in multiple states simultaneously due to superposition, unlike classical bits that are either 0 or 1...'
          },
          duration: 2000
        },
        {
          code: `  // Begin reflection iterations
  while (currentReflection < maxReflections) {
    currentReflection++;
    
    // Self-reflection to evaluate current best response
    const reflectionPrompt = \`
      You are an AI assistant evaluating your previous response:
      
      Question: \${query}
      
      Your response: \${bestResponse}
      
      Critically evaluate your response on a scale of 1-10, and explain:
      1. What aspects were strong?
      2. What was missing or could be improved?
      3. Any factual errors to correct?
    \`;
    
    const reflection = await llm(reflectionPrompt);
    reflectionHistory.push(\`Reflection #\${currentReflection}: \${reflection}\`);`,
          explanation: 'The agent reflects on its own response, looking for areas to improve.',
          output: 'Reflecting on initial response...',
          variableState: {
            'currentReflection': '1',
            'reflection': 'Evaluation: 7/10\n\nStrong aspects:\n- Clear explanation of qubits vs classical bits\n- Mentioned superposition\n\nImprovements needed:\n- Didn\'t explain entanglement\n- Missing practical applications\n- No mention of quantum algorithms\n\nNo factual errors detected.'
          },
          duration: 2000
        },
        {
          code: `    // Generate improved response based on reflection
    const improvedPrompt = \`
      You are an AI assistant improving your previous response.
      
      Question: \${query}
      
      Your previous response: \${bestResponse}
      
      Your reflection: \${reflection}
      
      Generate an improved response that addresses all the issues identified.
    \`;
    
    const improvedResponse = await llm(improvedPrompt);
    reflectionHistory.push(\`Improved response #\${currentReflection}: \${improvedResponse}\`);
    
    // Update best response
    bestResponse = improvedResponse;`,
          explanation: 'Based on its reflection, the agent generates an improved response.',
          output: 'Generating improved response...',
          variableState: {
            'improvedResponse': 'Quantum computing differs from classical computing in several fundamental ways. While classical computers use bits (0 or 1), quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously through superposition. Another key phenomenon is quantum entanglement, which allows qubits to be correlated in ways impossible for classical bits...',
            'bestResponse': 'Quantum computing differs from classical computing in several fundamental ways. While classical computers use bits (0 or 1), quantum computers use quantum bits or "qubits" that can exist in multiple states simultaneously through superposition. Another key phenomenon is quantum entanglement, which allows qubits to be correlated in ways impossible for classical bits...'
          },
          duration: 2000
        },
        {
          code: `    // Check if response quality has plateaued
    const qualityCheckPrompt = \`
      Rate the quality of this response on a scale of 1-10:
      \${bestResponse}
    \`;
    
    const qualityCheck = await llm(qualityCheckPrompt);
    const qualityMatch = qualityCheck.match(/([0-9]+(\\.[0-9]+)?)/);
    const newQuality = qualityMatch ? parseFloat(qualityMatch[0]) : 0;
    
    // If minimal improvement, stop early
    if (newQuality - responseQuality < 1 && currentReflection > 0) {
      break;
    }
    
    responseQuality = newQuality;
  }`,
          explanation: 'The agent checks if the quality of its response has improved significantly.',
          output: 'Evaluating response quality...',
          variableState: {
            'qualityCheck': 'Rating: 9/10',
            'newQuality': '9',
            'responseQuality': '9'
          },
          duration: 1500
        },
        {
          code: `  // Return the final improved response
  return {
    finalResponse: bestResponse,
    reflections: currentReflection,
    history: reflectionHistory
  };
};`,
          explanation: 'The agent returns its final, improved response after self-reflection.',
          output: 'Self-reflection process complete.',
          variableState: {
            'return value': '{finalResponse: "Quantum computing differs from classical computing...", reflections: 1, history: [...]}'
          },
          duration: 1000
        }
      ]
    }
  }
};

/**
 * Get execution examples for a specific pattern and language
 */
export function getCodeExecutionExample(patternId: string, language: 'python' | 'typescript') {
  const example = codeExecutionExamples[patternId]?.[language];
  return example ?? null; // Return null instead of undefined
}