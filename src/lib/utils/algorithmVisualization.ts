export interface AlgorithmStep {
  id: string;
  name: string;
  description: string;
  code?: string;
  data?: Record<string, any>;
  startTime?: number;
  endTime?: number;
}

export interface AlgorithmVisualizationData {
  patternId: string;
  steps: AlgorithmStep[];
  currentStepId?: string;
  isRunning: boolean;
}

const DEFAULT_TIME_BETWEEN_STEPS = 1500;

// Sample algorithm visualization for ReAct pattern
export const reactAgentVisualization: AlgorithmVisualizationData = {
  patternId: 'react-agent',
  steps: [
    {
      id: 'init',
      name: 'Initialization',
      description: 'Set up the agent environment and initialize variables',
      code: `const executeReAct = async (query: string, maxCycles = 5) => {
  // Initialize agent state
  let currentCycle = 0;
  let done = false;
  let contextHistory = [];
  let finalAnswer = '';

  // Add initial query to context
  contextHistory.push("User query: " + query);
}`,
      data: {
        currentCycle: 0,
        done: false,
        contextHistory: ["User query: What is the capital of France and what is its population?"]
      }
    },
    {
      id: 'cycle1-reasoning',
      name: 'Reasoning (Cycle 1)',
      description: 'Agent analyzes the problem and decides what information is needed',
      code: `// Step 1: Reasoning phase
console.log("Cycle " + currentCycle + ": Reasoning...");

const reasoningPrompt = "You are a ReAct agent...";
const reasoningResponse = await llm(reasoningPrompt);
contextHistory.push(reasoningResponse);`,
      data: {
        currentCycle: 1,
        reasoningResponse: "Thought: I need to find the capital of France and its population. I should use a search tool to find this information.\nAction: search\nAction Input: capital of France and population"
      }
    },
    {
      id: 'cycle1-action',
      name: 'Action (Cycle 1)',
      description: 'Agent uses a tool to gather information',
      code: `// Extract tool call
const actionMatch = reasoningResponse.match(/Action:(.*?)\\n/);
const actionInputMatch = reasoningResponse.match(/Action Input:(.*?)(?:\\n|$)/s);

if (actionMatch && actionInputMatch) {
  const toolName = actionMatch[1].trim();
  const toolInput = actionInputMatch[1].trim();
  
  // Execute the tool
  const toolResult = await tools[toolName](toolInput);
  contextHistory.push("Observation: " + toolResult);
}`,
      data: {
        toolName: 'search',
        toolInput: 'capital of France and population',
        toolResult: 'Search results: The capital of France is Paris. Paris has a population of approximately 2.2 million people in the city proper and about 12 million in the metropolitan area.'
      }
    },
    {
      id: 'cycle2-reasoning',
      name: 'Reasoning (Cycle 2)',
      description: 'Agent processes the information and determines next steps',
      code: `// Next cycle
currentCycle++;

// Generate next reasoning step
const nextReasoningPrompt = "You are a ReAct agent...";
const nextReasoningResponse = await llm(nextReasoningPrompt);
contextHistory.push(nextReasoningResponse);`,
      data: {
        currentCycle: 2,
        reasoningResponse: "Thought: I now know that Paris is the capital of France with a population of approximately 2.2 million people in the city proper and about 12 million in the metropolitan area. This information directly answers the question.\nFinal Answer: The capital of France is Paris, which has a population of approximately 2.2 million people in the city proper and about 12 million in the metropolitan area."
      }
    },
    {
      id: 'finalize',
      name: 'Finalize Result',
      description: 'Agent extracts the final answer and returns the result',
      code: `// Parse the reasoning response
if (reasoningResponse.includes('Final Answer:')) {
  // Extract the final answer
  const answerMatch = reasoningResponse.match(/Final Answer:(.*?)$/s);
  if (answerMatch) {
    finalAnswer = answerMatch[1].trim();
    done = true;
  }
}

return {
  status: done ? 'success' : 'max_cycles_reached',
  cycles: currentCycle,
  result: finalAnswer || 'No final answer reached.',
  history: contextHistory
};`,
      data: {
        finalAnswer: "The capital of France is Paris, which has a population of approximately 2.2 million people in the city proper and about 12 million in the metropolitan area.",
        done: true,
        currentCycle: 2
      }
    }
  ],
  isRunning: false
};

