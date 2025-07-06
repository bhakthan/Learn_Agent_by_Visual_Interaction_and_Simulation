export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  subCategory: string;
  learningObjectives: string[];
  relatedConcepts: string[];
  persona: string[];
  timeEstimate: number; // in seconds
  codeExample?: string;
  visualAid?: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subCategories: QuizSubCategory[];
  totalQuestions: number;
  estimatedTime: number;
}

export interface QuizSubCategory {
  id: string;
  name: string;
  description: string;
  questions: QuizQuestion[];
  prerequisites: string[];
}

export interface QuizSession {
  id: string;
  userId: string;
  categoryId: string;
  subCategoryId?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, number>;
  score: number;
  startTime: Date;
  endTime?: Date;
  timeSpent: number;
  completed: boolean;
  feedback: QuizFeedback[];
}

export interface QuizFeedback {
  questionId: string;
  isCorrect: boolean;
  selectedAnswer: number;
  correctAnswer: number;
  explanation: string;
  improvementSuggestions: string[];
}

export interface UserPersona {
  id: string;
  name: string;
  description: string;
  targetDifficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  learningStyle: 'visual' | 'hands-on' | 'theoretical' | 'mixed';
}

// User Personas
export const userPersonas: UserPersona[] = [
  {
    id: 'business-leader',
    name: 'Business Leader',
    description: 'Executives and managers who need to understand AI agent capabilities for strategic decisions',
    targetDifficulty: 'beginner',
    focusAreas: ['strategy', 'business-value', 'use-cases', 'roi'],
    learningStyle: 'visual'
  },
  {
    id: 'no-code-engineer',
    name: 'No-Code/Low-Code Engineer',
    description: 'Technical professionals who build solutions without extensive coding',
    targetDifficulty: 'beginner',
    focusAreas: ['configuration', 'integration', 'workflows', 'tools'],
    learningStyle: 'hands-on'
  },
  {
    id: 'agent-designer',
    name: 'Agent Designer',
    description: 'Professionals who design agent workflows and user experiences',
    targetDifficulty: 'intermediate',
    focusAreas: ['patterns', 'ux-design', 'workflows', 'communication'],
    learningStyle: 'mixed'
  },
  {
    id: 'agent-developer',
    name: 'Agent Developer',
    description: 'Developers who implement and customize AI agent solutions',
    targetDifficulty: 'intermediate',
    focusAreas: ['implementation', 'apis', 'integration', 'debugging'],
    learningStyle: 'hands-on'
  },
  {
    id: 'ai-enthusiast',
    name: 'AI Enthusiast',
    description: 'Technology enthusiasts exploring AI agent concepts and applications',
    targetDifficulty: 'intermediate',
    focusAreas: ['concepts', 'trends', 'experimentation', 'learning'],
    learningStyle: 'mixed'
  },
  {
    id: 'ai-engineer',
    name: 'AI Engineer',
    description: 'Engineers who build and optimize AI agent systems at scale',
    targetDifficulty: 'advanced',
    focusAreas: ['architecture', 'optimization', 'scalability', 'performance'],
    learningStyle: 'theoretical'
  },
  {
    id: 'agent-architect',
    name: 'Agent Architect',
    description: 'Architects who design complex multi-agent systems and infrastructures',
    targetDifficulty: 'advanced',
    focusAreas: ['system-design', 'architecture', 'patterns', 'protocols'],
    learningStyle: 'theoretical'
  },
  {
    id: 'ai-ops-engineer',
    name: 'AI Ops Engineer',
    description: 'Engineers who deploy, monitor, and maintain AI agent systems in production',
    targetDifficulty: 'advanced',
    focusAreas: ['deployment', 'monitoring', 'maintenance', 'security'],
    learningStyle: 'hands-on'
  }
];

