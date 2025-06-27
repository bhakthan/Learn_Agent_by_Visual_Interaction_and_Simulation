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
  azureServices: {
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
            title: "Azure AI Overview",
            url: "https://learn.microsoft.com/azure/ai-services/",
            description: "Official Microsoft documentation on Azure AI Services"
          },
          {
            title: "Azure AI Studio",
            url: "https://learn.microsoft.com/azure/ai-studio/",
            description: "Create, evaluate and deploy AI solutions"
          },
          {
            title: "Azure OpenAI Service Overview",
            url: "https://learn.microsoft.com/azure/ai-services/openai/overview",
            description: "Overview of Azure OpenAI Service capabilities"
          },
          {
            title: "Azure AI Services Playground",
            url: "https://learn.microsoft.com/azure/ai-services/openai/tools-playground",
            description: "Interactive playground to test Azure AI capabilities"
          }
        ]
      },
      {
        id: "tutorials",
        name: "Tutorials & Guides",
        references: [
          {
            title: "Getting Started with Azure OpenAI",
            url: "https://learn.microsoft.com/azure/ai-services/openai/getting-started",
            description: "Step-by-step guide to getting started with Azure OpenAI"
          },
          {
            title: "Azure AI Agent Tutorials",
            url: "https://github.com/Azure/azure-openai-samples",
            description: "Sample tutorials for Azure AI agents"
          },
          {
            title: "Azure OpenAI Cookbook",
            url: "https://github.com/Azure/OpenAI-Cookbook",
            description: "Collection of guidance for using Azure OpenAI"
          }
        ]
      },
      {
        id: "sdk",
        name: "SDKs & Libraries",
        references: [
          {
            title: "Azure SDK for JavaScript",
            url: "https://github.com/Azure/azure-sdk-for-js",
            description: "Official Azure SDK for JavaScript"
          },
          {
            title: "Azure SDK for Python",
            url: "https://github.com/Azure/azure-sdk-for-python",
            description: "Official Azure SDK for Python"
          },
          {
            title: "TypeScript Azure OpenAI SDK",
            url: "https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/openai/openai",
            description: "Azure OpenAI TypeScript SDK"
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
          },
          {
            title: "Azure AI Agent Framework Documentation",
            url: "https://learn.microsoft.com/azure/ai-studio/concepts/agents-guides",
            description: "Introduction to Azure AI Agent Framework"
          },
          {
            title: "Multi-Agent Systems in Azure",
            url: "https://techcommunity.microsoft.com/t5/ai-cognitive-services-blog/introduction-to-azure-openai/ba-p/3767406",
            description: "Technical overview of multi-agent systems in Azure"
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
          },
          {
            title: "Azure OpenAI Samples Repository",
            url: "https://github.com/Azure/azure-openai-samples",
            description: "Sample projects for Azure OpenAI"
          },
          {
            title: "Multi-agent Collaboration Samples",
            url: "https://github.com/Azure-Samples/openai-python-samples/tree/main/advanced-patterns",
            description: "Advanced multi-agent pattern samples"
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
          },
          {
            title: "Setting Up Azure OpenAI",
            url: "https://learn.microsoft.com/azure/ai-services/openai/how-to/create-resource",
            description: "Guide to setting up Azure OpenAI resources"
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
          },
          {
            title: "Azure OpenAI Jupyter Notebooks",
            url: "https://github.com/Azure/azure-openai-samples/tree/main/notebooks",
            description: "Collection of Azure OpenAI Jupyter notebooks"
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
          },
          {
            title: "Azure AI Model Context Documentation",
            url: "https://learn.microsoft.com/azure/ai-studio/concepts/model-context",
            description: "Documentation on model context in Azure AI"
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
          },
          {
            title: "Azure AI Context Management Samples",
            url: "https://github.com/Azure-Samples/openai-python-samples/tree/main/context-management",
            description: "Samples for context management in Azure AI"
          }
        ]
      },
      {
        id: "tutorials",
        name: "Tutorials & Guides",
        references: [
          {
            title: "Context Management Best Practices",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/context-management",
            description: "Guide to managing context in Azure AI applications"
          }
        ]
      }
    ],
    
    // Agent Communication Protocol (ACP) concept
    acp: [
      {
        id: "documentation",
        name: "Official Documentation",
        references: [
          {
            title: "ACP Official Documentation",
            url: "https://agentcommunicationprotocol.dev/",
            description: "Official documentation for the Agent Communication Protocol"
          },
          {
            title: "ACP Introduction",
            url: "https://agentcommunicationprotocol.dev/introduction",
            description: "Introduction to the Agent Communication Protocol"
          },
          {
            title: "ACP Specification",
            url: "https://agentcommunicationprotocol.dev/specification",
            description: "Technical specification for the ACP standard"
          }
        ]
      },
      {
        id: "quickstart",
        name: "Quickstart & Examples",
        references: [
          {
            title: "ACP Quickstart Guide",
            url: "https://agentcommunicationprotocol.dev/introduction/quickstart",
            description: "Getting started quickly with ACP implementation"
          },
          {
            title: "Example Agents",
            url: "https://agentcommunicationprotocol.dev/introduction/example-agents",
            description: "Sample agents implementing the ACP standard"
          }
        ]
      },
      {
        id: "deployments",
        name: "Deployment Patterns",
        references: [
          {
            title: "Single-Agent Deployment",
            url: "https://agentcommunicationprotocol.dev/patterns/single-agent",
            description: "Documentation for simple single-agent ACP deployments"
          },
          {
            title: "Multi-Agent Server Deployment",
            url: "https://agentcommunicationprotocol.dev/patterns/multi-agent",
            description: "Setting up multi-agent systems with ACP"
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
          },
          {
            title: "Azure AI Router Implementation",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/advanced-prompt-engineering",
            description: "Implementation guidance for router patterns"
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
          },
          {
            title: "Router Pattern in Azure",
            url: "https://github.com/Azure-Samples/openai-python-samples/tree/main/patterns/router",
            description: "Python implementation of router pattern"
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
          },
          {
            title: "Self-Improvement in LLMs",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/self-critique",
            description: "Concepts for implementing self-reflection in Azure AI"
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
          },
          {
            title: "Self-Reflection Improves LLM Performance",
            url: "https://arxiv.org/abs/2310.02207",
            description: "Research on effectiveness of self-reflection"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Reflexion Implementation",
            url: "https://github.com/noahshinn/reflexion",
            description: "Reference implementation of the Reflexion pattern"
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
          },
          {
            title: "Planning with Azure AI",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/task-planning",
            description: "Task planning implementation in Azure AI"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Planning with Azure OpenAI",
            url: "https://github.com/Azure-Samples/openai-python-samples/tree/main/patterns/planners",
            description: "Sample code for implementing planners in Azure OpenAI"
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
          },
          {
            title: "Azure AI Evaluation Tools",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/evaluation",
            description: "Tools for evaluating and optimizing Azure AI solutions"
          }
        ]
      },
      {
        id: "sdk",
        name: "SDKs & Tools",
        references: [
          {
            title: "Azure AI Evaluation SDK",
            url: "https://github.com/Azure/azureai-evaluation",
            description: "SDK for evaluating AI models in Azure"
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
          },
          {
            title: "Azure AI Orchestration Guide",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/agent-orchestration",
            description: "Guide to orchestrating multiple agents in Azure"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Orchestrator Pattern Examples",
            url: "https://github.com/Azure-Samples/openai-python-samples/tree/main/patterns/orchestrator",
            description: "Sample implementations of orchestrator patterns"
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
          },
          {
            title: "Azure AI Reasoning and Action",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/reasoning",
            description: "Implementation of reasoning and action in Azure AI"
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
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "ReAct Pattern Implementation",
            url: "https://github.com/Azure-Samples/openai-python-samples/tree/main/patterns/react",
            description: "Azure implementation examples of ReAct pattern"
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
          },
          {
            title: "Azure AI Code Generation",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/code-generation",
            description: "Guide to code generation with Azure AI"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "CodeAct Implementation Examples",
            url: "https://github.com/Azure-Samples/openai-python-samples/tree/main/code-generation",
            description: "Implementation examples for CodeAct pattern"
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
          },
          {
            title: "Azure AI Self-Critique Framework",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/self-critique",
            description: "Framework for self-reflection in Azure AI"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Self-Reflection Implementation",
            url: "https://github.com/Azure-Samples/openai-python-samples/tree/main/patterns/self-critique",
            description: "Sample implementations of self-reflection pattern"
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
          },
          {
            title: "Azure AI RAG Implementation",
            url: "https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview",
            description: "Overview of RAG implementation in Azure"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Agentic RAG Examples",
            url: "https://github.com/Azure-Samples/azure-search-openai-demo",
            description: "End-to-end RAG sample implementation"
          },
          {
            title: "Azure Vector Search with RAG",
            url: "https://github.com/Azure-Samples/azure-vector-search-openai-demo",
            description: "Vector search with Azure OpenAI and RAG"
          }
        ]
      }
    ],
    "computer-using-agent": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Computer Using Agent (CUA) Overview",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/cua",
            description: "Official documentation on Computer Using Agents"
          },
          {
            title: "Browser Automation with AI",
            url: "https://learn.microsoft.com/azure/ai-studio/how-to/browser-automation",
            description: "Guide for AI-powered browser automation"
          }
        ]
      },
      {
        id: "papers",
        name: "Research Papers",
        references: [
          {
            title: "Generative Agents: Interactive Simulacra of Human Behavior",
            url: "https://arxiv.org/abs/2304.03442",
            description: "Research on generative agents using computers"
          },
          {
            title: "WebGPT: Browser-assisted question-answering",
            url: "https://openai.com/research/webgpt",
            description: "Research on browser-based agents"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Azure CUA Implementation Examples",
            url: "https://github.com/Azure-Samples/azure-cua-samples",
            description: "Sample code for Computer Using Agents"
          }
        ]
      }
    ],
    "deep-researcher": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Deep Researcher Agent Pattern",
            url: "https://learn.microsoft.com/azure/ai-services/patterns/researcher",
            description: "Official documentation on Deep Researcher agents"
          },
          {
            title: "Azure AI for Research",
            url: "https://learn.microsoft.com/azure/ai-studio/concepts/research-agents",
            description: "Overview of research capabilities in Azure AI"
          }
        ]
      },
      {
        id: "papers",
        name: "Research Papers",
        references: [
          {
            title: "Large Language Models as Research Agents",
            url: "https://arxiv.org/abs/2310.05663",
            description: "Research on using LLMs for deep research tasks"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Azure Research Agent Implementations",
            url: "https://github.com/Azure-Samples/azure-search-openai-demo/tree/main/research",
            description: "Research agent implementation examples"
          }
        ]
      }
    ],
    "voice-agent": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Azure AI Voice Agents",
            url: "https://learn.microsoft.com/azure/ai-services/speech-service/voice-assistants",
            description: "Official documentation on Voice Agents in Azure"
          },
          {
            title: "Azure Neural Voice",
            url: "https://learn.microsoft.com/azure/ai-services/speech-service/text-to-speech",
            description: "Overview of Azure's neural voice capabilities"
          }
        ]
      },
      {
        id: "sdk",
        name: "SDKs & APIs",
        references: [
          {
            title: "Azure Speech SDK",
            url: "https://learn.microsoft.com/azure/ai-services/speech-service/speech-sdk",
            description: "SDK for voice integration in applications"
          },
          {
            title: "Speech-to-Text REST API",
            url: "https://learn.microsoft.com/azure/ai-services/speech-service/rest-speech-to-text",
            description: "REST API for speech recognition"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Voice Assistant Samples",
            url: "https://github.com/Azure-Samples/cognitive-services-speech-sdk/tree/master/quickstart",
            description: "Quick start samples for voice assistants"
          },
          {
            title: "Custom Voice Assistant",
            url: "https://github.com/Azure-Samples/Cognitive-Services-Voice-Assistant",
            description: "Examples of custom voice assistants built on Azure"
          }
        ]
      }
    ]
  },
  
  // Azure Services section
  azureServices: {
    "azure-openai": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Azure OpenAI Service Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/openai/",
            description: "Official documentation for Azure OpenAI Service"
          },
          {
            title: "Azure OpenAI Models",
            url: "https://learn.microsoft.com/azure/ai-services/openai/concepts/models",
            description: "Overview of available models in Azure OpenAI"
          }
        ]
      },
      {
        id: "sdk",
        name: "SDKs & APIs",
        references: [
          {
            title: "Azure OpenAI REST API Reference",
            url: "https://learn.microsoft.com/azure/ai-services/openai/reference",
            description: "REST API reference for Azure OpenAI"
          },
          {
            title: "Azure OpenAI SDK for JavaScript",
            url: "https://learn.microsoft.com/javascript/api/@azure/openai",
            description: "JavaScript SDK documentation"
          },
          {
            title: "Azure OpenAI SDK for Python",
            url: "https://learn.microsoft.com/python/api/overview/azure/ai.openai-readme",
            description: "Python SDK documentation"
          }
        ]
      }
    ],
    
    "azure-ai-foundry": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Azure AI Foundry Overview",
            url: "https://learn.microsoft.com/azure/ai-studio/",
            description: "Overview of Azure AI Foundry"
          }
        ]
      }
    ],
    
    "azure-ai-studio": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Azure AI Studio Documentation",
            url: "https://learn.microsoft.com/azure/ai-studio/",
            description: "Official documentation for Azure AI Studio"
          },
          {
            title: "Azure AI Studio Tutorials",
            url: "https://learn.microsoft.com/azure/ai-studio/tutorials/",
            description: "Step-by-step tutorials for Azure AI Studio"
          }
        ]
      }
    ],
    
    "azure-ai-search": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Azure AI Search Documentation",
            url: "https://learn.microsoft.com/azure/search/",
            description: "Official documentation for Azure AI Search"
          },
          {
            title: "Vector Search in Azure AI Search",
            url: "https://learn.microsoft.com/azure/search/vector-search-overview",
            description: "Guide to vector search capabilities"
          }
        ]
      },
      {
        id: "samples",
        name: "Code Samples",
        references: [
          {
            title: "Azure AI Search Samples",
            url: "https://github.com/Azure-Samples/azure-search-openai-demo",
            description: "Sample implementation of Azure AI Search with OpenAI"
          }
        ]
      }
    ],
    
    "azure-ai-evaluation": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Azure AI Evaluation Documentation",
            url: "https://learn.microsoft.com/azure/ai-studio/how-to/evaluation",
            description: "Guide to evaluating AI models in Azure"
          }
        ]
      },
      {
        id: "sdk",
        name: "SDKs & Tools",
        references: [
          {
            title: "Azure AI Evaluation SDK",
            url: "https://github.com/Azure/azureai-evaluation",
            description: "SDK for evaluating AI models in Azure"
          }
        ]
      }
    ],
    
    "azure-ai-inference": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Azure AI Inference SDK Documentation",
            url: "https://learn.microsoft.com/en-us/python/api/overview/azure/ai-inference-readme?view=azure-python-preview",
            description: "Official SDK documentation for Azure AI Inference"
          },
          {
            title: "Azure AI Inference Guide",
            url: "https://learn.microsoft.com/azure/ai-services/openai/how-to/inference",
            description: "Guide to inference optimization in Azure AI"
          }
        ]
      }
    ],
    
    "azure-ai-content-safety": [
      {
        id: "documentation",
        name: "Documentation",
        references: [
          {
            title: "Azure AI Content Safety Documentation",
            url: "https://learn.microsoft.com/azure/ai-services/content-safety/",
            description: "Official documentation for Azure AI Content Safety"
          },
          {
            title: "Content Safety Overview",
            url: "https://learn.microsoft.com/azure/ai-services/content-safety/overview",
            description: "Overview of Content Safety capabilities"
          }
        ]
      },
      {
        id: "sdk",
        name: "SDKs & API",
        references: [
          {
            title: "Content Safety SDK for JavaScript",
            url: "https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/contentsafety/ai-content-safety",
            description: "JavaScript SDK for Content Safety"
          },
          {
            title: "Content Safety REST API",
            url: "https://learn.microsoft.com/rest/api/contentsafety/",
            description: "REST API reference for Content Safety"
          }
        ]
      }
    ]
  }
};