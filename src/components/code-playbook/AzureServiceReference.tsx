import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Brain, 
  Bot, 
  Cpu, 
  Code, 
  Database, 
  ShieldCheck, 
  LineSegments, 
  Lightning, 
  FileCode 
} from '@phosphor-icons/react';

interface AzureServiceSample {
  title: string;
  code: string;
  language: 'typescript' | 'python';
  description: string;
}

interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  keyFeatures: string[];
  apiReference: string;
  resourceRequirements?: string[];
  pricingNotes?: string;
  samples: AzureServiceSample[];
}

const azureServiceDetails: ServiceDetails[] = [
  {
    id: 'azure-openai',
    name: 'Azure OpenAI Service',
    icon: <Cloud size={24} className="text-primary" />,
    description: 'Azure OpenAI provides access to OpenAI\'s powerful language models including GPT-4, GPT-3.5-Turbo, and Embeddings models with Azure\'s security and compliance capabilities.',
    keyFeatures: [
      'Access to advanced GPT-4, GPT-3.5-Turbo, and future models',
      'Text embeddings generation for vector search and similarity features',
      'Fine-tuning capabilities for custom scenarios',
      'Content filtering and safety mechanisms',
      'Azure security, compliance, and regional availability',
      'Integration with Azure\'s identity and access management'
    ],
    resourceRequirements: [
      'Requires quota approval for production usage',
      'Available in selected Azure regions',
      'Consider data residency requirements for your implementation'
    ],
    pricingNotes: 'Pay-per-token pricing model with tiered rates based on model and volume.',
    apiReference: 'https://learn.microsoft.com/azure/ai-services/openai/reference',
    samples: [
      {
        title: 'Basic Completion Request',
        language: 'typescript',
        description: 'Simple completion request to Azure OpenAI',
        code: `import { AzureOpenAIClient, AzureKeyCredential } from "@azure/openai";

// Set up the Azure OpenAI client
const client = new AzureOpenAIClient(
  "https://your-resource-name.openai.azure.com",
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY || "")
);

// Send a completion request
async function getCompletion(prompt: string) {
  const deploymentName = "gpt-35-turbo"; // Your deployment name
  
  const result = await client.getChatCompletions(
    deploymentName,
    [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ],
    { temperature: 0.7, maxTokens: 800 }
  );
  
  return result.choices[0].message?.content || "";
}`
      },
      {
        title: 'Agent System Message',
        language: 'typescript',
        description: 'Configuring an agent with system message',
        code: `// Define an agent with role-specific system message
const agentSystemMessage = "You are an Azure AI agent specialized in this pattern.\n" +
"Your capabilities include:\n" +
"1. Understanding user requests related to this pattern\n" +
"2. Explaining how the pattern works\n" +
"3. Suggesting implementation approaches\n\n" +
"Guidelines:\n" +
"- Provide concise, accurate information\n" +
"- When unsure, acknowledge limitations\n" +
"- Focus on practical implementation advice";

// Use the system message in an agent interaction
async function getAgentResponse(userQuery: string) {
  const result = await client.getChatCompletions(
    "gpt-4",
    [
      { role: "system", content: agentSystemMessage },
      { role: "user", content: userQuery }
    ],
    { temperature: 0.3 } // Lower temperature for more focused responses
  );
  
  return result.choices[0].message?.content || "";
}`
      }
    ]
  },
  {
    id: 'azure-cognitive-search',
    name: 'Azure Cognitive Search',
    icon: <Database size={24} className="text-secondary" />,
    description: 'AI-powered cloud search service with built-in retrieval capabilities for knowledge-intensive applications with vector, keyword, and hybrid search capabilities.',
    keyFeatures: [
      'Vector search for semantic retrieval using embeddings',
      'Hybrid search combining keywords and vectors for optimal results',
      'Document chunking and processing pipelines',
      'Integration with Azure OpenAI for RAG patterns',
      'Relevance tuning and ranking profiles',
      'Filters and facets for guided navigation'
    ],
    resourceRequirements: [
      'Select appropriate tier based on document count and query volume',
      'Consider storage needs for indexed documents',
      'Plan for index replicas for high availability'
    ],
    pricingNotes: 'Pricing based on service tier, with considerations for storage, document count, and indexing operations.',
    apiReference: 'https://learn.microsoft.com/rest/api/searchservice/',
    samples: [
      {
        title: 'Vector Search Setup',
        language: 'typescript',
        description: 'Configure vector search for RAG implementation',
        code: `import { SearchClient, AzureKeyCredential, SearchIndex } from "@azure/search-documents";

// Create a vector-enabled search index
async function createVectorSearchIndex() {
  const indexClient = new SearchIndexClient(
    "https://your-service.search.windows.net",
    new AzureKeyCredential(process.env.SEARCH_API_KEY || "")
  );
  
  const index: SearchIndex = {
    name: "knowledge-index",
    fields: [
      {
        name: "id",
        type: "Edm.String",
        key: true,
        searchable: true
      },
      {
        name: "title",
        type: "Edm.String",
        searchable: true
      },
      {
        name: "content",
        type: "Edm.String",
        searchable: true
      },
      {
        name: "contentVector",
        type: "Collection(Edm.Single)",
        dimensions: 1536, // OpenAI embeddings dimensions
        vectorSearchConfiguration: "vectorConfig"
      }
    ],
    vectorSearch: {
      algorithms: {
        hnsw: {
          name: "hnswAlgorithm",
          parameters: {
            m: 4,
            efConstruction: 400,
            efSearch: 500
          }
        }
      },
      configurations: {
        vectorConfig: {
          algorithmConfigurationName: "hnswAlgorithm"
        }
      }
    }
  };
  
  await indexClient.createOrUpdateIndex(index);
}`
      },
      {
        title: 'Hybrid RAG Search',
        language: 'typescript',
        description: 'Implement hybrid search for optimal RAG results',
        code: `// Perform hybrid search combining vectors and keywords
async function hybridSearch(query: string) {
  const searchClient = new SearchClient(
    "https://your-service.search.windows.net",
    "knowledge-index",
    new AzureKeyCredential(process.env.SEARCH_API_KEY || "")
  );
  
  // Get embeddings for the query
  const embeddings = await getEmbeddingsFromOpenAI(query);
  
  // Execute hybrid search
  const searchResults = await searchClient.search(query, {
    select: ["id", "title", "content"],
    top: 5,
    vectorSearchOptions: {
      queries: [
        {
          kind: "vector",
          vector: embeddings,
          fields: ["contentVector"],
          kNearestNeighborsCount: 50
        }
      ]
    }
  });
  
  // Process and return the results
  const results = [];
  for await (const result of searchResults.results) {
    results.push(result.document);
  }
  return results;
}`
      }
    ]
  },
  {
    id: 'azure-content-safety',
    name: 'Azure Content Safety',
    icon: <ShieldCheck size={24} className="text-destructive" />,
    description: 'AI service for detecting harmful content across text and images to maintain safety and compliance.',
    keyFeatures: [
      'Text content moderation for harmful language',
      'Image content analysis for inappropriate visuals',
      'Content categorization by harm type',
      'Severity level assessment for policy enforcement',
      'Custom blocklists and allowlists',
      'Real-time filtering capabilities'
    ],
    resourceRequirements: [
      'Determine throughput needs based on content volume',
      'Consider latency requirements for real-time filtering',
      'Plan integration points in the content pipeline'
    ],
    pricingNotes: 'Pay-per-transaction model with volume-based pricing tiers.',
    apiReference: 'https://learn.microsoft.com/azure/ai-services/content-safety/reference',
    samples: [
      {
        title: 'LLM Output Safety Check',
        language: 'typescript',
        description: 'Validate LLM outputs before displaying to users',
        code: `import { ContentSafetyClient, AzureKeyCredential } from "@azure/ai-content-safety";

// Set up Content Safety client
const contentSafetyClient = new ContentSafetyClient(
  "https://your-content-safety-resource.cognitiveservices.azure.com/",
  new AzureKeyCredential(process.env.CONTENT_SAFETY_API_KEY || "")
);

// Check LLM output for safety before displaying
async function validateOutput(llmOutput: string) {
  try {
    const result = await contentSafetyClient.analyzeSafety({
      text: llmOutput,
      categories: ["Hate", "SelfHarm", "Sexual", "Violence"]
    });
    
    // Check if any categories exceed threshold
    const maxSeverity = Math.max(
      ...result.categoriesAnalysis.map(category => category.severity || 0)
    );
    
    // If content exceeds threshold, replace with safe alternative
    if (maxSeverity > 3) {
      const flaggedCategories = result.categoriesAnalysis
        .filter(c => (c.severity || 0) > 3)
        .map(c => c.category)
        .join(", ");
        
      console.log(\`Content flagged for: \${flaggedCategories}\`);
      return {
        isSafe: false,
        sanitizedOutput: "I'm sorry, but I cannot provide that information. Let me offer an alternative approach."
      };
    }
    
    return {
      isSafe: true,
      sanitizedOutput: llmOutput
    };
  } catch (error) {
    console.error("Content safety validation failed:", error);
    
    // Fail safe - assume content is unsafe if validation fails
    return {
      isSafe: false,
      sanitizedOutput: "Sorry, I couldn't process that response. Let me try a different approach."
    };
  }
}`
      }
    ]
  },
  {
    id: 'azure-ai-inference',
    name: 'Azure AI Inference SDK',
    icon: <Lightning size={24} className="text-accent" />,
    description: 'Optimizes the deployment and execution of AI models for efficient inference in production environments.',
    keyFeatures: [
      'High-performance model inference optimization',
      'Automatic batching for throughput improvement',
      'GPU and hardware acceleration support',
      'Scalable model serving infrastructure',
      'Inference monitoring and logging capabilities',
      'Multi-model deployment management'
    ],
    apiReference: 'https://learn.microsoft.com/azure/machine-learning/reference-inferencing-sdk',
    samples: [
      {
        title: 'Optimized Inference Pipeline',
        language: 'typescript',
        description: 'Configure optimized inference for agent components',
        code: `import { InferenceClient } from "@azure/ai-inference";

// Set up optimized inference for critical agent components
async function configureAgentInference() {
  const inferenceClient = new InferenceClient(
    "https://your-inference-endpoint.azure.com",
    { key: process.env.INFERENCE_API_KEY }
  );
  
  // Configure batching for high-throughput scenarios
  const batchConfig = {
    maxBatchSize: 16,
    maxWaitTimeMs: 50,
    dynamicBatching: true
  };
  
  // Apply optimized configuration
  const deploymentConfig = {
    modelId: "agent-reasoning-model",
    computeType: "GPU",
    scaling: {
      minInstances: 1,
      maxInstances: 5,
      targetUtilization: 70
    },
    batchingConfiguration: batchConfig
  };
  
  // Create or update the deployment
  await inferenceClient.createOrUpdateDeployment(deploymentConfig);
}`
      }
    ]
  },
  {
    id: 'azure-ai-evaluation',
    name: 'Azure AI Evaluation SDK',
    icon: <LineSegments size={24} className="text-secondary" />,
    description: 'Tools for systematic evaluation and benchmarking of AI models to ensure quality, safety, and alignment with requirements.',
    keyFeatures: [
      'Automated model evaluation pipelines',
      'Benchmarking against reference models',
      'Safety and alignment testing frameworks',
      'Performance and accuracy metrics tracking',
      'Human feedback integration capabilities',
      'Regression testing for model updates'
    ],
    apiReference: 'https://learn.microsoft.com/en-us/python/api/overview/azure/ai-evaluation-readme?view=azure-python',
    samples: [
      {
        title: 'Agent Pattern Evaluation',
        language: 'typescript',
        description: 'Evaluate agent pattern effectiveness',
        code: `import { EvaluationClient } from "@azure/ai-evaluation";

// Set up evaluation for agent pattern performance
async function evaluateAgentPattern(patternImplementation: any, testCases: any[]) {
  const evaluationClient = new EvaluationClient({
    endpoint: "https://your-evaluation-endpoint.azure.com",
    credential: new AzureKeyCredential(process.env.EVALUATION_API_KEY || "")
  });
  
  // Define evaluation metrics
  const evaluationConfig = {
    metrics: ["correctness", "helpfulness", "relevance", "groundedness"],
    aggregation: "average",
    threshold: {
      correctness: 0.7,
      helpfulness: 0.8,
      relevance: 0.75,
      groundedness: 0.9
    }
  };
  
  // Run evaluation across test cases
  const results = await evaluationClient.evaluateAgent({
    agentImplementation: patternImplementation,
    testCases: testCases,
    config: evaluationConfig
  });
  
  // Process results
  const passedMetrics = Object.entries(results.aggregateScores)
    .filter(([metric, score]) => score >= evaluationConfig.threshold[metric])
    .map(([metric]) => metric);
    
  const failedMetrics = Object.entries(results.aggregateScores)
    .filter(([metric, score]) => score < evaluationConfig.threshold[metric])
    .map(([metric]) => metric);
    
  return {
    passed: failedMetrics.length === 0,
    scores: results.aggregateScores,
    passedMetrics,
    failedMetrics,
    detailedResults: results.perCaseResults
  };
}`
      },
      {
        title: 'Model Comparison Evaluation',
        language: 'typescript',
        description: 'Compare performance between model versions',
        code: `import { EvaluationClient } from "@azure/ai-evaluation";

// Compare different model versions on the same tasks
async function compareModelVersions(baselineModel: string, candidateModel: string, evaluationDataset: any[]) {
  const evaluationClient = new EvaluationClient({
    endpoint: "https://your-evaluation-endpoint.azure.com",
    credential: new AzureKeyCredential(process.env.EVALUATION_API_KEY || "")
  });
  
  // Configure comparison parameters
  const comparisonConfig = {
    metrics: [
      "accuracy", 
      "faithfulness", 
      "toxicity", 
      "coherence", 
      "relevance"
    ],
    evaluators: {
      accuracy: {
        type: "gpt-4-based",
        model: "gpt-4",
        prompt_template: "Evaluate the accuracy of the response compared to ground truth."
      },
      toxicity: {
        type: "content-safety",
        threshold: 0.7
      }
    }
  };
  
  // Run comparative evaluation
  const results = await evaluationClient.compareModels({
    baselineModel: {
      id: baselineModel,
      deployment: "azure-openai",
      parameters: { temperature: 0.0, max_tokens: 500 }
    },
    candidateModel: {
      id: candidateModel,
      deployment: "azure-openai",
      parameters: { temperature: 0.0, max_tokens: 500 }
    },
    dataset: evaluationDataset,
    config: comparisonConfig
  });
  
  // Analyze win rates and statistical significance
  return {
    winRates: results.winRates, // How often candidate beat baseline
    metricDeltas: results.metricDeltas, // Average improvement per metric
    significanceTests: results.significanceTests, // Statistical significance of differences
    recommendations: results.recommendations, // Automatic recommendations
    perQueryResults: results.perQueryResults // Detailed per-query comparisons
  };
}`
      },
      {
        title: 'RAG Evaluation Pipeline',
        language: 'python',
        description: 'Comprehensive evaluation of RAG systems',
        code: `from azure.ai.evaluation.retrieval import RetrievalEvaluator
from azure.ai.evaluation.qa import QuestionAnsweringEvaluator
from azure.ai.evaluation import EvaluationPipeline

# Create evaluators for each part of RAG system
def create_rag_evaluation_pipeline():
    # Retrieval evaluation
    retrieval_evaluator = RetrievalEvaluator(
        metrics=["precision_at_k", "recall_at_k", "ndcg", "map"],
        parameters={"k": [1, 3, 5, 10]}
    )
    
    # Question answering evaluation
    qa_evaluator = QuestionAnsweringEvaluator(
        metrics=["answer_relevance", "faithfulness", "context_utilization", "correctness"],
        reference_model="gpt-4-turbo",
        parameters={
            "prompt_template": "Evaluate the answer based on the provided context."
        }
    )
    
    # Create complete RAG evaluation pipeline
    pipeline = EvaluationPipeline(
        name="comprehensive-rag-evaluation",
        evaluators={
            "retrieval": retrieval_evaluator,
            "qa": qa_evaluator
        },
        pipeline_metrics=["end_to_end_accuracy", "latency"]
    )
    
    return pipeline

# Run evaluation against test dataset
def evaluate_rag_system(rag_system, test_dataset):
    pipeline = create_rag_evaluation_pipeline()
    
    # Run evaluation
    results = pipeline.evaluate(
        system=rag_system,
        dataset=test_dataset
    )
    
    # Generate evaluation report
    report = pipeline.generate_report(
        results=results,
        format="html",
        include_visualizations=True
    )
    
    # Retrieve recommendations for improvement
    recommendations = pipeline.generate_recommendations(results)
    
    return {
        "results": results,
        "report": report,
        "recommendations": recommendations
    }`
      }
    ]
  },
  {
    id: 'azure-ai-foundry',
    name: 'Azure AI Foundry',
    icon: <Brain size={24} className="text-primary" />,
    description: 'A collection of tools and services for building, deploying, and managing AI models on Azure.',
    keyFeatures: [
      'Model development workspace environment',
      'Simplified model deployment processes',
      'Monitoring and management tools for AI solutions',
      'Integration with Azure ML and other Azure services',
      'Collaboration tools for AI development teams',
      'Resource governance and organization'
    ],
    apiReference: 'https://learn.microsoft.com/azure/ai-studio/',
    samples: [
      {
        title: 'Pattern Deployment Pipeline',
        language: 'typescript',
        description: 'Set up CI/CD for pattern deployment',
        code: `// Azure AI Foundry CI/CD Pipeline Configuration
import { FoundryClient } from "@azure/ai-foundry";

async function setupPatternDeploymentPipeline() {
  const foundryClient = new FoundryClient({
    endpoint: "https://your-foundry-instance.azure.com",
    credential: new DefaultAzureCredential()
  });
  
  // Define deployment environments
  const environments = [
    { name: "development", autoApprove: true },
    { name: "staging", autoApprove: false },
    { name: "production", autoApprove: false }
  ];
  
  // Define deployment pipeline for agent pattern
  const pipelineConfig = {
    name: "pattern-deployment-pipeline",
    source: {
      type: "github",
      repository: "your-org/agent-patterns",
      branch: "main",
      directory: "patterns/agent-pattern"
    },
    deployment: {
      environments,
      testing: {
        unitTestPath: "tests/unit",
        integrationTestPath: "tests/integration",
        evaluationSuite: "agent-evaluation-suite"
      },
      monitoring: {
        metrics: ["accuracy", "latency", "cost"],
        alerts: [
          { metric: "accuracy", threshold: 0.9, operator: "below" },
          { metric: "latency", threshold: 500, operator: "above" }
        ]
      }
    }
  };
  
  // Create or update pipeline
  await foundryClient.createOrUpdatePipeline(pipelineConfig);
}`
      }
    ]
  },
  {
    id: 'azure-ai-agent-service',
    name: 'Azure AI Agent Service',
    icon: <Bot size={24} className="text-accent" />,
    description: 'Managed service for deploying, monitoring, and scaling intelligent agents built on Azure AI services.',
    keyFeatures: [
      'Agent lifecycle management from development to production',
      'Built-in agent templates and pattern implementations',
      'Tool integration framework for extensibility',
      'Conversation and context management services',
      'Usage analytics and performance monitoring',
      'High availability deployment options'
    ],
    apiReference: 'https://learn.microsoft.com/azure/ai-services/',
    samples: [
      {
        title: 'Agent Deployment',
        language: 'typescript',
        description: 'Deploy an agent to production',
        code: `import { AgentServiceClient } from "@azure/ai-agent-service";

// Deploy agent with the pattern
async function deployPatternAgent() {
  const agentClient = new AgentServiceClient({
    endpoint: "https://your-agent-service.azure.com",
    credential: new DefaultAzureCredential()
  });
  
  // Define agent configuration using the pattern
  const agentConfig = {
    name: "custom-agent",
    description: "An agent implementing a custom pattern",
    pattern: {
      type: "custom-pattern",
      configuration: {
        // Pattern-specific configuration
        // These values would be customized based on the pattern requirements
        maxIterations: 5,
        toolset: ["search", "calculator", "weather-api"],
        defaultTimeout: 30000,
        loggingLevel: "info"
      }
    },
    security: {
      authentication: "azure-ad",
      contentFiltering: true,
      dataAccess: {
        permissions: ["read-knowledge-base"],
        boundaries: ["public-data-only"]
      }
    },
    scaling: {
      minInstances: 2,
      maxInstances: 10,
      requestsPerInstance: 100
    },
    monitoring: {
      metrics: ["success-rate", "latency", "token-usage"],
      logging: {
        level: "info",
        destination: "azure-monitor"
      }
    }
  };
  
  // Create or update the agent
  const deploymentResult = await agentClient.createOrUpdateAgent(agentConfig);
  
  return {
    agentId: deploymentResult.id,
    endpointUrl: deploymentResult.endpoints.rest,
    status: deploymentResult.status
  };
}`
      }
    ]
  }
];