// Quiz Categories
export const quizCategories: QuizCategory[] = [
  {
    id: 'core-concepts',
    name: 'Core Concepts',
    description: 'Fundamental AI agent concepts and principles',
    icon: 'Brain',
    totalQuestions: 45,
    estimatedTime: 25,
    subCategories: [
      {
        id: 'agents',
        name: 'AI Agents',
        description: 'Understanding AI agents, their components, and lifecycle',
        prerequisites: [],
        questions: [
          // Beginner Questions
          {
            id: 'agents-b1',
            question: 'What is an AI agent?',
            options: [
              'A human who works with AI',
              'A software program that can perceive its environment and take actions to achieve goals',
              'A database that stores AI information',
              'A user interface for AI applications'
            ],
            correctAnswer: 1,
            explanation: 'An AI agent is a software program that can perceive its environment through sensors, process information, and take actions to achieve specific goals autonomously.',
            difficulty: 'beginner',
            category: 'core-concepts',
            subCategory: 'agents',
            learningObjectives: ['Define AI agents', 'Understand basic agent characteristics'],
            relatedConcepts: ['autonomy', 'perception', 'action'],
            persona: ['business-leader', 'no-code-engineer'],
            timeEstimate: 30
          },
          {
            id: 'agents-b2',
            question: 'Which of these is NOT a key characteristic of AI agents?',
            options: [
              'Autonomy',
              'Reactivity',
              'Proactivity',
              'Inflexibility'
            ],
            correctAnswer: 3,
            explanation: 'AI agents are characterized by autonomy, reactivity, proactivity, and social ability. Inflexibility is not a desirable characteristic as agents need to adapt to changing environments.',
            difficulty: 'beginner',
            category: 'core-concepts',
            subCategory: 'agents',
            learningObjectives: ['Identify agent characteristics'],
            relatedConcepts: ['autonomy', 'reactivity', 'proactivity'],
            persona: ['business-leader', 'no-code-engineer'],
            timeEstimate: 25
          },
          {
            id: 'agents-b3',
            question: 'What is the main business value of AI agents?',
            options: [
              'They automate repetitive tasks and make intelligent decisions',
              'They replace all human workers',
              'They eliminate the need for databases',
              'They only work with specific programming languages'
            ],
            correctAnswer: 0,
            explanation: 'The main business value of AI agents is their ability to automate repetitive tasks while making intelligent decisions based on data and context, freeing humans for more strategic work.',
            difficulty: 'beginner',
            category: 'core-concepts',
            subCategory: 'agents',
            learningObjectives: ['Understand business value of agents'],
            relatedConcepts: ['automation', 'decision-making', 'efficiency'],
            persona: ['business-leader'],
            timeEstimate: 35
          },
          // Intermediate Questions
          {
            id: 'agents-i1',
            question: 'In the agent lifecycle, what happens during the "Perception" phase?',
            options: [
              'The agent takes actions in the environment',
              'The agent processes and interprets sensory data from its environment',
              'The agent is created and initialized',
              'The agent communicates with other agents'
            ],
            correctAnswer: 1,
            explanation: 'During the perception phase, the agent processes and interprets sensory data from its environment to understand the current state and identify relevant information for decision-making.',
            difficulty: 'intermediate',
            category: 'core-concepts',
            subCategory: 'agents',
            learningObjectives: ['Understand agent lifecycle phases'],
            relatedConcepts: ['perception', 'sensors', 'data-processing'],
            persona: ['agent-designer', 'agent-developer', 'ai-enthusiast'],
            timeEstimate: 40
          },
          {
            id: 'agents-i2',
            question: 'What is the difference between reactive and proactive agents?',
            options: [
              'Reactive agents are faster than proactive agents',
              'Reactive agents use AI; proactive agents use rules',
              'Reactive agents respond to stimuli; proactive agents pursue goals independently',
              'There is no difference between them'
            ],
            correctAnswer: 2,
            explanation: 'Reactive agents respond to environmental stimuli or events, while proactive agents take initiative and pursue goals independently without waiting for external triggers.',
            difficulty: 'intermediate',
            category: 'core-concepts',
            subCategory: 'agents',
            learningObjectives: ['Differentiate agent types'],
            relatedConcepts: ['reactivity', 'proactivity', 'goal-orientation'],
            persona: ['agent-designer', 'agent-developer'],
            timeEstimate: 45
          },
          // Advanced Questions
          {
            id: 'agents-a1',
            question: 'In a multi-agent system, what is the primary challenge of agent coordination?',
            options: [
              'Ensuring all agents use the same programming language',
              'Managing concurrent actions and potential conflicts while maintaining system coherence',
              'Making sure agents have identical capabilities',
              'Preventing agents from communicating with each other'
            ],
            correctAnswer: 1,
            explanation: 'The primary challenge in multi-agent coordination is managing concurrent actions and potential conflicts while maintaining overall system coherence and achieving collective goals.',
            difficulty: 'advanced',
            category: 'core-concepts',
            subCategory: 'agents',
            learningObjectives: ['Understand multi-agent coordination challenges'],
            relatedConcepts: ['coordination', 'conflict-resolution', 'system-coherence'],
            persona: ['ai-engineer', 'agent-architect'],
            timeEstimate: 50
          },
          {
            id: 'agents-a2',
            question: 'What is the key consideration when designing agent memory systems for long-running processes?',
            options: [
              'Using the largest possible memory storage',
              'Balancing memory retention with computational efficiency and relevance decay',
              'Storing everything in a single database',
              'Avoiding memory altogether'
            ],
            correctAnswer: 1,
            explanation: 'When designing agent memory systems, it\'s crucial to balance memory retention with computational efficiency, implementing relevance decay to prioritize important information while managing resource constraints.',
            difficulty: 'advanced',
            category: 'core-concepts',
            subCategory: 'agents',
            learningObjectives: ['Design agent memory systems'],
            relatedConcepts: ['memory-management', 'relevance-decay', 'computational-efficiency'],
            persona: ['ai-engineer', 'agent-architect', 'ai-ops-engineer'],
            timeEstimate: 60
          }
        ]
      },
      {
        id: 'a2a-protocol',
        name: 'Agent-to-Agent (A2A) Protocol',
        description: 'Communication protocols between AI agents',
        prerequisites: ['agents'],
        questions: [
          // Beginner Questions
          {
            id: 'a2a-b1',
            question: 'What is the purpose of Agent-to-Agent (A2A) communication?',
            options: [
              'To replace human communication',
              'To enable AI agents to coordinate and share information with each other',
              'To slow down agent processing',
              'To make agents identical'
            ],
            correctAnswer: 1,
            explanation: 'A2A communication enables AI agents to coordinate activities, share information, and work together effectively in multi-agent systems.',
            difficulty: 'beginner',
            category: 'core-concepts',
            subCategory: 'a2a-protocol',
            learningObjectives: ['Understand A2A communication purpose'],
            relatedConcepts: ['coordination', 'information-sharing', 'multi-agent-systems'],
            persona: ['business-leader', 'no-code-engineer'],
            timeEstimate: 30
          },
          {
            id: 'a2a-b2',
            question: 'In business terms, what advantage does A2A communication provide?',
            options: [
              'Reduces the need for human oversight',
              'Eliminates all business processes',
              'Enables seamless workflow automation across different AI systems',
              'Makes all agents work identically'
            ],
            correctAnswer: 2,
            explanation: 'A2A communication enables seamless workflow automation across different AI systems, allowing for more efficient and integrated business processes.',
            difficulty: 'beginner',
            category: 'core-concepts',
            subCategory: 'a2a-protocol',
            learningObjectives: ['Identify business benefits of A2A'],
            relatedConcepts: ['workflow-automation', 'system-integration', 'efficiency'],
            persona: ['business-leader'],
            timeEstimate: 35
          },
          // Intermediate Questions
          {
            id: 'a2a-i1',
            question: 'What are the key components of an A2A message?',
            options: [
              'Only the message content',
              'Sender ID, recipient ID, message type, content, and metadata',
              'Just the timestamp',
              'Only the sender information'
            ],
            correctAnswer: 1,
            explanation: 'A2A messages typically include sender ID, recipient ID, message type, content, and metadata such as timestamps, priority levels, and conversation context.',
            difficulty: 'intermediate',
            category: 'core-concepts',
            subCategory: 'a2a-protocol',
            learningObjectives: ['Understand A2A message structure'],
            relatedConcepts: ['message-structure', 'metadata', 'communication-protocol'],
            persona: ['agent-designer', 'agent-developer'],
            timeEstimate: 40
          },
          {
            id: 'a2a-i2',
            question: 'What is the role of message queues in A2A communication?',
            options: [
              'To delete messages automatically',
              'To ensure reliable message delivery and handle asynchronous communication',
              'To slow down message processing',
              'To encrypt all messages'
            ],
            correctAnswer: 1,
            explanation: 'Message queues ensure reliable message delivery and handle asynchronous communication, allowing agents to send messages even when recipients are temporarily unavailable.',
            difficulty: 'intermediate',
            category: 'core-concepts',
            subCategory: 'a2a-protocol',
            learningObjectives: ['Understand message queuing mechanisms'],
            relatedConcepts: ['message-queues', 'asynchronous-communication', 'reliability'],
            persona: ['agent-developer', 'ai-enthusiast'],
            timeEstimate: 45
          },
          // Advanced Questions
          {
            id: 'a2a-a1',
            question: 'How should A2A protocols handle message ordering and causality in distributed systems?',
            options: [
              'Messages should always arrive in the order they were sent',
              'Implement vector clocks or logical timestamps to maintain causal relationships',
              'Ignore message ordering completely',
              'Use only synchronous communication'
            ],
            correctAnswer: 1,
            explanation: 'In distributed systems, A2A protocols should implement vector clocks or logical timestamps to maintain causal relationships between messages, as physical ordering cannot be guaranteed.',
            difficulty: 'advanced',
            category: 'core-concepts',
            subCategory: 'a2a-protocol',
            learningObjectives: ['Design distributed A2A systems'],
            relatedConcepts: ['vector-clocks', 'causality', 'distributed-systems'],
            persona: ['ai-engineer', 'agent-architect'],
            timeEstimate: 55
          },
          {
            id: 'a2a-a2',
            question: 'What is the optimal strategy for handling A2A protocol versioning in production systems?',
            options: [
              'Always use the latest version only',
              'Implement backward compatibility with graceful degradation and version negotiation',
              'Never change protocol versions',
              'Use different protocols for each agent'
            ],
            correctAnswer: 1,
            explanation: 'Production A2A systems should implement backward compatibility with graceful degradation and version negotiation to ensure smooth transitions and system stability.',
            difficulty: 'advanced',
            category: 'core-concepts',
            subCategory: 'a2a-protocol',
            learningObjectives: ['Design versioning strategies'],
            relatedConcepts: ['protocol-versioning', 'backward-compatibility', 'system-stability'],
            persona: ['ai-engineer', 'agent-architect', 'ai-ops-engineer'],
            timeEstimate: 60
          }
        ]
      },
      {
        id: 'mcp',
        name: 'Model Context Protocol (MCP)',
        description: 'Protocol for efficient AI model interaction and context management',
        prerequisites: ['agents'],
        questions: [
          // Beginner Questions
          {
            id: 'mcp-b1',
            question: 'What is the Model Context Protocol (MCP) designed to solve?',
            options: [
              'Making AI models run faster',
              'Standardizing how AI models access and share contextual information',
              'Reducing AI model size',
              'Eliminating the need for training data'
            ],
            correctAnswer: 1,
            explanation: 'MCP is designed to standardize how AI models access and share contextual information, enabling more efficient and consistent interactions between models and applications.',
            difficulty: 'beginner',
            category: 'core-concepts',
            subCategory: 'mcp',
            learningObjectives: ['Understand MCP purpose'],
            relatedConcepts: ['context-management', 'standardization', 'model-interaction'],
            persona: ['business-leader', 'no-code-engineer'],
            timeEstimate: 30
          },
          {
            id: 'mcp-b2',
            question: 'What business benefit does MCP provide to organizations?',
            options: [
              'Eliminates the need for AI models',
              'Reduces integration complexity and improves AI application reliability',
              'Makes all AI models identical',
              'Removes the need for data'
            ],
            correctAnswer: 1,
            explanation: 'MCP reduces integration complexity and improves AI application reliability by providing a standardized way for different AI components to share context and information.',
            difficulty: 'beginner',
            category: 'core-concepts',
            subCategory: 'mcp',
            learningObjectives: ['Identify MCP business benefits'],
            relatedConcepts: ['integration', 'reliability', 'standardization'],
            persona: ['business-leader'],
            timeEstimate: 35
          },
          // Intermediate Questions
          {
            id: 'mcp-i1',
            question: 'What types of context can MCP manage?',
            options: [
              'Only text data',
              'Conversation history, tool definitions, schemas, and resource access',
              'Only images',
              'Only database connections'
            ],
            correctAnswer: 1,
            explanation: 'MCP can manage various types of context including conversation history, tool definitions, schemas, resource access permissions, and other metadata needed for AI model interactions.',
            difficulty: 'intermediate',
            category: 'core-concepts',
            subCategory: 'mcp',
            learningObjectives: ['Understand MCP context types'],
            relatedConcepts: ['context-types', 'conversation-history', 'tool-definitions'],
            persona: ['agent-designer', 'agent-developer'],
            timeEstimate: 40
          },
          {
            id: 'mcp-i2',
            question: 'How does MCP handle resource access and permissions?',
            options: [
              'It gives all models full access to everything',
              'It implements fine-grained access control with capability-based permissions',
              'It blocks all resource access',
              'It only works with public resources'
            ],
            correctAnswer: 1,
            explanation: 'MCP implements fine-grained access control with capability-based permissions, allowing precise control over what resources each model or agent can access.',
            difficulty: 'intermediate',
            category: 'core-concepts',
            subCategory: 'mcp',
            learningObjectives: ['Understand MCP security model'],
            relatedConcepts: ['access-control', 'permissions', 'security'],
            persona: ['agent-developer', 'ai-enthusiast'],
            timeEstimate: 45
          },
          // Advanced Questions
          {
            id: 'mcp-a1',
            question: 'What are the key architectural considerations for implementing MCP in a distributed system?',
            options: [
              'Using a single central server for all context',
              'Implementing distributed context synchronization with eventual consistency',
              'Storing all context in memory only',
              'Avoiding any context sharing'
            ],
            correctAnswer: 1,
            explanation: 'In distributed systems, MCP implementation requires distributed context synchronization with eventual consistency to ensure context coherence across different nodes while maintaining performance.',
            difficulty: 'advanced',
            category: 'core-concepts',
            subCategory: 'mcp',
            learningObjectives: ['Design distributed MCP systems'],
            relatedConcepts: ['distributed-systems', 'eventual-consistency', 'context-synchronization'],
            persona: ['ai-engineer', 'agent-architect'],
            timeEstimate: 55
          },
          {
            id: 'mcp-a2',
            question: 'How should MCP implementations handle context versioning and migration?',
            options: [
              'Never change context formats',
              'Implement semantic versioning with backward-compatible transformations',
              'Always use the newest format only',
              'Store multiple copies of all context'
            ],
            correctAnswer: 1,
            explanation: 'MCP implementations should use semantic versioning with backward-compatible transformations to handle context evolution while maintaining compatibility with existing systems.',
            difficulty: 'advanced',
            category: 'core-concepts',
            subCategory: 'mcp',
            learningObjectives: ['Design context versioning strategies'],
            relatedConcepts: ['semantic-versioning', 'context-migration', 'backward-compatibility'],
            persona: ['ai-engineer', 'agent-architect', 'ai-ops-engineer'],
            timeEstimate: 60
          }
        ]
      },
      {
        id: 'acp',
        name: 'Agent Communication Protocol (ACP)',
        description: 'Standardized communication protocol for AI agent interactions',
        prerequisites: ['agents', 'a2a-protocol'],
        questions: [
          // Beginner Questions
          {
            id: 'acp-b1',
            question: 'What is the Agent Communication Protocol (ACP)?',
            options: [
              'A protocol for human-agent communication only',
              'A standardized protocol for AI agents to communicate with each other and external systems',
              'A database protocol',
              'A network security protocol'
            ],
            correctAnswer: 1,
            explanation: 'ACP is a standardized protocol that enables AI agents to communicate effectively with each other and with external systems, providing a common language for agent interactions.',
            difficulty: 'beginner',
            category: 'core-concepts',
            subCategory: 'acp',
            learningObjectives: ['Define ACP'],
            relatedConcepts: ['standardization', 'communication-protocol', 'interoperability'],
            persona: ['business-leader', 'no-code-engineer'],
            timeEstimate: 30
          },
          {
            id: 'acp-b2',
            question: 'Why is a standardized communication protocol important for AI agents?',
            options: [
              'To make all agents identical',
              'To enable interoperability between different agent systems and vendors',
              'To slow down communication',
              'To eliminate the need for agents'
            ],
            correctAnswer: 1,
            explanation: 'A standardized communication protocol like ACP enables interoperability between different agent systems and vendors, preventing vendor lock-in and enabling ecosystem growth.',
            difficulty: 'beginner',
            category: 'core-concepts',
            subCategory: 'acp',
            learningObjectives: ['Understand ACP importance'],
            relatedConcepts: ['interoperability', 'vendor-independence', 'ecosystem'],
            persona: ['business-leader'],
            timeEstimate: 35
          },
          // Intermediate Questions
          {
            id: 'acp-i1',
            question: 'What are the key layers of the ACP protocol stack?',
            options: [
              'Only the message layer',
              'Transport, message, content, and interaction layers',
              'Only the transport layer',
              'Just the content layer'
            ],
            correctAnswer: 1,
            explanation: 'ACP typically includes transport layer (message delivery), message layer (structure), content layer (semantics), and interaction layer (conversation patterns).',
            difficulty: 'intermediate',
            category: 'core-concepts',
            subCategory: 'acp',
            learningObjectives: ['Understand ACP architecture'],
            relatedConcepts: ['protocol-stack', 'layered-architecture', 'separation-of-concerns'],
            persona: ['agent-designer', 'agent-developer'],
            timeEstimate: 40
          },
          {
            id: 'acp-i2',
            question: 'How does ACP handle different message types and conversation patterns?',
            options: [
              'It only supports one message type',
              'It defines message ontologies and conversation protocols for different interaction patterns',
              'It converts all messages to text',
              'It ignores message types'
            ],
            correctAnswer: 1,
            explanation: 'ACP defines message ontologies and conversation protocols to handle different interaction patterns like request-response, negotiation, and coordination.',
            difficulty: 'intermediate',
            category: 'core-concepts',
            subCategory: 'acp',
            learningObjectives: ['Understand ACP message types'],
            relatedConcepts: ['message-ontologies', 'conversation-protocols', 'interaction-patterns'],
            persona: ['agent-developer', 'ai-enthusiast'],
            timeEstimate: 45
          },
          // Advanced Questions
          {
            id: 'acp-a1',
            question: 'What are the key challenges in implementing ACP for large-scale multi-agent systems?',
            options: [
              'Making all agents use the same hardware',
              'Managing protocol complexity, ensuring scalability, and maintaining semantic consistency',
              'Eliminating all communication',
              'Using only synchronous communication'
            ],
            correctAnswer: 1,
            explanation: 'Large-scale ACP implementations face challenges in managing protocol complexity, ensuring scalability across many agents, and maintaining semantic consistency in communications.',
            difficulty: 'advanced',
            category: 'core-concepts',
            subCategory: 'acp',
            learningObjectives: ['Design scalable ACP systems'],
            relatedConcepts: ['scalability', 'protocol-complexity', 'semantic-consistency'],
            persona: ['ai-engineer', 'agent-architect'],
            timeEstimate: 55
          },
          {
            id: 'acp-a2',
            question: 'How should ACP implementations handle security and trust in open agent environments?',
            options: [
              'Trust all agents completely',
              'Implement cryptographic signatures, capability-based access control, and reputation systems',
              'Block all external agents',
              'Use only private networks'
            ],
            correctAnswer: 1,
            explanation: 'ACP security requires cryptographic signatures for message authenticity, capability-based access control for permissions, and reputation systems for trust management.',
            difficulty: 'advanced',
            category: 'core-concepts',
            subCategory: 'acp',
            learningObjectives: ['Design secure ACP systems'],
            relatedConcepts: ['cryptographic-signatures', 'capability-based-security', 'reputation-systems'],
            persona: ['ai-engineer', 'agent-architect', 'ai-ops-engineer'],
            timeEstimate: 60
          }
        ]
      }
    ]
  },
  {
    id: 'agent-patterns',
    name: 'Agent Patterns',
    description: 'Common patterns and architectures for AI agent implementation',
    icon: 'PuzzlePiece',
    totalQuestions: 40,
    estimatedTime: 22,
    subCategories: [
      {
        id: 'react-pattern',
        name: 'ReAct Pattern',
        description: 'Reasoning and Acting pattern for AI agents',
        prerequisites: ['agents'],
        questions: [
          // Beginner Questions
          {
            id: 'react-b1',
            question: 'What does "ReAct" stand for in AI agent patterns?',
            options: [
              'React to Actions',
              'Reason and Act',
              'Reactive Actions',
              'Real Actions'
            ],
            correctAnswer: 1,
            explanation: 'ReAct stands for "Reason and Act" - it\'s a pattern where agents alternate between reasoning about their situation and taking actions based on that reasoning.',
            difficulty: 'beginner',
            category: 'agent-patterns',
            subCategory: 'react-pattern',
            learningObjectives: ['Define ReAct pattern'],
            relatedConcepts: ['reasoning', 'action', 'thought-process'],
            persona: ['business-leader', 'no-code-engineer'],
            timeEstimate: 30
          },
          {
            id: 'react-b2',
            question: 'What is the main business advantage of the ReAct pattern?',
            options: [
              'It makes agents work faster',
              'It eliminates all errors',
              'It provides transparent decision-making that can be audited and understood',
              'It works without any training'
            ],
            correctAnswer: 2,
            explanation: 'The ReAct pattern provides transparent decision-making by explicitly showing the reasoning process, making it easier to audit, understand, and trust agent decisions.',
            difficulty: 'beginner',
            category: 'agent-patterns',
            subCategory: 'react-pattern',
            learningObjectives: ['Understand ReAct business benefits'],
            relatedConcepts: ['transparency', 'auditability', 'trust'],
            persona: ['business-leader'],
            timeEstimate: 35
          },
          // Intermediate Questions
          {
            id: 'react-i1',
            question: 'In the ReAct pattern, what is the typical sequence of operations?',
            options: [
              'Action → Thought → Observation',
              'Thought → Action → Observation',
              'Observation → Action → Thought',
              'Only actions, no thoughts'
            ],
            correctAnswer: 1,
            explanation: 'The ReAct pattern follows: Thought (reasoning about current state) → Action (taking a step) → Observation (seeing the result), then repeating this cycle.',
            difficulty: 'intermediate',
            category: 'agent-patterns',
            subCategory: 'react-pattern',
            learningObjectives: ['Understand ReAct sequence'],
            relatedConcepts: ['thought-action-observation', 'iterative-process', 'feedback-loop'],
            persona: ['agent-designer', 'agent-developer'],
            timeEstimate: 40
          },
          {
            id: 'react-i2',
            question: 'When should you use the ReAct pattern versus other agent patterns?',
            options: [
              'Always use ReAct for every task',
              'Use ReAct when you need explicit reasoning traces and step-by-step problem solving',
              'Never use ReAct',
              'Only use ReAct for simple tasks'
            ],
            correctAnswer: 1,
            explanation: 'ReAct is best used when you need explicit reasoning traces, step-by-step problem solving, or when decisions need to be explainable and auditable.',
            difficulty: 'intermediate',
            category: 'agent-patterns',
            subCategory: 'react-pattern',
            learningObjectives: ['Know when to use ReAct'],
            relatedConcepts: ['pattern-selection', 'use-cases', 'explainability'],
            persona: ['agent-designer', 'agent-developer', 'ai-enthusiast'],
            timeEstimate: 45
          },
          // Advanced Questions
          {
            id: 'react-a1',
            question: 'What are the main challenges in implementing ReAct for complex multi-step tasks?',
            options: [
              'There are no challenges',
              'Managing reasoning chain length, handling reasoning errors, and preventing infinite loops',
              'It works perfectly for all tasks',
              'Only the speed of execution'
            ],
            correctAnswer: 1,
            explanation: 'Complex ReAct implementations face challenges in managing reasoning chain length, handling reasoning errors gracefully, and preventing infinite loops in the thought-action cycle.',
            difficulty: 'advanced',
            category: 'agent-patterns',
            subCategory: 'react-pattern',
            learningObjectives: ['Understand ReAct implementation challenges'],
            relatedConcepts: ['chain-length-management', 'error-handling', 'loop-prevention'],
            persona: ['ai-engineer', 'agent-architect'],
            timeEstimate: 55
          },
          {
            id: 'react-a2',
            question: 'How can ReAct be optimized for production environments with latency constraints?',
            options: [
              'Remove all reasoning steps',
              'Implement reasoning caching, parallel action execution, and adaptive reasoning depth',
              'Use only simple actions',
              'Avoid production use'
            ],
            correctAnswer: 1,
            explanation: 'Production ReAct optimization includes reasoning caching for common patterns, parallel action execution where possible, and adaptive reasoning depth based on task complexity.',
            difficulty: 'advanced',
            category: 'agent-patterns',
            subCategory: 'react-pattern',
            learningObjectives: ['Optimize ReAct for production'],
            relatedConcepts: ['performance-optimization', 'caching', 'parallel-execution'],
            persona: ['ai-engineer', 'agent-architect', 'ai-ops-engineer'],
            timeEstimate: 60
          }
        ]
      },
      {
        id: 'self-reflection',
        name: 'Self-Reflection Pattern',
        description: 'Pattern for agents to evaluate and improve their own performance',
        prerequisites: ['agents', 'react-pattern'],
        questions: [
          // Beginner Questions
          {
            id: 'reflection-b1',
            question: 'What is the self-reflection pattern in AI agents?',
            options: [
              'Agents looking at mirrors',
              'Agents evaluating their own performance and learning from mistakes',
              'Agents copying other agents',
              'Agents working alone'
            ],
            correctAnswer: 1,
            explanation: 'The self-reflection pattern involves agents evaluating their own performance, identifying mistakes or areas for improvement, and adjusting their behavior accordingly.',
            difficulty: 'beginner',
            category: 'agent-patterns',
            subCategory: 'self-reflection',
            learningObjectives: ['Define self-reflection pattern'],
            relatedConcepts: ['self-evaluation', 'performance-improvement', 'learning'],
            persona: ['business-leader', 'no-code-engineer'],
            timeEstimate: 30
          },
          {
            id: 'reflection-b2',
            question: 'What business value does self-reflection provide to AI agents?',
            options: [
              'Makes agents more expensive',
              'Enables continuous improvement and reduces the need for manual corrections',
              'Slows down agent performance',
              'Makes agents more complex to use'
            ],
            correctAnswer: 1,
            explanation: 'Self-reflection enables continuous improvement in agent performance and reduces the need for manual corrections, leading to more autonomous and reliable systems.',
            difficulty: 'beginner',
            category: 'agent-patterns',
            subCategory: 'self-reflection',
            learningObjectives: ['Understand self-reflection business value'],
            relatedConcepts: ['continuous-improvement', 'autonomy', 'reliability'],
            persona: ['business-leader'],
            timeEstimate: 35
          },
          // Intermediate Questions
          {
            id: 'reflection-i1',
            question: 'What are the key components of the self-reflection cycle?',
            options: [
              'Only action execution',
              'Action execution, outcome evaluation, learning extraction, and strategy adjustment',
              'Only outcome evaluation',
              'Just strategy adjustment'
            ],
            correctAnswer: 1,
            explanation: 'The self-reflection cycle includes: executing actions, evaluating outcomes, extracting learnings from successes and failures, and adjusting strategies for future actions.',
            difficulty: 'intermediate',
            category: 'agent-patterns',
            subCategory: 'self-reflection',
            learningObjectives: ['Understand reflection cycle components'],
            relatedConcepts: ['reflection-cycle', 'outcome-evaluation', 'strategy-adjustment'],
            persona: ['agent-designer', 'agent-developer'],
            timeEstimate: 40
          },
          {
            id: 'reflection-i2',
            question: 'How does self-reflection integrate with other agent patterns like ReAct?',
            options: [
              'It replaces all other patterns',
              'It adds a meta-cognitive layer that evaluates the reasoning and actions of other patterns',
              'It cannot be used with other patterns',
              'It only works in isolation'
            ],
            correctAnswer: 1,
            explanation: 'Self-reflection adds a meta-cognitive layer that can evaluate the reasoning and actions of other patterns like ReAct, providing feedback for improvement.',
            difficulty: 'intermediate',
            category: 'agent-patterns',
            subCategory: 'self-reflection',
            learningObjectives: ['Understand pattern integration'],
            relatedConcepts: ['meta-cognition', 'pattern-composition', 'feedback-loops'],
            persona: ['agent-designer', 'agent-developer', 'ai-enthusiast'],
            timeEstimate: 45
          },
          // Additional Intermediate Questions for Better Coverage
          {
            id: 'reflection-i3',
            question: 'How would you implement a self-reflection mechanism for an AI agent in a production environment?',
            options: [
              'Use simple if-else statements to check outputs',
              'Implement a feedback loop with performance metrics, error tracking, and automated adjustment mechanisms',
              'Have humans manually review every action',
              'Use random sampling to check results'
            ],
            correctAnswer: 1,
            explanation: 'Production self-reflection requires systematic feedback loops with performance metrics, error tracking, and automated adjustment mechanisms to enable continuous improvement.',
            difficulty: 'intermediate',
            category: 'agent-patterns',
            subCategory: 'self-reflection',
            learningObjectives: ['Implement self-reflection in production'],
            relatedConcepts: ['feedback-loops', 'performance-metrics', 'error-tracking', 'automation'],
            persona: ['agent-developer', 'ai-engineer', 'ai-ops-engineer'],
            timeEstimate: 45,
            codeExample: `
class SelfReflectingAgent:
    def __init__(self):
        self.performance_metrics = {}
        self.error_log = []
        self.adjustment_thresholds = {'accuracy': 0.8, 'response_time': 2.0}
    
    def reflect_on_performance(self):
        current_metrics = self.calculate_metrics()
        if current_metrics['accuracy'] < self.adjustment_thresholds['accuracy']:
            self.adjust_strategy('accuracy')
        if current_metrics['response_time'] > self.adjustment_thresholds['response_time']:
            self.adjust_strategy('speed')
    
    def adjust_strategy(self, metric):
        # Implement adjustment logic based on metric
        pass
            `
          },
          {
            id: 'reflection-i4',
            question: 'What design patterns can be combined with self-reflection for maximum effectiveness?',
            options: [
              'Only observer pattern',
              'Strategy pattern for adaptive behavior, Chain of Responsibility for error handling, and Observer for monitoring',
              'Just singleton pattern',
              'Template method pattern only'
            ],
            correctAnswer: 1,
            explanation: 'Effective self-reflection combines multiple patterns: Strategy for adaptive behavior, Chain of Responsibility for error handling, and Observer for real-time monitoring.',
            difficulty: 'intermediate',
            category: 'agent-patterns',
            subCategory: 'self-reflection',
            learningObjectives: ['Combine design patterns with self-reflection'],
            relatedConcepts: ['design-patterns', 'strategy-pattern', 'observer-pattern', 'chain-of-responsibility'],
            persona: ['agent-architect', 'agent-developer', 'ai-engineer'],
            timeEstimate: 50
          },
          // Advanced Questions
          {
            id: 'reflection-a1',
            question: 'What are the main challenges in implementing effective self-reflection systems?',
            options: [
              'There are no challenges',
              'Avoiding over-reflection, ensuring objective self-evaluation, and preventing reflection loops',
              'Only computational cost',
              'Just memory usage'
            ],
            correctAnswer: 1,
            explanation: 'Effective self-reflection systems must avoid over-reflection (analysis paralysis), ensure objective self-evaluation, and prevent infinite reflection loops while maintaining performance.',
            difficulty: 'advanced',
            category: 'agent-patterns',
            subCategory: 'self-reflection',
            learningObjectives: ['Understand reflection implementation challenges'],
            relatedConcepts: ['over-reflection', 'objective-evaluation', 'reflection-loops'],
            persona: ['ai-engineer', 'agent-architect'],
            timeEstimate: 55
          },
          {
            id: 'reflection-a2',
            question: 'How should self-reflection systems handle conflicting feedback and learning signals?',
            options: [
              'Ignore all feedback',
              'Implement weighted feedback integration with confidence scoring and temporal decay',
              'Use only the latest feedback',
              'Average all feedback equally'
            ],
            correctAnswer: 1,
            explanation: 'Advanced self-reflection systems should implement weighted feedback integration, considering confidence scores, source reliability, and temporal decay to handle conflicting signals.',
            difficulty: 'advanced',
            category: 'agent-patterns',
            subCategory: 'self-reflection',
            learningObjectives: ['Design advanced reflection systems'],
            relatedConcepts: ['weighted-feedback', 'confidence-scoring', 'temporal-decay'],
            persona: ['ai-engineer', 'agent-architect', 'ai-ops-engineer'],
            timeEstimate: 60
          }
        ]
      }
    ]
  },
  {
    id: 'azure-services',
    name: 'Azure AI Services',
    description: 'Microsoft Azure AI services and their integration with agent systems',
    icon: 'StackSimple',
    totalQuestions: 35,
    estimatedTime: 20,
    subCategories: [
      {
        id: 'azure-openai',
        name: 'Azure OpenAI',
        description: 'Azure OpenAI service and its capabilities',
        prerequisites: ['agents'],
        questions: [
          // Beginner Questions
          {
            id: 'aoai-b1',
            question: 'What is Azure OpenAI Service?',
            options: [
              'A database service',
              'Microsoft\'s cloud-based service providing access to OpenAI models with enterprise security',
              'A web hosting service',
              'A backup service'
            ],
            correctAnswer: 1,
            explanation: 'Azure OpenAI Service is Microsoft\'s cloud-based service that provides access to OpenAI models like GPT-4 with enterprise-grade security, compliance, and regional availability.',
            difficulty: 'beginner',
            category: 'azure-services',
            subCategory: 'azure-openai',
            learningObjectives: ['Define Azure OpenAI Service'],
            relatedConcepts: ['cloud-services', 'enterprise-security', 'compliance'],
            persona: ['business-leader', 'no-code-engineer'],
            timeEstimate: 30
          },
          {
            id: 'aoai-b2',
            question: 'What are the main business benefits of using Azure OpenAI versus direct OpenAI API?',
            options: [
              'It\'s always cheaper',
              'It\'s faster',
              'It has more models',
              'Enterprise security, compliance, data residency, and integration with Azure ecosystem'
            ],
            correctAnswer: 3,
            explanation: 'Azure OpenAI provides enterprise security, compliance certifications, data residency options, and seamless integration with the Azure ecosystem, making it suitable for enterprise use.',
            difficulty: 'beginner',
            category: 'azure-services',
            subCategory: 'azure-openai',
            learningObjectives: ['Understand Azure OpenAI business benefits'],
            relatedConcepts: ['enterprise-security', 'compliance', 'data-residency'],
            persona: ['business-leader'],
            timeEstimate: 35
          },
          // Intermediate Questions
          {
            id: 'aoai-i1',
            question: 'How do you integrate Azure OpenAI with AI agent systems?',
            options: [
              'It cannot be integrated',
              'Through REST APIs, SDKs, and Azure services like Functions or Logic Apps',
              'Only through manual processes',
              'Only through third-party tools'
            ],
            correctAnswer: 1,
            explanation: 'Azure OpenAI integrates with AI agent systems through REST APIs, official SDKs, and Azure services like Functions, Logic Apps, or Container Apps for scalable deployments.',
            difficulty: 'intermediate',
            category: 'azure-services',
            subCategory: 'azure-openai',
            learningObjectives: ['Understand Azure OpenAI integration'],
            relatedConcepts: ['REST-APIs', 'SDKs', 'Azure-services'],
            persona: ['agent-designer', 'agent-developer'],
            timeEstimate: 40
          },
          {
            id: 'aoai-i2',
            question: 'What are the key considerations for scaling Azure OpenAI in production agent systems?',
            options: [
              'Only cost',
              'Rate limits, token usage, model selection, and deployment strategies',
              'Only speed',
              'Only availability'
            ],
            correctAnswer: 1,
            explanation: 'Production scaling requires managing rate limits, monitoring token usage, selecting appropriate models for different tasks, and implementing deployment strategies for reliability.',
            difficulty: 'intermediate',
            category: 'azure-services',
            subCategory: 'azure-openai',
            learningObjectives: ['Understand scaling considerations'],
            relatedConcepts: ['rate-limits', 'token-usage', 'model-selection'],
            persona: ['agent-developer', 'ai-enthusiast'],
            timeEstimate: 45
          },
          // Advanced Questions
          {
            id: 'aoai-a1',
            question: 'How should you implement content filtering and safety measures for Azure OpenAI in agent systems?',
            options: [
              'No filtering is needed',
              'Implement multi-layered filtering with custom content policies, prompt injection detection, and output validation',
              'Use only Azure\'s default filters',
              'Block all content'
            ],
            correctAnswer: 1,
            explanation: 'Production agent systems should implement multi-layered content filtering including custom policies, prompt injection detection, output validation, and monitoring for safety.',
            difficulty: 'advanced',
            category: 'azure-services',
            subCategory: 'azure-openai',
            learningObjectives: ['Design safety measures'],
            relatedConcepts: ['content-filtering', 'prompt-injection', 'output-validation'],
            persona: ['ai-engineer', 'agent-architect'],
            timeEstimate: 55
          },
          {
            id: 'aoai-a2',
            question: 'What are the best practices for managing Azure OpenAI costs in high-volume agent deployments?',
            options: [
              'Use unlimited resources',
              'Implement token optimization, model right-sizing, caching strategies, and usage monitoring',
              'Only use free tiers',
              'Avoid monitoring'
            ],
            correctAnswer: 1,
            explanation: 'Cost management requires token optimization, choosing right-sized models, implementing caching for common responses, and comprehensive usage monitoring and alerting.',
            difficulty: 'advanced',
            category: 'azure-services',
            subCategory: 'azure-openai',
            learningObjectives: ['Optimize costs'],
            relatedConcepts: ['token-optimization', 'model-right-sizing', 'caching-strategies'],
            persona: ['ai-engineer', 'agent-architect', 'ai-ops-engineer'],
            timeEstimate: 60
          }
        ]
      }
    ]
  }
];

