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
        data: { label: 'LLM Call 1', nodeType: 'llm' },
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
        data: { label: 'LLM Call 2', nodeType: 'llm' },
        position: { x: 550, y: 50 }
      },
      {
        id: 'llm3',
        type: 'default',
        data: { label: 'LLM Call 3', nodeType: 'llm' },
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
        data: { label: 'LLM Call 1', nodeType: 'llm' },
        position: { x: 300, y: 50 }
      },
      {
        id: 'llm2',
        type: 'default',
        data: { label: 'LLM Call 2', nodeType: 'llm' },
        position: { x: 300, y: 150 }
      },
      {
        id: 'llm3',
        type: 'default',
        data: { label: 'LLM Call 3', nodeType: 'llm' },
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
  }
];

// More patterns can be added as needed