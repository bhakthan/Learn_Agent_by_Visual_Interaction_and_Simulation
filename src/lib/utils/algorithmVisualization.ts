import { useMemo } from 'react';
import type { AlgorithmStep } from '@/components/visualization/AlgorithmVisualizer';

// Algorithm visualization data type
export interface AlgorithmVisualizationData {
  patternId: string;
  steps: AlgorithmStep[];
}

// Cache for algorithm visualization data
interface AlgorithmVisualizationCache {
  [key: string]: {
    steps: AlgorithmStep[];
    timestamp: number;
  };
}

const visualizationCache: AlgorithmVisualizationCache = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache lifetime

/**
 * Get algorithm visualization steps with memoization
 * @param algorithmId Unique identifier for the algorithm
 * @param patternId Pattern ID to contextualize the algorithm
 */
export function getAlgorithmVisualization(algorithmId: string, patternId: string): AlgorithmVisualizationData {
  const cacheKey = `${patternId}:${algorithmId}`;
  const now = Date.now();
  
  // Return from cache if valid
  if (
    visualizationCache[cacheKey] && 
    now - visualizationCache[cacheKey].timestamp < CACHE_TTL
  ) {
    return {
      patternId,
      steps: visualizationCache[cacheKey].steps
    };
  }
  
  // Generate visualization data based on algorithm type
  const steps = generateAlgorithmSteps(algorithmId, patternId);
  
  // Cache the result
  visualizationCache[cacheKey] = {
    steps,
    timestamp: now
  };
  
  return {
    patternId,
    steps
  };
}

/**
 * React hook for algorithm visualization with memoization
 */
export function useAlgorithmVisualization(algorithmId: string, patternId: string): AlgorithmVisualizationData {
  return useMemo(() => getAlgorithmVisualization(algorithmId, patternId), [algorithmId, patternId]);
}

/**
 * Generate algorithm steps for visualization
 */
