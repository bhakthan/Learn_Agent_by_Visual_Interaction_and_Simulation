import { CodeExecutionStep } from '@/components/code-playbook/CodeStepVisualizer';

interface StepData {
  [patternId: string]: {
    python?: CodeExecutionStep[];
    typescript?: CodeExecutionStep[];
  };
}

/**
 * Maps pattern IDs to their code execution steps for both Python and TypeScript
 * Each step represents a segment of code being executed with relevant context
 */
export const codeExecutionSteps: StepData = {
  'react': {
    python: [
      {
        lineStart: 7,
        lineEnd: 16,
        description: 'Initialize the ReAct agent class with model settings',
        variableState: {
          'client': 'OpenAI client instance',
          'model': '"gpt-4"'
        }
      },
      {
        lineStart: 18,
        lineEnd: 35,
        description: 'Begin agent execution and initialize state variables',
        variableState: {
          'current_cycle': '0',
          'done': 'false',
          'context_history': '[]',
          'final_answer': '""',
          'query': '"Calculate distance between two points"'
        }
      },
      {
        lineStart: 37,
        lineEnd: 55,
        description: 'Set up available tools for the agent to use',
        output: 'Tools initialized: search, calculate, weather',
        variableState: {
          'tools': '{search: Function, calculate: Function, weather: Function}'
        }
      },
      {
        lineStart: 57,
        lineEnd: 97,
        description: 'Agent reasoning phase with LLM',
        output: 'Reasoning: I need to calculate the distance between two points (3,4) and (0,0)',
        variableState: {
          'current_cycle': '1',
          'reasoning_response': 'Thought: I need to calculate the distance...\nAction: calculate\nAction Input: ((3**2 + 4**2) ** 0.5)'
        }
      },
      {
        lineStart: 99,
        lineEnd: 121,
        description: 'Agent action phase - execute the selected tool',
        output: 'Executing calculation: ((3**2 + 4**2) ** 0.5)',
        variableState: {
          'tool_name': 'calculate',
          'tool_input': '((3**2 + 4**2) ** 0.5)',
          'tool_result': '5.0',
          'observation': 'Observation: {"result": 5.0}'
        }
      },
      {
        lineStart: 123,
        lineEnd: 137,
        description: 'Return final results from the agent',
        output: 'Final answer: The distance between points (0,0) and (3,4) is 5 units',
        variableState: {
          'status': 'success',
          'cycles': '1',
          'answer': 'The distance between points (0,0) and (3,4) is 5 units',
          'history': '[User query, Reasoning, Observation]'
        }
      }
    ],
    typescript: [
      {
        lineStart: 0,
        lineEnd: 7,
        description: 'Initialize function and state variables',
        variableState: {
          'query': '"Calculate distance between two points"',
          'contextHistory': '[]'
        }
      },
      {
        lineStart: 9,
        lineEnd: 19,
        description: 'First prompt to LLM for thinking about the problem',
        output: '> Constructing initial prompt with user query\n> Sending to LLM',
        variableState: {
          'thoughts': '{Reasoning text from LLM}',
          'contextHistory': '[User query, LLM thoughts]'
        }
      },
      {
        lineStart: 21,
        lineEnd: 30,
        description: 'Determine action to take based on thoughts',
        output: '> Action selected: calculate_distance',
        variableState: {
          'action': 'calculate_distance',
          'actionInput': '{x1: 0, y1: 0, x2: 3, y2: 4}'
        }
      },
      {
        lineStart: 32,
        lineEnd: 41,
        description: 'Execute action and observe result',
        output: '> Executing distance calculation\n> Result: 5.0',
        variableState: {
          'observation': '5.0',
          'contextHistory': '[Query, Thoughts, Action, Observation]'
        }
      },
      {
        lineStart: 43,
        lineEnd: 55,
        description: 'Generate final response with LLM',
        output: '> Formulating final response\n> "The distance between points (0,0) and (3,4) is 5 units."',
        variableState: {
          'response': 'The distance between points (0,0) and (3,4) is 5 units.'
        }
      }
    ]
  },
  
  'codeact': {
    python: [
      {
        lineStart: 7,
        lineEnd: 16,
        description: 'Initialize CodeAct agent class and variables',
        variableState: {
          'client': 'OpenAI client instance',
          'model': '"gpt-4"'
        }
      },
      {
        lineStart: 18,
        lineEnd: 30,
        description: 'Begin execution and setup state tracking',
        variableState: {
          'query': '"Write code to find the factorial of a number"',
          'current_cycle': '0',
          'done': 'false',
          'context_history': '[]',
          'final_result': '""'
        }
      },
      {
        lineStart: 32,
        lineEnd: 54,
        description: 'Define code execution simulation environment',
        output: 'Setting up code execution environment',
        variableState: {
          'execute_code': 'function(code) { /* code execution simulation */ }'
        }
      },
      {
        lineStart: 56,
        lineEnd: 58,
        description: 'Add initial query to context history',
        variableState: {
          'context_history': '["User query: Write code to find the factorial of a number"]'
        }
      },
      {
        lineStart: 60,
        lineEnd: 97,
        description: 'Generate first agent prompt and get response',
        output: 'Agent generates factorial function',
        variableState: {
          'current_cycle': '1',
          'agent_response': 'Thought: I\'ll write code to calculate factorial...\nCode:\n```\ndef factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n\n# Test with n=5\nresult = factorial(5)\nprint(result)\n```'
        }
      },
      {
        lineStart: 99,
        lineEnd: 115,
        description: 'Extract and execute the generated Python code',
        output: 'Code executed. Result: 120',
        variableState: {
          'code': 'def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n\n# Test with n=5\nresult = factorial(5)\nprint(result)',
          'execution_result': 'Output: 120'
        }
      }
    ],
    typescript: [
      {
        lineStart: 0,
        lineEnd: 10,
        description: 'Initialize CodeAct agent with initial setup',
        variableState: {
          'currentCycle': '0',
          'done': 'false',
          'contextHistory': '[]',
          'finalResult': '\"\\"'
        }
      },
      {
        lineStart: 12,
        lineEnd: 31,
        description: 'Define the code execution environment',
        variableState: {
          'executeCode': 'function (simulated)'
        }
      },
      {
        lineStart: 33,
        lineEnd: 40,
        description: 'Begin processing the user query',
        variableState: {
          'contextHistory': '["User query: Write code to find the factorial of a number"]'
        }
      },
      {
        lineStart: 42,
        lineEnd: 61,
        description: 'Generate agent prompt for code creation',
        output: '> Creating prompt for CodeAct agent',
        variableState: {
          'currentCycle': '1'
        }
      },
      {
        lineStart: 63,
        lineEnd: 68,
        description: 'LLM generates factorial function code',
        output: 'Thought: I need to write a function to calculate factorial\nCode:\n```python\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)\n```',
        variableState: {
          'agentResponse': 'Response containing code block'
        }
      },
      {
        lineStart: 70,
        lineEnd: 85,
        description: 'Extract and execute the Python code',
        output: 'Code executed. Result: Function defined successfully.',
        variableState: {
          'code': 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)',
          'executionResult': 'Function defined successfully.'
        }
      },
      {
        lineStart: 87,
        lineEnd: 92,
        description: 'Add execution result to context history',
        variableState: {
          'contextHistory': '[Query, Code, Execution result]'
        }
      }
    ]
  },
  
  'self-reflection': {
    python: [
      {
        lineStart: 7,
        lineEnd: 16,
        description: 'Initialize SelfReflection agent class',
        variableState: {
          'client': 'OpenAI client instance',
          'model': '"gpt-4"'
        }
      },
      {
        lineStart: 18,
        lineEnd: 25,
        description: 'Begin execution and set up state variables',
        variableState: {
          'query': '"Find the bug in this code: sum = 0; for i in range(1, 11): sum += i; print(sum/10)"',
          'revisions': '0',
          'reflections': '[]',
          'current_response': '""'
        }
      },
      {
        lineStart: 28,
        lineEnd: 36,
        description: 'Generate initial solution response',
        output: 'The factorial of a number n is the product of all positive integers less than or equal to n.',
        variableState: {
          'current_response': '"The factorial of a number n is the product of all positive integers less than or equal to n. It\'s often denoted as n!. So 5! = 5 × 4 × 3 × 2 × 1 = 120."'
        }
      },
      {
        lineStart: 38,
        lineEnd: 44,
        description: 'Store initial response in reflections',
        variableState: {
          'reflections': '[{iteration: 0, response: "The factorial...", reflection: null}]'
        }
      },
      {
        lineStart: 46,
        lineEnd: 64,
        description: 'First reflection cycle - evaluate initial solution',
        output: 'Reflection: The response is accurate but could be more complete.',
        variableState: {
          'revisions': '1',
          'reflection': 'The response is accurate but could be more complete. It defines factorial and gives an example for 5!, but doesn\'t explain how to calculate factorials for edge cases like 0! or mention practical applications or algorithmic implementations.'
        }
      },
      {
        lineStart: 66,
        lineEnd: 80,
        description: 'Generate improved response based on reflection',
        output: 'Improved response with edge cases and implementation details',
        variableState: {
          'current_response': '"The factorial of a number n is the product of all positive integers less than or equal to n, denoted as n!.\\n\\nExamples:\\n- 5! = 5 × 4 × 3 × 2 × 1 = 120\\n- 3! = 3 × 2 × 1 = 6\\n\\nEdge cases:\\n- 0! is defined as 1\\n- 1! = 1\\n\\nFactorials can be calculated recursively or iteratively..."'
        }
      },
      {
        lineStart: 81,
        lineEnd: 87,
        description: 'Store first revised response in reflections',
        variableState: {
          'reflections': '[initial reflection, {iteration: 1, response: "improved response", reflection: "..."}]'
        }
      },
      {
        lineStart: 89,
        lineEnd: 107,
        description: 'Second reflection cycle and further improvement',
        output: 'Second reflection and final improved solution',
        variableState: {
          'revisions': '2',
          'current_response': 'Final well-structured response with definition, examples, edge cases, and implementation'
        }
      }
    ]
  },
  
  'agentic-rag': {
    python: [
      {
        lineStart: 7,
        lineEnd: 16,
        description: 'Initialize AgenticRAG agent class and components',
        variableState: {
          'client': 'OpenAI client instance',
          'model': '"gpt-4"',
          'vector_store': 'null',
          'document_processor': 'null'
        }
      },
      {
        lineStart: 18,
        lineEnd: 28,
        description: 'Begin execution and set up document store',
        variableState: {
          'query': '"What are the main agent patterns used in Azure AI?"',
          'documents': 'Array of 5 document objects with content about AI agents'
        }
      },
      {
        lineStart: 30,
        lineEnd: 51,
        description: 'Step 1: Query decomposition to identify search terms',
        output: 'Decomposing query into search terms',
        variableState: {
          'decomposition_result': '{search_terms: ["agent patterns", "AI agents", "Azure AI", "communication protocols"], required_info: [...], query_type: "explanation"}'
        }
      },
      {
        lineStart: 53,
        lineEnd: 72,
        description: 'Step 2: Intelligent document retrieval based on search terms',
        output: 'Retrieved documents containing agent pattern information',
        variableState: {
          'retrieved_docs': 'Array of relevant documents',
          'unique_docs': 'Deduplicated array of documents'
        }
      },
      {
        lineStart: 74,
        lineEnd: 95,
        description: 'Step 3: Relevance assessment of retrieved documents',
        output: 'Assessing document relevance to the query',
        variableState: {
          'relevance_assessment': '[{doc_id: "doc2", relevance: 9, reason: "..."}, ...]'
        }
      },
      {
        lineStart: 97,
        lineEnd: 114,
        description: 'Step 4: Information synthesis from relevant documents',
        output: 'Synthesizing answer from relevant documents',
        variableState: {
          'content_for_synthesis': 'Compiled content from relevant documents',
          'synthesis_result': '"Agent patterns are methodologies for designing AI agents with specific capabilities..."'
        }
      }
    ]
  },
  
  'routing': {
    python: [
      {
        lineStart: 7,
        lineEnd: 16,
        description: 'Initialize RoutingAgent class',
        variableState: {
          'client': 'OpenAI client instance',
          'model': '"gpt-4"'
        }
      },
      {
        lineStart: 18,
        lineEnd: 40,
        description: 'Begin execution and define specialized agent types',
        variableState: {
          'query': '"How do I implement a merge sort algorithm in Python?"',
          'specialized_agents': '{math: {...}, code: {...}, research: {...}, creative: {...}}'
        }
      },
      {
        lineStart: 42,
        lineEnd: 64,
        description: 'Step 1: Analyze query and determine best agent',
        output: 'Analyzing query to determine appropriate agent',
        variableState: {
          'routing_decision': '{selected_agent: "code", confidence: 0.92, reasoning: "...", fallback_agent: "math"}'
        }
      },
      {
        lineStart: 66,
        lineEnd: 91,
        description: 'Step 2: Check confidence and request clarification if needed',
        output: 'Confidence is high (0.92), proceeding without clarification',
        variableState: {
          'selected_agent': 'code'
        }
      },
      {
        lineStart: 93,
        lineEnd: 121,
        description: 'Steps 3-4: Route to selected agent and execute',
        output: 'Routing query to code agent...',
        variableState: {
          'agent_response': 'Code implementation of merge sort algorithm'
        }
      }
    ]
  },
  
  'plan-execute': {
    python: [
      {
        lineStart: 7,
        lineEnd: 16,
        description: 'Initialize PlanExecuteAgent class',
        variableState: {
          'client': 'OpenAI client instance',
          'model': '"gpt-4"'
        }
      },
      {
        lineStart: 18,
        lineEnd: 37,
        description: 'Begin execution and set up available tools',
        variableState: {
          'query': '"Create a budget-friendly one-week travel itinerary for Paris"',
          'tools': '{search: Function, calculator: Function, weather: Function, translator: Function}'
        }
      },
      {
        lineStart: 39,
        lineEnd: 66,
        description: 'Step 1: Planning phase - create detailed plan',
        output: 'Creating detailed plan with sequential steps',
        variableState: {
          'plan': '{goal: "Create a budget-friendly one-week travel itinerary for Paris", steps: [{step_id: 1, description: "Search for budget accommodation", ...}, ...]}'
        }
      },
      {
        lineStart: 68,
        lineEnd: 102,
        description: 'Step 2: Execution phase - execute each step in the plan',
        output: 'Executing steps from the plan sequentially',
        variableState: {
          'results': '[{step_id: 1, status: "success", result: {...}}, {...}]'
        }
      },
      {
        lineStart: 104,
        lineEnd: 120,
        description: 'Step 3: Synthesis phase - combine results',
        output: 'Synthesizing results into final response',
        variableState: {
          'synthesis': '"# Budget-Friendly Paris Itinerary\n\n## Accommodation\nBased on our search..."'
        }
      }
    ]
  },
  
  'evaluator-optimizer': {
    python: [
      {
        lineStart: 7,
        lineEnd: 16,
        description: 'Initialize EvaluatorOptimizerAgent class',
        variableState: {
          'client': 'OpenAI client instance',
          'model': '"gpt-4"'
        }
      },
      {
        lineStart: 18,
        lineEnd: 36,
        description: 'Begin execution and set up tracking variables',
        variableState: {
          'query': '"Explain agent patterns in Azure AI"',
          'initial_response': '"Agent patterns are architectural approaches for AI..."',
          'evaluations': '[]',
          'responses': '[initial_response]',
          'iterations': '0',
          'max_iterations': '3',
          'quality_threshold': '0.85'
        }
      },
      {
        lineStart: 38,
        lineEnd: 57,
        description: 'Set up evaluation criteria for response assessment',
        output: 'Define evaluation criteria for assessment',
        variableState: {
          'evaluation_criteria': '{accuracy: "...", completeness: "...", clarity: "...", helpfulness: "...", conciseness: "..."}'
        }
      },
      {
        lineStart: 59,
        lineEnd: 90,
        description: 'First evaluation cycle',
        output: 'Evaluating initial response',
        variableState: {
          'iterations': '1',
          'evaluation_result': '{criteria: {...}, overall_score: 0.72, primary_improvements_needed: [...]}'
        }
      },
      {
        lineStart: 91,
        lineEnd: 112,
        description: 'First optimization cycle',
        output: 'Optimizing response based on evaluation',
        variableState: {
          'optimized_response': '"# Understanding Agent Patterns in Azure AI\n\n## Definition\nAgent patterns are reusable architectural approaches..."',
          'responses': '[initial_response, optimized_response]'
        }
      },
      {
        lineStart: 59,
        lineEnd: 112,
        description: 'Second evaluation and optimization cycle',
        output: 'Further refining response',
        variableState: {
          'iterations': '2',
          'evaluation_result': '{criteria: {...}, overall_score: 0.84, primary_improvements_needed: [...]}'
        }
      },
      {
        lineStart: 59,
        lineEnd: 112,
        description: 'Final evaluation cycle',
        output: 'Final evaluation',
        variableState: {
          'iterations': '3',
          'evaluation_result': '{criteria: {...}, overall_score: 0.92, primary_improvements_needed: []}',
          'overall_score': '0.92'
        }
      }
    ]
  }
};

/**
 * Gets the code execution steps for a specific pattern and language
 */
export function getCodeExecutionSteps(patternId: string, language: 'python' | 'typescript'): CodeExecutionStep[] | undefined {
  const patternSteps = codeExecutionSteps[patternId];
  if (!patternSteps) return undefined;
  return patternSteps[language];
}