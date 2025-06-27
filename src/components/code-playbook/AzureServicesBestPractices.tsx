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
    serviceId: 'azure-ai-evaluation',
    patternId: 'evaluator-optimizer',
    steps: [
      {
        title: '1. Set Up Evaluation Pipeline',
        description: 'Create a comprehensive evaluation pipeline for agent outputs',
        code: `import { EvaluationClient, EvaluationPipeline } from "@azure/ai-evaluation";

// Configure the evaluation client
const evaluationClient = new EvaluationClient({
  endpoint: "https://your-evaluation-endpoint.azure.com",
  credential: new AzureKeyCredential(process.env.EVALUATION_API_KEY || "")
});

// Create an evaluation pipeline for the evaluator-optimizer pattern
async function createEvaluationPipeline() {
  const pipeline = new EvaluationPipeline({
    name: "agent-output-evaluation",
    stages: [
      {
        name: "factuality",
        evaluator: {
          type: "llm-based",
          model: "gpt-4",
          prompt_template: "Evaluate if the following text is factually accurate based on known information."
        }
      },
      {
        name: "relevance",
        evaluator: {
          type: "llm-based",
          model: "gpt-4",
          prompt_template: "On a scale of 1-10, rate how relevant this response is to the query."
        }
      },
      {
        name: "safety",
        evaluator: {
          type: "content-safety",
          categories: ["hate", "violence", "selfHarm", "sexual"]
        }
      },
      {
        name: "quality",
        evaluator: {
          type: "custom",
          evaluate: async (input) => {
            // Custom evaluation logic here
            return { score: 0.85, reason: "Good quality response with minor improvements needed" };
          }
        }
      }
    ]
  });
  
  return pipeline;
}`,
        language: 'typescript'
      },
      {
        title: '2. Implement Optimizer with Feedback Loop',
        description: 'Create an optimizer that improves content based on evaluation feedback',
        code: `// Optimize content based on evaluation feedback
async function optimizeContent(content: string, query: string, evaluationResults: any) {
  // Create system message that incorporates evaluation feedback
  const systemMessage = \`You are a content optimizer. Your task is to improve content based on evaluation feedback.
The content needs improvement in these areas:
\${evaluationResults.factuality.score < 0.7 ? '- Factual accuracy: ' + evaluationResults.factuality.feedback : ''}
\${evaluationResults.relevance.score < 0.7 ? '- Relevance to query: ' + evaluationResults.relevance.feedback : ''}
\${evaluationResults.quality.score < 0.7 ? '- Overall quality: ' + evaluationResults.quality.feedback : ''}

Original query: \${query}
\`;

  // Request improved content
  const result = await client.getChatCompletions(
    "gpt-4",
    [
      { role: "system", content: systemMessage },
      { role: "user", content: content }
    ],
    { temperature: 0.7 }
  );
  
  return result.choices[0].message?.content || content;
}`,
        language: 'typescript'
      },
      {
        title: '3. Create Evaluation-Optimization Loop',
        description: 'Implement the full evaluator-optimizer cycle',
        code: `// Full implementation of evaluator-optimizer pattern
async function evaluateAndOptimize(initialContent: string, query: string, maxIterations = 3) {
  const pipeline = await createEvaluationPipeline();
  let currentContent = initialContent;
  let iterations = 0;
  let evaluationResults;
  let improvementHistory = [];
  
  while (iterations < maxIterations) {
    iterations++;
    
    // Evaluate current content
    evaluationResults = await pipeline.evaluate({
      content: currentContent,
      query: query,
      context: { iteration: iterations }
    });
    
    // Record results in history
    improvementHistory.push({
      iteration: iterations,
      content: currentContent,
      scores: {
        factuality: evaluationResults.factuality.score,
        relevance: evaluationResults.relevance.score,
        safety: evaluationResults.safety.score,
        quality: evaluationResults.quality.score
      }
    });
    
    // Check if quality thresholds have been met
    const overallScore = (
      evaluationResults.factuality.score +
      evaluationResults.relevance.score +
      evaluationResults.quality.score
    ) / 3;
    
    // If quality is sufficient, break the loop
    if (overallScore > 0.85) {
      console.log(`Quality threshold met after ${iterations} iterations`);
      break;
    }
    
    // Optimize the content based on evaluation feedback
    currentContent = await optimizeContent(currentContent, query, evaluationResults);
  }
  
  return {
    finalContent: currentContent,
    iterations: iterations,
    evaluationResults: evaluationResults,
    improvementHistory: improvementHistory
  };
}`,
        language: 'typescript'
      }
    ]
  },
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
    serviceId: 'azure-ai-evaluation',
    patternId: 'reflexion',
    steps: [
      {
        title: '1. Configure Evaluation Framework',
        description: 'Set up a self-reflection evaluation framework',
        language: 'python',
        code: `from azure.ai.evaluation.reflexion import ReflexionEvaluator
from azure.ai.evaluation import EvaluationSuite

# Create evaluator for the Reflexion pattern
def setup_reflexion_evaluator():
    # Define reflection evaluation criteria
    reflection_criteria = [
        {
            "name": "error_identification",
            "description": "How well the agent identifies errors in its reasoning"
        },
        {
            "name": "learning_from_feedback",
            "description": "How effectively the agent incorporates feedback"
        },
        {
            "name": "improvement_over_iterations",
            "description": "Whether successive iterations show measurable improvement"
        }
    ]
    
    # Create reflexion-specific evaluator
    reflexion_evaluator = ReflexionEvaluator(
        criteria=reflection_criteria,
        reference_model="gpt-4-turbo",
        num_iterations_to_analyze=3
    )
    
    # Create evaluation suite with multiple evaluators
    evaluation_suite = EvaluationSuite(
        name="reflexion-evaluation-suite",
        evaluators=[
            reflexion_evaluator,
            # Can include additional evaluators here
        ]
    )
    
    return evaluation_suite`
      },
      {
        title: '2. Implement Comparative Analysis',
        description: 'Compare performance with and without reflective capabilities',
        language: 'python',
        code: `from azure.ai.evaluation import ComparativeAnalysis

# Compare agent performance with and without reflection capabilities
def compare_reflection_impact(baseline_agent, reflexion_agent, test_cases):
    # Configure comparative analysis
    comparison = ComparativeAnalysis(
        name="reflection-impact-analysis",
        metrics=[
            "accuracy",
            "reasoning_quality", 
            "error_recovery"
        ]
    )
    
    # Run both agents on the same test cases
    results = comparison.evaluate(
        systems={
            "baseline": baseline_agent,
            "with_reflection": reflexion_agent
        },
        test_cases=test_cases
    )
    
    # Generate detailed report
    report = comparison.generate_report(
        results=results,
        include_visualizations=True
    )
    
    # Extract key insights
    improvements = results.get_improvement_statistics(
        baseline="baseline", 
        candidate="with_reflection"
    )
    
    return {
        "results": results,
        "report": report,
        "improvements": improvements
    }`
      },
      {
        title: '3. Track Learning Curves',
        description: 'Measure agent improvement over multiple reflection cycles',
        language: 'typescript',
        code: `import { LearningCurveAnalyzer } from "@azure/ai-evaluation";

// Track agent improvement over multiple reflection cycles
async function analyzeLearningCurve(reflectionSessions, metrics = ["accuracy", "reasoning_depth"]) {
  const analyzer = new LearningCurveAnalyzer({
    metrics: metrics,
    significanceThreshold: 0.05
  });
  
  // Add reflection sessions to analysis
  for (const session of reflectionSessions) {
    analyzer.addDataPoint({
      iteration: session.iteration,
      metrics: {
        accuracy: session.evaluationResults.accuracy,
        reasoning_depth: session.evaluationResults.reasoning_depth
      },
      metadata: {
        task: session.task,
        duration: session.duration
      }
    });
  }
  
  // Generate learning curve analysis
  const analysis = await analyzer.analyze();
  
  return {
    // Learning rate: how quickly the agent is improving
    learningRate: analysis.learningRate,
    
    // Plateaus: iterations where improvement slowed
    plateaus: analysis.plateaus,
    
    // Projected performance: prediction of future performance
    projectedPerformance: analysis.projectedPerformance,
    
    // Statistical significance of improvements
    significantImprovements: analysis.significantChanges.filter(c => c.direction === "positive")
  };
}`
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
    serviceId: 'azure-ai-evaluation',
    patternId: 'agentic-rag',
    steps: [
      {
        title: '1. RAG Quality Evaluation',
        description: 'Evaluate the quality of the retrieval and generation components',
        language: 'python',
        code: `from azure.ai.evaluation.rag import RAGEvaluator

# Set up RAG evaluation for agentic RAG patterns
def evaluate_agentic_rag_system(rag_system, test_queries, ground_truth):
    # Initialize evaluator
    rag_evaluator = RAGEvaluator(
        metrics=[
            "retrieval_precision",
            "retrieval_recall",
            "answer_relevance",
            "answer_faithfulness",
            "answer_completeness"
        ]
    )
    
    # Run evaluation
    results = rag_evaluator.evaluate(
        system=rag_system,
        queries=test_queries,
        ground_truth=ground_truth,
        include_retrieval_analysis=True
    )
    
    # Generate insights report
    insights = rag_evaluator.generate_insights(results)
    
    return {
        "overall_scores": results.get_aggregate_scores(),
        "per_query_scores": results.get_per_query_scores(),
        "retrieval_analysis": results.get_retrieval_analysis(),
        "improvement_suggestions": insights.get_improvement_suggestions(),
        "failure_modes": insights.get_failure_modes()
    }`
      },
      {
        title: '2. Hallucination Detection',
        description: 'Identify and measure hallucinations in RAG responses',
        language: 'typescript',
        code: `import { HallucinationDetector } from "@azure/ai-evaluation";

// Detect hallucinations in RAG system outputs
async function detectHallucinations(responses, retrievedDocuments) {
  const detector = new HallucinationDetector({
    reference_model: "gpt-4",
    strict_mode: true
  });
  
  const results = await detector.analyze({
    responses: responses,
    context: retrievedDocuments,
    detection_types: [
      "contradiction",  // Claims that contradict provided context
      "fabrication",    // Made-up information not in context
      "extrapolation"   // Excessive inference beyond what context supports
    ]
  });
  
  // Get hallucination statistics
  const stats = {
    hallucination_rate: results.hallucination_rate,
    by_type: results.hallucinations_by_type,
    severity: results.severity_distribution
  };
  
  // Get problematic responses
  const problematic = results.responses
    .filter(r => r.has_hallucination)
    .map(r => ({
      response_id: r.id,
      hallucination_spans: r.hallucination_spans,
      severity: r.severity
    }));
  
  return {
    statistics: stats,
    problematic_responses: problematic,
    suggested_improvements: results.improvement_suggestions
  };
}`
      },
      {
        title: '3. Query-Document Relevance Assessment',
        description: 'Evaluate the relevance of retrieved documents to the query',
        language: 'typescript',
        code: `import { RelevanceEvaluator } from "@azure/ai-evaluation";

// Evaluate relevance between queries and retrieved documents
async function evaluateQueryDocumentRelevance(queries, retrievedDocuments) {
  const evaluator = new RelevanceEvaluator({
    model: "text-embedding-ada-002",
    metrics: ["cosine_similarity", "semantic_relevance"]
  });
  
  // Run relevance evaluation across all query-document pairs
  const results = await evaluator.evaluateRelevance(queries, retrievedDocuments);
  
  // Analyze distribution of relevance scores
  const relevanceAnalysis = await evaluator.analyzeRelevanceDistribution(results);
  
  // Generate ideal document examples for low-scoring queries
  const improvementExamples = await evaluator.generateIdealDocuments(
    queries.filter(q => results.getQueryAverage(q.id) < 0.7)
  );
  
  return {
    overall_relevance: results.getAverageScore(),
    query_document_scores: results.getDetailedScores(),
    score_distribution: relevanceAnalysis.distribution,
    weak_queries: relevanceAnalysis.low_performing_queries,
    improvement_examples: improvementExamples
  };
}`
      }
    ]
  },
  {
    serviceId: 'azure-ai-search',
    patternId: 'agentic-rag',
    steps: [
      {
        title: '1. Configure Azure AI Search',
        description: 'Set up vector search in Azure AI Search',
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
    documentation: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/'
  },
  {
    id: 'azure-ai-search',
    name: 'Azure AI Search',
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
    documentation: 'https://learn.microsoft.com/en-us/azure/search/'
  },
  {
    id: 'azure-content-safety',
    name: 'Azure Content Safety',
    icon: <ShieldCheck size={18} className="text-destructive" />,
    category: 'safety',
    description: 'AI service for detecting harmful content across text and images to maintain safety and compliance.',
    tips: [
      'Implement pre-moderation for AI-generated content before display',
      'Set appropriate threshold levels based on your application audience',
      'Create feedback loops to improve detection over time',
      'Implement blocklists for domain-specific problematic content',
      'Deploy content safety in multiple stages of the agent workflow'
    ],
    documentation: 'https://learn.microsoft.com/en-us/azure/ai-services/content-safety/'
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
      'Include diverse evaluation criteria beyond accuracy (safety, fairness, etc.)',
      'Use comparative evaluations to measure improvements between model versions'
    ],
    documentation: 'https://learn.microsoft.com/en-us/python/api/overview/azure/ai-evaluation-readme?view=azure-python'
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
    documentation: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-inference'
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
    documentation: 'https://learn.microsoft.com/en-us/azure/ai-studio/'
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
    documentation: 'https://learn.microsoft.com/en-us/azure/ai-services/'
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