import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, Stack, Lightning, Database, LineSegments, ShieldCheck, Article, Cpu } from '@phosphor-icons/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Define types for services
type ServiceCategory = 'foundation' | 'knowledge' | 'safety' | 'evaluation' | 'inference' | 'platform' | 'agent';

interface AzureServiceInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: ServiceCategory;
  tips: string[];
  documentation: string;
}

interface ServiceImplementationStep {
  title: string;
  description: string;
  code?: string;
  language?: 'typescript' | 'python';
}

interface AzureServiceImplementation {
  serviceId: string;
  patternId: string;
  steps: ServiceImplementationStep[];
}

// Sample data for Azure services best practices with implementation steps
const azureServiceImplementations: AzureServiceImplementation[] = [
  {
    serviceId: 'azure-openai',
    patternId: 'agent-to-agent',
    steps: [
      {
        title: '1. Create Agent Interface',
        description: 'Define a common interface for agent communication',
        code: `interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  process: (message: Message) => Promise<Message>;
  canHandle: (task: Task) => Promise<boolean>;
}`,
        language: 'typescript'
      },
      {
        title: '2. Set Up Azure OpenAI Client',
        description: 'Configure Azure OpenAI client with authentication',
        code: `import { AzureOpenAIClient } from "@azure/openai";

const client = new AzureOpenAIClient(
  "https://your-resource-name.openai.azure.com",
  { key: process.env.AZURE_OPENAI_KEY }
);`,
        language: 'typescript'
      },
      {
        title: '3. Implement Agent Communication Protocol',
        description: 'Define message format for agent-to-agent communication',
        code: `interface Message {
  id: string;
  fromAgent: string;
  toAgent: string;
  content: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error';
  context?: Record<string, any>;
}`,
        language: 'typescript'
      }
    ]
  },
  {
    serviceId: 'azure-openai',
    patternId: 'reflexion',
    steps: [
      {
        title: '1. Configure Separate Model Instances',
        description: 'Set up separate model deployments for action and reflection',
        code: `// Action model - can use higher temperature for generation
const actionModel = new AzureOpenAIClient(
  "https://your-resource-name.openai.azure.com/deployments/action-model",
  { key: process.env.AZURE_OPENAI_KEY }
);

// Reflection model - use lower temperature for critical evaluation
const reflectionModel = new AzureOpenAIClient(
  "https://your-resource-name.openai.azure.com/deployments/reflection-model",
  { key: process.env.AZURE_OPENAI_KEY }
);`,
        language: 'typescript'
      },
      {
        title: '2. Define Reflection Template',
        description: 'Create a structured template for self-reflection',
        code: `const reflectionTemplate = \`
Evaluate the following solution:

SOLUTION:
\${solution}

Please provide a detailed assessment using the following structure:
1. Correctness: Is the solution technically correct?
2. Completeness: Does it address all aspects of the problem?
3. Efficiency: Could the solution be more efficient?
4. Clarity: Is the solution clear and easy to understand?
5. Improvements: Specific suggestions for improvement
\`;`,
        language: 'typescript'
      }
    ]
  },
  {
    serviceId: 'azure-cognitive-search',
    patternId: 'agentic-rag',
    steps: [
      {
        title: '1. Configure Azure Cognitive Search',
        description: 'Set up vector search in Azure Cognitive Search',
        code: `import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

// Configure search client with vector capabilities
const searchClient = new SearchClient(
  "https://your-service.search.windows.net",
  "your-index-name",
  new AzureKeyCredential(process.env.AZURE_SEARCH_KEY),
  {
    apiVersion: "2023-10-01-Preview" // Use preview API for vector search
  }
);`,
        language: 'typescript'
      },
      {
        title: '2. Implement Query Rewriting',
        description: 'Enhance retrieval with query rewriting techniques',
        code: `async function enhanceQuery(userQuery: string): Promise<string> {
  // Use Azure OpenAI to enhance the original query
  const systemMessage = "You are a search query enhancement assistant. Your job is to rewrite user queries to improve search results. Expand abbreviations, add synonyms, and clarify ambiguous terms.";
  
  const prompt = \`Original query: "\${userQuery}"
Please rewrite this search query to improve search results.\`;

  const response = await client.getChatCompletions(
    "your-gpt4-deployment",
    [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt }
    ],
    { temperature: 0.3 }
  );
  
  return response.choices[0].message.content || userQuery;
}`,
        language: 'typescript'
      },
      {
        title: '3. Implement Hybrid Search',
        description: 'Combine vector and keyword search for optimal retrieval',
        code: `async function hybridSearch(query: string, filters?: any) {
  const enhancedQuery = await enhanceQuery(query);
  
  // Generate embeddings for the query
  const embeddings = await getEmbeddings(enhancedQuery);
  
  // Perform hybrid search
  const searchResults = await searchClient.search(enhancedQuery, {
    vectorSearchOptions: {
      vector: embeddings,
      fields: ["contentVector"],
      kind: "hybrid"
    },
    select: ["id", "content", "title", "source"],
    filter: filters,
    top: 5
  });
  
  return searchResults;
}`,
        language: 'typescript'
      }
    ]
  }
];

