import { TutorialConfig } from "../hooks/useTutorial";

// Main app tutorial - shown on first visit
export const mainAppTutorial: TutorialConfig = {
  id: "main-app",
  name: "Welcome to Azure AI Agent Visualization",
  steps: [
    {
      id: "welcome",
      title: "Welcome!",
      content: "Welcome to Azure AI Agent Visualization. This interactive tool helps you understand Azure AI agents, patterns, and implementation concepts with visual demonstrations and code examples.",
      target: ".container h1", // Target the main heading
      placement: "bottom"
    },
    {
      id: "navigation",
      title: "Navigation",
      content: "Use these tabs to navigate between different sections of the app. Let's explore what each section offers.",
      target: ".container .flex.space-x-1",
      placement: "bottom"
    },
    {
      id: "core-concepts",
      title: "Core Concepts",
      content: "Learn fundamental concepts about AI agents, their communication protocols, and how they work together. Start here if you're new to Azure AI agents.",
      target: "a[href='/']",
      placement: "bottom"
    },
    {
      id: "agent-patterns",
      title: "Agent Patterns",
      content: "Explore different agent interaction patterns, view interactive visualizations, and see code examples for implementing these patterns.",
      target: "a[href='/patterns']",
      placement: "bottom"
    },
    {
      id: "azure-services",
      title: "Azure Services",
      content: "Discover Azure AI services that power agent capabilities and how to integrate them into your solutions.",
      target: "a[href='/azure-services']",
      placement: "bottom"
    },
    {
      id: "theme",
      title: "Theme Toggle",
      content: "You can switch between light and dark themes using this button.",
      target: ".flex.items-center.gap-2",
      placement: "bottom"
    },
    {
      id: "resources",
      title: "Resources",
      content: "Access additional resources like documentation, protocols, and sample code repositories.",
      target: ".NavigationMenuTrigger",
      placement: "bottom"
    },
    {
      id: "ending",
      title: "Let's Get Started!",
      content: "That's it for the quick tour. Feel free to explore on your own or restart this tutorial anytime using the tutorial button in the top right corner.",
      target: "main",
      placement: "center"
    }
  ]
};

// Agent Patterns tutorial
export const agentPatternsTutorial: TutorialConfig = {
  id: "agent-patterns",
  name: "Agent Patterns Tutorial",
  steps: [
    {
      id: "patterns-welcome",
      title: "Agent Patterns",
      content: "This section demonstrates various AI agent patterns and architectures. You'll see interactive visualizations and learn how to implement each pattern.",
      target: ".container h2, .container h1",
      placement: "bottom"
    },
    {
      id: "patterns-navigation",
      title: "Pattern Navigation",
      content: "Use this sidebar to navigate between different agent patterns. Each pattern has its own visualization and code examples.",
      target: ".sidebar, [data-sidebar], nav",
      placement: "right"
    },
    {
      id: "visualization-tab",
      title: "Visualization Tab",
      content: "The visualization tab shows an interactive diagram of the agent pattern. You can see how agents interact and communicate.",
      target: "[data-tab='visualization']",
      placement: "bottom"
    },
    {
      id: "implementation-tab",
      title: "Implementation Tab",
      content: "The implementation tab provides code examples and step-by-step guides for implementing the pattern in your own projects.",
      target: "[data-tab='implementation']",
      placement: "bottom"
    },
    {
      id: "interactive-demo",
      title: "Interactive Demo",
      content: "Try the interactive demonstration to see the pattern in action. You can control the flow and observe how agents process information.",
      target: ".flow-container, [data-flow]",
      placement: "top"
    },
    {
      id: "code-examples",
      title: "Code Examples",
      content: "Browse through code examples in different languages. You can copy the code and adapt it for your own projects.",
      target: "pre, code",
      placement: "top"
    }
  ]
};

// Concepts Explorer tutorial
export const conceptsExplorerTutorial: TutorialConfig = {
  id: "concepts-explorer",
  name: "Core Concepts Tutorial",
  steps: [
    {
      id: "concepts-welcome",
      title: "Core Concepts",
      content: "This section explains fundamental concepts related to AI agents, including communication protocols and interaction models.",
      target: ".container h2, .container h1",
      placement: "bottom"
    },
    {
      id: "concepts-tabs",
      title: "Topic Navigation",
      content: "Use these tabs to explore different AI agent concepts such as Agent-to-Agent communication, Model Context Protocol, and more.",
      target: ".TabsList, [role='tablist']",
      placement: "bottom"
    },
    {
      id: "concept-details",
      title: "Concept Details",
      content: "Each concept includes detailed explanations, diagrams, and practical applications to help you understand the fundamentals.",
      target: ".TabsContent, [data-state='active']",
      placement: "top"
    },
    {
      id: "concept-diagrams",
      title: "Visual Diagrams",
      content: "Interactive diagrams help visualize complex concepts. Hover over different elements to see more details.",
      target: "svg, .diagram, .visualization",
      placement: "bottom"
    }
  ]
};

// Code Playbook tutorial
export const codePlaybookTutorial: TutorialConfig = {
  id: "code-playbook",
  name: "Code Playbook Tutorial",
  steps: [
    {
      id: "playbook-welcome",
      title: "Code Playbook",
      content: "The Code Playbook provides detailed implementation guides and best practices for different agent patterns.",
      target: ".card h3, [data-section='code-playbook']",
      placement: "bottom"
    },
    {
      id: "playbook-tabs",
      title: "Code Categories",
      content: "Navigate through different implementation aspects like general setup, Azure AI services integration, and security practices.",
      target: "[role='tablist']",
      placement: "bottom"
    },
    {
      id: "code-step-by-step",
      title: "Step-by-Step Guide",
      content: "Follow the step-by-step guide to implement each pattern. The playbook breaks down complex implementations into manageable tasks.",
      target: ".steps, ol, [data-section='steps']",
      placement: "right"
    },
    {
      id: "code-visualization",
      title: "Code Visualization",
      content: "The code visualizer helps you understand the execution flow of the implementation, highlighting key steps and outcomes.",
      target: ".code-visualization, [data-section='visualizer']",
      placement: "top"
    },
    {
      id: "azure-services-tab",
      title: "Azure AI Services",
      content: "This tab shows how to integrate Azure AI services with the pattern, including service configurations and API usage.",
      target: "[data-tab='azure-services']",
      placement: "bottom"
    }
  ]
};