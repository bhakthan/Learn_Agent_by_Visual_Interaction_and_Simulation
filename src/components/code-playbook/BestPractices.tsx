import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { InfoCircle, CaretDoubleRight, Warning, Code, SmileyWink, Cloud, Database, Lightning, ShieldCheck, Lightbulb, BookmarkSimple } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { azureAIServices, azureServicePatternMappings } from "@/lib/data/azureAiServices";
import { Button } from "@/components/ui/button";
import AzureIntegrationGuide from "./AzureIntegrationGuide";
import AzureServicesBestPractices from "./AzureServicesBestPractices";
import AzureServiceReference from "./AzureServiceReference";
import { Separator } from "@/components/ui/separator";

interface BestPracticesProps {
  patternId: string;
  patternName: string; // Added pattern name for display purposes
}

interface PracticeItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
}

const BestPractices: React.FC<BestPracticesProps> = ({ patternId, patternName }) => {
  const [practiceType, setPracticeType] = useState<'general' | 'azure'>('general');
  const [azureView, setAzureView] = useState<'overview' | 'detailed' | 'reference'>('overview');
  
  // Get best practices based on pattern ID
  const generalPractices = getGeneralBestPracticesForPattern(patternId);
  
  // Get Azure service mappings
  const serviceMappings = azureServicePatternMappings.filter(mapping => mapping.patternId === patternId);
  
  // Find the most important Azure services for this pattern (top 2)
  const keyServices = serviceMappings
    .map(mapping => azureAIServices.find(s => s.id === mapping.serviceId))
    .filter(service => service !== undefined)
    .slice(0, 2);
  
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 text-lg">
              <Lightbulb size={20} className="text-primary" />
              Implementation Best Practices
            </div>
            <Tabs defaultValue="general" value={practiceType} onValueChange={(v) => setPracticeType(v as 'general' | 'azure')} className="w-full sm:w-auto">
              <TabsList className="h-8 w-full grid grid-cols-2 sm:w-auto sm:flex">
                <TabsTrigger value="general" className="text-xs px-3 py-1 h-7">General</TabsTrigger>
                <TabsTrigger value="azure" className="text-xs px-3 py-1 h-7">Azure AI Services</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {practiceType === 'general' && (
            <div className="mt-0 space-y-6">
              {/* Add Azure services highlight in General tab if there are services */}
              {serviceMappings.length > 0 && (
                <div className="border rounded-lg p-4 bg-primary/5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Cloud size={20} className="text-primary" />
                    <h3 className="font-medium">Azure AI Services for {patternName}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    This pattern works best with the following Azure AI services:
                  </p>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {keyServices.map((service) => (
                      service && (
                        <div key={service.id} className="flex items-center gap-2 border rounded-md px-3 py-2 bg-card">
                          {getServiceIcon(service.id)}
                          <span className="font-medium text-sm">{service.name}</span>
                        </div>
                      )
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-primary"
                      onClick={() => {
                        setPracticeType('azure');
                        setAzureView('overview');
                      }}
                    >
                      View Azure Integration Details →
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mb-2">
                <h3 className="text-md font-medium mb-1">General Best Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Implementation guidelines for the {patternName} pattern regardless of cloud platform.
                </p>
              </div>
              
              {generalPractices.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {generalPractices.map((practice, index) => (
                    <AccordionItem key={index} value={`practice-${index}`}>
                      <AccordionTrigger className="hover:text-primary">
                        <div className="flex items-center gap-2">
                          {practice.icon}
                          <span>{practice.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <p className="text-foreground/80">{practice.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {practice.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="bg-muted/50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center p-6 border border-dashed rounded-lg">
                  <InfoCircle size={32} className="mx-auto text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No Best Practices</h3>
                  <p className="text-muted-foreground mt-2">
                    General best practices are not defined for this pattern.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {practiceType === 'azure' && (
            <div className="mt-0 space-y-4">
              <div className="mb-2">
                <h3 className="text-md font-medium flex items-center gap-2">
                  <Cloud size={18} className="text-primary" />
                  Azure AI Services Integration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Learn how to implement the {patternName} pattern with Azure AI services.
                </p>
              </div>
              
              <Tabs value={azureView} onValueChange={(v) => setAzureView(v as 'overview' | 'detailed' | 'reference')} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="overview">Service Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Implementation Guide</TabsTrigger>
                  <TabsTrigger value="reference">Service Reference</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="mt-4">
                {azureView === 'overview' && <AzureIntegrationGuide patternId={patternId} patternName={patternName} />}
                {azureView === 'detailed' && <AzureServicesBestPractices patternId={patternId} patternName={patternName} />}
                {azureView === 'reference' && <AzureServiceReference patternId={patternId} patternName={patternName} />}
              </div>
              
              {/* Add resources section */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <BookmarkSimple size={18} className="text-primary" />
                  <h3 className="font-medium">Additional Resources</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a 
                    href="https://learn.microsoft.com/azure/ai-services/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border rounded-md p-3 hover:border-primary/50 hover:bg-muted/20 transition-colors"
                  >
                    <h4 className="font-medium text-sm">Azure AI Documentation</h4>
                    <p className="text-xs text-muted-foreground">Official Microsoft Azure AI Services documentation</p>
                  </a>
                  <a 
                    href="https://learn.microsoft.com/azure/ai-studio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border rounded-md p-3 hover:border-primary/50 hover:bg-muted/20 transition-colors"
                  >
                    <h4 className="font-medium text-sm">Azure AI Studio</h4>
                    <p className="text-xs text-muted-foreground">Visual development environment for AI applications</p>
                  </a>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get general practices based on pattern ID
function getGeneralBestPracticesForPattern(patternId: string): PracticeItem[] {
  // Generic practices (applied to all patterns)
  const genericPractices: PracticeItem[] = [
    {
      title: "Error Handling and Retries",
      description: 
        "LLM calls can occasionally fail or timeout. Implement robust error handling with exponential backoff retries. " +
        "Set appropriate timeouts and handle different types of failures gracefully. For multi-step patterns, " +
        "consider implementing checkpoints so you can resume from the last successful step.",
      icon: <Warning size={18} className="text-destructive" />,
      tags: ["reliability", "production-ready", "error-handling"]
    },
    {
      title: "Prompt Engineering for Pattern Success",
      description: 
        "The effectiveness of any agent pattern depends heavily on well-crafted prompts. Make your instructions explicit " +
        "and provide clear output formats (like JSON). Include examples when possible, and consider providing " +
        "context about the pattern's purpose to the LLM. Test prompts extensively with various inputs.",
      icon: <SmileyWink size={18} className="text-accent" />,
      tags: ["prompt-engineering", "effectiveness", "reliability"]
    },
    {
      title: "Context Management",
      description: 
        "Most patterns involve maintaining state and context across steps. Design your context management carefully, " +
        "considering context window limitations. Use structured formats for passing information between steps, " +
        "and implement summarization techniques for long-running processes.",
      icon: <CaretDoubleRight size={18} className="text-secondary" />,
      tags: ["state-management", "scaling", "optimization"]
    },
    {
      title: "Testing and Evaluation",
      description: 
        "Implement comprehensive testing for each component of your pattern. Create automated tests that validate " +
        "pattern behavior across various inputs and edge cases. Set up monitoring to track performance, reliability, " +
        "and quality metrics in production.",
      icon: <Code size={18} className="text-primary" />,
      tags: ["quality", "monitoring", "reliability"]
    }
  ];

  // Pattern-specific practices
  const specificPractices: Record<string, PracticeItem[]> = {
    "prompt-chaining": [
      {
        title: "Chain Validation Gates",
        description: 
          "Implement validation at each step of your prompt chain to catch errors early. Design each step to produce " +
          "outputs that can be validated programmatically before being passed to the next step. This prevents error " +
          "cascading and saves computation costs on ultimately failed chains.",
        icon: <CaretDoubleRight size={18} className="text-secondary" />,
        tags: ["validation", "quality-control", "efficiency"]
      },
      {
        title: "Variable Step Complexity",
        description: 
          "Design your chain with steps of appropriate complexity. Initial steps often benefit from simpler, more " +
          "focused prompts, while later steps might handle more complex integration of previous results. Adjust " +
          "model parameters (like temperature) at different steps based on whether you need creative generation " +
          "or precise formatting.",
        icon: <InfoCircle size={18} className="text-primary" />,
        tags: ["design", "optimization", "performance"]
      }
    ],
    "parallelization": [
      {
        title: "Aggregation Strategy Design",
        description: 
          "The aggregation method is critical in parallelization patterns. Consider whether a simple combination, " +
          "a weighted approach, or another LLM call to synthesize results is most appropriate. Design clear criteria " +
          "for resolving conflicts between parallel results.",
        icon: <InfoCircle size={18} className="text-primary" />,
        tags: ["design", "integration", "decision-making"]
      },
      {
        title: "Parallel Call Management",
        description: 
          "Efficiently manage parallel API calls with proper concurrency control. Implement timeout handling for " +
          "cases where some parallel paths take longer than others. Consider fallback mechanisms for scenarios " +
          "where some parallel paths fail but others succeed.",
        icon: <Code size={18} className="text-primary" />,
        tags: ["performance", "reliability", "scalability"]
      }
    ],
    "orchestrator-worker": [
      {
        title: "Clear Interface Contracts",
        description: 
          "Define strict interfaces between orchestrator and worker components. Establish clear formats for task " +
          "assignment, result reporting, and error notifications. This modularity allows easier updates and " +
          "replacements of individual components.",
        icon: <Code size={18} className="text-primary" />,
        tags: ["modularity", "maintainability", "integration"]
      },
      {
        title: "Task Granularity Optimization",
        description: 
          "Finding the right granularity for task decomposition is crucial. Tasks should be small enough to be " +
          "manageable by specialized workers but large enough to minimize coordination overhead. Consider batching " +
          "related small tasks when appropriate.",
        icon: <CaretDoubleRight size={18} className="text-secondary" />,
        tags: ["optimization", "efficiency", "design"]
      }
    ],
    "evaluator-optimizer": [
      {
        title: "Objective Evaluation Criteria",
        description: 
          "Design clear, measurable evaluation criteria for the evaluator component. Use structured formats for " +
          "evaluation results to make them actionable by the optimizer. Consider implementing multiple evaluation " +
          "dimensions to capture different aspects of quality.",
        icon: <InfoCircle size={18} className="text-primary" />,
        tags: ["quality", "metrics", "evaluation"]
      },
      {
        title: "Diminishing Returns Detection",
        description: 
          "Implement mechanisms to detect when iterations are producing diminishing returns. Track improvement metrics " +
          "across iterations and establish thresholds for early stopping. This prevents unnecessary computation and " +
          "reduces costs for minimal quality gains.",
        icon: <Warning size={18} className="text-destructive" />,
        tags: ["efficiency", "optimization", "cost-control"]
      }
    ],
    "routing": [
      {
        title: "Classification Confidence",
        description: 
          "Design your router to provide confidence scores with classifications. Implement thresholds for when to route " +
          "directly versus when to request clarification. Consider multi-label classification for inputs that might " +
          "require handling by multiple specialists.",
        icon: <InfoCircle size={18} className="text-primary" />,
        tags: ["accuracy", "decision-making", "quality"]
      },
      {
        title: "Fallback Handlers",
        description: 
          "Always implement fallback paths for inputs that don't clearly match any category. Create a general-purpose " +
          "handler for edge cases, and consider logging these instances for improving your routing over time. This " +
          "ensures users always receive some appropriate response.",
        icon: <Warning size={18} className="text-destructive" />,
        tags: ["reliability", "edge-cases", "user-experience"]
      }
    ],
    "autonomous-workflow": [
      {
        title: "Clear Goal Specification",
        description: 
          "Precisely define the agent's objectives and constraints. Include specific success criteria and boundaries " +
          "for the agent's actions. This guidance is crucial for autonomous systems to ensure they remain aligned " +
          "with user intent throughout their execution.",
        icon: <CaretDoubleRight size={18} className="text-secondary" />,
        tags: ["alignment", "goal-setting", "constraints"]
      },
      {
        title: "Safeguards and Circuit Breakers",
        description: 
          "Implement multiple layers of safeguards for autonomous systems. Include circuit breakers that can halt " +
          "execution based on specific triggers (excessive resource use, potential harmful actions, etc.). Consider " +
          "implementing human-in-the-loop checkpoints for critical decisions.",
        icon: <Warning size={18} className="text-destructive" />,
        tags: ["safety", "control", "monitoring"]
      }
    ],
    "reflexion": [
      {
        title: "Directed Self-Assessment",
        description: 
          "Guide the self-reflection process with specific aspects to evaluate. Rather than asking for general " +
          "criticism, direct the reflection toward particular dimensions like accuracy, completeness, or reasoning " +
          "quality. This produces more actionable feedback for improvement.",
        icon: <InfoCircle size={18} className="text-primary" />,
        tags: ["quality", "evaluation", "improvement"]
      },
      {
        title: "Explicit Reasoning Traces",
        description: 
          "Encourage the agent to maintain explicit traces of its reasoning during both generation and reflection. " +
          "This increases transparency and makes the improvement process more effective by identifying specific " +
          "points where reasoning went astray.",
        icon: <Code size={18} className="text-primary" />,
        tags: ["transparency", "reasoning", "debugging"]
      }
    ],
    "plan-and-execute": [
      {
        title: "Dynamic Plan Adaptation",
        description: 
          "Design your system to recognize when plans need revision based on execution results. Implement both " +
          "minor plan adjustments and more significant replanning capabilities. Balance the overhead of replanning " +
          "against the benefits of adapting to new information.",
        icon: <CaretDoubleRight size={18} className="text-secondary" />,
        tags: ["adaptability", "robustness", "planning"]
      },
      {
        title: "Plan Validation Before Execution",
        description: 
          "Implement a validation step between planning and execution. Check for common issues like missing dependencies, " +
          "logical inconsistencies, or steps beyond the system's capabilities. This can prevent wasted resources on " +
          "executing flawed plans.",
        icon: <Warning size={18} className="text-destructive" />,
        tags: ["validation", "efficiency", "quality-control"]
      }
    ],
    "react-agent": [
      {
        title: "Tool Selection Strategy",
        description: 
          "Design clear criteria for how the ReAct agent selects appropriate tools. Provide explicit examples of " +
          "reasoning that leads to correct tool selection in your prompts. Consider implementing validation steps " +
          "before tool execution to prevent misuse.",
        icon: <InfoCircle size={18} className="text-primary" />,
        tags: ["tools", "reasoning", "decision-making"]
      },
      {
        title: "Observation Processing",
        description: 
          "Structure how your ReAct agent processes and incorporates tool outputs. Format observations for easy " +
          "parsing, and provide guidance on how to interpret different types of observations. Include strategies " +
          "for handling unexpected observation formats.",
        icon: <CaretDoubleRight size={18} className="text-secondary" />,
        tags: ["observation", "tools", "reasoning"]
      }
    ],
    "codeact-agent": [
      {
        title: "Code Execution Environment",
        description: 
          "Create a secure, isolated environment for executing generated code. Implement resource limits, timeouts, " +
          "and access controls. Consider using container-based isolation for stronger security guarantees.",
        icon: <Warning size={18} className="text-destructive" />,
        tags: ["security", "execution", "isolation"]
      },
      {
        title: "Code Quality Standards",
        description: 
          "Define explicit quality standards for generated code. Consider implementing automated linting and style " +
          "checking before execution. Structure your prompts to encourage well-documented, maintainable code generation.",
        icon: <Code size={18} className="text-primary" />,
        tags: ["quality", "standards", "maintainability"]
      }
    ],
    "self-reflection": [
      {
        title: "Structured Self-Assessment Template",
        description: 
          "Provide a structured template for the agent's self-assessment process. Include explicit dimensions to " +
          "evaluate such as accuracy, coherence, and completeness. This structured approach makes reflection more " +
          "effective and actionable.",
        icon: <InfoCircle size={18} className="text-primary" />,
        tags: ["structure", "assessment", "quality"]
      },
      {
        title: "Iterative Refinement Process",
        description: 
          "Establish clear mechanisms for incorporating self-reflection insights into subsequent responses. Define how " +
          "many reflection iterations to perform and design stopping criteria based on quality improvement metrics.",
        icon: <CaretDoubleRight size={18} className="text-secondary" />,
        tags: ["iteration", "improvement", "refinement"]
      }
    ],
    "agentic-rag": [
      {
        title: "Query Optimization",
        description: 
          "Develop techniques for query rewriting and decomposition to improve retrieval quality. Consider implementing " +
          "multiple retrieval strategies in parallel and aggregating results. Capture and utilize user feedback to improve " +
          "retrieval strategies over time.",
        icon: <CaretDoubleRight size={18} className="text-secondary" />,
        tags: ["retrieval", "optimization", "query-processing"]
      },
      {
        title: "Knowledge Synthesis",
        description: 
          "Implement effective techniques for synthesizing information from multiple retrieved documents. Design prompts " +
          "that encourage proper attribution and citation. Include mechanisms to identify and resolve contradictions " +
          "between sources.",
        icon: <InfoCircle size={18} className="text-primary" />,
        tags: ["synthesis", "knowledge", "integration"]
      }
    ],
    "model-context-protocol": [
      {
        title: "Context Schema Design",
        description: 
          "Create well-structured context schemas that balance completeness with token efficiency. Consider hierarchical " +
          "context structures with different levels of detail. Define clear protocols for context updating and maintenance.",
        icon: <Code size={18} className="text-primary" />,
        tags: ["schema", "structure", "efficiency"]
      },
      {
        title: "Context Routing",
        description: 
          "Implement intelligent context routing based on query classification. Design filters for context relevance " +
          "and prioritization. Consider implementing context caching strategies for frequently accessed information.",
        icon: <CaretDoubleRight size={18} className="text-secondary" />,
        tags: ["routing", "relevance", "optimization"]
      }
    ],
    "agent-to-agent": [
      {
        title: "Communication Protocol Design",
        description: 
          "Define clear, structured communication protocols between agents. Specify message formats, required fields, " +
          "and validation rules. Consider implementing schema validation for all inter-agent messages.",
        icon: <Code size={18} className="text-primary" />,
        tags: ["protocol", "communication", "standards"]
      },
      {
        title: "Coordination Mechanisms",
        description: 
          "Design effective coordination strategies for multi-agent systems. Implement clear role definitions and " +
          "responsibility boundaries. Consider both hierarchical and peer-to-peer coordination models based on your " +
          "specific use case.",
        icon: <InfoCircle size={18} className="text-primary" />,
        tags: ["coordination", "roles", "organization"]
      }
    ]
  };

  // Combine generic practices with pattern-specific ones
  return [...(specificPractices[patternId] || []), ...genericPractices];
}

// Helper function to get service icon based on service ID
function getServiceIcon(serviceId: string) {
  switch (serviceId) {
    case 'azure-openai':
      return <Cloud size={18} className="text-primary" />;
    case 'azure-ai-search':
      return <Database size={18} className="text-secondary" />;
    case 'azure-content-safety':
      return <ShieldCheck size={18} className="text-destructive" />;
    case 'azure-ai-inference':
      return <Lightning size={18} className="text-accent" />;
    case 'azure-ai-foundry':
      return <Cloud size={18} className="text-primary" />;
    case 'azure-ai-evaluation':
      return <InfoCircle size={18} className="text-secondary" />;
    default:
      return <Cloud size={18} className="text-primary" />;
  }
}

export default BestPractices;