// Utility functions for quiz management
export const getQuizzesByPersona = (persona: string, difficulty?: 'beginner' | 'intermediate' | 'advanced') => {
  const allQuestions: QuizQuestion[] = [];
  
  quizCategories.forEach(category => {
    category.subCategories.forEach(subCategory => {
      subCategory.questions.forEach(question => {
        if (question.persona.includes(persona)) {
          if (!difficulty || question.difficulty === difficulty) {
            allQuestions.push(question);
          }
        }
      });
    });
  });
  
  return allQuestions;
};

export const getQuizzesByCategory = (categoryId: string, difficulty?: 'beginner' | 'intermediate' | 'advanced') => {
  const category = quizCategories.find(c => c.id === categoryId);
  if (!category) return [];
  
  const allQuestions: QuizQuestion[] = [];
  category.subCategories.forEach(subCategory => {
    subCategory.questions.forEach(question => {
      if (!difficulty || question.difficulty === difficulty) {
        allQuestions.push(question);
      }
    });
  });
  
  return allQuestions;
};

export const generateAdaptiveQuiz = (persona: string, focusAreas: string[], difficulty: 'beginner' | 'intermediate' | 'advanced', questionCount: number = 10) => {
  const allQuestions = getQuizzesByPersona(persona, difficulty);
  
  // Score questions based on relevance to focus areas
  const scoredQuestions = allQuestions.map(question => ({
    ...question,
    relevanceScore: question.relatedConcepts.filter(concept => 
      focusAreas.some(area => concept.toLowerCase().includes(area.toLowerCase()))
    ).length
  }));
  
  // Sort by relevance and select top questions
  scoredQuestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return scoredQuestions.slice(0, questionCount);
};

