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
  },

  'evaluator-optimizer': {
    typescript: {
      description: 'The Evaluator-Optimizer pattern assesses outputs and iteratively improves them based on specific criteria.',
      blocks: [
        {
          code: `const evaluatorOptimizer = async (query: string, initialResponse: string) => {
  // Initialize state variables
  const evaluations = [];
  const responses = [initialResponse];
  let iterations = 0;
  const maxIterations = 2;
  let overallScore = 0;
  
  // Define evaluation criteria
  const evaluationCriteria = {
    accuracy: "Is the information factually correct?",
    completeness: "Does it fully address the query?",
    clarity: "Is it easy to understand?",
    helpfulness: "Does it provide actionable insights?",
    conciseness: "Is it appropriately detailed without being verbose?"
  };`,
          explanation: 'Set up the evaluator-optimizer with criteria for assessing response quality.',
          variableState: {
            'query': '"Explain agent patterns in AI"',
            'initialResponse': '"Agent patterns are common structures used in AI systems."',
            'evaluations': '[]',
            'responses': '["Agent patterns are common structures used in AI systems."]'
          },
          duration: 1500
        },
        {
          code: `  // First evaluation cycle
  iterations++;
  const currentResponse = responses[responses.length - 1];
  
  // Evaluate the current response
  const evaluationPrompt = \`
    Evaluate this response to the query based on these criteria:
    
    Query: \${query}
    
    Response to evaluate:
    \${currentResponse}
    
    Criteria:
    \${JSON.stringify(evaluationCriteria, null, 2)}
    
    For each criterion, provide a score (0-10) and specific feedback.
    Finally, calculate an overall quality score (0-1 scale).
  \`;`,
          explanation: 'First evaluation cycle - the agent analyzes the initial response against the criteria.',
          output: 'Evaluating initial response...',
          variableState: {
            'iterations': '1',
            'currentResponse': '"Agent patterns are common structures used in AI systems."'
          },
          duration: 1800
        },
        {
          code: `  // Simulate LLM evaluation
  const evaluationResult = {
    criteria: {
      accuracy: { score: 7, feedback: "Technically correct but very limited in detail." },
      completeness: { score: 3, feedback: "Severely lacking examples and pattern types." },
      clarity: { score: 6, feedback: "Clear but too simplistic." },
      helpfulness: { score: 3, feedback: "Provides little actionable information." },
      conciseness: { score: 8, feedback: "Concise, but needs more detail." }
    },
    overall_score: 0.54,
    primary_improvements_needed: [
      "Add specific examples of agent patterns",
      "Explain key pattern types",
      "Provide more technical depth"
    ]
  };
  
  evaluations.push(evaluationResult);
  overallScore = evaluationResult.overall_score;`,
          explanation: 'The agent evaluates the response and identifies areas for improvement.',
          variableState: {
            'evaluationResult': '{criteria: {...}, overall_score: 0.54, primary_improvements_needed: [...]}',
            'overallScore': '0.54'
          },
          duration: 1500
        },
        {
          code: `  // First optimization cycle
  const optimizationPrompt = \`
    Improve the following response based on this evaluation:
    
    Query: \${query}
    
    Current response:
    \${currentResponse}
    
    Evaluation:
    \${JSON.stringify(evaluationResult, null, 2)}
    
    Create an improved response that addresses these issues while maintaining strengths.
  \`;
  
  // Simulate LLM optimization
  const optimizedResponse = \`Agent patterns are structural frameworks that guide how AI agents process information and make decisions. Key patterns include:

1. ReAct (Reasoning + Acting): Alternates between thinking and performing actions.
2. Reflexion: Enables self-critique to improve responses through iteration.
3. Plan-Execute: Creates detailed plans before execution.
4. Chain-of-Thought: Breaks reasoning into explicit steps.

These patterns help AI systems handle complex tasks by providing structured approaches to problem-solving, similar to design patterns in software engineering.\`;
  
  responses.push(optimizedResponse);`,
          explanation: 'The agent optimizes the response based on the evaluation feedback.',
          output: 'Generating improved response...',
          variableState: {
            'optimizedResponse': 'Agent patterns are structural frameworks that guide how AI agents process information and make decisions. Key patterns include: 1. ReAct (Reasoning + Acting)...',
            'responses': '[initial response, optimized response]'
          },
          duration: 2000
        },
        {
          code: `  // Second evaluation cycle
  iterations++;
  const nextResponse = responses[responses.length - 1];
  
  // Evaluate the improved response
  const secondEvalPrompt = \`
    Evaluate this response to the query based on these criteria:
    
    Query: \${query}
    
    Response to evaluate:
    \${nextResponse}
    
    Criteria:
    \${JSON.stringify(evaluationCriteria, null, 2)}
    
    For each criterion, provide a score (0-10) and specific feedback.
    Finally, calculate an overall quality score (0-1 scale).
  \`;
  
  // Simulate LLM evaluation of improved response
  const secondEvalResult = {
    criteria: {
      accuracy: { score: 9, feedback: "Accurate with good examples." },
      completeness: { score: 8, feedback: "Covers main patterns but could include more on applications." },
      clarity: { score: 9, feedback: "Clear structure with good definitions." },
      helpfulness: { score: 8, feedback: "Provides useful context and examples." },
      conciseness: { score: 9, feedback: "Well-balanced level of detail." }
    },
    overall_score: 0.86,
    primary_improvements_needed: [
      "Add practical applications"
    ]
  };
  
  evaluations.push(secondEvalResult);
  overallScore = secondEvalResult.overall_score;`,
          explanation: 'Second evaluation cycle - the agent reassesses the improved response.',
          output: 'Evaluating improved response...',
          variableState: {
            'iterations': '2',
            'nextResponse': 'Agent patterns are structural frameworks...',
            'secondEvalResult': '{criteria: {...}, overall_score: 0.86, primary_improvements_needed: [...]}'
          },
          duration: 1800
        },
        {
          code: `  // Return the final result with evaluation history
  return {
    status: "success",
    iterations: iterations,
    evaluations: evaluations,
    responses: responses,
    final_response: responses[responses.length - 1],
    final_score: overallScore
  };
};`,
          explanation: 'The agent returns the final improved response along with evaluation history.',
          output: 'Evaluation-Optimization process complete.',
          variableState: {
            'return value': '{status: "success", iterations: 2, evaluations: [...], responses: [...], final_response: "Agent patterns are structural frameworks...", final_score: 0.86}'
          },
          duration: 1000
        }
      ]
    }
  },

  'plan-execute': {
    typescript: {
      description: 'The Plan-Execute pattern involves creating a detailed plan before executing actions to solve complex problems.',
      blocks: [
        {
          code: `const planExecuteAgent = async (query: string) => {
  // Available tools for execution
  const tools = {
    search: (query: string) => ({ results: \`Search results for '\${query}'\` }),
    calculate: (expr: string) => ({ result: eval(expr) }),
    weather: (location: string) => ({ temperature: 72, condition: "sunny" })
  };
  
  console.log(\`Processing query: \${query}\`);`,
          explanation: 'Initialize the Plan-Execute agent with tools for execution.',
          variableState: {
            'query': '"Create a 3-day itinerary for New York City"',
            'tools': '{search: Function, calculate: Function, weather: Function}'
          },
          duration: 1000
        },
        {
          code: `  // Step 1: Planning phase - create detailed plan
  const planningPrompt = \`
    Create a detailed step-by-step plan to solve this problem:
    
    Problem: \${query}
    
    Available tools:
    - search: Search for information online
    - calculate: Perform mathematical calculations
    - weather: Get weather information for a location
    
    Your plan should include sequential steps with tools to use for each step.
    Format your response as a JSON object with steps as an array.
  \`;
  
  // Simulate LLM plan generation
  const plan = {
    goal: "Create a 3-day itinerary for New York City",
    steps: [
      {
        step_id: 1,
        description: "Get weather forecast for New York City",
        tool: "weather",
        input: "New York City",
        success_criteria: "Obtain temperature and conditions"
      },
      {
        step_id: 2,
        description: "Find top attractions in NYC",
        tool: "search",
        input: "top tourist attractions in New York City",
        success_criteria: "List of at least 5 popular attractions"
      },
      {
        step_id: 3,
        description: "Search for restaurant recommendations",
        tool: "search",
        input: "best restaurants in New York City for tourists",
        success_criteria: "List of restaurant options for different areas"
      }
    ]
  };`,
          explanation: 'Planning phase - the agent creates a detailed plan with sequential steps.',
          output: 'Creating detailed plan for New York City itinerary...',
          variableState: {
            'plan': '{goal: "Create a 3-day itinerary for New York City", steps: [...]}'
          },
          duration: 2000
        },
        {
          code: `  console.log(\`Plan created with \${plan.steps.length} steps\`);
  
  // Step 2: Execution phase - execute each step
  const results = [];
  
  for (const step of plan.steps) {
    console.log(\`Executing step \${step.step_id}: \${step.description}\`);
    
    // Get the appropriate tool
    const toolName = step.tool;
    const toolInput = step.input;
    
    try {
      // Execute the tool if available
      if (tools[toolName]) {
        const result = tools[toolName](toolInput);
        
        results.push({
          step_id: step.step_id,
          description: step.description,
          status: "success",
          result: result
        });
      } else {
        results.push({
          step_id: step.step_id,
          description: step.description,
          status: "failed",
          error: \`Tool '\${toolName}' not found\`
        });
      }
    } catch (error) {
      results.push({
        step_id: step.step_id,
        description: step.description,
        status: "failed",
        error: error.message
      });
    }
  }`,
          explanation: 'Execution phase - the agent executes each step in the plan sequentially.',
          output: 'Plan created with 3 steps\nExecuting step 1: Get weather forecast for New York City\nExecuting step 2: Find top attractions in NYC\nExecuting step 3: Search for restaurant recommendations',
          variableState: {
            'results': [
              {step_id: 1, status: "success", result: {temperature: 72, condition: "sunny"}},
              {step_id: 2, status: "success", result: {results: "Search results for 'top tourist attractions in New York City'"}},
              {step_id: 3, status: "success", result: {results: "Search results for 'best restaurants in New York City for tourists'"}}
            ]
          },
          duration: 2500
        },
        {
          code: `  // Step 3: Synthesis phase - combine results into final response
  const synthesisPrompt = \`
    Synthesize the results of the executed plan into a coherent response:
    
    Original query: \${query}
    
    Plan: \${JSON.stringify(plan, null, 2)}
    
    Results: \${JSON.stringify(results, null, 2)}
    
    Create a comprehensive response that addresses the original query.
  \`;
  
  // Simulate LLM synthesis
  const synthesis = \`# 3-Day New York City Itinerary

## Weather Forecast
The weather in New York City will be sunny with temperatures around 72°F (22°C), perfect for sightseeing!

## Day 1: Manhattan Highlights
- Morning: Visit the Empire State Building for panoramic city views
- Lunch: Try Chelsea Market for diverse food options
- Afternoon: Explore Central Park and the Met Museum
- Dinner: Enjoy Italian cuisine in Little Italy

## Day 2: Downtown & Brooklyn
- Morning: Visit the 9/11 Memorial and One World Observatory
- Lunch: Grab food at Brookfield Place
- Afternoon: Walk across Brooklyn Bridge and explore DUMBO
- Dinner: Pizza at Juliana's or Grimaldi's in Brooklyn

## Day 3: Midtown & Beyond
- Morning: Visit Times Square and Rockefeller Center
- Lunch: Food halls at Grand Central Terminal
- Afternoon: MoMA or shopping on Fifth Avenue
- Dinner: Try a Broadway district restaurant before a show

This itinerary gives you a mix of iconic landmarks, cultural experiences, and local favorites!\`;
  
  return {
    status: "success",
    plan: plan,
    execution_results: results,
    final_response: synthesis
  };
};`,
          explanation: 'Synthesis phase - the agent combines execution results into a coherent response.',
          output: 'Synthesizing final response from execution results...',
          variableState: {
            'synthesis': '# 3-Day New York City Itinerary\n## Weather Forecast\nThe weather in New York City will be sunny...',
            'return value': '{status: "success", plan: {...}, execution_results: [...], final_response: "# 3-Day New York City Itinerary..."}'
          },
          duration: 2000
        }
      ]
    }
  },

  'agentic-rag': {
    typescript: {
      description: 'The Agentic RAG pattern enhances retrieval-augmented generation with active decision making.',
      blocks: [
        {
          code: `const agenticRAG = async (query: string) => {
  console.log(\`Processing query: \${query}\`);
  
  // Simulated document store for demonstration
  const documents = [
    { id: "doc1", content: "Azure AI Agents are systems that can understand goals and complete tasks." },
    { id: "doc2", content: "Agent patterns include ReAct, Reflexion, and Plan-and-Execute methodologies." },
    { id: "doc3", content: "The Agent Communication Protocol (ACP) enables interoperability between AI agents." },
    { id: "doc4", content: "Model Context Protocol (MCP) provides standardized interactions with AI models." },
    { id: "doc5", content: "Azure OpenAI Service provides secure, enterprise-ready AI capabilities." }
  ];
  
  const retrievalSteps = [];`,
          explanation: 'Initialize Agentic RAG with a document store for retrieval.',
          variableState: {
            'query': '"Explain agent patterns and their communication protocols"',
            'documents': '[{id: "doc1", content: "Azure AI Agents..."}, ...]',
            'retrievalSteps': '[]'
          },
          duration: 1200
        },
        {
          code: `  // Step 1: Query Decomposition
  const decompositionPrompt = \`
    Analyze this query and break it into search terms:
    Query: \${query}
    
    Output a JSON with:
    1. "search_terms": Array of specific terms to search for
    2. "required_info": Key information needed
    3. "query_type": Classification of query type
  \`;
  
  // Simulated query decomposition
  const decomposition = {
    search_terms: ["agent patterns", "communication protocols", "AI agents"],
    required_info: ["Types of agent patterns", "Communication between agents", "Protocols used"],
    query_type: "explanation"
  };
  
  retrievalSteps.push({
    step: "Query Decomposition",
    output: decomposition
  });`,
          explanation: 'Step 1: Query Decomposition - break down the query into specific search terms.',
          output: 'Decomposing query into search components...',
          variableState: {
            'decomposition': '{search_terms: ["agent patterns", "communication protocols", "AI agents"], ...}',
            'retrievalSteps': '[{step: "Query Decomposition", output: {...}}]'
          },
          duration: 1800
        },
        {
          code: `  // Step 2: Intelligent Retrieval
  const retrievedDocs = [];
  
  for (const term of decomposition.search_terms) {
    // Simulate semantic search with simple string matching
    const matchingDocs = documents.filter(doc => 
      doc.content.toLowerCase().includes(term.toLowerCase())
    );
    retrievedDocs.push(...matchingDocs);
  }
  
  // Remove duplicates
  const uniqueDocs = [...new Map(retrievedDocs.map(doc => 
    [doc.id, doc]
  )).values()];
  
  retrievalSteps.push({
    step: "Document Retrieval",
    output: uniqueDocs
  });`,
          explanation: 'Step 2: Intelligent Retrieval - find documents matching search terms.',
          output: 'Retrieving relevant documents from knowledge base...',
          variableState: {
            'uniqueDocs': '[{id: "doc2", content: "Agent patterns include ReAct, Reflexion, and Plan-and-Execute methodologies."}, {id: "doc3", content: "The Agent Communication Protocol (ACP) enables interoperability between AI agents."}, ...]'
          },
          duration: 1500
        },
        {
          code: `  // Step 3: Relevance Assessment
  const relevancePrompt = \`
    Assess the relevance of each document to this query:
    Query: \${query}
    
    Documents:
    \${JSON.stringify(uniqueDocs, null, 2)}
    
    For each document, rate relevance from 0-10 and explain why.
  \`;
  
  // Simulated relevance assessment
  const relevanceAssessment = uniqueDocs.map(doc => {
    let relevance = 0;
    let reason = "";
    
    if (doc.content.includes("Agent patterns")) {
      relevance = 9;
      reason = "Directly addresses agent patterns";
    } else if (doc.content.includes("Communication Protocol")) {
      relevance = 8;
      reason = "Covers communication protocols between agents";
    } else if (doc.content.includes("AI Agents")) {
      relevance = 7;
      reason = "Provides context about AI agents";
    } else {
      relevance = 5;
      reason = "Somewhat related to the query";
    }
    
    return {
      doc_id: doc.id,
      relevance,
      reason
    };
  }).sort((a, b) => b.relevance - a.relevance);
  
  retrievalSteps.push({
    step: "Relevance Assessment",
    output: relevanceAssessment
  });`,
          explanation: 'Step 3: Relevance Assessment - determine how relevant each document is to the query.',
          output: 'Assessing document relevance scores...',
          variableState: {
            'relevanceAssessment': '[{doc_id: "doc2", relevance: 9, reason: "Directly addresses agent patterns"}, {doc_id: "doc3", relevance: 8, reason: "Covers communication protocols between agents"}, ...]'
          },
          duration: 2000
        },
        {
          code: `  // Step 4: Information Synthesis
  // Get content from relevant documents (relevance >= 6)
  const relevantContent = relevanceAssessment
    .filter(assessment => assessment.relevance >= 6)
    .map(assessment => {
      const doc = uniqueDocs.find(d => d.id === assessment.doc_id);
      return doc ? doc.content : "";
    })
    .join("\\n\\n");
  
  const synthesisPrompt = \`
    Synthesize an answer using this information:
    
    Query: \${query}
    
    Relevant Information:
    \${relevantContent}
    
    Provide a comprehensive answer addressing all aspects.
  \`;
  
  // Simulated synthesis result
  const synthesis = \`Agent patterns are methodologies for designing AI agents with specific capabilities and behaviors. The main patterns include:

1. ReAct (Reasoning and Acting): Combines reasoning about a problem with taking actions.

2. Reflexion: Enables self-improvement through reflection on past performance.

3. Plan-and-Execute: Creates detailed plans before executing actions.

These agent patterns communicate using standardized protocols such as:

- Agent Communication Protocol (ACP): Enables interoperability between different AI agents, allowing them to exchange information and coordinate tasks regardless of their underlying implementation.

- Model Context Protocol (MCP): Provides standardized ways for agents to interact with AI models, creating a consistent interface for communication.

These protocols are essential for creating complex systems where multiple agents need to work together coherently.\`;
  
  retrievalSteps.push({
    step: "Information Synthesis",
    output: synthesis
  });`,
          explanation: 'Step 4: Information Synthesis - combine relevant information into a coherent response.',
          output: 'Synthesizing final response from relevant documents...',
          variableState: {
            'relevantContent': 'Agent patterns include ReAct, Reflexion, and Plan-and-Execute methodologies.\n\nThe Agent Communication Protocol (ACP) enables interoperability between AI agents.\n\nModel Context Protocol (MCP) provides standardized interactions with AI models.',
            'synthesis': 'Agent patterns are methodologies for designing AI agents with specific capabilities and behaviors. The main patterns include...'
          },
          duration: 2000
        },
        {
          code: `  // Return the final result with process trace
  return {
    status: "success",
    answer: synthesis,
    process: retrievalSteps,
    sources: relevanceAssessment
      .filter(assessment => assessment.relevance >= 6)
      .map(assessment => assessment.doc_id)
  };
};`,
          explanation: 'Return the final result with the complete process trace and sources.',
          output: 'Agentic RAG process complete.',
          variableState: {
            'return value': '{status: "success", answer: "Agent patterns are methodologies...", process: [...], sources: ["doc2", "doc3", "doc1"]}'
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