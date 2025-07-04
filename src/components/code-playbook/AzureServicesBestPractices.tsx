import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Cloud, 
  Lightning, 
  MagnifyingGlass, 
  Warning,
  Lock,
  Database,
  Gauge,
  ClockClockwise
} from '@phosphor-icons/react';

// Mock environment variables for browser environment
const mockEnv = {
  AZURE_OPENAI_ENDPOINT: "https://your-openai-resource.openai.azure.com/",
  AZURE_OPENAI_API_KEY: "your-api-key",
  AZURE_CONTENT_SAFETY_ENDPOINT: "https://your-content-safety.cognitiveservices.azure.com/",
  AZURE_CONTENT_SAFETY_KEY: "your-content-safety-key",
  AZURE_SEARCH_ENDPOINT: "https://your-search.search.windows.net",
  AZURE_SEARCH_INDEX_NAME: "your-index-name",
  AZURE_SEARCH_API_KEY: "your-search-api-key",
  AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME: "text-embedding-ada-002",
  STORAGE_ACCOUNT_NAME: "yourstorageaccount",
  AGENT_VERSION: "1.0.0",
  REDIS_CONNECTION_STRING: "redis://localhost:6379",
  AZURE_OPENAI_DEPLOYMENT_NAME: "gpt-4",
  APPINSIGHTS_CONNECTION_STRING: "InstrumentationKey=your-instrumentation-key",
  TENANT_ID: "your-tenant-id",
  CLIENT_ID: "your-client-id",
  CLIENT_SECRET: "your-client-secret",
  KEYVAULT_URL: "https://your-keyvault.vault.azure.net/"
};

interface AzureServicesBestPracticesProps {
  patternId: string;
  patternName: string;
}

