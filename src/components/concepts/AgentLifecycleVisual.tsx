import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, ArrowClockwise } from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';

interface AgentLifecycleProps {
  autoPlay?: boolean;
}

const AgentLifecycleVisual: React.FC<AgentLifecycleProps> = ({ autoPlay = false }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [activeMicroLesson, setActiveMicroLesson] = useState<number | null>(null);
  const [userKnowledgeLevel, setUserKnowledgeLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  const colors = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#d1d5db',
    text: isDarkMode ? '#f9fafb' : '#111827',
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    secondary: isDarkMode ? '#6b7280' : '#6b7280',
    active: isDarkMode ? '#10b981' : '#059669',
    inactive: isDarkMode ? '#4b5563' : '#9ca3af',
    accent: isDarkMode ? '#f59e0b' : '#d97706'
  };

  const steps = [
    {
      id: 0,
      title: "Input Received",
      description: "User provides query or task",
      icon: "📥",
      position: { x: 50, y: 125 }
    },
    {
      id: 1,
      title: "Task Analysis",
      description: "Agent analyzes and understands the request",
      icon: "🧠",
      position: { x: 200, y: 60 }
    },
    {
      id: 2,
      title: "Planning",
      description: "Creates step-by-step execution plan",
      icon: "📋",
      position: { x: 400, y: 30 }
    },
    {
      id: 3,
      title: "Tool Selection",
      description: "Identifies required tools and resources",
      icon: "🔧",
      position: { x: 600, y: 60 }
    },
    {
      id: 4,
      title: "Execution",
      description: "Performs actions and gathers information",
      icon: "⚡",
      position: { x: 720, y: 125 }
    },
    {
      id: 5,
      title: "Evaluation",
      description: "Assesses results and determines next steps",
      icon: "✅",
      position: { x: 600, y: 220 }
    },
    {
      id: 6,
      title: "Response",
      description: "Delivers final answer or continues iteration",
      icon: "💬",
      position: { x: 400, y: 250 }
    },
    {
      id: 7,
      title: "Learning",
      description: "Updates knowledge for future tasks",
      icon: "📚",
      position: { x: 200, y: 220 }
    }
  ];

  // Micro-learning content for each step
  const microLearningContent = {
    0: {
      beginner: {
        title: "Input Received - Quick Start",
        content: "This is where the agent first receives your request. Think of it like a restaurant server taking your order.",
        codeExample: `// Example: User input
const userQuery = "Help me plan a trip to Paris";
agent.receiveInput(userQuery);`,
        keyPoints: ["First step in agent processing", "Raw input needs to be understood", "Sets the context for everything that follows"]
      },
      intermediate: {
        title: "Input Processing Deep Dive",
        content: "The agent parses natural language, extracts intent, and identifies key parameters from the user's request.",
        codeExample: `// Input parsing and intent extraction
const parsedInput = {
  intent: "travel_planning",
  entities: { destination: "Paris", type: "trip" },
  context: { user_preferences: [] }
};`,
        keyPoints: ["Natural language processing", "Intent classification", "Entity extraction", "Context preservation"]
      },
      advanced: {
        title: "Advanced Input Analysis",
        content: "Sophisticated agents use multi-modal input processing, context awareness, and uncertainty handling.",
        codeExample: `// Advanced input processing
class InputProcessor {
  async processInput(input: MultiModalInput) {
    const semanticVector = await this.embedInput(input);
    const contextualizedInput = this.applyContext(semanticVector);
    return this.generateActionPlan(contextualizedInput);
  }
}`,
        keyPoints: ["Multi-modal processing", "Semantic embeddings", "Context integration", "Uncertainty quantification"]
      }
    },
    1: {
      beginner: {
        title: "Task Analysis - Breaking It Down",
        content: "The agent figures out what you're really asking for. Like a smart assistant understanding your needs.",
        codeExample: `// Simple task analysis
if (query.includes("plan trip")) {
  taskType = "travel_planning";
  requiredSteps = ["research", "booking", "itinerary"];
}`,
        keyPoints: ["Understanding the request", "Identifying task type", "Determining complexity"]
      },
      intermediate: {
        title: "Cognitive Task Decomposition",
        content: "The agent breaks down complex requests into manageable subtasks and identifies dependencies.",
        codeExample: `// Task decomposition
const taskGraph = {
  mainTask: "plan_paris_trip",
  subtasks: [
    { id: "research_flights", depends: [] },
    { id: "find_hotels", depends: ["research_flights"] },
    { id: "plan_activities", depends: ["find_hotels"] }
  ]
};`,
        keyPoints: ["Task decomposition", "Dependency analysis", "Resource estimation", "Priority assignment"]
      },
      advanced: {
        title: "Advanced Cognitive Analysis",
        content: "Sophisticated reasoning using knowledge graphs, logical inference, and uncertainty propagation.",
        codeExample: `// Advanced task analysis with reasoning
class CognitiveAnalyzer {
  async analyzeTask(input: ParsedInput): Promise<TaskPlan> {
    const knowledge = await this.queryKnowledgeGraph(input);
    const reasoning = this.performLogicalInference(knowledge);
    return this.generateExecutionPlan(reasoning);
  }
}`,
        keyPoints: ["Knowledge graph integration", "Logical inference", "Uncertainty propagation", "Multi-step reasoning"]
      }
    },
    2: {
      beginner: {
        title: "Planning - Making a To-Do List",
        content: "The agent creates a step-by-step plan, like making a to-do list for your request.",
        codeExample: `// Simple planning
const plan = [
  "Step 1: Search for flights",
  "Step 2: Find hotels",
  "Step 3: Create itinerary"
];`,
        keyPoints: ["Sequential planning", "Step-by-step approach", "Clear objectives"]
      },
      intermediate: {
        title: "Strategic Planning Framework",
        content: "The agent creates detailed execution plans with contingencies, resource allocation, and success metrics.",
        codeExample: `// Strategic planning
const executionPlan = {
  strategy: "hierarchical_decomposition",
  phases: [
    { name: "research", duration: "2h", resources: ["web_search", "database"] },
    { name: "booking", duration: "1h", resources: ["booking_api", "payment"] }
  ],
  contingencies: [
    { trigger: "no_flights_found", action: "suggest_alternatives" }
  ]
};`,
        keyPoints: ["Resource allocation", "Timeline estimation", "Contingency planning", "Success metrics"]
      },
      advanced: {
        title: "Advanced Planning Algorithms",
        content: "Uses sophisticated planning algorithms like A*, Monte Carlo tree search, and multi-agent coordination.",
        codeExample: `// Advanced planning with MCTS
class AdvancedPlanner {
  async generateOptimalPlan(state: PlanningState): Promise<Plan> {
    const searchTree = new MonteCarloTreeSearch(state);
    const optimalPath = await searchTree.search(1000);
    return this.convertToExecutablePlan(optimalPath);
  }
}`,
        keyPoints: ["Optimal path finding", "Monte Carlo methods", "Multi-agent coordination", "Real-time replanning"]
      }
    },
    3: {
      beginner: {
        title: "Tool Selection - Choosing the Right Tools",
        content: "The agent picks the best tools for the job, like choosing the right app for a task.",
        codeExample: `// Simple tool selection
const tools = {
  "web_search": "For finding information online",
  "booking_api": "For making reservations",
  "weather_api": "For checking weather"
};`,
        keyPoints: ["Tool identification", "Capability matching", "Resource availability"]
      },
      intermediate: {
        title: "Dynamic Tool Orchestration",
        content: "The agent dynamically selects and combines tools based on task requirements and current context.",
        codeExample: `// Dynamic tool selection
class ToolOrchestrator {
  selectTools(task: Task): ToolSet {
    const candidates = this.getAvailableTools();
    const scored = this.scoreTools(candidates, task);
    return this.optimizeToolCombination(scored);
  }
}`,
        keyPoints: ["Dynamic selection", "Tool composition", "Performance optimization", "Fallback strategies"]
      },
      advanced: {
        title: "Autonomous Tool Discovery",
        content: "Advanced agents can discover new tools, learn their capabilities, and even create custom tools.",
        codeExample: `// Advanced tool discovery
class ToolDiscovery {
  async discoverTools(domain: string): Promise<Tool[]> {
    const discovered = await this.scanEnvironment(domain);
    const learned = await this.learnCapabilities(discovered);
    return this.synthesizeCustomTools(learned);
  }
}`,
        keyPoints: ["Tool discovery", "Capability learning", "Custom tool creation", "Adaptive toolsets"]
      }
    },
    4: {
      beginner: {
        title: "Execution - Getting Things Done",
        content: "The agent actually performs the actions, like a robot following instructions.",
        codeExample: `// Simple execution
async function executeTask() {
  const flights = await searchFlights();
  const hotels = await searchHotels();
  return { flights, hotels };
}`,
        keyPoints: ["Action execution", "Sequential processing", "Result collection"]
      },
      intermediate: {
        title: "Parallel Task Execution",
        content: "The agent executes multiple tasks concurrently, handles errors, and adapts to changing conditions.",
        codeExample: `// Parallel execution with error handling
class TaskExecutor {
  async executeParallel(tasks: Task[]): Promise<Result[]> {
    const promises = tasks.map(task => this.executeWithRetry(task));
    return Promise.allSettled(promises);
  }
}`,
        keyPoints: ["Parallel processing", "Error handling", "Retry strategies", "Progress monitoring"]
      },
      advanced: {
        title: "Adaptive Execution Engine",
        content: "Sophisticated execution with real-time adaptation, resource optimization, and failure recovery.",
        codeExample: `// Advanced execution with adaptation
class AdaptiveExecutor {
  async execute(plan: Plan): Promise<Result> {
    const monitor = new ExecutionMonitor();
    const adaptor = new PlanAdaptor();
    
    while (!plan.isComplete()) {
      const status = monitor.getCurrentStatus();
      plan = adaptor.adaptPlan(plan, status);
      await this.executeNextStep(plan);
    }
  }
}`,
        keyPoints: ["Real-time adaptation", "Resource optimization", "Failure recovery", "Performance monitoring"]
      }
    },
    5: {
      beginner: {
        title: "Evaluation - Checking Your Work",
        content: "The agent checks if the results are good, like proofreading an essay.",
        codeExample: `// Simple evaluation
function evaluateResults(results) {
  if (results.flights && results.hotels) {
    return "Success";
  }
  return "Needs improvement";
}`,
        keyPoints: ["Result validation", "Success criteria", "Quality checking"]
      },
      intermediate: {
        title: "Multi-Dimensional Evaluation",
        content: "The agent evaluates results across multiple dimensions: accuracy, completeness, efficiency, and user satisfaction.",
        codeExample: `// Multi-dimensional evaluation
class ResultEvaluator {
  evaluate(results: Results, criteria: EvaluationCriteria): Score {
    return {
      accuracy: this.measureAccuracy(results),
      completeness: this.checkCompleteness(results),
      efficiency: this.calculateEfficiency(results),
      satisfaction: this.predictSatisfaction(results)
    };
  }
}`,
        keyPoints: ["Multi-dimensional scoring", "Objective metrics", "Subjective assessment", "Continuous improvement"]
      },
      advanced: {
        title: "Autonomous Quality Assurance",
        content: "Advanced agents perform sophisticated self-evaluation using learned quality models and uncertainty estimation.",
        codeExample: `// Advanced evaluation with uncertainty
class AutonomousEvaluator {
  async evaluate(results: Results): Promise<EvaluationReport> {
    const qualityModel = await this.getQualityModel();
    const uncertainty = this.estimateUncertainty(results);
    const improvements = this.suggestImprovements(results);
    
    return { quality: qualityModel.score(results), uncertainty, improvements };
  }
}`,
        keyPoints: ["Learned quality models", "Uncertainty estimation", "Improvement suggestions", "Meta-evaluation"]
      }
    },
    6: {
      beginner: {
        title: "Response - Giving Your Answer",
        content: "The agent presents the final answer in a clear, helpful way.",
        codeExample: `// Simple response
function generateResponse(results) {
  return \`Found \${results.flights.length} flights and \${results.hotels.length} hotels for your Paris trip!\`;
}`,
        keyPoints: ["Clear communication", "Result presentation", "User-friendly format"]
      },
      intermediate: {
        title: "Adaptive Response Generation",
        content: "The agent tailors responses to user preferences, context, and communication style.",
        codeExample: `// Adaptive response generation
class ResponseGenerator {
  generate(results: Results, userProfile: UserProfile): Response {
    const style = this.determineStyle(userProfile);
    const format = this.selectFormat(results.type);
    return this.renderResponse(results, style, format);
  }
}`,
        keyPoints: ["Personalized communication", "Context adaptation", "Multi-format support", "Engagement optimization"]
      },
      advanced: {
        title: "Intelligent Response Orchestration",
        content: "Advanced agents generate multi-modal responses with explanations, visualizations, and interactive elements.",
        codeExample: `// Advanced response orchestration
class IntelligentResponder {
  async orchestrateResponse(results: Results): Promise<MultiModalResponse> {
    const explanation = await this.generateExplanation(results);
    const visualization = await this.createVisualization(results);
    const interaction = await this.buildInteractionLayer(results);
    
    return { explanation, visualization, interaction };
  }
}`,
        keyPoints: ["Multi-modal responses", "Explanation generation", "Interactive elements", "Cognitive load optimization"]
      }
    },
    7: {
      beginner: {
        title: "Learning - Getting Better",
        content: "The agent remembers what worked well to improve next time.",
        codeExample: `// Simple learning
if (userFeedback === "good") {
  memory.successful_strategies.push(currentStrategy);
}`,
        keyPoints: ["Experience storage", "Pattern recognition", "Improvement tracking"]
      },
      intermediate: {
        title: "Continuous Learning Loop",
        content: "The agent continuously updates its knowledge and strategies based on feedback and outcomes.",
        codeExample: `// Continuous learning
class LearningEngine {
  async updateKnowledge(experience: Experience): Promise<void> {
    const patterns = this.extractPatterns(experience);
    await this.updateModels(patterns);
    this.optimizeStrategies(patterns);
  }
}`,
        keyPoints: ["Pattern extraction", "Model updates", "Strategy optimization", "Knowledge consolidation"]
      },
      advanced: {
        title: "Meta-Learning and Adaptation",
        content: "Advanced agents learn how to learn better, adapt their learning strategies, and transfer knowledge across domains.",
        codeExample: `// Meta-learning system
class MetaLearner {
  async adaptLearningStrategy(domain: Domain): Promise<LearningStrategy> {
    const performance = await this.evaluateCurrentStrategy(domain);
    const alternatives = this.generateAlternatives(performance);
    return this.selectOptimalStrategy(alternatives);
  }
}`,
        keyPoints: ["Learning to learn", "Strategy adaptation", "Transfer learning", "Cognitive architecture evolution"]
      }
    }
  };

  const showMicroLesson = (stepId: number) => {
    setActiveMicroLesson(stepId);
  };

  const hideMicroLesson = () => {
    setActiveMicroLesson(null);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, steps.length]);

  const getStepColor = (stepId: number) => {
    if (stepId === currentStep) return colors.active;
    if (stepId < currentStep) return colors.primary;
    return colors.inactive;
  };

  const getConnectionPath = (from: number, to: number) => {
    const fromStep = steps[from];
    const toStep = steps[to];
    const startX = fromStep.position.x + 40;
    const startY = fromStep.position.y + 40;
    const endX = toStep.position.x + 40;
    const endY = toStep.position.y + 40;
    
    // Create curved path
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const controlX = midX + (startY - endY) * 0.1;
    const controlY = midY + (endX - startX) * 0.1;
    
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  };

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 1] // Cycle back to analysis
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Agent Lifecycle & Decision Flow</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
              }}
            >
              <ArrowClockwise size={16} />
              Reset
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Watch how an AI agent processes tasks through its cognitive cycle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            width="800"
            height="300"
            viewBox="0 0 800 400"
            className="w-full h-auto border rounded-lg"
            style={{ backgroundColor: colors.background }}
          >
            {/* Definitions */}
            <defs>
              <marker
                id="agent-arrow"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 8 3, 0 6"
                  fill={colors.secondary}
                />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Connection paths */}
            {connections.map(([from, to], index) => (
              <path
                key={`connection-${from}-${to}`}
                d={getConnectionPath(from, to)}
                stroke={currentStep >= from ? colors.primary : colors.inactive}
                strokeWidth="2"
                fill="none"
                markerEnd="url(#agent-arrow)"
                className={currentStep === from ? "animate-pulse" : ""}
                strokeDasharray={currentStep === from ? "5,5" : "none"}
              />
            ))}

            {/* Step nodes */}
            {steps.map((step) => (
              <g key={step.id}>
                {/* Node circle */}
                <circle
                  cx={step.position.x + 40}
                  cy={step.position.y + 40}
                  r="35"
                  fill={getStepColor(step.id)}
                  stroke={colors.border}
                  strokeWidth="2"
                  filter={step.id === currentStep ? "url(#glow)" : "none"}
                  className={step.id === currentStep ? "animate-pulse" : ""}
                />
                
                {/* Step icon */}
                <text
                  x={step.position.x + 40}
                  y={step.position.y + 48}
                  textAnchor="middle"
                  className="text-lg"
                >
                  {step.icon}
                </text>
                
                {/* Step title */}
                <text
                  x={step.position.x + 40}
                  y={step.position.y + 100}
                  textAnchor="middle"
                  fill={colors.text}
                  className="text-sm font-medium"
                >
                  {step.title}
                </text>
                
                {/* Step description */}
                <text
                  x={step.position.x + 40}
                  y={step.position.y + 115}
                  textAnchor="middle"
                  fill={colors.secondary}
                  className="text-xs"
                >
                  {step.description}
                </text>
                
                {/* Micro-learning trigger button */}
                <circle
                  cx={step.position.x + 70}
                  cy={step.position.y + 15}
                  r="10"
                  fill={colors.accent}
                  stroke={colors.border}
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => showMicroLesson(step.id)}
                />
                <text
                  x={step.position.x + 70}
                  y={step.position.y + 20}
                  textAnchor="middle"
                  fill={colors.background}
                  className="text-xs font-bold pointer-events-none"
                >
                  ?
                </text>
                
                {/* Current step indicator - subtle highlight */}
                {step.id === currentStep && (
                  <circle
                    cx={step.position.x + 40}
                    cy={step.position.y + 40}
                    r="42"
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth="3"
                    opacity="0.6"
                  />
                )}
              </g>
            ))}

            {/* Central legend - moved to top right to avoid occlusion */}
            <rect
              x="680"
              y="20"
              width="180"
              height="70"
              rx="8"
              fill={colors.background}
              stroke={colors.border}
              strokeWidth="1"
              fillOpacity="0.95"
              strokeDasharray="3,3"
            />
            <text x="770" y="40" textAnchor="middle" fill={colors.text} className="text-sm font-semibold">
              Agent Cognitive Cycle
            </text>
            <text x="770" y="55" textAnchor="middle" fill={colors.secondary} className="text-xs">
              Continuous learning and adaptation
            </text>
            <text x="770" y="70" textAnchor="middle" fill={colors.secondary} className="text-xs">
              through experience and feedback
            </text>
          </svg>
        </div>
        
        {/* Step details */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-lg mb-2">
            Current Step: {steps[currentStep].title}
          </h4>
          <p className="text-muted-foreground text-sm">
            {steps[currentStep].description}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Micro-learning display area */}
        {activeMicroLesson !== null && (
          <div className="mt-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {steps[activeMicroLesson].icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {microLearningContent[activeMicroLesson][userKnowledgeLevel].title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Step {activeMicroLesson + 1}: {steps[activeMicroLesson].title}
                  </p>
                </div>
              </div>
              <button
                onClick={hideMicroLesson}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close micro-learning"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Knowledge level selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose your knowledge level:
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setUserKnowledgeLevel(level)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      userKnowledgeLevel === level
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Overview</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {microLearningContent[activeMicroLesson][userKnowledgeLevel].content}
                </p>
              </div>

              {/* Code example */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Code Example</h4>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400">
                    <code>{microLearningContent[activeMicroLesson][userKnowledgeLevel].codeExample}</code>
                  </pre>
                </div>
              </div>

              {/* Key points */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Points</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {microLearningContent[activeMicroLesson][userKnowledgeLevel].keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick tip */}
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 dark:text-amber-400 text-sm">💡</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Quick Tip</h5>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Try clicking the other "?" buttons to explore different aspects of the agent lifecycle. 
                      Each step builds upon the previous ones to create intelligent, adaptive behavior.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentLifecycleVisual;
