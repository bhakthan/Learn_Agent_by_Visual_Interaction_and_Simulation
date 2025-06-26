import { PatternType } from "./patterns";

export interface CommunityPattern {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  patternType: PatternType;
  description: string;
  codeSnippet: string;
  useCases: string[];
  bestPractices: string[];
  createdAt: string;
  votes: number;
  tags: string[];
}

// Initial seed data for community patterns
export const communityPatterns: CommunityPattern[] = [
  {
    id: "comm-1",
    title: "Enhanced ReAct Pattern with Azure Content Safety",
    author: "Sarah Chen",
    authorAvatar: "https://i.pravatar.cc/150?u=sarah.chen",
    patternType: "react",
    description: "A modified ReAct pattern that integrates Azure Content Safety checks at each reasoning step to ensure compliance with content policies.",
    codeSnippet: `// Enhanced ReAct Pattern with Azure Content Safety
const enhancedReAct = async (query, maxSteps = 5) => {
  const contentSafetyClient = new ContentSafetyClient(
    "https://your-content-safety.cognitiveservices.azure.com",
    new AzureKeyCredential(process.env.CONTENT_SAFETY_KEY)
  );
  
  let steps = 0;
  let reasoning = "";
  let action = "";
  let observation = "";
  let history = [];
  
  // Initial prompt
  let currentPrompt = \`You are solving the following task: \${query}
Let's solve this step by step.\`;

  while (steps < maxSteps) {
    steps++;
    
    // Check content safety before proceeding
    const safetyResult = await contentSafetyClient.analyzeText({
      text: currentPrompt,
      categories: ["Hate", "SelfHarm", "Sexual", "Violence"]
    });
    
    if (hasFlagged(safetyResult)) {
      return {
        result: "Content safety check failed. Cannot proceed.",
        history
      };
    }
    
    // Get LLM response
    const response = await llm(currentPrompt);
    
    // Extract reasoning, action and update history
    reasoning = extractReasoning(response);
    action = extractAction(response);
    
    history.push({
      step: steps,
      reasoning,
      action
    });
    
    // Execute action and get observation
    observation = await executeAction(action);
    
    // Update prompt with history
    currentPrompt = \`\${query}
Previous steps:
\${formatHistory(history)}
Observation: \${observation}
What should I do next?\`;
    
    // Check if done
    if (isDone(response, observation)) {
      break;
    }
  }
  
  return {
    result: reasoning,
    history
  };
};`,
    useCases: [
      "Content moderation platforms",
      "Educational AI assistants",
      "Customer-facing AI services that need compliance guardrails"
    ],
    bestPractices: [
      "Always use Azure Content Safety for all agent outputs before showing to users",
      "Implement proper error handling for safety API failures",
      "Create a feedback loop to improve safety detection over time"
    ],
    createdAt: "2023-11-20",
    votes: 42,
    tags: ["content-safety", "react-pattern", "azure-ai", "compliance"]
  },
  {
    id: "comm-2",
    title: "Orchestrator Pattern with Azure AI Search Integration",
    author: "Miguel Rodriguez",
    authorAvatar: "https://i.pravatar.cc/150?u=miguel.r",
    patternType: "orchestrator-worker",
    description: "An implementation of the orchestrator pattern that uses Azure AI Search for knowledge retrieval to improve task delegation logic.",
    codeSnippet: `// Orchestrator with Azure AI Search
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

const orchestrateWithKnowledge = async (mainTask, workers) => {
  // Initialize Azure AI Search client
  const searchClient = new SearchClient(
    "https://your-search-service.search.windows.net",
    "your-index-name",
    new AzureKeyCredential(process.env.SEARCH_API_KEY)
  );

  // First, search for relevant knowledge
  const searchResults = await searchClient.search(mainTask, {
    select: ["id", "content", "category", "confidence"],
    top: 5,
    includeTotalCount: true
  });
  
  // Extract knowledge context
  const knowledgeContext = [];
  for await (const result of searchResults.results) {
    knowledgeContext.push(result.document);
  }
  
  // Use knowledge to better decompose the task
  const decompositionPrompt = \`Based on the following knowledge and the main task: "\${mainTask}", 
break this down into subtasks that can be assigned to specialized workers.
Knowledge context:
\${JSON.stringify(knowledgeContext, null, 2)}\`;

  const taskBreakdown = await llm(decompositionPrompt);
  const subtasks = parseSubtasks(taskBreakdown);
  
  // Assign subtasks to workers based on their capabilities
  const assignments = {};
  subtasks.forEach(subtask => {
    const bestWorker = findBestWorker(subtask, workers);
    if (!assignments[bestWorker.id]) {
      assignments[bestWorker.id] = [];
    }
    assignments[bestWorker.id].push(subtask);
  });
  
  // Execute subtasks
  const results = {};
  for (const [workerId, tasks] of Object.entries(assignments)) {
    results[workerId] = await executeWorkerTasks(workers[workerId], tasks);
  }
  
  // Synthesize results
  const synthesisPrompt = \`Synthesize the following results into a coherent response to the original task:
Task: "\${mainTask}"
Results: \${JSON.stringify(results, null, 2)}\`;

  const finalResult = await llm(synthesisPrompt);
  
  return {
    result: finalResult,
    subtaskResults: results,
    knowledgeUsed: knowledgeContext
  };
};`,
    useCases: [
      "Enterprise search and knowledge management",
      "Customer support bots requiring domain-specific knowledge",
      "Research assistants parsing technical literature"
    ],
    bestPractices: [
      "Create specialized indexes for different domains in Azure AI Search",
      "Use semantic ranking for better relevance in search results",
      "Implement vector search for deep semantic understanding"
    ],
    createdAt: "2023-12-05",
    votes: 38,
    tags: ["orchestrator", "azure-ai-search", "knowledge-integration"]
  }
];