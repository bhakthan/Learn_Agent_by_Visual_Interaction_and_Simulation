import React, { useState } from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Lightbulb, Info, Sparkle, Brain, Code, BookOpen, ChartBar, Users } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageSynopsis {
  title: string;
  description: string;
  learningCategories: {
    name: string;
    description: string;
    icon: React.ReactNode;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }[];
  keyFeatures: string[];
  estimatedTime: string;
  completionRate?: number;
}

interface EnhancedTutorialButtonProps extends ButtonProps {
  hasCompleted?: boolean;
  tooltip?: string;
  pageSynopsis?: PageSynopsis;
  showDetailedView?: boolean;
}

const pagesSynopsis: Record<string, PageSynopsis> = {
  'core-concepts': {
    title: "Core Concepts Explorer",
    description: "Master the fundamentals of AI agents and communication protocols through interactive visualizations",
    learningCategories: [
      {
        name: "Agent Lifecycle",
        description: "Complete cognitive cycle from input to learning",
        icon: <Brain size={16} />,
        difficulty: 'beginner'
      },
      {
        name: "A2A Communication",
        description: "Direct, broadcast, and hierarchical patterns. A protocol for agent interaction. Agent cards and communication strategies.",
        icon: <Users size={16} />,
        difficulty: 'intermediate'
      },
      {
        name: "MCP Protocol",
        description: "Standardized agent communication framework",
        icon: <Code size={16} />,
        difficulty: 'intermediate'
      },
      {
        name: "ACP Standards",
        description: "Open protocol for agent interoperability",
        icon: <Sparkle size={16} />,
        difficulty: 'advanced'
      }
    ],
    keyFeatures: [
      "Interactive SVG visualizations",
      "Adaptive micro-learning overlays",
      "Real-time animation controls",
      "Progressive difficulty levels"
    ],
    estimatedTime: "25-30 minutes",
    completionRate: 78
  },
  'agent-patterns': {
    title: "Agent Patterns Workshop",
    description: "Explore implementation patterns with code examples and interactive demonstrations",
    learningCategories: [
      {
        name: "ReAct Pattern",
        description: "Reasoning and acting cycle implementation",
        icon: <Brain size={16} />,
        difficulty: 'intermediate'
      },
      {
        name: "Self-Reflection",
        description: "Agents that evaluate their own performance",
        icon: <Sparkle size={16} />,
        difficulty: 'advanced'
      },
      {
        name: "Agentic RAG",
        description: "Retrieval-augmented generation with autonomy",
        icon: <BookOpen size={16} />,
        difficulty: 'advanced'
      },
      {
        name: "Tool Orchestration",
        description: "Dynamic tool selection and coordination",
        icon: <Code size={16} />,
        difficulty: 'intermediate'
      }
    ],
    keyFeatures: [
      "Python & TypeScript code examples",
      "Interactive code execution",
      "Pattern comparison tools",
      "Best practice recommendations"
    ],
    estimatedTime: "35-40 minutes",
    completionRate: 65
  },
  'azure-services': {
    title: "Azure AI Services Integration",
    description: "Comprehensive guide to Azure AI services for agent development",
    learningCategories: [
      {
        name: "OpenAI Integration",
        description: "Azure OpenAI service capabilities",
        icon: <Brain size={16} />,
        difficulty: 'intermediate'
      },
      {
        name: "AI Search",
        description: "Intelligent search and retrieval services",
        icon: <BookOpen size={16} />,
        difficulty: 'intermediate'
      },
      {
        name: "Content Safety",
        description: "Safety and security implementations",
        icon: <Sparkle size={16} />,
        difficulty: 'beginner'
      },
      {
        name: "Document Intelligence",
        description: "Advanced document processing capabilities",
        icon: <Code size={16} />,
        difficulty: 'advanced'
      }
    ],
    keyFeatures: [
      "Service comparison matrices",
      "Integration code examples",
      "Cost optimization strategies",
      "Performance benchmarks"
    ],
    estimatedTime: "20-25 minutes",
    completionRate: 82
  },
  'references': {
    title: "Reference Library",
    description: "Curated collection of documentation, articles, and resources",
    learningCategories: [
      {
        name: "Official Documentation",
        description: "Microsoft and OpenAI official resources",
        icon: <BookOpen size={16} />,
        difficulty: 'beginner'
      },
      {
        name: "Research Articles",
        description: "Latest research and academic papers",
        icon: <ChartBar size={16} />,
        difficulty: 'advanced'
      },
      {
        name: "Implementation Guides",
        description: "Step-by-step tutorials and walkthroughs",
        icon: <Code size={16} />,
        difficulty: 'intermediate'
      },
      {
        name: "Community Resources",
        description: "Community-contributed content and examples",
        icon: <Users size={16} />,
        difficulty: 'intermediate'
      }
    ],
    keyFeatures: [
      "Searchable reference database",
      "Categorized by topic and difficulty",
      "Direct links to external resources",
      "Community-curated content"
    ],
    estimatedTime: "15-20 minutes",
    completionRate: 91
  },
  'community': {
    title: "Community Hub",
    description: "Share knowledge, contribute patterns, and learn from the community",
    learningCategories: [
      {
        name: "Pattern Sharing",
        description: "Contribute your own agent implementations",
        icon: <Code size={16} />,
        difficulty: 'intermediate'
      },
      {
        name: "Best Practices",
        description: "Learn from community experiences",
        icon: <Sparkle size={16} />,
        difficulty: 'beginner'
      },
      {
        name: "Collaborative Learning",
        description: "Engage with other developers and researchers",
        icon: <Users size={16} />,
        difficulty: 'beginner'
      },
      {
        name: "Knowledge Exchange",
        description: "Share insights and learn from others",
        icon: <Brain size={16} />,
        difficulty: 'intermediate'
      }
    ],
    keyFeatures: [
      "Pattern contribution form",
      "Community-driven content",
      "Knowledge sharing platform",
      "Collaborative learning environment"
    ],
    estimatedTime: "10-15 minutes",
    completionRate: 73
  }
};

