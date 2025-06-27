import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Books, FileText, Link as LinkIcon, MagnifyingGlass } from '@phosphor-icons/react';

export default function ReferencesSection() {
  const [activeTab, setActiveTab] = useState('documentation');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter references based on search query
  const filterReferences = (items: any[]) => {
    if (!searchQuery) return items;
    
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some((tag: string) => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">References</h1>
        <p className="text-muted-foreground">
          Essential documentation, articles, and resources for Azure AI agent development
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search references..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button variant="outline" size="icon">
          <MagnifyingGlass size={18} />
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <Books size={18} />
            <span>Documentation</span>
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText size={18} />
            <span>Articles & Tutorials</span>
          </TabsTrigger>
          <TabsTrigger value="githubRepos" className="flex items-center gap-2">
            <LinkIcon size={18} />
            <span>GitHub Repositories</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documentation" className="space-y-4">
          {filterReferences(documentationLinks).map((doc, index) => (
            <ReferenceCard key={index} {...doc} />
          ))}
        </TabsContent>
        
        <TabsContent value="articles" className="space-y-4">
          {filterReferences(articleLinks).map((article, index) => (
            <ReferenceCard key={index} {...article} />
          ))}
        </TabsContent>
        
        <TabsContent value="githubRepos" className="space-y-4">
          {filterReferences(githubRepos).map((repo, index) => (
            <ReferenceCard key={index} {...repo} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReferenceCard({
  title,
  description,
  url,
  tags = [],
  updated
}: {
  title: string;
  description: string;
  url: string;
  tags?: string[];
  updated: string;
}) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary flex items-start gap-2"
          >
            {title}
            <LinkIcon size={18} className="inline" />
          </a>
        </CardTitle>
        <CardDescription className="text-sm">
          Last updated: {updated}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <Badge key={idx} variant="outline">{tag}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Sample data for references
const documentationLinks = [
  {
    title: "Azure AI Overview",
    description: "Official documentation for Microsoft Azure AI services, capabilities, and integration patterns.",
    url: "https://learn.microsoft.com/azure/ai-services/",
    tags: ["Azure", "Documentation", "AI Services"],
    updated: "2023-10-15"
  },
  {
    title: "Agent Communication Protocol (ACP)",
    description: "Documentation for the Agent Communication Protocol, an open protocol for agent interoperability.",
    url: "https://agentcommunicationprotocol.dev/",
    tags: ["ACP", "Communication", "Protocol"],
    updated: "2023-09-22"
  },
  {
    title: "Model Context Protocol (MCP)",
    description: "Protocol for efficient AI model interactions and context management.",
    url: "https://modelcontextprotocol.io/",
    tags: ["MCP", "Protocol", "Context Management"],
    updated: "2023-08-30"
  },
  {
    title: "Azure OpenAI Service Documentation",
    description: "Comprehensive guide to Azure OpenAI Service, including API references and prompt engineering.",
    url: "https://learn.microsoft.com/azure/ai-services/openai/",
    tags: ["Azure OpenAI", "API", "Documentation"],
    updated: "2023-10-10"
  },
  {
    title: "Azure AI Search Documentation",
    description: "Official documentation for Azure AI Search, including vector search and semantic ranking features.",
    url: "https://learn.microsoft.com/azure/search/",
    tags: ["Azure AI Search", "Vector Search", "RAG"],
    updated: "2023-09-18"
  }
];

const articleLinks = [
  {
    title: "Building Multi-Agent Systems with Azure",
    description: "A comprehensive tutorial on designing and implementing multi-agent systems using Azure AI services.",
    url: "https://techcommunity.microsoft.com/t5/ai-cognitive-services-blog/building-multi-agent-systems-with-azure/ba-p/3976517",
    tags: ["Multi-Agent", "Tutorial", "Azure AI"],
    updated: "2023-09-05"
  },
  {
    title: "Implementing Retrieval-Augmented Generation (RAG)",
    description: "Step-by-step guide to implementing RAG patterns with Azure AI Search and Azure OpenAI.",
    url: "https://cookbook.openai.com/examples/how_to_build_a_rag_system",
    tags: ["RAG", "Azure OpenAI", "Azure AI Search"],
    updated: "2023-08-12"
  },
  {
    title: "Securing AI Agent Communications",
    description: "Best practices for implementing secure agent-to-agent communication in enterprise environments.",
    url: "https://learn.microsoft.com/security/ai-security/ai-security-overview",
    tags: ["Security", "A2A", "Enterprise"],
    updated: "2023-10-02"
  },
  {
    title: "Evaluating Agent Performance",
    description: "Methods and metrics for evaluating AI agent performance using Azure AI Evaluation SDK.",
    url: "https://learn.microsoft.com/python/api/overview/azure/ai-evaluation-readme",
    tags: ["Evaluation", "Metrics", "Testing"],
    updated: "2023-09-14"
  }
];

const githubRepos = [
  {
    title: "Azure OpenAI Samples",
    description: "Official Microsoft repository with code samples for Azure OpenAI Service implementation patterns.",
    url: "https://github.com/Azure/azure-openai-samples",
    tags: ["Azure OpenAI", "Samples", "Microsoft"],
    updated: "2023-10-08"
  },
  {
    title: "Agent Communication Protocol",
    description: "Reference implementation and examples for the Agent Communication Protocol (ACP).",
    url: "https://github.com/microsoft/autogen",
    tags: ["ACP", "Implementation", "Examples"],
    updated: "2023-09-20"
  },
  {
    title: "Model Context Protocol",
    description: "Official repository for Model Context Protocol (MCP) with implementation examples.",
    url: "https://github.com/microsoft/mcp",
    tags: ["MCP", "Protocol", "Samples"],
    updated: "2023-08-25"
  },
  {
    title: "Azure AI Inference SDK",
    description: "SDK for performing inference with Azure AI models, including examples and documentation.",
    url: "https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/ai/azure-ai-inference",
    tags: ["Inference", "SDK", "Python"],
    updated: "2023-10-05"
  },
  {
    title: "Azure AI Search JavaScript SDK",
    description: "JavaScript client library for Azure AI Search with examples for vector search implementation.",
    url: "https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/search/search-documents",
    tags: ["Azure AI Search", "JavaScript", "SDK"],
    updated: "2023-09-10"
  }
];