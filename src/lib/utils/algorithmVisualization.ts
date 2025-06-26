/**
 * Utilities for visualizing algorithmic steps in code execution
 * These functions help demonstrate how different agent patterns process information
 */

interface VisualizationStep {
  name: string;
  description: string;
  data?: any;
  substeps?: VisualizationStep[];
}

export interface AlgorithmVisualization {
  id: string;
  name: string;
  description: string;
  steps: VisualizationStep[];
}

/**
 * Collection of algorithm visualizations for common agent patterns
 */
export const algorithmVisualizations: Record<string, AlgorithmVisualization> = {
  'react': {
    id: 'react-algorithm',
    name: 'ReAct Pattern Algorithm',
    description: 'Reasoning and Acting in a loop to solve complex tasks',
    steps: [
      {
        name: 'Initialize',
        description: 'Set up context and parse user query',
        data: {
          context: '[]',
          query: 'Calculate distance between two points'
        }
      },
      {
        name: 'Reason',
        description: 'Analyze the task and determine approach',
        data: {
          reasoning: 'To calculate distance between points, I need to use the Pythagorean theorem: sqrt((x2-x1)^2 + (y2-y1)^2)'
        },
        substeps: [
          { name: 'Parse Query', description: 'Understand the user intent' },
          { name: 'Identify Task Type', description: 'Mathematical calculation task' },
          { name: 'Recall Knowledge', description: 'Distance formula via Pythagorean theorem' }
        ]
      },
      {
        name: 'Act',
        description: 'Execute action based on reasoning',
        data: {
          action: 'calculate_distance',
          inputs: { x1: 0, y1: 0, x2: 3, y2: 4 }
        },
        substeps: [
          { name: 'Select Tool', description: 'Choose appropriate calculation tool' },
          { name: 'Prepare Inputs', description: 'Format parameters for the tool' },
          { name: 'Execute Tool', description: 'Run the calculation operation' }
        ]
      },
      {
        name: 'Observe',
        description: 'Process the results of the action',
        data: {
          observation: '5.0',
          context: '[Query, Reasoning, Action, Observation]'
        }
      },
      {
        name: 'Respond',
        description: 'Generate final response based on observations',
        data: {
          response: 'The distance between points (0,0) and (3,4) is 5 units.'
        }
      }
    ]
  },
  
  'codeact': {
    id: 'codeact-algorithm',
    name: 'CodeAct Pattern Algorithm',
    description: 'Generate and execute code to solve problems',
    steps: [
      {
        name: 'Parse Problem',
        description: 'Understand the coding task requirements',
        data: {
          query: 'Write a function to calculate factorial'
        }
      },
      {
        name: 'Generate Code',
        description: 'Create code solution using language model',
        data: {
          code: 'def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)'
        },
        substeps: [
          { name: 'Plan Solution', description: 'Design recursive factorial approach' },
          { name: 'Write Function', description: 'Implement recursive solution with base cases' },
          { name: 'Add Comments', description: 'Document code functionality' }
        ]
      },
      {
        name: 'Execute Code',
        description: 'Run the generated code in a safe environment',
        data: {
          result: 'Function defined successfully'
        },
        substeps: [
          { name: 'Prepare Environment', description: 'Set up execution sandbox' },
          { name: 'Run Code', description: 'Execute in isolated context' },
          { name: 'Capture Output', description: 'Record execution results' }
        ]
      },
      {
        name: 'Evaluate Results',
        description: 'Check if code works correctly',
        data: {
          evaluation: 'Code executes correctly and handles base cases'
        }
      },
      {
        name: 'Iterate if Needed',
        description: 'Fix issues or optimize based on evaluation',
        data: {
          improved_code: 'def factorial(n):\n    if not isinstance(n, int) or n < 0:\n        raise ValueError("Input must be a non-negative integer")\n    if n == 0 or n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)'
        }
      }
    ]
  },
  
  'reflexion': {
    id: 'reflexion-algorithm',
    name: 'Reflexion Pattern Algorithm',
    description: 'Self-critique and iterative improvement through reflection',
    steps: [
      {
        name: 'Initial Attempt',
        description: 'Generate first response to the problem',
        data: {
          query: 'Find the bug in this code: sum = 0; for i in range(1, 11): sum += i; print(sum/10)',
          initial_solution: 'The code calculates the average of numbers 1-10'
        }
      },
      {
        name: 'Self-Reflection',
        description: 'Analyze own solution for issues or improvements',
        data: {
          reflection: 'My solution correctly identified that the code calculates an average, but I should verify the result is correct.'
        },
        substeps: [
          { name: 'Analysis', description: 'Trace code execution step by step' },
          { name: 'Critique', description: 'Identify potential issues or oversights' },
          { name: 'Verification', description: 'Check for edge cases and accuracy' }
        ]
      },
      {
        name: 'Revised Attempt',
        description: 'Generate improved solution based on reflection',
        data: {
          revised_solution: 'The code correctly calculates the sum of numbers from 1 to 10 (which is 55) and divides by 10 to get 5.5. There is no bug.'
        }
      },
      {
        name: 'Final Reflection',
        description: 'Validate final solution and check completeness',
        data: {
          final_reflection: 'I've verified the code logic is correct: sum = 55, average = 55/10 = 5.5'
        }
      }
    ]
  },
  
  'plan-execute': {
    id: 'plan-execute-algorithm',
    name: 'Plan & Execute Pattern Algorithm',
    description: 'Create detailed plan before execution to solve complex problems',
    steps: [
      {
        name: 'Problem Analysis',
        description: 'Understand the problem requirements and constraints',
        data: {
          query: 'Create a function to analyze text sentiment and extract key topics'
        }
      },
      {
        name: 'Plan Creation',
        description: 'Develop comprehensive step-by-step plan',
        data: {
          plan: ['1. Create sentiment analysis function', '2. Create key topic extraction', '3. Combine both analyses']
        },
        substeps: [
          { name: 'Task Decomposition', description: 'Break down into manageable subtasks' },
          { name: 'Dependency Analysis', description: 'Identify task relationships and order' },
          { name: 'Resource Allocation', description: 'Determine required tools/libraries' }
        ]
      },
      {
        name: 'Step 1 Execution',
        description: 'Implement sentiment analysis function',
        data: {
          step_result: 'function analyzeSentiment(text) { /* code */ }'
        }
      },
      {
        name: 'Step 2 Execution',
        description: 'Implement topic extraction function',
        data: {
          step_result: 'function extractTopics(text) { /* code */ }'
        }
      },
      {
        name: 'Step 3 Execution',
        description: 'Combine functions into unified solution',
        data: {
          step_result: 'function analyzeText(text) { /* combined code */ }'
        }
      },
      {
        name: 'Solution Assembly',
        description: 'Integrate all components into final solution',
        data: {
          final_result: 'Complete text analysis solution with sentiment and topic extraction'
        }
      }
    ]
  },
  
  'agent2agent': {
    id: 'agent2agent-algorithm',
    name: 'Agent-to-Agent Pattern Algorithm',
    description: 'Multiple specialized agents collaborating to solve complex tasks',
    steps: [
      {
        name: 'Task Delegation',
        description: 'Distribute task to appropriate specialist agents',
        data: {
          query: 'Design an e-commerce recommendation system',
          agents: ['Product Specialist', 'User Behavior Analyst']
        }
      },
      {
        name: 'Agent 1 Analysis',
        description: 'First agent processes the problem from its perspective',
        data: {
          agent: 'Product Specialist',
          analysis: 'We need to consider product categories, attributes, and relationships'
        },
        substeps: [
          { name: 'Knowledge Retrieval', description: 'Access specialized domain knowledge' },
          { name: 'Focused Analysis', description: 'Apply expertise to problem' },
          { name: 'Contribution Preparation', description: 'Format insights for collaboration' }
        ]
      },
      {
        name: 'Agent 2 Analysis',
        description: 'Second agent processes the problem from its perspective',
        data: {
          agent: 'User Behavior Analyst',
          analysis: 'We should incorporate user browsing history and purchase patterns'
        }
      },
      {
        name: 'Collaborative Synthesis',
        description: 'Agents share insights and develop unified approach',
        data: {
          shared_context: 'Combined knowledge about products and user behavior patterns'
        },
        substeps: [
          { name: 'Information Exchange', description: 'Share specialized insights' },
          { name: 'Conflict Resolution', description: 'Address any contradictions in approaches' },
          { name: 'Integration Planning', description: 'Design unified solution architecture' }
        ]
      },
      {
        name: 'Solution Generation',
        description: 'Create solution incorporating all agent perspectives',
        data: {
          solution: 'Recommendation system incorporating product relationships and user behavior'
        }
      }
    ]
  }
};

/**
 * Gets algorithm visualization steps for a specific pattern
 */
export function getAlgorithmVisualization(patternId: string): AlgorithmVisualization | undefined {
  return algorithmVisualizations[patternId];
}