// Define Azure services with implementation tips
const azureServicesBestPractices: AzureServiceInfo[] = [
  {
    id: 'azure-openai',
    name: 'Azure OpenAI Service',
    icon: <Cloud size={18} className="text-primary" />,
    category: 'foundation',
    description: 'Provides REST API access to OpenAI\'s powerful language models with Azure security and compliance features.',
    tips: [
      'Configure system messages to define agent behavior constraints and roles',
      'Use separate model deployments for different agent functions (reasoning vs. generation)',
      'Implement token usage tracking and rate limiting for cost management',
      'Cache responses for identical or similar queries to reduce costs',
      'Set appropriate temperature values based on task requirements (lower for factual tasks, higher for creative ones)'
    ],
    documentation: 'https://learn.microsoft.com/azure/ai-services/openai/'
  },
  {
    id: 'azure-cognitive-search',
    name: 'Azure Cognitive Search',
    icon: <Database size={18} className="text-secondary" />,
    category: 'knowledge',
    description: 'AI-powered cloud search service with built-in retrieval capabilities for knowledge-intensive applications.',
    tips: [
      'Design optimal chunking strategies for your document corpus',
      'Implement hybrid search combining vector and keyword approaches',
      'Use filters to narrow search scope for more relevant results',
      'Configure proper relevance tuning based on content types',
      'Implement feedback loops to improve search quality over time'
    ],
    documentation: 'https://learn.microsoft.com/azure/search/'
  },
  {
    id: 'azure-content-safety',
    name: 'Azure Content Safety',
    icon: <ShieldCheck size={18} className="text-destructive" />,
    category: 'safety',
    description: 'AI service for detecting harmful content across text and images to maintain safety and compliance.',
    tips: [
      'Implement pre-moderation for AI-generated content before display',
      'Set appropriate threshold levels based on your application\'s audience',
      'Create feedback loops to improve detection over time',
      'Implement blocklists for domain-specific problematic content',
      'Deploy content safety in multiple stages of the agent workflow'
    ],
    documentation: 'https://learn.microsoft.com/azure/ai-services/content-safety/'
  },
  {
    id: 'azure-ai-evaluation',
    name: 'Azure AI Evaluation SDK',
    icon: <LineSegments size={18} className="text-secondary" />,
    category: 'evaluation',
    description: 'Tools for systematic evaluation and benchmarking of AI models to ensure quality, safety, and alignment.',
    tips: [
      'Create comprehensive test suites covering expected agent behaviors',
      'Implement evaluation for edge cases and adversarial inputs',
      'Set up regular automated evaluation runs for continuous quality assessment',
      'Track evaluation metrics over time to identify regressions',
      'Include diverse evaluation criteria beyond accuracy (safety, fairness, etc.)'
    ],
    documentation: 'https://learn.microsoft.com/azure/ai-services/content-safety/'
  },
  {
    id: 'azure-ai-inference',
    name: 'Azure AI Inference SDK',
    icon: <Lightning size={18} className="text-accent" />,
    category: 'inference',
    description: 'Optimizes the deployment and execution of AI models for efficient inference in production environments.',
    tips: [
      'Implement request batching to improve throughput where appropriate',
      'Configure autoscaling based on demand patterns',
      'Set appropriate timeouts and retry policies for inference requests',
      'Optimize model size for deployment constraints (distillation, quantization)',
      'Use caching for frequently requested inference results'
    ],
    documentation: 'https://learn.microsoft.com/azure/machine-learning/concept-inference'
  },
  {
    id: 'azure-ai-foundry',
    name: 'Azure AI Foundry',
    icon: <Stack size={18} className="text-primary" />,
    category: 'platform',
    description: 'Collection of tools and services for building, deploying, and managing AI models on Azure.',
    tips: [
      'Set up proper CI/CD pipelines for model deployment',
      'Implement staged deployment (dev, test, prod) for AI models',
      'Use version control for prompts and model configurations',
      'Establish monitoring dashboards for model performance',
      'Implement testing frameworks for AI behaviors'
    ],
    documentation: 'https://learn.microsoft.com/azure/ai-studio/'
  },
  {
    id: 'azure-ai-agent-service',
    name: 'Azure AI Agent Service',
    icon: <Cpu size={18} className="text-accent" />,
    category: 'agent',
    description: 'Managed service for deploying, monitoring, and scaling intelligent agents built on Azure AI services.',
    tips: [
      'Define clear boundaries for agent capabilities and limitations',
      'Implement comprehensive logging of agent actions and decisions',
      'Design agents with graceful degradation paths when services are unavailable',
      'Create agent testing suites that verify behavior across scenarios',
      'Implement usage throttling and cost control mechanisms'
    ],
    documentation: 'https://learn.microsoft.com/azure/ai-services/'
  }
];