interface AzureServiceReferenceProps {
  patternId: string;
  patternName: string;
  serviceId?: string;
}

const AzureServiceReference: React.FC<AzureServiceReferenceProps> = ({ 
  patternId = 'default-pattern', 
  patternName = 'Default Pattern', 
  serviceId 
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(serviceId || 'azure-openai');
  const [activeTab, setActiveTab] = useState<'overview' | 'samples'>('overview');
  
  // Get the currently selected service
  const selectedService = azureServiceDetails.find(s => s.id === selectedServiceId) || azureServiceDetails[0];
  
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b">
        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
          <Cloud size={20} className="text-primary" /> 
          Azure AI Services for {patternName}
        </h3>
        <p className="text-sm text-muted-foreground">
          Select an Azure AI service to see detailed reference information and implementation samples for the {patternName} pattern.
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {azureServiceDetails.map(service => (
          <Button
            key={service.id}
            variant={selectedServiceId === service.id ? "default" : "outline"}
            size="sm"
            className="h-9"
            onClick={() => setSelectedServiceId(service.id)}
          >
            <span className="flex items-center gap-1">
              {service.icon}
              <span className="truncate max-w-[150px]">{service.name}</span>
            </span>
          </Button>
        ))}
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            {selectedService.icon}
            <span>{selectedService.name}</span>
          </CardTitle>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'samples')}>
            <TabsList>
              <TabsTrigger value="overview">Service Overview</TabsTrigger>
              <TabsTrigger value="samples">Implementation Samples</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-5">
              <div>
                <p className="text-foreground/90">{selectedService.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Key Features</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  {selectedService.keyFeatures.map((feature, i) => (
                    <li key={i} className="text-foreground/90">{feature}</li>
                  ))}
                </ul>
              </div>
              
              {selectedService.resourceRequirements && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Resource Considerations</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    {selectedService.resourceRequirements.map((req, i) => (
                      <li key={i} className="text-foreground/90">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedService.pricingNotes && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Pricing Notes</h4>
                  <p className="text-sm text-foreground/90">{selectedService.pricingNotes}</p>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedService.apiReference, '_blank')}
                >
                  <FileCode size={16} className="mr-1" /> API Reference
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'samples' && (
            <div className="p-6 space-y-6">
              {selectedService.samples.map((sample, idx) => (
                <div key={idx} className="space-y-3">
                  <div>
                    <h4 className="text-base font-medium">{sample.title}</h4>
                    <p className="text-sm text-muted-foreground">{sample.description}</p>
                  </div>
                  
                  <div className="relative">
                    <pre className="bg-zinc-950 text-zinc-50 p-4 rounded text-sm overflow-x-auto">
                      <code>{sample.code}</code>
                    </pre>
                    <div className="absolute top-3 right-3 flex gap-1">
                      <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded text-xs">
                        {sample.language}
                      </span>
                      <button 
                        className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs"
                        onClick={() => navigator.clipboard.writeText(sample.code)}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  {idx < selectedService.samples.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
              
              {selectedService.samples.length === 0 && (
                <div className="text-center p-8">
                  <Code size={32} className="mx-auto text-muted-foreground mb-3" />
                  <h4 className="text-base font-medium mb-1">No Code Samples</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementation samples for {selectedService.name} with {patternName} are not available yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AzureServiceReference;