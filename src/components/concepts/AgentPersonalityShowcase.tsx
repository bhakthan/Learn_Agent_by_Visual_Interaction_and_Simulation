import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from '@/components/theme/ThemeProvider';
import { Brain, Code, MagnifyingGlass, Lightbulb, Calculator, FileText, Users, Lightning } from '@phosphor-icons/react';

interface AgentPersonality {
  id: string;
  name: string;
  role: string;
  personality: string;
  specialties: string[];
  avatar: React.ReactNode;
  color: string;
  description: string;
  tools: string[];
  communicationStyle: string;
  catchphrase: string;
}

interface ThinkingBubble {
  id: string;
  agentId: string;
  thought: string;
  x: number;
  y: number;
  duration: number;
}

const AgentPersonalityShowcase: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [thinkingBubbles, setThinkingBubbles] = useState<ThinkingBubble[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const colors = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#d1d5db',
    text: isDarkMode ? '#f9fafb' : '#111827',
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    secondary: isDarkMode ? '#6b7280' : '#6b7280',
    accent: isDarkMode ? '#10b981' : '#059669',
    success: isDarkMode ? '#22c55e' : '#16a34a',
    warning: isDarkMode ? '#f59e0b' : '#d97706',
    error: isDarkMode ? '#ef4444' : '#dc2626'
  };

  const agentPersonalities: AgentPersonality[] = [
    {
      id: 'react-detective',
      name: 'ReactBot',
      role: 'Problem-Solving Detective',
      personality: 'Methodical and curious',
      specialties: ['Reasoning', 'Action Planning', 'Tool Usage'],
      avatar: <MagnifyingGlass size={32} className="text-blue-500" />,
      color: '#3b82f6',
      description: 'I methodically reason through problems, gathering clues and taking actions to solve mysteries step by step.',
      tools: ['Web Search', 'Calculator', 'Knowledge Base'],
      communicationStyle: 'Systematic and thorough',
      catchphrase: '🔍 "Let me think through this step by step..."'
    },
    {
      id: 'codeact-programmer',
      name: 'CodeCraft',
      role: 'Coding Wizard',
      personality: 'Creative and pragmatic',
      specialties: ['Python Coding', 'Algorithm Design', 'Data Analysis'],
      avatar: <Code size={32} className="text-green-500" />,
      color: '#10b981',
      description: 'I write and execute code to solve complex problems, creating custom solutions for unique challenges.',
      tools: ['Python Environment', 'Code Editor', 'Debug Tools'],
      communicationStyle: 'Technical and precise',
      catchphrase: '💻 "Let me code up a solution for that!"'
    },
    {
      id: 'reflection-philosopher',
      name: 'ReflectBot',
      role: 'Thoughtful Philosopher',
      personality: 'Introspective and wise',
      specialties: ['Self-Critique', 'Quality Improvement', 'Deep Analysis'],
      avatar: <Brain size={32} className="text-purple-500" />,
      color: '#8b5cf6',
      description: 'I carefully examine my own thoughts and outputs, constantly seeking to improve and refine my responses.',
      tools: ['Self-Analysis', 'Quality Metrics', 'Feedback Loops'],
      communicationStyle: 'Thoughtful and reflective',
      catchphrase: '🤔 "Hmm, let me reconsider this from another angle..."'
    },
    {
      id: 'rag-librarian',
      name: 'KnowledgeKeeper',
      role: 'Expert Librarian',
      personality: 'Knowledgeable and thorough',
      specialties: ['Information Retrieval', 'Source Verification', 'Knowledge Synthesis'],
      avatar: <FileText size={32} className="text-orange-500" />,
      color: '#f59e0b',
      description: 'I excel at finding relevant information from vast knowledge bases and synthesizing it into coherent answers.',
      tools: ['Vector Search', 'Document Store', 'Citation System'],
      communicationStyle: 'Authoritative and well-sourced',
      catchphrase: '📚 "I found some excellent sources on this topic..."'
    },
    {
      id: 'tool-engineer',
      name: 'ToolMaster',
      role: 'Integration Engineer',
      personality: 'Efficient and reliable',
      specialties: ['API Integration', 'Tool Orchestration', 'System Connectivity'],
      avatar: <Lightning size={32} className="text-yellow-500" />,
      color: '#eab308',
      description: 'I seamlessly integrate with various tools and services to provide comprehensive solutions.',
      tools: ['MCP Protocol', 'REST APIs', 'Service Mesh'],
      communicationStyle: 'Direct and efficient',
      catchphrase: '⚡ "I can connect you with the right tools for this!"'
    },
    {
      id: 'coordinator-manager',
      name: 'OrchestrAgent',
      role: 'Team Coordinator',
      personality: 'Organized and diplomatic',
      specialties: ['Task Delegation', 'Team Coordination', 'Resource Management'],
      avatar: <Users size={32} className="text-pink-500" />,
      color: '#ec4899',
      description: 'I coordinate between multiple agents, ensuring smooth collaboration and efficient task completion.',
      tools: ['Agent Registry', 'Task Queue', 'Communication Hub'],
      communicationStyle: 'Collaborative and organized',
      catchphrase: '👥 "Let me coordinate the team for the best result!"'
    }
  ];

  const agentThoughts = {
    'react-detective': [
      "I need to gather more evidence...",
      "Let me search for additional clues",
      "This pattern suggests...",
      "I should verify this with another source",
      "The facts point to this conclusion"
    ],
    'codeact-programmer': [
      "I'll write a function for this...",
      "Let me debug this algorithm",
      "Time to refactor this code",
      "I need to import some libraries",
      "This requires a clever solution"
    ],
    'reflection-philosopher': [
      "Is this the best approach?",
      "Let me examine this more carefully",
      "I should consider other perspectives",
      "This could be improved by...",
      "What are the implications here?"
    ],
    'rag-librarian': [
      "Searching knowledge base...",
      "Cross-referencing sources...",
      "Found relevant documentation",
      "Verifying information accuracy",
      "Synthesizing multiple sources"
    ],
    'tool-engineer': [
      "Connecting to external API...",
      "Optimizing tool chain...",
      "Checking service availability",
      "Routing through best path",
      "Ensuring secure connection"
    ],
    'coordinator-manager': [
      "Assigning tasks to specialists",
      "Monitoring team progress",
      "Balancing workload efficiently",
      "Facilitating communication",
      "Ensuring quality outcomes"
    ]
  };

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const randomAgent = agentPersonalities[Math.floor(Math.random() * agentPersonalities.length)];
      const thoughts = agentThoughts[randomAgent.id];
      const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
      
      const newBubble: ThinkingBubble = {
        id: `bubble-${Date.now()}`,
        agentId: randomAgent.id,
        thought: randomThought,
        x: Math.random() * 400,
        y: Math.random() * 200,
        duration: 3000
      };
      
      setThinkingBubbles(prev => [...prev, newBubble]);
      
      // Remove bubble after duration
      setTimeout(() => {
        setThinkingBubbles(prev => prev.filter(b => b.id !== newBubble.id));
      }, newBubble.duration);
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(selectedAgent === agentId ? null : agentId);
  };

  const selectedAgentData = selectedAgent ? agentPersonalities.find(a => a.id === selectedAgent) : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb size={24} className="text-primary" />
          Agent Personality Showcase
        </CardTitle>
        <CardDescription>
          Meet the different agent personalities, each with unique specialties and communication styles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsSimulating(!isSimulating)}
              variant={isSimulating ? "default" : "outline"}
            >
              {isSimulating ? 'Stop Simulation' : 'Start Thinking Simulation'}
            </Button>
            <Badge variant="outline">
              Click agents to learn more about their personalities
            </Badge>
          </div>

          {/* Agent Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentPersonalities.map((agent) => (
              <Card 
                key={agent.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedAgent === agent.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleAgentClick(agent.id)}
                style={{ borderColor: selectedAgent === agent.id ? agent.color : undefined }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-full"
                      style={{ backgroundColor: `${agent.color}20` }}
                    >
                      {agent.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription className="text-sm">{agent.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{agent.personality}</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs italic" style={{ color: agent.color }}>
                      {agent.catchphrase}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Thinking Bubbles Visualization */}
          {isSimulating && (
            <div className="relative h-64 border rounded-lg overflow-hidden" style={{ backgroundColor: colors.background }}>
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <span className="text-sm">Agent Thinking Simulation</span>
              </div>
              {thinkingBubbles.map((bubble) => {
                const agent = agentPersonalities.find(a => a.id === bubble.agentId);
                return (
                  <div
                    key={bubble.id}
                    className="absolute animate-bounce"
                    style={{
                      left: `${bubble.x}px`,
                      top: `${bubble.y}px`,
                      animationDuration: '2s'
                    }}
                  >
                    <div 
                      className="px-3 py-2 rounded-lg text-xs text-white shadow-lg max-w-xs"
                      style={{ backgroundColor: agent?.color }}
                    >
                      <div className="font-bold">{agent?.name}</div>
                      <div>{bubble.thought}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Agent Details */}
          {selectedAgentData && (
            <Card className="border-2" style={{ borderColor: selectedAgentData.color }}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-full"
                    style={{ backgroundColor: `${selectedAgentData.color}20` }}
                  >
                    {selectedAgentData.avatar}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedAgentData.name}</CardTitle>
                    <CardDescription className="text-lg">{selectedAgentData.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Personality</h4>
                    <p className="text-sm">{selectedAgentData.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Communication Style</h4>
                    <p className="text-sm italic">{selectedAgentData.communicationStyle}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgentData.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" style={{ borderColor: selectedAgentData.color }}>
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Preferred Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgentData.tools.map((tool, index) => (
                        <Badge key={index} variant="secondary">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${selectedAgentData.color}10` }}>
                    <h4 className="font-semibold mb-2">Signature Catchphrase</h4>
                    <p className="italic" style={{ color: selectedAgentData.color }}>
                      {selectedAgentData.catchphrase}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pattern Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agent Pattern Mapping</CardTitle>
              <CardDescription>
                How each personality corresponds to agent patterns in the codebase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-sm"><strong>ReactBot</strong> → ReAct Agent Pattern</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm"><strong>CodeCraft</strong> → CodeAct Agent Pattern</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-sm"><strong>ReflectBot</strong> → Self-Reflection Pattern</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span className="text-sm"><strong>KnowledgeKeeper</strong> → Agentic RAG Pattern</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-sm"><strong>ToolMaster</strong> → Modern Tool Use Pattern</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-pink-500"></div>
                    <span className="text-sm"><strong>OrchestrAgent</strong> → Agent-to-Agent Pattern</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentPersonalityShowcase;
