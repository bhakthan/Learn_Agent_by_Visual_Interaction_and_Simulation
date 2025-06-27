export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: "prompt-engineering",
    name: "Prompt Engineering",
    description: "Techniques for crafting effective prompts for different tasks",
    icon: "Lightbulb"
  },
  {
    id: "function-calling",
    name: "Function Calling",
    description: "Using function calling to enhance model capabilities",
    icon: "Function"
  },
  {
    id: "rag",
    name: "Retrieval Augmented Generation",
    description: "Combining external data sources with LLMs",
    icon: "Database"
  },
  {
    id: "fine-tuning",
    name: "Fine-Tuning",
    description: "Customizing models for specific use cases",
    icon: "Sliders"
  },
  {
    id: "assistants",
    name: "Assistants API",
    description: "Building AI assistants with persistent memory",
    icon: "Robot"
  },
  {
    id: "embeddings",
    name: "Embeddings",
    description: "Working with vector representations of content",
    icon: "Graph"
  },
  {
    id: "tools-integrations",
    name: "Tools & Integrations",
    description: "Connecting OpenAI with other services and tools",
    icon: "Plugs"
  },
  {
    id: "moderation",
    name: "Moderation",
    description: "Content filtering and safety measures",
    icon: "ShieldCheck"
  }
];