// Sample algorithm visualization for CodeAct pattern
export const codeActAgentVisualization: AlgorithmVisualizationData = {
  patternId: 'codeact-agent',
  steps: [
    {
      id: 'init',
      name: 'Initialization',
      description: 'Set up the agent environment and initialize variables',
      code: `const executeCodeAct = async (query, maxCycles = 5) => {
  // Initialize agent state
  let currentCycle = 0;
  let done = false;
  let contextHistory = [];
  let finalResult = '';

  // Add initial query to context
  contextHistory.push("User query: " + query);
}`,
      data: {
        currentCycle: 0,
        done: false,
        contextHistory: ["User query: Calculate the sum of numbers from 1 to 10"]
      }
    },
    {
      id: 'cycle1-code-gen',
      name: 'Code Generation (Cycle 1)',
      description: 'Agent generates Python code to solve the problem',
      code: `// Generate agent response
const agentPrompt = "You are a CodeAct agent that solves problems by writing and executing Python code...";
const agentResponse = await llm(agentPrompt);
contextHistory.push("Agent: " + agentResponse);`,
      data: {
        currentCycle: 1,
        agentResponse: `Thought: I need to calculate the sum of numbers from 1 to 10. I can write a simple Python code to do this.
Code:
\`\`\`
# Calculate sum of numbers from 1 to 10
total = 0
for i in range(1, 11):
    total += i
print(f"Sum of numbers from 1 to 10: {total}")
\`\`\``
      }
    },
    {
      id: 'cycle1-code-exec',
      name: 'Code Execution (Cycle 1)',
      description: 'Agent executes the generated code and observes the result',
      code: `// Extract code block
const codeMatch = agentResponse.match(/\`\`\`\\s*([\\s\\S]*?)\\s*\`\`\`/);
if (codeMatch) {
  const code = codeMatch[1].trim();
  
  // Execute the code (simulated)
  const executionResult = await executeCode(code);
  
  // Add the observation to the history
  contextHistory.push("Observation: " + executionResult);
}`,
      data: {
        code: `# Calculate sum of numbers from 1 to 10
total = 0
for i in range(1, 11):
    total += i
print(f"Sum of numbers from 1 to 10: {total}")`,
        executionResult: "Output: Sum of numbers from 1 to 10: 55"
      }
    },
    {
      id: 'cycle2-final',
      name: 'Final Result (Cycle 2)',
      description: 'Agent provides the final answer based on code execution',
      code: `// Next cycle
currentCycle++;

// Generate next agent response
const finalAgentPrompt = "You are a CodeAct agent...";
const finalAgentResponse = await llm(finalAgentPrompt);
contextHistory.push("Agent: " + finalAgentResponse);`,
      data: {
        currentCycle: 2,
        agentResponse: `Thought: I've calculated the sum of numbers from 1 to 10 using a Python for loop. The result is 55, which we can verify: 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 = 55.
Final Answer: The sum of numbers from 1 to 10 is 55.`
      }
    },
    {
      id: 'finalize',
      name: 'Finalize Result',
      description: 'Agent extracts the final answer and returns the result',
      code: `// Check if the response contains a final answer
if (agentResponse.includes('Final Answer:')) {
  const answerMatch = agentResponse.match(/Final Answer:(.*?)$/s);
  if (answerMatch) {
    finalResult = answerMatch[1].trim();
    done = true;
  }
}

return {
  status: done ? 'success' : 'max_cycles_reached',
  cycles: currentCycle,
  result: finalResult || 'No final result reached.',
  history: contextHistory
};`,
      data: {
        finalResult: "The sum of numbers from 1 to 10 is 55.",
        done: true,
        currentCycle: 2
      }
    }
  ],
  isRunning: false
};

