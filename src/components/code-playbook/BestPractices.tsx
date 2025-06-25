import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { InfoCircle, CaretDoubleRight, Warning, Code, SmileyWink } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

interface BestPracticesProps {
  patternId: string;
}

interface PracticeItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
}

const BestPractices: React.FC<BestPracticesProps> = ({ patternId }) => {
  // Get best practices based on pattern ID
  const practices = getBestPracticesForPattern(patternId);
  
  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <InfoCircle size={20} className="text-primary" />
          Implementation Best Practices
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Accordion type="multiple" className="w-full">
          {practices.map((practice, index) => (
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
      </CardContent>
    </Card>
  );
};

// Helper function to get practices based on pattern ID
function getBestPracticesForPattern(patternId: string): PracticeItem[] {
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
    ]
  };

  // Combine generic practices with pattern-specific ones
  return [...(specificPractices[patternId] || []), ...genericPractices];
}

export default BestPractices;