export const calculateQuizScore = (session: QuizSession): number => {
  const totalQuestions = session.questions.length;
  
  // console.log('=== QUIZ SCORING DEBUG ===');
  // console.log('Total questions:', totalQuestions);
  // console.log('Session answers:', session.answers);
  // console.log('Questions:', session.questions.map(q => ({ id: q.id, correctAnswer: q.correctAnswer })));
  
  const correctAnswers = session.questions.filter(question => {
    const selectedAnswer = session.answers[question.id];
    // Ensure both values are numbers for comparison
    const selectedAnswerNum = typeof selectedAnswer === 'string' ? parseInt(selectedAnswer) : selectedAnswer;
    const isCorrect = selectedAnswerNum === question.correctAnswer;
    
    // Debug logging
    // console.log('Scoring question:', {
    //   questionId: question.id,
    //   selectedAnswer,
    //   selectedAnswerNum,
    //   correctAnswer: question.correctAnswer,
    //   isCorrect,
    //   question: question.question.substring(0, 50) + '...',
    //   hasAnswer: selectedAnswer !== undefined && selectedAnswer !== null
    // });
    
    return isCorrect;
  }).length;
  
  // console.log('Quiz score calculation:', {
  //   totalQuestions,
  //   correctAnswers,
  //   percentage: Math.round((correctAnswers / totalQuestions) * 100)
  // });
  // console.log('=== END QUIZ SCORING DEBUG ===');
  
  return Math.round((correctAnswers / totalQuestions) * 100);
};