const DetailedTooltipContent: React.FC<{ synopsis: PageSynopsis }> = ({ synopsis }) => {
  return (
    <Card className="w-80 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{synopsis.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{synopsis.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Learning Categories</h4>
          <div className="grid grid-cols-2 gap-2">
            {synopsis.learningCategories.map((category, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                <div className="flex-shrink-0 mt-0.5">
                  {category.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-medium">{category.name}</span>
                    <Badge 
                      variant={category.difficulty === 'beginner' ? 'secondary' : 
                               category.difficulty === 'intermediate' ? 'default' : 'destructive'}
                      className="text-xs px-1 py-0"
                    >
                      {category.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Key Features</h4>
          <ul className="text-xs space-y-1">
            {synopsis.keyFeatures.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Est. time: {synopsis.estimatedTime}
            </span>
          </div>
          {synopsis.completionRate && (
            <div className="flex items-center gap-1">
              <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${synopsis.completionRate}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {synopsis.completionRate}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const EnhancedTutorialButton: React.FC<EnhancedTutorialButtonProps> = ({
  onClick,
  hasCompleted,
  tooltip = "Start Tutorial",
  pageSynopsis,
  showDetailedView = false,
  className,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 relative transition-all duration-200",
            hasCompleted ? "border-muted" : "border-primary",
            isHovered && "scale-105 shadow-md",
            className
          )}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          <Lightbulb 
            size={16} 
            weight={hasCompleted ? "regular" : "fill"} 
            className={cn(
              "transition-all duration-200",
              hasCompleted ? "text-muted-foreground" : "text-primary",
              isHovered && "animate-pulse"
            )}
          />
          {!hasCompleted && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        className="max-w-none p-0"
        sideOffset={8}
      >
        {showDetailedView && pageSynopsis ? (
          <DetailedTooltipContent synopsis={pageSynopsis} />
        ) : (
          <div className="px-3 py-2">
            <p className="text-sm">
              {hasCompleted ? "Restart Tutorial" : tooltip}
            </p>
            {pageSynopsis && (
              <p className="text-xs text-muted-foreground mt-1">
                Hover for detailed overview
              </p>
            )}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

// Legacy component for backward compatibility
interface TutorialButtonProps extends ButtonProps {
  hasCompleted?: boolean; 
  tooltip?: string;
}

export const TutorialButton: React.FC<TutorialButtonProps> = ({
  onClick,
  hasCompleted,
  tooltip = "Start Tutorial",
  className,
  ...props
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 relative",
            hasCompleted ? "border-muted" : "border-primary",
            className
          )}
          onClick={onClick}
          {...props}
        >
          <Lightbulb 
            size={16} 
            weight={hasCompleted ? "regular" : "fill"} 
            className={cn(
              "transition-colors",
              hasCompleted ? "text-muted-foreground" : "text-primary"
            )}
          />
          {!hasCompleted && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{hasCompleted ? "Restart Tutorial" : tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Export page synopsis data for use in other components
export { pagesSynopsis };
export type { PageSynopsis };
