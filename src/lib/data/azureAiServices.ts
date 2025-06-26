// Azure AI Services for agent patterns
export interface AzureAIService {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  useCases: string[];
  bestPractices: string[];
  documentation: string;
}

export const azureAIServices: AzureAIService[] = [
  {
    id: "azure-openai",
    name: "Azure OpenAI Service",
    description: "Azure OpenAI provides REST API access to OpenAI's powerful language models including GPT-4, GPT-3.5-Turbo, and Embeddings models.",
    capabilities: [
      "Access to advanced GPT-4 and GPT-3.5-Turbo models",
      "Text embeddings generation",
      "Fine-tuning capabilities",
      "Content filtering and safety mechanisms",
      "Azure security and compliance features"
    ],
    useCases: [
      "Natural language understanding and generation",
      "Text summarization and extraction",
      "Code generation and completion",
      "Conversational AI agents"
    ],
    bestPractices: [
      "Implement effective prompt engineering with clear instructions",
      "Use system messages to define agent behavior and constraints",
      "Leverage Azure role-based access control (RBAC) for secure deployment",
      "Implement prompt validation and output sanitization",
      "Monitor token usage and implement rate limiting mechanisms",
      "Cache responses for identical or similar queries to reduce costs"
    ],
    documentation: "https://learn.microsoft.com/azure/ai-services/openai/"
  },
  {
    id: "azure-ai-foundry",
    name: "Azure AI Foundry",
    description: "Azure AI Foundry is a collection of tools and services for building, deploying, and managing AI models on Azure.",
    capabilities: [
      "Model development workspace",
      "Simplified model deployment",
      "Monitoring and management of AI solutions",
      "Integration with Azure ML and other Azure services",
      "Collaboration tools for AI teams"
    ],
    useCases: [
      "Enterprise-scale AI development",
      "AI model lifecycle management",
      "Cross-functional AI team collaboration",
      "Secure AI deployment in regulated industries"
    ],
    bestPractices: [
      "Set up proper CI/CD pipelines for model deployment",
      "Implement staged deployment (dev, test, prod) for AI models",
      "Use version control for prompts and model configurations",
      "Establish monitoring dashboards for model performance",
      "Implement testing frameworks for AI behaviors",
      "Document model limitations and intended use cases"
    ],
    documentation: "https://learn.microsoft.com/azure/ai-studio/"
  },
  {
    id: "azure-ai-evaluation",
    name: "Azure AI Evaluation SDK",
    description: "Tools for systematic evaluation and benchmarking of AI models to ensure quality, safety, and alignment with requirements.",
    capabilities: [
      "Automated model evaluation pipelines",
      "Benchmarking against reference models",
      "Safety and alignment testing",
      "Performance and accuracy metrics",
      "Human feedback integration"
    ],
    useCases: [
      "Model quality assurance",
      "Comparative model analysis",
      "Regression testing for model updates",
      "Safety and alignment verification"
    ],
    bestPractices: [
      "Create comprehensive test suites covering expected agent behaviors",
      "Implement evaluation for edge cases and adversarial inputs",
      "Set up regular automated evaluation runs for continuous quality assessment",
      "Track evaluation metrics over time to identify regressions",
      "Include diverse evaluation criteria beyond accuracy (safety, fairness, etc.)",
      "Combine automated evaluation with human review for critical systems"
    ],
    documentation: "https://learn.microsoft.com/azure/ai-services/content-safety/"
  },
  {
    id: "azure-ai-inference",
    name: "Azure AI Inference SDK",
    description: "Optimizes the deployment and execution of AI models for efficient inference in production environments.",
    capabilities: [
      "High-performance model inference",
      "Automatic batching and throughput optimization",
      "GPU and hardware acceleration",
      "Scalable model serving",
      "Inference monitoring and logging"
    ],
    useCases: [
      "Real-time AI applications",
      "High-volume prediction services",
      "Edge and IoT inference",
      "Cost-optimized model deployment"
    ],
    bestPractices: [
      "Implement request batching to improve throughput where appropriate",
      "Configure autoscaling based on demand patterns",
      "Set appropriate timeouts and retry policies for inference requests",
      "Optimize model size for deployment constraints (distillation, quantization)",
      "Use caching for frequently requested inference results",
      "Implement fallbacks for inference failures"
    ],
    documentation: "https://learn.microsoft.com/azure/machine-learning/concept-inference"
  },
  {
    id: "azure-ai-agent-service",
    name: "Azure AI Agent Service",
    description: "Managed service for deploying, monitoring, and scaling intelligent agents built on Azure AI services.",
    capabilities: [
      "Agent lifecycle management",
      "Built-in agent templates and patterns",
      "Tool integration framework",
      "Conversation and context management",
      "Usage analytics and monitoring"
    ],
    useCases: [
      "Customer service automation",
      "Enterprise knowledge assistants",
      "Agent-based workflow automation",
      "Multi-agent systems"
    ],
    bestPractices: [
      "Define clear boundaries for agent capabilities and limitations",
      "Implement comprehensive logging of agent actions and decisions",
      "Design agents with graceful degradation paths when services are unavailable",
      "Create agent testing suites that verify behavior across scenarios",
      "Implement usage throttling and cost control mechanisms",
      "Design governance processes for updating agent capabilities"
    ],
    documentation: "https://learn.microsoft.com/azure/ai-services/"
  },
  {
    id: "azure-content-safety",
    name: "Azure Content Safety",
    description: "AI service for detecting harmful content across text and images to maintain safety and compliance.",
    capabilities: [
      "Text content moderation",
      "Image content analysis",
      "Content categorization",
      "Severity level assessment",
      "Custom blocklists and allowlists"
    ],
    useCases: [
      "User-generated content moderation",
      "AI output safety filtering",
      "Regulatory compliance for content",
      "Brand safety protection"
    ],
    bestPractices: [
      "Implement pre-moderation for AI-generated content before display",
      "Set appropriate threshold levels based on your application's audience",
      "Combine automated safety checks with human review for edge cases",
      "Create feedback loops to improve detection over time",
      "Implement blocklists for domain-specific problematic content",
      "Deploy content safety in multiple stages of the agent workflow"
    ],
    documentation: "https://learn.microsoft.com/azure/ai-services/content-safety/"
  },
  {
    id: "azure-language-service",
    name: "Azure Language Service",
    description: "Comprehensive NLP capabilities including sentiment analysis, entity recognition, and custom text classification.",
    capabilities: [
      "Named entity recognition",
      "Sentiment analysis",
      "Language detection",
      "Custom text classification",
      "Key phrase extraction",
      "Conversational language understanding"
    ],
    useCases: [
      "Enhanced agent understanding of user inputs",
      "Document processing and information extraction",
      "Customer feedback analysis",
      "Domain-specific language understanding"
    ],
    bestPractices: [
      "Combine with Azure OpenAI for enhanced language capabilities",
      "Create custom classifiers for domain-specific terminology",
      "Use sentiment analysis to adapt agent tone and responses",
      "Implement entity recognition for better context understanding",
      "Process and extract structured information before reasoning tasks",
      "Leverage language detection for multilingual agent support"
    ],
    documentation: "https://learn.microsoft.com/azure/ai-services/language-service/"
  },
  {
    id: "azure-cognitive-search",
    name: "Azure Cognitive Search",
    description: "AI-powered cloud search service with built-in retrieval capabilities for knowledge-intensive applications.",
    capabilities: [
      "Vector search for semantic retrieval",
      "Hybrid search combining keyword and semantic approaches",
      "Document chunking and indexing",
      "Content enrichment pipelines",
      "Natural language query understanding"
    ],
    useCases: [
      "Enterprise RAG implementations",
      "Knowledge base search",
      "Document discovery and exploration",
      "Content recommendation"
    ],
    bestPractices: [
      "Design optimal chunking strategies for your document corpus",
      "Implement hybrid retrieval combining vector and keyword search",
      "Create query rewriting steps to improve retrieval quality",
      "Use filters to narrow search scope for more relevant results",
      "Implement feedback loops to capture user interaction with search results",
      "Configure proper relevance tuning based on content types"
    ],
    documentation: "https://learn.microsoft.com/azure/search/"
  },
  {
    id: "azure-document-intelligence",
    name: "Azure Document Intelligence",
    description: "Extract text, key-value pairs, tables, and structure from documents using AI-powered OCR and document understanding.",
    capabilities: [
      "Optical character recognition (OCR)",
      "Form recognition",
      "Layout analysis",
      "Pre-built models for common documents",
      "Custom document models"
    ],
    useCases: [
      "Document processing automation",
      "Data extraction from forms and receipts",
      "Contract analysis",
      "ID document processing"
    ],
    bestPractices: [
      "Pre-process documents for optimal extraction quality",
      "Train custom models for domain-specific documents",
      "Implement validation logic for extracted information",
      "Combine with other Azure AI services for end-to-end document workflows",
      "Set up monitoring for extraction quality metrics",
      "Design fallback paths for when automated extraction fails"
    ],
    documentation: "https://learn.microsoft.com/azure/ai-services/document-intelligence/"
  }
];