// Sample algorithm visualization for Self-Reflection pattern
export const selfReflectionVisualization: AlgorithmVisualizationData = {
  patternId: 'self-reflection',
  steps: [
    {
      id: 'init',
      name: 'Initialization',
      description: 'Set up the reflection agent environment',
      code: `const executeSelfReflection = async (query: string, maxRevisions = 3) => {
  // Initialize state
  let revisions = 0;
  let currentResponse = '';
  let isAccepted = false;
  let reflectionHistory = [];
}`,
      data: {
        revisions: 0,
        query: "Explain how neural networks learn through backpropagation"
      }
    },
    {
      id: 'initial-response',
      name: 'Initial Response',
      description: 'Generate first draft response to the query',
      code: `// Initial response generation
console.log("Generating initial response...");
currentResponse = await llm(\`
  Provide a comprehensive response to this query:
  "\${query}"
\`);

reflectionHistory.push({
  version: 'initial',
  content: currentResponse,
  reflection: null
});`,
      data: {
        initialResponse: `Neural networks learn through backpropagation by adjusting weights based on the calculation of errors. First, the network makes a forward pass, then calculates error using a loss function, and finally propagates this error backward to update weights. This process is repeated many times until the network's performance improves.`
      }
    },
    {
      id: 'reflection-1',
      name: 'Self-Reflection (Round 1)',
      description: 'Agent critically evaluates its own response',
      code: `// Self-reflection/critique phase
revisions++;
console.log("Performing self-reflection round " + revisions + "...");

const reflection = await llm(\`
  You are a critical evaluator. Analyze this response to the query:
  
  Query: "\${query}"
  
  Response:
  \${currentResponse}
  
  Provide a thorough critique identifying:
  1. Factual errors or inaccuracies
  2. Logical inconsistencies or gaps in reasoning
  3. Missing important perspectives or information
  4. Clarity and structure issues
\`);`,
      data: {
        reflection: `Critique:
1. The explanation lacks technical details about how the error calculation actually works (e.g., no mention of gradient descent or chain rule).
2. There's no explanation of what weights actually represent in a neural network.
3. Missing information about activation functions and their role in the learning process.
4. The response is too brief and doesn't properly explain the "backward" process in sufficient detail.
5. No mention of learning rate or other hyperparameters that affect learning.

Score: 5/10
Needs Revision: Yes`
      }
    },
    {
      id: 'revision-1',
      name: 'Revision (Round 1)',
      description: 'Agent improves its response based on self-reflection',
      code: `// Generate improved version based on self-reflection
currentResponse = await llm(\`
  You are tasked with improving a response based on self-critique.
  
  Original query: "\${query}"
  
  Previous response:
  \${currentResponse}
  
  Self-critique:
  \${reflection}
  
  Please provide an improved response that addresses all the issues identified in the critique.
\`);`,
      data: {
        improvedResponse: `Neural networks learn through backpropagation, a supervised learning algorithm that enables models to adjust their parameters based on error calculation.

In a neural network, information flows through interconnected nodes (neurons) organized in layers. Each connection has a "weight" - a numerical value that determines the strength of the signal passing through it. Initially, these weights are randomly assigned.

The learning process involves several key steps:

1. Forward propagation: Input data passes through the network, with each neuron applying an activation function (like ReLU or sigmoid) to the weighted sum of inputs.

2. Error calculation: The network's output is compared to the expected output using a loss function (such as mean squared error), quantifying how far the prediction is from the target.

3. Backpropagation: Using the chain rule of calculus, the error is propagated backward through the network. This calculates how much each weight contributed to the error.

4. Weight update: Each weight is adjusted using gradient descent, where weights are modified in the direction that minimizes error. The formula is typically:
   new_weight = old_weight - (learning_rate * gradient)

The learning rate hyperparameter controls how large these adjustments are - too high causes unstable learning, too low results in slow convergence.

This process is repeated with many examples, allowing the network to gradually improve its predictions by fine-tuning weights based on feedback from error signals.`
      }
    },
    {
      id: 'reflection-2',
      name: 'Self-Reflection (Round 2)',
      description: 'Agent evaluates its revised response',
      code: `// Self-reflection/critique phase
revisions++;
console.log("Performing self-reflection round " + revisions + "...");

const nextReflection = await llm(\`
  You are a critical evaluator. Analyze this response to the query:
  
  Query: "\${query}"
  
  Response:
  \${currentResponse}
  
  Provide a thorough critique identifying:
  1. Factual errors or inaccuracies
  2. Logical inconsistencies or gaps in reasoning
  3. Missing important perspectives or information
  4. Clarity and structure issues
\`);`,
      data: {
        reflection: `Critique:
This is a much stronger explanation that addresses most of the previous issues:

1. The explanation now includes technical details like gradient descent and activation functions.
2. Clear explanation of what weights represent.
3. Good mention of the role of learning rate.

Minor opportunities for improvement:
1. Could mention the concept of "epochs" (multiple passes through the training data).
2. A brief note about challenges like vanishing/exploding gradients might be useful.
3. Some mention of computational efficiency considerations could round it out.

Overall, this is a solid explanation that covers the key concepts accurately.

Score: 8/10
Needs Revision: No`
      }
    },
    {
      id: 'final-reflection',
      name: 'Final Reflection',
      description: 'Validate final solution and check completeness',
      data: {
        final_reflection: "I've verified the core explanation is accurate and comprehensive. The response now covers the key mechanisms of backpropagation, including forward propagation, error calculation, the mathematics of gradient descent, and the role of activation functions and learning rates."
      }
    }
  ],
  isRunning: false
};