export const generateQuizFeedback = (session: QuizSession): QuizFeedback[] => {
  return session.questions.map(question => {
    const selectedAnswer = session.answers[question.id];
    // Ensure both values are numbers for comparison
    const selectedAnswerNum = typeof selectedAnswer === 'string' ? parseInt(selectedAnswer) : selectedAnswer;
    const isCorrect = selectedAnswerNum === question.correctAnswer;
    
    // Debug logging
    // console.log('Feedback generation:', {
    //   questionId: question.id,
    //   selectedAnswer,
    //   selectedAnswerNum,
    //   correctAnswer: question.correctAnswer,
    //   isCorrect,
    //   selectedAnswerType: typeof selectedAnswer,
    //   correctAnswerType: typeof question.correctAnswer
    // });
    
    return {
      questionId: question.id,
      isCorrect,
      selectedAnswer: selectedAnswerNum,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      improvementSuggestions: isCorrect ? [] : [
        `Review the ${question.subCategory} concepts`,
        `Practice with ${question.relatedConcepts.join(', ')} topics`,
        `Consider exploring the ${question.category} section in more detail`
      ]
    };
  });
};

// Business-focused advanced questions
const businessAdvancedQuestions = [
  {
    id: 'business-strategy-a1',
    question: 'What ROI metrics should be tracked when implementing AI agent solutions at enterprise scale?',
    options: [
      'Only cost reduction',
      'Cost reduction, productivity gains, error reduction, customer satisfaction improvement, and time-to-market acceleration',
      'Just employee satisfaction',
      'Only revenue increase'
    ],
    correctAnswer: 1,
    explanation: 'Enterprise AI agent ROI should track multiple metrics: cost reduction, productivity gains, error reduction, customer satisfaction improvement, and time-to-market acceleration for comprehensive value assessment.',
    difficulty: 'advanced',
    category: 'business-strategy',
    subCategory: 'enterprise-implementation',
    learningObjectives: ['Measure AI agent business value'],
    relatedConcepts: ['roi-metrics', 'enterprise-scale', 'productivity-gains', 'customer-satisfaction'],
    persona: ['business-leader', 'ai-ops-engineer'],
    timeEstimate: 55
  },
  {
    id: 'business-strategy-a2',
    question: 'How should organizations approach AI agent governance and risk management?',
    options: [
      'No governance needed',
      'Implement AI ethics committees, establish clear accountability frameworks, monitor bias and fairness, and ensure regulatory compliance',
      'Let IT handle everything',
      'Only worry about technical performance'
    ],
    correctAnswer: 1,
    explanation: 'AI agent governance requires AI ethics committees, clear accountability frameworks, bias and fairness monitoring, and regulatory compliance to ensure responsible deployment.',
    difficulty: 'advanced',
    category: 'business-strategy',
    subCategory: 'governance',
    learningObjectives: ['Understand AI governance'],
    relatedConcepts: ['ai-ethics', 'accountability', 'bias-monitoring', 'regulatory-compliance'],
    persona: ['business-leader'],
    timeEstimate: 50
  }
];