const AzureServicesBestPractices: React.FC<AzureServicesBestPracticesProps> = ({ patternId, patternName }) => {
  const practices = [
    {
      name: 'Azure OpenAI Integration',
      icon: <Cloud size={18} className="text-primary" />,
      category: 'foundation',
      description: 'Provides REST API access to OpenAI\'s powerful language models with Azure security and compliance features.',
      tips: [
        'Configure system messages to define agent behavior constraints and roles',
        'Use Azure RBAC for access management of AI resources',
        'Apply Azure Key Vault for secure credential management',
        'Leverage managed identity for authentication where available',
        'Implement request/response logging for later analysis'
      ],
      code: `// Setup Azure OpenAI with proper authentication
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { DefaultAzureCredential } from "@azure/identity";

// Best Practice: Use managed identity where possible
const credential = new DefaultAzureCredential();

// Fallback to API key if needed
const getClient = () => {
  const endpoint = mockEnv.AZURE_OPENAI_ENDPOINT;
  
  try {
    // Try managed identity first
    return new OpenAIClient(endpoint, credential);
  } catch (err) {
    // Fallback to API key
    const apiKey = mockEnv.AZURE_OPENAI_API_KEY;
    return new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
  }
};

const client = getClient();

// Best Practice: Consistent system messages for agent patterns
const agentSystemPrompt = "You are an Azure AI agent implementing the " + patternName + " pattern.
Your capabilities include:
1. Analyzing user requests related to this domain
2. Following a structured reasoning process
3. Using available tools appropriately
4. Providing clear explanations of your process

You must always:
- Stay within the scope of your defined tools
- Notify users when a request is beyond your capabilities
- Avoid generating harmful or misleading information
";`
    },
    {
      name: 'Content Safety',
      icon: <Warning size={18} className="text-primary" />,
      category: 'safety',
      description: 'Implements guardrails for agent-generated content to ensure appropriateness and safety.',
      tips: [
        'Implement pre-moderation for AI-generated content before display',
        'Set appropriate threshold levels based on your application\'s audience',
        'Create feedback loops to improve detection over time',
        'Implement blocklists for domain-specific problematic content',
        'Use moderation in both directions - for user input and AI responses'
      ],
      code: `import { ContentSafetyClient, AzureKeyCredential } from "@azure/ai-content-safety";

// Initialize the content safety client
const contentSafetyClient = new ContentSafetyClient(
  mockEnv.AZURE_CONTENT_SAFETY_ENDPOINT,
  new AzureKeyCredential(mockEnv.AZURE_CONTENT_SAFETY_KEY)
);

// Function to moderate AI-generated content
async function moderateContent(text) {
  try {
    const result = await contentSafetyClient.analyzeText({
      text: text,
      categories: ["Hate", "SelfHarm", "Sexual", "Violence"],
      blocklistNames: ["custom-blocklist"] // Your custom blocklist if configured
    });
    
    // Check if any category exceeds the threshold (4 = medium severity)
    const hasPotentialHarm = result.categoriesAnalysis.some(
      category => category.severity >= 4
    );
    
    // Check for blocklist matches
    const hasBlocklistMatch = result.blocklistsMatch && 
      result.blocklistsMatch.length > 0;
      
    return {
      safe: !hasPotentialHarm && !hasBlocklistMatch,
      analysis: result.categoriesAnalysis,
      blocklistMatches: result.blocklistsMatch
    };
  } catch (error) {
    console.error("Content moderation failed:", error);
    return { safe: false, error: error.message };
  }
}

// Integrate with agent response pipeline
async function getModeratedAgentResponse(userQuery) {
  // Check user input first
  const userInputSafety = await moderateContent(userQuery);
  if (!userInputSafety.safe) {
    return "I'm unable to respond to that request due to content guidelines.";
  }
  
  // Generate agent response
  const agentResponse = await generateAgentResponse(userQuery);
  
  // Check agent response before returning
  const responseSafety = await moderateContent(agentResponse);
  if (!responseSafety.safe) {
    return "I've generated a response, but it may not comply with content guidelines. Please try with a different query.";
  }
  
  return agentResponse;
}`
    },
    {
      name: 'Vector Search',
      icon: <MagnifyingGlass size={18} className="text-primary" />,
      category: 'retrieval',
      description: 'Optimizes retrieval augmented generation through semantic understanding of content.',
      tips: [
        'Create domain-specific embedding models for better semantic matching',
        'Implement hybrid retrieval that combines vector and keywords',
        'Filter search results by metadata before retrieval',
        'Add re-ranking step after initial vector search',
        'Perform chunking optimization appropriate for your content'
      ],
      code: `import { SearchClient, AzureKeyCredential, VectorizedQuery } from "@azure/search-documents";
import { OpenAIClient } from "@azure/openai";

// Initialize search client
const searchClient = new SearchClient(
  mockEnv.AZURE_SEARCH_ENDPOINT,
  mockEnv.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(mockEnv.AZURE_SEARCH_API_KEY)
);

const openaiClient = new OpenAIClient(
  mockEnv.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(mockEnv.AZURE_OPENAI_API_KEY)
);

// Best Practice: Implement hybrid search with filtering
async function retrieveRelevantContext(query, filters = {}) {
  try {
    // Generate embeddings for vector search
    const embeddingResponse = await openaiClient.getEmbeddings(
      mockEnv.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
      [query]
    );
    
    const queryEmbedding = embeddingResponse.data[0].embedding;
    
    // Build filter expression based on provided filters
    let filterExpression = "";
    if (filters.category) {
      filterExpression += "category eq '" + filters.category + "'";
    }
    
    if (filters.dateRange) {
      const dateFilter = "timestamp ge " + filters.dateRange.start + " and timestamp le " + filters.dateRange.end;
      filterExpression += filterExpression ? " and " + dateFilter : dateFilter;
    }
    
    // Hybrid search combining vector, keyword, and filters
    const searchResults = await searchClient.search(query, {
      vectorQueries: [
        {
          kind: "vector",
          vector: queryEmbedding,
          fields: ["contentVector"],
          k: 50  // Get more candidates for re-ranking
        }
      ],
      select: ["id", "title", "content", "category", "source"],
      filter: filterExpression || undefined,
      top: 50
    });
    
    // Convert to array for processing
    const results = [];
    for await (const result of searchResults.results) {
      results.push(result.document);
    }
    
    // Best Practice: Re-rank results with additional criteria
    const rerankedResults = await rerank(results, query);
    
    return rerankedResults.slice(0, 5); // Return top 5 after re-ranking
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

// Re-ranking function (simplified)
async function rerank(results, query) {
  // Simplified implementation - in production use a proper re-ranker
  return results.sort((a, b) => {
    // Combine factors: relevance score, recency, source authority, etc.
    return b.searchScore - a.searchScore;
  });
}`
    },
    {
      name: 'Model Evaluation',
      icon: <Gauge size={18} className="text-primary" />,
      category: 'quality',
      description: 'Implements systematic evaluation of agent behaviors to ensure quality and continuous improvement.',
      tips: [
        'Design comprehensive evaluation test sets for your use case',
        'Evaluate multiple aspects beyond just accuracy (safety, tone, etc.)',
        'Implement automatic evaluation with Azure AI Evaluation Services',
        'Combine automated and human evaluations in your pipeline',
        'Track model quality over time to catch regressions'
      ],
      code: `from azure.ai.evaluation import EvaluationPipeline, LLMEvaluator
import pandas as pd
import json

# Function that runs the agent
def run_agent(query):
    # Your agent implementation here
    pass

# Create evaluator using Azure OpenAI
evaluator = LLMEvaluator(
    endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
    deployment_name="gpt-4", # Using stronger model for evaluation
    api_key=os.environ["AZURE_OPENAI_API_KEY"]
)

# Best Practice: Define multiple evaluation criteria
evaluation_criteria = [
    "Relevance: Does the response directly address the user's question?",
    "Accuracy: Is the information provided factually correct?",
    "Completeness: Does the response cover all aspects of the question?",
    "Safety: Does the response avoid potentially harmful content?",
    "Reasoning: Does the agent demonstrate clear reasoning steps?",
]

# Create evaluation pipeline
pipeline = EvaluationPipeline(evaluator=evaluator)

# Load test cases from file
with open("test_cases.json", "r") as f:
    test_cases = json.load(f)

# Run evaluation
eval_results = pipeline.evaluate(
    test_cases=test_cases,
    agent_fn=run_agent,
    criteria=evaluation_criteria,
    scoring_method="likert_scale",
    scale_max=5
)

# Best Practice: Detailed analysis of results
def analyze_results(results):
    # Overall scores
    print(f"Overall mean score: {results.mean_score:.2f}/5.0")
    
    # Per-criterion analysis
    for criterion in evaluation_criteria:
        name = criterion.split(":")[0]
        score = results.criterion_scores[name]
        print(f"{name}: {score:.2f}/5.0")
    
    # Identify weak areas
    weak_areas = [c for c, s in results.criterion_scores.items() if s < 4.0]
    if weak_areas:
        print(f"Areas needing improvement: {', '.join(weak_areas)}")
    
    # Save detailed results for further analysis
    pd.DataFrame(results.individual_scores).to_csv("evaluation_results.csv")

analyze_results(eval_results)`
    },
    {
      name: 'Data Storage',
      icon: <Database size={18} className="text-primary" />,
      category: 'security',
      description: 'Securely manages data used by and generated from AI agents with proper compliance controls.',
      tips: [
        'Use Azure Storage with encryption at rest and in transit',
        'Implement data retention policies aligned with requirements',
        'Set up storage analytics to monitor access patterns',
        'Apply RBAC for granular access control to stored data',
        'Consider Azure Synapse for large-scale analytics on agent data'
      ],
      code: `import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

// Best Practice: Use managed identities for authentication
const credential = new DefaultAzureCredential();

// Create blob service client using managed identity
const blobServiceClient = new BlobServiceClient(
  "https://" + mockEnv.STORAGE_ACCOUNT_NAME + ".blob.core.windows.net",
  credential
);

// Store agent conversational data securely
async function storeConversationData(conversationId, userData, agentResponses) {
  try {
    // Get container client (create if not exists)
    const containerClient = blobServiceClient.getContainerClient("agent-conversations");
    await containerClient.createIfNotExists();
    
    // Separate PII from conversational data
    const piiData = {
      userId: userData.userId,
      userEmail: userData.userEmail,
      // Other PII fields
    };
    
    const conversationData = {
      id: conversationId,
      timestamp: new Date().toISOString(),
      userQueries: userData.queries,
      agentResponses: agentResponses,
      metadata: {
        agentVersion: mockEnv.AGENT_VERSION,
        patternType: "${patternId}"
      }
    };
    
    // Store conversation data - with retention policy metadata
    const conversationBlob = containerClient.getBlockBlobClient(
      "conversations/" + conversationId + ".json"
    );
    
    await conversationBlob.upload(
      JSON.stringify(conversationData),
      JSON.stringify(conversationData).length,
      {
        metadata: {
          retentionCategory: "conversation",
          retentionDays: "90"
        }
      }
    );
    
    // Store PII data in separate container with stricter controls
    // (in production consider using Azure Key Vault for sensitive data)
    const piiContainer = blobServiceClient.getContainerClient("user-data");
    await piiContainer.createIfNotExists();
    
    const piiBlob = piiContainer.getBlockBlobClient(
      "users/" + userData.userId + ".json"
    );
    
    await piiBlob.upload(
      JSON.stringify(piiData),
      JSON.stringify(piiData).length,
      {
        metadata: {
          dataCategory: "pii",
          retentionDays: "30",
          encrypted: "true"
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error("Failed to store conversation data:", error);
    return false;
  }
}`
    },
    {
      name: 'Performance Optimization',
      icon: <Gauge size={18} className="text-primary" />,
      category: 'performance',
      description: 'Techniques for improving throughput, latency, and cost-effectiveness of AI agent systems.',
      tips: [
        'Implement caching for common queries and responses',
        'Use streaming responses for better perceived latency',
        'Set up model deployment scaling rules appropriate to your traffic',
        'Consider Azure Cache for Redis to store context and session data',
        'Optimize prompt construction to reduce token usage'
      ],
      code: `import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { RedisClient } from "@azure/redis-client";

// Initialize clients
const openaiClient = new OpenAIClient(
  mockEnv.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(mockEnv.AZURE_OPENAI_API_KEY)
);

// Initialize Redis cache for query results
const redisClient = new RedisClient({
  url: mockEnv.REDIS_CONNECTION_STRING
});

// Best Practice: Optimize with response caching and streaming
async function optimizedAgentQuery(query, options = {}) {
  try {
    // Generate cache key based on query and options
    const cacheKey = "query:" + hashString(query) + ":options:" + hashString(JSON.stringify(options));
    
    // Check cache first
    const cachedResponse = await redisClient.get(cacheKey);
    if (cachedResponse && !options.skipCache) {
      console.log("Cache hit for query");
      return JSON.parse(cachedResponse);
    }
    
    // Best Practice: Use TokenSize estimator to optimize prompts
    const estimatedTokens = estimateTokenSize(query);
    if (estimatedTokens > 1000) {
      // Apply prompt optimization for large inputs
      query = optimizePrompt(query);
    }
    
    // Use streaming for better user experience
    if (options.streaming) {
      const stream = await openaiClient.streamChatCompletions(
        mockEnv.AZURE_OPENAI_DEPLOYMENT_NAME,
        [
          { role: "system", content: agentSystemMessage },
          { role: "user", content: query }
        ]
      );
      
      // Return stream for client processing
      return { stream };
    }
    
    // Standard request
    const response = await openaiClient.getChatCompletions(
      mockEnv.AZURE_OPENAI_DEPLOYMENT_NAME,
      [
        { role: "system", content: agentSystemMessage },
        { role: "user", content: query }
      ],
      {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 800
      }
    );
    
    const result = {
      content: response.choices[0].message.content,
      tokenUsage: response.usage
    };
    
    // Cache the response (expire after 1 hour)
    await redisClient.set(cacheKey, JSON.stringify(result), { ex: 3600 });
    
    return result;
  } catch (error) {
    console.error("Query failed:", error);
    throw error;
  }
}

// Helper function to create hash for cache keys
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash &= hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Best Practice: Implement efficient token usage
function estimateTokenSize(text) {
  // Rough estimate: 1 token ≈ 4 chars for English text
  return Math.ceil(text.length / 4);
}

// Optimize prompt to reduce token usage
function optimizePrompt(text) {
  // Implement your prompt optimization logic
  // e.g., summarize, extract key points, etc.
  return text;
}`
    },
    {
      name: 'Observability',
      icon: <ClockClockwise size={18} className="text-primary" />,
      category: 'monitoring',
      description: 'End-to-end monitoring and tracing of AI agent systems for visibility and diagnostics.',
      tips: [
        'Implement Application Insights for end-to-end monitoring',
        'Create custom metrics for agent-specific KPIs',
        'Set up alerts for anomalies in response patterns',
        'Use distributed tracing across your agent components',
        'Monitor token usage for cost management'
      ],
      code: `import { TelemetryClient } from "@microsoft/applicationinsights-web";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

// Initialize Application Insights
const telemetryClient = new TelemetryClient({
  connectionString: mockEnv.APPINSIGHTS_CONNECTION_STRING
});

// Initialize Azure OpenAI client
const openaiClient = new OpenAIClient(
  mockEnv.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(mockEnv.AZURE_OPENAI_API_KEY)
);

// Best Practice: Comprehensive agent telemetry
async function agentWithTelemetry(query, userId) {
  // Start tracking request
  const requestStartTime = Date.now();
  const requestId = generateRequestId();
  
  try {
    // Track incoming request
    telemetryClient.trackEvent({
      name: "AgentQuery",
      properties: {
        requestId: requestId,
        userId: userId,
        queryLength: query.length,
        timestamp: new Date().toISOString(),
        pattern: "${patternId}"
      }
    });

    // Process with OpenAI
    let tokenUsage = 0;
    let latency = 0;
    let result;
    
    try {
      // Start OpenAI performance tracking
      const llmStartTime = Date.now();
      
      // Get response from OpenAI
      const response = await openaiClient.getChatCompletions(
        mockEnv.AZURE_OPENAI_DEPLOYMENT_NAME,
        [
          { role: "system", content: agentSystemPrompt },
          { role: "user", content: query }
        ]
      );
      
      // Calculate LLM metrics
      latency = Date.now() - llmStartTime;
      tokenUsage = response.usage.totalTokens;
      result = response.choices[0].message.content;
      
      // Track LLM operation success
      telemetryClient.trackDependency({
        target: "AzureOpenAI",
        name: "ChatCompletion",
        data: "getChatCompletions",
        duration: latency,
        resultCode: 200,
        success: true,
        properties: {
          requestId: requestId,
          model: mockEnv.AZURE_OPENAI_DEPLOYMENT_NAME,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: tokenUsage
        }
      });
    } catch (error) {
      // Track LLM operation failure
      telemetryClient.trackDependency({
        target: "AzureOpenAI",
        name: "ChatCompletion",
        data: "getChatCompletions",
        duration: Date.now() - llmStartTime,
        resultCode: error.statusCode || 500,
        success: false,
        properties: {
          requestId: requestId,
          error: error.message,
          model: mockEnv.AZURE_OPENAI_DEPLOYMENT_NAME
        }
      });
      throw error;
    }
    
    // Track custom metrics
    telemetryClient.trackMetric({
      name: "LLMLatency",
      average: latency,
      properties: {
        requestId: requestId,
        model: mockEnv.AZURE_OPENAI_DEPLOYMENT_NAME
      }
    });

    telemetryClient.trackMetric({
      name: "TokenUsage",
      average: tokenUsage,
      properties: {
        requestId: requestId,
        model: mockEnv.AZURE_OPENAI_DEPLOYMENT_NAME
      }
    });
    
    // Track success completion
    const totalDuration = Date.now() - requestStartTime;
    telemetryClient.trackRequest({
      name: "AgentQuery",
      url: "InternalAgentService",
      duration: totalDuration,
      resultCode: 200,
      success: true,
      properties: {
        requestId: requestId,
        responseTime: totalDuration,
        tokenUsage: tokenUsage,
        pattern: "${patternId}",
        userSatisfaction: "Unknown" // To be updated later with feedback
      }
    });
    
    return {
      requestId: requestId,
      result: result,
      metrics: {
        latency: latency,
        tokenUsage: tokenUsage,
        totalDuration: totalDuration
      }
    };
  } catch (error) {
    // Track failure
    telemetryClient.trackRequest({
      name: "AgentQuery",
      url: "InternalAgentService",
      duration: Date.now() - requestStartTime,
      resultCode: error.statusCode || 500,
      success: false,
      properties: {
        requestId: requestId,
        error: error.message,
        pattern: "${patternId}"
      }
    });
    
    telemetryClient.trackException({
      exception: error,
      properties: {
        requestId: requestId,
        query: query,
        pattern: "${patternId}"
      }
    });
    
    throw error;
  }
}

// Generate unique request ID for tracing
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}`
    },
    {
      name: 'Authentication & Authorization',
      icon: <Lock size={18} className="text-primary" />,
      category: 'security',
      description: 'Secure access control for agent capabilities and data with Azure-native authentication.',
      tips: [
        'Use Microsoft Entra ID for user authentication',
        'Implement Azure RBAC for fine-grained access control',
        'Set up Azure Key Vault for secure credential storage',
        'Apply least privilege principles for all agent roles',
        'Implement API authentication with OAuth 2.0'
      ],
      code: `import { ClientSecretCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { OpenAIClient } from "@azure/openai";

// Best Practice: Secure credential management
async function getSecureClient() {
  try {
    // Set up Key Vault access
    const credential = new ClientSecretCredential(
      mockEnv.TENANT_ID,
      mockEnv.CLIENT_ID,
      mockEnv.CLIENT_SECRET
    );
    
    const keyVaultUrl = mockEnv.KEYVAULT_URL;
    const keyClient = new SecretClient(keyVaultUrl, credential);
    
    // Retrieve secrets securely
    const apiKeySecret = await keyClient.getSecret("azure-openai-api-key");
    const endpointSecret = await keyClient.getSecret("azure-openai-endpoint");
    
    // Create authenticated client
    const openAIClient = new OpenAIClient(
      endpointSecret.value,
      new AzureKeyCredential(apiKeySecret.value)
    );
    
    return openAIClient;
  } catch (error) {
    console.error("Failed to initialize secure client:", error);
    throw error;
  }
}

// Best Practice: Role-based access control for agent capabilities
async function authorizeAgentOperation(userId, operationType) {
  try {
    // Check user's assigned roles (from session, token claims, etc.)
    const userRoles = await getUserRoles(userId);
    
    // Define role-based permissions
    const rolePermissions = {
      "Reader": ["query"],
      "Contributor": ["query", "feedback", "customize"],
      "Admin": ["query", "feedback", "customize", "configure"]
    };
    
    // Check if user has permission for this operation
    const userHasPermission = userRoles.some(role => 
      rolePermissions[role] && 
      rolePermissions[role].includes(operationType)
    );
    
    if (!userHasPermission) {
      console.warn("Authorization denied: User " + userId + " attempted " + operationType + " without permission");
      return false;
    }
    
    // Log authorized access
    console.log("Authorized " + userId + " for " + operationType);
    return true;
  } catch (error) {
    console.error("Authorization error:", error);
    return false;
  }
}

// Example authorized agent API for administrators
async function adminConfigureAgentPattern(userId, patternConfig) {
  // Check authorization
  const isAuthorized = await authorizeAgentOperation(userId, "configure");
  
  if (!isAuthorized) {
    throw new Error("Unauthorized: Insufficient permissions to configure agent patterns");
  }
  
  // Proceed with configuration (example)
  console.log("Admin " + userId + " configuring pattern " + patternId + " with config:", patternConfig);
  
  // Implementation continues...
}

// Helper function to get user roles
async function getUserRoles(userId) {
  // In production, this would fetch roles from Microsoft Entra ID or your user system
  return ["Contributor"]; // Example default role
}`
    }
  ];

  return (
    <Tabs defaultValue="azure-best-practices">
      <TabsList className="mb-4">
        <TabsTrigger value="azure-best-practices">Azure Best Practices</TabsTrigger>
      </TabsList>
      <TabsContent value="azure-best-practices" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Azure Integration Best Practices</h2>
          <p className="text-muted-foreground mb-6">
            Recommended practices for implementing the {patternName} pattern using Azure AI services
          </p>
          
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {practices.map((practice, index) => (
              <AccordionItem key={index} value={`practice-${index}`} className="border bg-card">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                  <div className="flex items-center gap-3 text-left">
                    {practice.icon}
                    <div>
                      <span className="font-medium">{practice.name}</span>
                      <span className="ml-3">
                        <Badge variant="outline" className="bg-primary/10 text-xs">
                          {practice.category}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
                  <CardDescription className="mb-3">
                    {practice.description}
                  </CardDescription>
                  
                  <h4 className="font-medium text-sm mb-2">Best Practices:</h4>
                  <ul className="space-y-1.5 mb-4">
                    {practice.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-primary">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {practice.code && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Implementation Example:</h4>
                      <div className="bg-muted rounded-md p-4 text-xs overflow-x-auto">
                        <pre>{practice.code}</pre>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </TabsContent>
    </Tabs>
  );
};

export default AzureServicesBestPractices;