function generateAlgorithmSteps(algorithmId: string, patternId: string): AlgorithmStep[] {
  // Customize steps based on algorithm ID
  switch (algorithmId) {
    case 'react-pattern':
      return [
        {
          id: 'step1',
          name: 'User Input Processing',
          description: 'The agent receives and processes the user query',
          data: {
            query: 'What is the average of numbers from 1 to 10?',
            timestamp: Date.now()
          },
          timing: 1000
        },
        {
          id: 'step2',
          name: 'Reasoning Phase',
          description: 'Agent reasons about how to approach the problem',
          code: `// Agent reasoning process
const reasoning = await llm(\`
  You are a ReAct agent solving problems through cycles of reasoning and action.
  
  Task: Calculate the average of numbers from 1 to 10.
  What's the best approach to solve this problem?
\`);`,
          data: {
            reasoning: 'I need to calculate the sum of numbers 1-10, then divide by 10 to get the average'
          },
          timing: 2000
        },
        {
          id: 'step3',
          name: 'Tool Selection',
          description: 'Agent selects appropriate tool for the task',
          code: `// Tool selection logic
const toolChoice = determineToolFromReasoning(reasoning);
console.log(\`Selected tool: \${toolChoice}\`);`,
          data: {
            selected_tool: 'calculator',
            available_tools: ['calculator', 'search', 'database']
          },
          timing: 1500
        },
        {
          id: 'step4',
          name: 'Action Execution',
          description: 'Agent executes the chosen action using the selected tool',
          code: `// Execute calculation tool
const result = await tools.calculator('(1+2+3+4+5+6+7+8+9+10)/10');`,
          data: {
            tool_input: '(1+2+3+4+5+6+7+8+9+10)/10',
            raw_result: 5.5
          },
          timing: 1800
        },
        {
          id: 'step5',
          name: 'Observation Analysis',
          description: 'Agent observes and analyzes the result',
          code: `// Process tool result
const observation = \`Calculator result: \${result}\`;
context.push(observation);`,
          data: {
            observation: 'Calculator result: 5.5'
          },
          timing: 1200
        },
        {
          id: 'step6',
          name: 'Final Reflection',
          description: 'Validate final solution and check completeness',
          data: {
            final_reflection: 'I\'ve verified the code logic is correct: sum = 55, average = 55/10 = 5.5'
          },
          timing: 1500
        },
        {
          id: 'step7',
          name: 'Response Generation',
          description: 'Generate the final response to user query',
          code: `// Format final answer
const finalAnswer = await llm(\`
  Based on the calculations, formulate a clear answer to: "What is the average of numbers from 1 to 10?"
  
  Calculation result: 5.5
\`);`,
          data: {
            final_answer: 'The average of numbers from 1 to 10 is 5.5'
          },
          timing: 1700
        }
      ];
      
    case 'codeact-pattern':
      return [
        {
          id: 'step1',
          name: 'Problem Analysis',
          description: 'Agent analyzes the coding problem',
          data: {
            query: 'Write a function to calculate factorial of a number',
            timestamp: Date.now()
          },
          timing: 1200
        },
        {
          id: 'step2',
          name: 'Code Generation',
          description: 'Agent generates Python code to solve the problem',
          code: `def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n-1)

# Test with n=5
result = factorial(5)
print(result)`,
          data: {
            language: 'python',
            approach: 'recursive'
          },
          timing: 2200
        },
        {
          id: 'step3',
          name: 'Code Execution',
          description: 'Execute the generated code in a secure environment',
          data: {
            execution_output: '120',
            execution_time: '0.003s'
          },
          timing: 1800
        },
        {
          id: 'step4',
          name: 'Validation',
          description: 'Validate results against expected output',
          code: `# Validation logic
assert factorial(0) == 1
assert factorial(1) == 1
assert factorial(5) == 120
print("All tests passed!")`,
          data: {
            validation_passed: true,
            test_cases: [
              { input: 0, expected: 1, actual: 1 },
              { input: 1, expected: 1, actual: 1 },
              { input: 5, expected: 120, actual: 120 }
            ]
          },
          timing: 1500
        },
        {
          id: 'step5',
          name: 'Optimization',
          description: 'Optimize code for better performance',
          code: `def factorial_optimized(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

# Test optimized version
result = factorial_optimized(5)
print(result)`,
          data: {
            optimization_reason: 'Iterative approach prevents stack overflow for large inputs',
            performance_gain: '15% faster for n > 10'
          },
          timing: 2000
        },
        {
          id: 'step6',
          name: 'Response Formulation',
          description: 'Format and present the final solution',
          data: {
            final_code: 'def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    else:\n        result = 1\n        for i in range(2, n + 1):\n            result *= i\n        return result',
            explanation: 'This function calculates factorial using an iterative approach for better performance with large inputs.'
          },
          timing: 1300
        }
      ];
      
    // Add more algorithm types as needed
    
    default:
      // Default generic algorithm steps
      return [
        {
          id: 'step1',
          name: 'Initialize',
          description: 'Set up initial state and parameters',
          timing: 1000
        },
        {
          id: 'step2',
          name: 'Process Input',
          description: 'Parse and validate user input',
          timing: 1200
        },
        {
          id: 'step3',
          name: 'Execute Core Logic',
          description: 'Run the main algorithm logic',
          timing: 2000
        },
        {
          id: 'step4',
          name: 'Format Results',
          description: 'Prepare and format the output',
          timing: 1000
        }
      ];
  }
}

/**
 * Calculate speed multiplier based on animation settings
 */
export function getSpeedMultiplier(speed: 'slow' | 'normal' | 'fast' | number): number {
  if (typeof speed === 'number') {
    return speed;
  }
  
  switch (speed) {
    case 'slow': return 0.5;
    case 'fast': return 2.0;
    case 'normal':
    default: return 1.0;
  }
}