// Designer-focused intermediate and advanced questions
const designerAdvancedQuestions = [
  {
    id: 'design-patterns-i1',
    question: 'What UX principles should guide conversational agent interface design?',
    options: [
      'Make it look like existing software',
      'Design for natural conversation flow, clear intent recognition, graceful error handling, and context preservation',
      'Use as many features as possible',
      'Copy other chatbots exactly'
    ],
    correctAnswer: 1,
    explanation: 'Conversational agent UX should prioritize natural conversation flow, clear intent recognition, graceful error handling, and context preservation for optimal user experience.',
    difficulty: 'intermediate',
    category: 'agent-design',
    subCategory: 'ux-patterns',
    learningObjectives: ['Apply UX principles to agent design'],
    relatedConcepts: ['conversation-flow', 'intent-recognition', 'error-handling', 'context-preservation'],
    persona: ['agent-designer', 'no-code-engineer'],
    timeEstimate: 45
  },
  {
    id: 'design-patterns-a1',
    question: 'How do you design agent workflows that adapt to different user expertise levels?',
    options: [
      'Use the same interface for everyone',
      'Implement progressive disclosure, adaptive complexity, contextual help, and personalized interaction patterns based on user proficiency',
      'Make everything as simple as possible',
      'Always use the most complex interface'
    ],
    correctAnswer: 1,
    explanation: 'Adaptive agent workflows require progressive disclosure, adaptive complexity, contextual help, and personalized interaction patterns that adjust based on user proficiency levels.',
    difficulty: 'advanced',
    category: 'agent-design',
    subCategory: 'adaptive-interfaces',
    learningObjectives: ['Design adaptive agent interfaces'],
    relatedConcepts: ['progressive-disclosure', 'adaptive-complexity', 'contextual-help', 'personalization'],
    persona: ['agent-designer', 'agent-developer'],
    timeEstimate: 55
  }
];

