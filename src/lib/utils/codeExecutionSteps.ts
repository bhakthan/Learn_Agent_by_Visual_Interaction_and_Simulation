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
        lineStart: 0,
        lineEnd: 1,
        description: 'Define function parameters and initialize state',
        variableState: {
          'query': '"Calculate distance between two points"',
          'context': '[]'
        }
      },
      {
        lineStart: 3,
        lineEnd: 9,
        description: 'Initial LLM call to process the user query',
        variableState: {
          'thoughts': 'String containing reasoning about the problem'
        }
      },
      {
        lineStart: 11,
        lineEnd: 15,
        description: 'Execute action based on reasoning',
        output: 'Using the Pythagorean theorem to calculate distance',
        variableState: {
          'action': 'calc_distance',
          'action_input': '{x1: 0, y1: 0, x2: 3, y2: 4}'
        }
      },
      {
        lineStart: 17,
        lineEnd: 22,
        description: 'Receive observation from action execution',
        output: 'Distance: 5.0',
        variableState: {
          'observation': '5.0',
          'context': '[Query, Thoughts, Action, Observation]'
        }
      },
      {
        lineStart: 24,
        lineEnd: 30,
        description: 'Generate final response based on observation',
        output: 'The distance between points (0,0) and (3,4) is 5 units.',
        variableState: {
          'response': 'The distance between points (0,0) and (3,4) is 5 units.'
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
        lineStart: 0,
        lineEnd: 6,
        description: 'Initialize CodeAct function with query parameter',
        variableState: {
          'query': '"Write code to find the factorial of a number"',
          'contextHistory': '[]'
        }
      },
      {
        lineStart: 8,
        lineEnd: 15,
        description: 'LLM generates Python code for factorial',
        output: '```python\ndef factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n```',
        variableState: {
          'code': 'def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)'
        }
      },
      {
        lineStart: 17,
        lineEnd: 25,
        description: 'Execute the generated Python code',
        output: '> Executing code\n> Code compiled successfully',
        variableState: {
          'contextHistory': '[User query, Generated code, Execution result]'
        }
      },
      {
        lineStart: 27,
        lineEnd: 35,
        description: 'LLM evaluates the execution result',
        variableState: {
          'evaluation': 'Code executes correctly and handles base cases'
        }
      },
      {
        lineStart: 37,
        lineEnd: 45,
        description: 'Generate final response with working code',
        output: 'Here is a recursive factorial function that handles base cases correctly:',
        variableState: {
          'response': 'Final code with explanation'
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
  
  'reflexion': {
    python: [
      {
        lineStart: 0,
        lineEnd: 5,
        description: 'Initialize the reflexion agent function',
        variableState: {
          'query': '"Find the bug in this code: sum = 0; for i in range(1, 11): sum += i; print(sum/10)"',
          'maxReflections': '3',
          'reflections': '[]'
        }
      },
      {
        lineStart: 7,
        lineEnd: 15,
        description: 'First attempt at solving the problem',
        output: '> Initial analysis of the code',
        variableState: {
          'attempt': '1',
          'solution': 'The code calculates the average of numbers 1-10'
        }
      },
      {
        lineStart: 17,
        lineEnd: 25,
        description: 'Self-reflection on the initial solution',
        output: '> Reflecting on solution: Is it correct?',
        variableState: {
          'reflection': 'The code correctly calculates the sum and average.',
          'reflections': '[First reflection]'
        }
      },
      {
        lineStart: 27,
        lineEnd: 35,
        description: 'Second attempt with reflection incorporated',
        output: '> Wait, I need to check if there\'s a bug in the implementation',
        variableState: {
          'attempt': '2',
          'solution': 'The code is actually correct for calculating mean of 1-10'
        }
      },
      {
        lineStart: 37,
        lineEnd: 45,
        description: 'Final solution after reflection',
        output: 'The code correctly calculates the average of numbers from 1 to 10, which is 5.5',
        variableState: {
          'finalSolution': 'Explanation that the code is actually correct'
        }
      }
    ]
  },
  
  'plan-execute': {
    typescript: [
      {
        lineStart: 0,
        lineEnd: 8,
        description: 'Initialize the plan-execute agent',
        variableState: {
          'query': '"Create a function to analyze a text for sentiment and key topics"',
          'steps': '[]'
        }
      },
      {
        lineStart: 10,
        lineEnd: 20,
        description: 'Planning phase - creating subtasks',
        output: '> Creating execution plan',
        variableState: {
          'plan': '["1. Create sentiment analysis function", "2. Create key topic extraction", "3. Combine both analyses"]'
        }
      },
      {
        lineStart: 22,
        lineEnd: 35,
        description: 'Execute first subtask - sentiment analysis',
        output: '> Executing Step 1: Sentiment Analysis Function\n> Created function that returns positive/negative/neutral',
        variableState: {
          'currentStep': '0',
          'stepResult': 'Function: analyzeSentiment(text)'
        }
      },
      {
        lineStart: 37,
        lineEnd: 50,
        description: 'Execute second subtask - topic extraction',
        output: '> Executing Step 2: Topic Extraction\n> Created function that identifies key topics using NLP techniques',
        variableState: {
          'currentStep': '1',
          'stepResult': 'Function: extractTopics(text)'
        }
      },
      {
        lineStart: 52,
        lineEnd: 65,
        description: 'Execute final subtask - combining functions',
        output: '> Executing Step 3: Combining Analysis Functions\n> Created combined function that returns both results',
        variableState: {
          'currentStep': '2',
          'stepResult': 'Function: analyzeText(text) returning {sentiment, topics}'
        }
      },
      {
        lineStart: 67,
        lineEnd: 75,
        description: 'Finalize and return complete solution',
        output: 'Created complete text analysis solution with sentiment and topic extraction',
        variableState: {
          'result': 'Complete code with all functions'
        }
      }
    ]
  },
  
  'agent2agent': {
    typescript: [
      {
        lineStart: 0,
        lineEnd: 10,
        description: 'Initialize the agent-to-agent framework',
        variableState: {
          'query': '"Design an e-commerce recommendation system"',
          'agents': '["Product Specialist", "User Behavior Analyst"]'
        }
      },
      {
        lineStart: 12,
        lineEnd: 25,
        description: 'First agent analyzes the problem',
        output: '> Agent 1: Product Specialist analyzing the request',
        variableState: {
          'agent1Response': 'We need to consider product categories, attributes, and relationships'
        }
      },
      {
        lineStart: 27,
        lineEnd: 40,
        description: 'Second agent responds to first agent\'s analysis',
        output: '> Agent 2: User Behavior Analyst responding to Product Specialist',
        variableState: {
          'agent2Response': 'We should incorporate user browsing history and purchase patterns'
        }
      },
      {
        lineStart: 42,
        lineEnd: 55,
        description: 'Agents collaborate to refine the solution',
        output: '> Agents collaborating on solution refinement',
        variableState: {
          'sharedContext': 'Combined knowledge about products and user behavior'
        }
      },
      {
        lineStart: 57,
        lineEnd: 65,
        description: 'Solution synthesized from agent collaboration',
        output: 'Recommendation system design incorporating product relationships and user behavior patterns',
        variableState: {
          'finalSolution': 'Complete recommendation system design'
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