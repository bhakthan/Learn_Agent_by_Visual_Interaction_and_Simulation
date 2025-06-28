import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Cloud, TerminalWindow, Lightning, Lock, Cpu, Globe, Code, ArrowSquareOut } from '@phosphor-icons/react';

// Mock environment variables for browser environment
const mockEnv = {
  AZURE_OPENAI_ENDPOINT: "https://your-openai-resource.openai.azure.com/",
  AZURE_OPENAI_API_KEY: "your-api-key",
  AZURE_OPENAI_DEPLOYMENT_NAME: "gpt-4",
  AZURE_OPENAI_EMBEDDING_DEPLOYMENT: "text-embedding-ada-002",
  AZURE_SEARCH_ENDPOINT: "https://your-search.search.windows.net",
  AZURE_SEARCH_INDEX_NAME: "your-index-name",
  AZURE_SEARCH_API_KEY: "your-search-api-key",
  AZURE_CONTENT_SAFETY_ENDPOINT: "https://your-content-safety.cognitiveservices.azure.com/",
  AZURE_CONTENT_SAFETY_KEY: "your-content-safety-key"
};

interface AzureServiceReferenceProps {
  pattern: string;
}

const AzureServiceReference: React.FC<AzureServiceReferenceProps> = ({ pattern }) => {
  // Services relevant to agent patterns
  const services = [
    {
      name: 'Azure OpenAI Service',
      icon: <Cloud size={24} className="text-primary" />,
      description: 'Azure OpenAI provides access to OpenAI\'s powerful language models including GPT-4, GPT-3.5-Turbo, and Embeddings models with Azure\'s security and compliance capabilities.',
      keyFeatures: [
        'Access to advanced GPT-4, GPT-3.5-Turbo, and future models',
        'Azure security, compliance, and regional availability',
        'Private network connectivity with VNet integration',
        'Monitoring and observability through Azure Monitor'
      ],
      documentation: 'https://learn.microsoft.com/azure/ai-services/openai/',
      quickStartLink: 'https://learn.microsoft.com/azure/ai-services/openai/quickstart',
      codeExamples: [
        {
          title: 'Basic Integration',
          language: 'TypeScript',
          description: 'Initialize client and send a completion request',
          code: `import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

// Initialize Azure OpenAI client
const endpoint = mockEnv.AZURE_OPENAI_ENDPOINT;
const azureApiKey = mockEnv.AZURE_OPENAI_API_KEY;
const deploymentName = mockEnv.AZURE_OPENAI_DEPLOYMENT_NAME;

const client = new OpenAIClient(
  endpoint, 
  new AzureKeyCredential(azureApiKey)
);

// Send a completion request
const result = await client.getChatCompletions(
  deploymentName,
  [
    { role: "system", content: "You are an AI assistant that helps with tasks." },
    { role: "user", content: "How can I implement a ReAct agent?" }
  ]
);

console.log(result.choices[0].message.content);`
        },
        {
          title: 'System Message Configuration',
          language: 'TypeScript',
          description: 'Configuring an agent with system message',
          code: `// Define an agent with role-specific system message
const agentSystemMessage = "You are an Azure AI agent specialized in this pattern. Your capabilities include: 1. Understanding user requests related to this pattern, 2. Generating code examples, 3. Providing implementation guidance";

// Agent setup function
async function setupAgent(client, deploymentName, systemMessage) {
  return async function(userQuery) {
    const result = await client.getChatCompletions(
      deploymentName,
      [
        { role: "system", content: systemMessage },
        { role: "user", content: userQuery }
      ],
      {
        temperature: 0.7,
        maxTokens: 800,
      }
    );
    
    return result.choices[0].message.content;
  };
}`
        }
      ]
    },
    {
      name: 'Azure AI Foundry',
      icon: <Lightning size={24} className="text-primary" />,
      description: 'A unified platform for building, evaluating, and deploying AI models and agents with a comprehensive toolset for the entire AI application lifecycle.',
      keyFeatures: [
        'Integrated environment for developing AI agents and applications',
        'Prompt flow for visual pipeline development',
        'Built-in evaluation tools for model comparison',
        'Seamless deployment and monitoring capabilities'
      ],
      documentation: 'https://learn.microsoft.com/azure/ai-studio/',
      quickStartLink: 'https://learn.microsoft.com/azure/ai-studio/how-to/prompt-flow',
      codeExamples: []
    },
    {
      name: 'Azure AI Search',
      icon: <Globe size={24} className="text-primary" />,
      description: 'Formerly Azure Cognitive Search, provides cloud search capabilities with built-in AI for content understanding and vector search for semantic similarity.',
      keyFeatures: [
        'Vector search for semantic similarity',
        'Hybrid retrieval combining vector and keyword search',
        'Built-in AI enrichment pipelines',
        'Seamless integration with other Azure AI services'
      ],
      documentation: 'https://learn.microsoft.com/azure/search/',
      quickStartLink: 'https://learn.microsoft.com/azure/search/search-get-started-vector',
      codeExamples: [
        {
          title: 'Vector Search Integration',
          language: 'TypeScript',
          description: 'Setting up vector search for RAG patterns',
          code: `import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import { OpenAIClient } from "@azure/openai";

// Initialize clients
const searchClient = new SearchClient(
  mockEnv.AZURE_SEARCH_ENDPOINT,
  mockEnv.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(mockEnv.AZURE_SEARCH_API_KEY)
);

const openaiClient = new OpenAIClient(
  mockEnv.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(mockEnv.AZURE_OPENAI_API_KEY)
);

// Function to perform vector search
async function vectorSearch(query, topK = 5) {
  // Generate embeddings for the query
  const embeddingResult = await openaiClient.getEmbeddings(
    mockEnv.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
    [query]
  );
  
  const queryEmbedding = embeddingResult.data[0].embedding;
  
  // Perform vector search
  const searchResults = await searchClient.search({
    vector: {
      value: queryEmbedding,
      fields: ["contentVector"],
      k: topK
    },
    select: ["title", "content", "category"]
  });
  
  return searchResults;
}`
        }
      ]
    },
    {
      name: 'Azure AI Content Safety',
      icon: <Lock size={24} className="text-primary" />,
      description: 'Provides moderation capabilities to detect and filter harmful content across text and images for safer AI applications.',
      keyFeatures: [
        'Text and image content moderation',
        'Customizable filtering thresholds',
        'Detection of harmful categories: hate, violence, sexual content',
        'Integration into content generation pipelines'
      ],
      documentation: 'https://learn.microsoft.com/azure/ai-services/content-safety/',
      quickStartLink: 'https://learn.microsoft.com/azure/ai-services/content-safety/quickstart-text',
      codeExamples: [
        {
          title: 'Content Moderation',
          language: 'TypeScript',
          description: 'Implementing content safety checks for agent outputs',
          code: `import { ContentSafetyClient, AzureKeyCredential } from "@azure/ai-content-safety";

// Initialize Content Safety client
const contentSafetyClient = new ContentSafetyClient(
  mockEnv.AZURE_CONTENT_SAFETY_ENDPOINT,
  new AzureKeyCredential(mockEnv.AZURE_CONTENT_SAFETY_KEY)
);

// Function to check text safety
async function checkTextSafety(text) {
  const result = await contentSafetyClient.analyzeTText({
    text: text,
    categories: ["Hate", "SelfHarm", "Sexual", "Violence"]
  });
  
  // Check if any category exceeds moderate threshold
  const hasPotentialHarm = result.categoriesAnalysis.some(
    category => category.severity >= 4
  );
  
  return {
    safe: !hasPotentialHarm,
    analysis: result.categoriesAnalysis
  };
}

// Implementation in agent pipeline
async function generateSafeResponse(prompt) {
  // Generate response from LLM
  const response = await llm(prompt);
  
  // Check safety before returning
  const safetyCheck = await checkTextSafety(response);
  
  if (!safetyCheck.safe) {
    return "I'm unable to provide that information due to content guidelines.";
  }
  
  return response;
}`
        }
      ]
    },
    {
      name: 'Azure AI Inference',
      icon: <Cpu size={24} className="text-primary" />,
      description: 'Optimized runtime for deploying and serving machine learning models with high performance and low latency.',
      keyFeatures: [
        'High-performance model serving',
        'Optimized for deployment efficiency',
        'Supports various model formats',
        'Scalable infrastructure for production workloads'
      ],
      documentation: 'https://learn.microsoft.com/python/api/overview/azure/ai-inference-readme?view=azure-python-preview',
      quickStartLink: 'https://github.com/Azure/azureml-inference',
      codeExamples: []
    },
    {
      name: 'Azure AI Evaluation',
      icon: <TerminalWindow size={24} className="text-primary" />,
      description: 'Tools and services for comprehensive evaluation of AI models and agent systems with automated metrics and human feedback integration.',
      keyFeatures: [
        'Standardized evaluation framework for LLMs and agents',
        'Automated and human-in-the-loop evaluation pipelines',
        'Customizable evaluation metrics',
        'Performance tracking across model versions'
      ],
      documentation: 'https://learn.microsoft.com/python/api/overview/azure/ai-evaluation-readme?view=azure-python',
      quickStartLink: 'https://github.com/Azure/azureml-evaluation',
      codeExamples: [
        {
          title: 'Agent Evaluation',
          language: 'Python',
          description: 'Implementing evaluation for agent performance',
          code: `from azure.ai.evaluation import EvaluationPipeline, LLMEvaluator

# Create evaluation pipeline
eval_pipeline = EvaluationPipeline(
    evaluator=LLMEvaluator(
        endpoint="YOUR_AZURE_OPENAI_ENDPOINT",
        deployment_name="gpt-4",
        api_key="YOUR_AZURE_OPENAI_KEY"
    )
)

# Define evaluation criteria
evaluation_criteria = [
    "Relevance: Does the response directly address the user's question?",
    "Accuracy: Is the information provided factually correct?",
    "Completeness: Does the response cover all aspects of the question?",
    "Reasoning: Does the agent show clear step-by-step reasoning?"
]

# Sample test cases
test_cases = [
    {
        "query": "What is the capital of France and what is its population?",
        "reference_answer": "The capital of France is Paris. Paris has a population of approximately 2.2 million people in the city proper."
    },
    # Add more test cases...
]

# Run evaluation
results = eval_pipeline.evaluate(
    test_cases=test_cases,
    agent_fn=your_agent_function,  # Function that takes query and returns response
    criteria=evaluation_criteria,
    scoring_method="likert_scale",  # Options: likert_scale, percentage, binary
    scale_max=5
)

# Print results summary
print(f"Average score: {results.mean_score}")
for criterion in evaluation_criteria:
    criterion_name = criterion.split(":")[0]
    print(f"{criterion_name} average: {results.criterion_scores[criterion_name]}")`
        }
      ]
    }
  ];

  return (
    <Tabs defaultValue="azure-services">
      <TabsList className="mb-4">
        <TabsTrigger value="azure-services">Azure Services</TabsTrigger>
      </TabsList>
      <TabsContent value="azure-services" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Azure AI Services Reference</h2>
        <p className="text-muted-foreground mb-6">
          Key Azure services for implementing {pattern} pattern with enterprise-grade capabilities
        </p>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.name} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {service.icon}
                    <CardTitle>{service.name}</CardTitle>
                  </div>
                  <Button variant="link" className="h-8 p-0" asChild>
                    <a href={service.documentation} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <ArrowSquareOut size={16} className="mr-1" />
                      Docs
                    </a>
                  </Button>
                </div>
                <CardDescription className="mt-2">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <h4 className="font-medium mb-2">Key Features</h4>
                <ul className="mb-4 space-y-1">
                  {service.keyFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="mr-2 mt-0.5 text-primary">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {service.codeExamples.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="mt-4">
                      <h4 className="font-medium mb-3">Integration Examples</h4>
                      <Accordion type="single" collapsible className="w-full">
                        {service.codeExamples.map((example, idx) => (
                          <AccordionItem key={idx} value={`example-${idx}`}>
                            <AccordionTrigger className="py-2">
                              <div className="flex items-center gap-2 text-left">
                                <Code size={16} className="text-primary" />
                                <span>{example.title}</span>
                                <Badge variant="outline" className="ml-2 bg-muted">
                                  {example.language}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-sm text-muted-foreground mb-2">{example.description}</p>
                              <div className="relative mt-2 rounded-md bg-muted p-4 overflow-x-auto">
                                <pre className="text-xs">
                                  <code>{example.code}</code>
                                </pre>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </>
                )}

                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant="outline" className="text-xs" asChild>
                    <a href={service.quickStartLink} target="_blank" rel="noopener noreferrer">
                      Quick Start Guide
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TabsContent>
    </Tabs>
  );
};

export default AzureServiceReference;