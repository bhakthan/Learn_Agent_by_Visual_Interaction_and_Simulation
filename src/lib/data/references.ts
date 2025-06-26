export type ReferenceItem = {
  title: string;
  url: string;
  description?: string;
};

export type ReferenceCategory = {
  id: string;
  name: string;
  references: ReferenceItem[];
};

export type ReferencesData = {
  concepts: {
    [key: string]: ReferenceCategory[]
  };
  patterns: {
    [key: string]: ReferenceCategory[]
  };
};

export const references: ReferencesData = {
  concepts: {
    // Core AI agents concept
    agents: [
      {
        id: "documentation",
        name: "Official Documentation",
        references: [
          {
            title: "Azure AI Agents Overview",
            url: "https://learn.microsoft.com/azure/ai-services/",
            description: "Official Microsoft documentation on Azure AI Agents"
          },
          {
            title: "Azure AI Studio",
            url: "https://learn.microsoft.com/azure/ai-studio/",
            description: "Create, evaluate and deploy AI solutions"
          }
        ]
      },
      {
        id: "tutorials",
        name: "Tutorials & Guides",
        references: [
          {
            title: "Getting Started with Azure AI Agents",
            url: "https://learn.microsoft.com/azure/ai-services/openai/",
            description: "Step-by-step guide to creating your first Azure AI agent"
          }
        ]
      }
    ],
    
    // Agent to Agent (A2A) concept
    a2a: [
      {
        id: "documentation",
        name: "Official Documentation",
        references: [
          {
            title: "A2A SDK documentation",
            url: "https://github.com/a2aproject/a2a-python",
            description: "Official documentation for the A2A SDK"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "A2A Samples",
            url: "https://github.com/a2aproject/a2a-samples/tree/main/samples",
            description: "Sample code for A2A projects"
          }
        ]
      },
      {
        id: "installation",
        name: "Installation & Setup",
        references: [
          {
            title: "Installing A2A SDK",
            url: "https://github.com/a2aproject/a2a-python",
            description: "Installation guide for the A2A SDK"
          }
        ]
      },
      {
        id: "notebooks",
        name: "Notebooks & Examples",
        references: [
          {
            title: "Quick Start notebooks",
            url: "https://github.com/a2aproject/a2a-samples/tree/main/notebooks",
            description: "Jupyter notebooks with A2A examples"
          }
        ]
      }
    ],
    
    // ModelContextProtocol (MCP) concept
    mcp: [
      {
        id: "documentation",
        name: "Official Documentation",
        references: [
          {
            title: "MCP Framework Overview",
            url: "https://learn.microsoft.com/azure/ai-services/",
            description: "Official documentation on the ModelContextProtocol"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "MCP Implementation Examples",
            url: "https://github.com/microsoft/MCP-examples",
            description: "Example implementations of the MCP"
          }
        ]
      }
    ]
  },
  
  patterns: {
    // Each pattern follows the pattern IDs from the existing code
    "routing": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Routing Pattern Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/routing",
            description: "Official documentation on the Routing pattern"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Routing Pattern Samples",
            url: "https://github.com/azure/ai-patterns/routing",
            description: "Sample implementations of the Routing pattern"
          }
        ]
      }
    ],
    
    "reflexion": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Reflexion Pattern Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/reflexion",
            description: "Official documentation on the Reflexion pattern"
          }
        ]
      },
      {
        id: "papers",
        name: "Research Papers",
        references: [
          {
            title: "Reflexion: Language Agents with Verbal Reinforcement Learning",
            url: "https://arxiv.org/abs/2303.11366",
            description: "Research paper on the Reflexion pattern"
          }
        ]
      }
    ],

    "plan-and-execute": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Plan-and-Execute Pattern Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/plan-execute",
            description: "Official documentation on the Plan-and-Execute pattern"
          }
        ]
      }
    ],
    
    "evaluator-optimizer": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Evaluator-Optimizer Pattern Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/evaluator",
            description: "Official documentation on the Evaluator-Optimizer pattern"
          }
        ]
      }
    ],
    
    "orchestrator-worker": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Orchestrator-Worker Pattern Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/orchestrator",
            description: "Official documentation on the Orchestrator-Worker pattern"
          }
        ]
      }
    ],
    
    "react": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "ReAct Pattern Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/react",
            description: "Official documentation on the ReAct pattern"
          }
        ]
      },
      {
        id: "papers",
        name: "Research Papers",
        references: [
          {
            title: "ReAct: Synergizing Reasoning and Acting in Language Models",
            url: "https://arxiv.org/abs/2210.03629",
            description: "Original research paper on the ReAct pattern"
          }
        ]
      }
    ],
    
    "codeact": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "CodeAct Pattern Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/codeact",
            description: "Official documentation on the CodeAct pattern"
          }
        ]
      }
    ],
    
    "self-reflection": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Self-Reflection Pattern Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/self-reflection",
            description: "Official documentation on the Self-Reflection pattern"
          }
        ]
      }
    ],
    
    "agentic-rag": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Agentic RAG Pattern Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/agentic-rag",
            description: "Official documentation on the Agentic RAG pattern"
          }
        ]
      }
    ]
  }
};