interface AzureServicesBestPracticesProps {
  patternId: string;
  patternName: string;
}

const AzureServicesBestPractices: React.FC<AzureServicesBestPracticesProps> = ({ patternId, patternName }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>("azure-openai");
  
  // Get implementation steps for the current pattern and selected service
  const implementationSteps = azureServiceImplementations.find(
    impl => impl.serviceId === selectedServiceId && impl.patternId === patternId
  )?.steps || [];
  
  const selectedService = azureServicesBestPractices.find(s => s.id === selectedServiceId);
  
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-muted/10">
        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
          <Cloud size={20} className="text-primary" />
          Azure AI Services Integration for {patternName}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose an Azure service to see implementation guidance and best practices for the {patternName} pattern.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {azureServicesBestPractices.map(service => (
            <Card 
              key={service.id}
              className={`overflow-hidden cursor-pointer transition-colors ${
                selectedServiceId === service.id 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedServiceId(service.id)}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {service.icon}
                  <span>{service.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {selectedService && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/30 p-4 border-b">
            <h3 className="text-base font-medium flex items-center gap-2">
              {selectedService.icon}
              <span>{selectedService.name} Integration</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Best practices and implementation guidance for integrating {selectedService.name} with the {patternName} pattern.
            </p>
          </div>
          
          <div className="p-4">
            <Tabs defaultValue="best-practices">
              <TabsList className="mb-4">
                <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="best-practices" className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Integration Best Practices</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {selectedService.tips.map((tip, i) => (
                      <li key={i} className="text-foreground/90">{tip}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">When to use {selectedService.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="border rounded p-3 bg-background">
                      <Badge variant="outline" className="mb-2">Recommended</Badge>
                      <ul className="list-disc pl-4 text-xs space-y-1">
                        <li>When implementing complex {patternName} patterns</li>
                        <li>For production-grade agent deployments</li>
                        <li>When security and compliance are critical</li>
                      </ul>
                    </div>
                    <div className="border rounded p-3 bg-background">
                      <Badge variant="outline" className="mb-2 bg-muted/50">Consider Alternatives</Badge>
                      <ul className="list-disc pl-4 text-xs space-y-1">
                        <li>For prototyping and early development</li>
                        <li>When budget constraints are significant</li>
                        <li>For extremely simple agent patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs" 
                    onClick={() => window.open(selectedService.documentation, '_blank')}
                  >
                    Official Documentation
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="implementation" className="space-y-4">
                {implementationSteps.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {implementationSteps.map((step, idx) => (
                      <AccordionItem key={idx} value={`step-${idx}`}>
                        <AccordionTrigger className="hover:text-primary text-sm">
                          {step.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                          
                          {step.code && (
                            <div className="relative">
                              <pre className="bg-zinc-950 text-zinc-50 p-3 rounded text-xs overflow-x-auto">
                                <code>{step.code}</code>
                              </pre>
                              <div className="absolute top-2 right-2 flex gap-1">
                                <span className="bg-zinc-800 text-zinc-200 px-2 py-1 rounded text-[10px]">
                                  {step.language || 'typescript'}
                                </span>
                                <button 
                                  className="bg-primary text-primary-foreground px-2 py-1 rounded text-[10px]"
                                  onClick={() => navigator.clipboard.writeText(step.code || '')}
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-6 border border-dashed rounded-lg">
                    <LineSegments size={32} className="mx-auto text-muted-foreground mb-2" />
                    <h4 className="text-base font-medium">Implementation Steps Not Available</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Detailed implementation steps for {selectedService.name} with the {patternName} pattern are not available yet.
                    </p>
                  </div>
                )}
                
                <div className="bg-muted/20 p-3 rounded text-sm">
                  <p className="font-medium mb-1">Implementation Note</p>
                  <p className="text-muted-foreground text-xs">
                    These implementation examples are starting points. You may need to adapt them to your specific 
                    requirements and Azure environment. Always refer to the latest Azure documentation.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default AzureServicesBestPractices;