// Developer-focused advanced questions
const developerAdvancedQuestions = [
  {
    id: 'development-a1',
    question: 'What are the key architectural patterns for building resilient multi-agent systems?',
    options: [
      'Use only microservices',
      'Implement circuit breakers, bulkhead isolation, timeout patterns, retry with exponential backoff, and graceful degradation',
      'Just add more servers',
      'Use only monolithic architecture'
    ],
    correctAnswer: 1,
    explanation: 'Resilient multi-agent systems require circuit breakers, bulkhead isolation, timeout patterns, retry with exponential backoff, and graceful degradation to handle failures gracefully.',
    difficulty: 'advanced',
    category: 'agent-development',
    subCategory: 'resilience-patterns',
    learningObjectives: ['Implement resilient agent architectures'],
    relatedConcepts: ['circuit-breakers', 'bulkhead-isolation', 'timeout-patterns', 'exponential-backoff', 'graceful-degradation'],
    persona: ['agent-developer', 'ai-engineer', 'agent-architect'],
    timeEstimate: 60,
    codeExample: `
class ResilientAgentFramework:
    def __init__(self):
        self.circuit_breakers = {}
        self.timeout_config = {'default': 5000, 'critical': 10000}
        self.retry_config = {'max_attempts': 3, 'base_delay': 1000}
    
    async def execute_with_resilience(self, operation, service_name):
        circuit_breaker = self.get_circuit_breaker(service_name)
        
        if circuit_breaker.is_open():
            return await self.fallback_strategy(operation)
        
        try {
            result = await self.execute_with_timeout_and_retry(operation)
            circuit_breaker.record_success()
            return result
        } catch (Exception e) {
            circuit_breaker.record_failure()
            return await self.handle_failure(e, operation)
        }
    }
    
    async def execute_with_timeout_and_retry(self, operation):
        for attempt in range(self.retry_config['max_attempts']):
            try:
                timeout = self.timeout_config.get(operation.type, self.timeout_config['default'])
                return await asyncio.wait_for(operation.execute(), timeout=timeout/1000)
            except asyncio.TimeoutError:
                if attempt == self.retry_config['max_attempts'] - 1:
                    raise
                delay = self.retry_config['base_delay'] * (2 ** attempt)
                await asyncio.sleep(delay / 1000)
    `
  },
  {
    id: 'development-a2',
    question: 'How do you implement proper observability in distributed agent systems?',
    options: [
      'Just use logs',
      'Implement distributed tracing, structured logging, metrics collection, health checks, and correlation IDs across all agent interactions',
      'Use only monitoring dashboards',
      'Observability is not needed'
    ],
    correctAnswer: 1,
    explanation: 'Proper observability in distributed agent systems requires distributed tracing, structured logging, metrics collection, health checks, and correlation IDs to track interactions across the system.',
    difficulty: 'advanced',
    category: 'agent-development',
    subCategory: 'observability',
    learningObjectives: ['Implement agent system observability'],
    relatedConcepts: ['distributed-tracing', 'structured-logging', 'metrics-collection', 'health-checks', 'correlation-ids'],
    persona: ['agent-developer', 'ai-engineer', 'ai-ops-engineer'],
    timeEstimate: 55
  }
];

// Add these questions to the main categories
quizCategories.forEach(category => {
  if (category.id === 'business-strategy') {
    if (!category.subCategories.find(sub => sub.id === 'enterprise-implementation')) {
      category.subCategories.push({
        id: 'enterprise-implementation',
        name: 'Enterprise Implementation',
        description: 'Strategies for implementing AI agents at enterprise scale',
        questions: businessAdvancedQuestions
      });
    }
  }
  
  if (category.id === 'agent-design') {
    if (!category.subCategories.find(sub => sub.id === 'ux-patterns')) {
      category.subCategories.push({
        id: 'ux-patterns',
        name: 'UX Design Patterns',
        description: 'User experience patterns for agent interfaces',
        questions: designerAdvancedQuestions.filter(q => q.category === 'agent-design')
      });
    }
  }
  
  if (category.id === 'agent-development') {
    if (!category.subCategories.find(sub => sub.id === 'resilience-patterns')) {
      category.subCategories.push({
        id: 'resilience-patterns',
        name: 'Resilience Patterns',
        description: 'Patterns for building resilient agent systems',
        questions: developerAdvancedQuestions.filter(q => q.category === 'agent-development')
      });
    }
  }
});