// Map each service to applicable agent patterns
export interface AzureServicePatternMapping {
  patternId: string;
  serviceId: string;
  integration: string;
  bestPractices: string[];
}

export const azureServicePatternMappings: AzureServicePatternMapping[] = [
  {
    patternId: "react-agent",
    serviceId: "azure-openai",
    integration: "Core reasoning engine for the agent",
    bestPractices: [
      "Use Azure OpenAI GPT-4 for complex reasoning tasks",
      "Implement system messages to maintain ReAct format consistency",
      "Balance verbosity of reasoning traces with token efficiency",
      "Cache reasoning paths for similar problems to improve efficiency"
    ]
  },
  {
    patternId: "react-agent",
    serviceId: "azure-content-safety",
    integration: "Filter and validate both user inputs and agent outputs",
    bestPractices: [
      "Apply content safety checks before tool execution",
      "Validate agent outputs before returning to users",
      "Implement appropriate response handling for flagged content",
      "Create custom allowlists for domain-specific terminology"
    ]
  },
  {
    patternId: "react-agent",
    serviceId: "azure-ai-evaluation",
    integration: "Evaluate reasoning steps and tool use effectiveness",
    bestPractices: [
      "Build evaluation suites that validate tool selection logic",
      "Measure chain-of-thought reasoning quality metrics",
      "Compare different prompt strategies empirically",
      "Track performance across different types of user queries"
    ]
  },
  {
    patternId: "codeact-agent",
    serviceId: "azure-openai",
    integration: "Code generation and execution planning",
    bestPractices: [
      "Use code-specialized models like GPT-4 with enhanced code capabilities",
      "Implement strict validation of generated code before execution",
      "Set up execution sandboxes with appropriate security constraints",
      "Cache common code patterns to improve efficiency"
    ]
  },
  {
    patternId: "codeact-agent",
    serviceId: "azure-content-safety",
    integration: "Validate generated code for security issues",
    bestPractices: [
      "Scan generated code for potentially harmful operations",
      "Implement execution permissions based on safety assessments",
      "Create allowlists for approved libraries and functions",
      "Log all code execution attempts for security auditing"
    ]
  },
  {
    patternId: "codeact-agent",
    serviceId: "azure-ai-evaluation",
    integration: "Evaluate code quality and execution results",
    bestPractices: [
      "Create test suites that validate code correctness across scenarios",
      "Measure execution time and resource usage metrics",
      "Compare code solutions for efficiency and readability",
      "Track success rates for different types of coding tasks"
    ]
  },
  {
    patternId: "self-reflection",
    serviceId: "azure-openai",
    integration: "Self-critique and improvement capabilities",
    bestPractices: [
      "Use separate model instances for generation and reflection",
      "Implement temperature variation between generation and critique",
      "Design prompt strategies that encourage honest self-assessment",
      "Track improvement metrics across iteration cycles"
    ]
  },
  {
    patternId: "self-reflection",
    serviceId: "azure-ai-evaluation",
    integration: "Formalized evaluation of agent outputs",
    bestPractices: [
      "Create quantitative metrics for evaluating output quality",
      "Compare outputs before and after reflection steps",
      "Implement human feedback loops to validate improvements",
      "Design test cases that target common reasoning failures"
    ]
  },
  {
    patternId: "agentic-rag",
    serviceId: "azure-openai",
    integration: "Query understanding and result synthesis",
    bestPractices: [
      "Implement query decomposition for complex information needs",
      "Use dedicated system messages for retrieval vs. synthesis roles",
      "Balance citation and attribution with natural sounding responses",
      "Prompt the model to identify missing information gaps"
    ]
  },
  {
    patternId: "agentic-rag",
    serviceId: "azure-cognitive-search",
    integration: "Knowledge retrieval backbone",
    bestPractices: [
      "Design hybrid retrieval strategies combining semantic and keyword search",
      "Implement query rewriting to improve retrieval quality",
      "Use metadata filtering to narrow search context appropriately",
      "Optimize chunk size and overlap for your specific content types"
    ]
  },
  {
    patternId: "agentic-rag",
    serviceId: "azure-ai-evaluation",
    integration: "Evaluate retrieval quality and response accuracy",
    bestPractices: [
      "Measure relevance of retrieved documents to user queries",
      "Create test suites with known-answer questions",
      "Evaluate factuality and citation accuracy in responses",
      "Track hallucination rates across different query types"
    ]
  },
  {
    patternId: "modern-tool-use",
    serviceId: "azure-openai",
    integration: "Tool selection and result interpretation",
    bestPractices: [
      "Implement clear tool specifications in system messages",
      "Create explicit examples of tool use in few-shot prompts",
      "Design tool output schemas that are easy for models to parse",
      "Implement preference for simpler tools when appropriate"
    ]
  },
  {
    patternId: "modern-tool-use",
    serviceId: "azure-content-safety",
    integration: "Tool input and output validation",
    bestPractices: [
      "Validate all tool inputs for safety before execution",
      "Apply content safety checks to external tool outputs",
      "Implement appropriate error handling for flagged content",
      "Create safety logs for tool usage patterns"
    ]
  },
  {
    patternId: "model-context-protocol",
    serviceId: "azure-openai",
    integration: "Context-aware processing and response generation",
    bestPractices: [
      "Design context schemas that balance completeness and token efficiency",
      "Implement hierarchical context structures with varying detail levels",
      "Use system messages to define context handling protocols",
      "Track context relevance metrics to optimize retrieval"
    ]
  },
  {
    patternId: "model-context-protocol",
    serviceId: "azure-cognitive-search",
    integration: "Efficient context retrieval and filtering",
    bestPractices: [
      "Implement context routers based on query classification",
      "Design filtering strategies to narrow context based on user permissions",
      "Use relevance tuning to prioritize most important context",
      "Implement context caching for frequently accessed information"
    ]
  },
  {
    patternId: "agent-to-agent",
    serviceId: "azure-openai",
    integration: "Multi-agent coordination and communication",
    bestPractices: [
      "Define clear communication protocols between agents",
      "Use different system messages to specialize agent roles",
      "Implement message validation between agent interactions",
      "Design conversation summarization to manage context length"
    ]
  },
  {
    patternId: "agent-to-agent",
    serviceId: "azure-ai-agent-service",
    integration: "Agent lifecycle and conversation management",
    bestPractices: [
      "Set up appropriate authentication between communicating agents",
      "Design fallback mechanisms when agent communication fails",
      "Implement observability for all agent interactions",
      "Create feedback loops to improve agent coordination"
    ]
  },
  {
    patternId: "prompt-chaining",
    serviceId: "azure-openai",
    integration: "Sequential reasoning and transformation steps",
    bestPractices: [
      "Design each chain step with clear input and output formats",
      "Implement validation between chain steps to catch errors early",
      "Use different temperature settings based on step requirements",
      "Consider smaller models for simpler chain steps to optimize costs"
    ]
  },
  {
    patternId: "prompt-chaining",
    serviceId: "azure-ai-inference",
    integration: "Optimize inference performance across chain steps",
    bestPractices: [
      "Batch similar chain steps together when possible",
      "Implement parallel execution for independent chain branches",
      "Configure appropriate timeouts for each chain step",
      "Design graceful degradation when chain steps fail"
    ]
  },
  {
    patternId: "parallelization",
    serviceId: "azure-openai",
    integration: "Parallel execution of multiple reasoning paths",
    bestPractices: [
      "Use consistent prompting across parallel instances",
      "Design effective aggregation strategies for parallel outputs",
      "Implement diversity-promoting techniques when appropriate",
      "Consider cost-effective model selection for parallel calls"
    ]
  },
  {
    patternId: "parallelization",
    serviceId: "azure-ai-inference",
    integration: "Efficient parallel inference execution",
    bestPractices: [
      "Configure appropriate request batching for parallel calls",
      "Implement timeout handling for lagging parallel paths",
      "Design failover strategies when some parallel paths fail",
      "Optimize resource allocation based on criticality of parallel paths"
    ]
  },
  {
    patternId: "orchestrator-worker",
    serviceId: "azure-openai",
    integration: "Task orchestration and worker specialization",
    bestPractices: [
      "Use separate model configurations for orchestrator vs. worker roles",
      "Design explicit task specifications for worker clarity",
      "Implement result validation before accepting worker outputs",
      "Create clear success/failure criteria for tasks"
    ]
  },
  {
    patternId: "orchestrator-worker",
    serviceId: "azure-ai-agent-service",
    integration: "Agent coordination and management",
    bestPractices: [
      "Implement proper authentication between orchestrator and workers",
      "Design logging for full task lifecycle visibility",
      "Create monitoring dashboards for orchestration patterns",
      "Implement circuit breakers for failing workers"
    ]
  },
  {
    patternId: "evaluator-optimizer",
    serviceId: "azure-openai",
    integration: "Content evaluation and iterative improvement",
    bestPractices: [
      "Use separate model instances for generation and evaluation",
      "Design explicit evaluation criteria in system messages",
      "Implement objective scoring systems for measurable improvement",
      "Tune optimization cycles based on diminishing returns"
    ]
  },
  {
    patternId: "evaluator-optimizer",
    serviceId: "azure-ai-evaluation",
    integration: "Formalized evaluation frameworks",
    bestPractices: [
      "Create comprehensive evaluation dimensions beyond quality",
      "Implement checkpoint comparisons across optimization cycles",
      "Design human evaluation integration for subjective aspects",
      "Track improvement metrics to determine stopping criteria"
    ]
  },
  {
    patternId: "routing",
    serviceId: "azure-openai",
    integration: "Query classification and specialized handling",
    bestPractices: [
      "Design clear classification categories with examples",
      "Implement confidence thresholds for routing decisions",
      "Create fallback paths for ambiguous queries",
      "Track routing accuracy metrics for continuous improvement"
    ]
  },
  {
    patternId: "routing",
    serviceId: "azure-language-service",
    integration: "Enhanced query understanding and classification",
    bestPractices: [
      "Train custom classifiers for domain-specific routing",
      "Implement entity recognition to extract routing signals",
      "Use multi-label classification for complex queries",
      "Combine rule-based and ML-based routing approaches"
    ]
  },
  {
    patternId: "autonomous-workflow",
    serviceId: "azure-openai",
    integration: "Autonomous decision-making and action planning",
    bestPractices: [
      "Implement clear constraints and boundaries in system messages",
      "Design explicit action spaces and tool specifications",
      "Create comprehensive logging of all actions and reasoning",
      "Implement circuit breakers for unexpected behaviors"
    ]
  },
  {
    patternId: "autonomous-workflow",
    serviceId: "azure-content-safety",
    integration: "Safety validation for autonomous actions",
    bestPractices: [
      "Validate all planned actions before execution",
      "Implement permission levels for different action types",
      "Create safety logs for autonomous decision patterns",
      "Design human approval workflows for critical actions"
    ]
  },
  {
    patternId: "reflexion",
    serviceId: "azure-openai",
    integration: "Self-reflection and iterative improvement",
    bestPractices: [
      "Use separate prompts for action vs. reflection phases",
      "Implement structured reflection templates for consistency",
      "Design improvement tracking across reflection cycles",
      "Create memory mechanisms for learning from past reflections"
    ]
  },
  {
    patternId: "reflexion",
    serviceId: "azure-ai-evaluation",
    integration: "Formalized self-evaluation frameworks",
    bestPractices: [
      "Create evaluation dimensions aligned with task objectives",
      "Implement checkpoint comparisons across reflection cycles",
      "Design test suites that target common reasoning failures",
      "Track learning curves across similar problem types"
    ]
  },
  {
    patternId: "plan-and-execute",
    serviceId: "azure-openai",
    integration: "Task decomposition and sequential execution",
    bestPractices: [
      "Use clear planning templates with explicit steps and dependencies",
      "Implement validation between planning and execution phases",
      "Design replanning triggers when execution results change assumptions",
      "Balance plan granularity with execution efficiency"
    ]
  },
  {
    patternId: "plan-and-execute",
    serviceId: "azure-ai-agent-service",
    integration: "Agent coordination for plan execution",
    bestPractices: [
      "Implement task tracking across multiple execution agents",
      "Design proper handoffs between planning and execution phases",
      "Create visibility into plan progress and bottlenecks",
      "Implement fallbacks when planned steps fail"
    ]
  },
  // Add mappings for any additional patterns or services that might be missing
  {
    patternId: "plan-and-execute",
    serviceId: "azure-ai-foundry",
    integration: "Model lifecycle management for planning models",
    bestPractices: [
      "Implement CI/CD pipelines for deploying updated planner models",
      "Use version control for planning templates and configurations",
      "Establish monitoring dashboards for planning performance metrics",
      "Document planning model limitations and intended use cases"
    ]
  },
  {
    patternId: "autonomous-workflow",
    serviceId: "azure-ai-foundry",
    integration: "End-to-end autonomous agent development and deployment",
    bestPractices: [
      "Set up CI/CD pipelines for agent deployment across environments",
      "Create staging environments for testing autonomous behaviors safely",
      "Implement feature flags for controlling autonomous capabilities",
      "Document agent capabilities, limitations, and safety measures"
    ]
  },
  {
    patternId: "react-agent",
    serviceId: "azure-cognitive-search",
    integration: "Knowledge retrieval for tool-assisted reasoning",
    bestPractices: [
      "Provide access to domain knowledge through search tools",
      "Use vector search for semantic understanding of tool requirements",
      "Implement hybrid retrieval for tool documentation and examples",
      "Create specialized indexes for different tool categories"
    ]
  },
  {
    patternId: "codeact-agent",
    serviceId: "azure-ai-foundry",
    integration: "Code generation model development and deployment",
    bestPractices: [
      "Implement separate development and production environments for code agents",
      "Use version control for code examples and test cases",
      "Set up monitoring for code generation quality metrics",
      "Document code pattern libraries and implementation guidelines"
    ]
  }
];