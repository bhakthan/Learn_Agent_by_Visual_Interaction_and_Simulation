import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from '@/components/theme/ThemeProvider';
import { Play, Pause, ArrowClockwise, Gear } from '@phosphor-icons/react';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  type: 'query' | 'response' | 'tool_call' | 'data' | 'protocol_handshake';
  timestamp: number;
  path: { x: number; y: number }[];
}

interface ComponentState {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'user' | 'agent' | 'mcp_server' | 'tool' | 'database' | 'api';
  status: 'idle' | 'processing' | 'responding' | 'error';
  description: string;
}

const AgentCommunicationPlayground: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [components, setComponents] = useState<ComponentState[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<'mcp' | 'a2a' | 'acp'>('mcp');

  const colors = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#d1d5db',
    text: isDarkMode ? '#f9fafb' : '#111827',
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    secondary: isDarkMode ? '#6b7280' : '#6b7280',
    accent: isDarkMode ? '#10b981' : '#059669',
    user: isDarkMode ? '#8b5cf6' : '#7c3aed',
    agent: isDarkMode ? '#06b6d4' : '#0891b2',
    tool: isDarkMode ? '#f59e0b' : '#d97706',
    data: isDarkMode ? '#ef4444' : '#dc2626',
    success: isDarkMode ? '#22c55e' : '#16a34a',
    warning: isDarkMode ? '#f59e0b' : '#d97706',
    error: isDarkMode ? '#ef4444' : '#dc2626'
  };

  // Define different scenarios based on your hand-drawn diagram
  const scenarios = {
    mcp: {
      title: "Model Context Protocol (MCP)",
      description: "Standardized communication between clients and MCP servers",
      components: [
        { id: 'user', label: 'User\n(Me)', x: 80, y: 220, width: 80, height: 60, type: 'user' as const, status: 'idle' as const, description: 'End user making requests' },
        { id: 'claude', label: 'Claude\nClient', x: 200, y: 140, width: 80, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'AI client using MCP' },
        { id: 'llm_app', label: 'LLM\nApplication', x: 200, y: 220, width: 80, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'LLM-powered application' },
        { id: 'ide', label: 'IDE\n(VS Code)', x: 200, y: 300, width: 80, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'Development environment' },
        { id: 'mcp_servers', label: 'MCP\nServers', x: 400, y: 220, width: 100, height: 100, type: 'mcp_server' as const, status: 'idle' as const, description: 'MCP protocol servers' },
        { id: 'local_files', label: 'Local\nFiles/\nLinux', x: 600, y: 140, width: 80, height: 60, type: 'database' as const, status: 'idle' as const, description: 'Local file system' },
        { id: 'database', label: 'Data\nBase', x: 600, y: 220, width: 80, height: 60, type: 'database' as const, status: 'idle' as const, description: 'Database storage' },
        { id: 'cloud_api', label: 'Cloud\nAPI\n(3rd Party)', x: 600, y: 300, width: 80, height: 60, type: 'api' as const, status: 'idle' as const, description: 'External cloud services' },
        { id: 'slack', label: 'Slack\nAPI', x: 720, y: 220, width: 80, height: 60, type: 'api' as const, status: 'idle' as const, description: 'Slack integration' }
      ],
      steps: [
        { from: 'user', to: 'claude', content: 'Query', type: 'query' as const, description: 'User sends query to Claude' },
        { from: 'claude', to: 'mcp_servers', content: 'MCP Request', type: 'protocol_handshake' as const, description: 'Claude makes MCP request' },
        { from: 'mcp_servers', to: 'local_files', content: 'File Access', type: 'tool_call' as const, description: 'MCP server accesses local files' },
        { from: 'local_files', to: 'mcp_servers', content: 'File Data', type: 'data' as const, description: 'Local files return data' },
        { from: 'mcp_servers', to: 'database', content: 'DB Query', type: 'tool_call' as const, description: 'MCP server queries database' },
        { from: 'database', to: 'mcp_servers', content: 'DB Results', type: 'data' as const, description: 'Database returns results' },
        { from: 'mcp_servers', to: 'cloud_api', content: 'API Call', type: 'tool_call' as const, description: 'MCP server calls external API' },
        { from: 'cloud_api', to: 'slack', content: 'Slack Request', type: 'tool_call' as const, description: 'Cloud API integrates with Slack' },
        { from: 'slack', to: 'cloud_api', content: 'Slack Response', type: 'data' as const, description: 'Slack returns data' },
        { from: 'cloud_api', to: 'mcp_servers', content: 'API Response', type: 'data' as const, description: 'Cloud API returns response' },
        { from: 'mcp_servers', to: 'claude', content: 'MCP Response', type: 'response' as const, description: 'MCP server responds to Claude' },
        { from: 'claude', to: 'user', content: 'Final Answer', type: 'response' as const, description: 'Claude provides final answer' }
      ]
    },
    a2a: {
      title: "Agent-to-Agent (A2A) Communication",
      description: "Direct communication between autonomous agents",
      components: [
        { id: 'user', label: 'User', x: 80, y: 220, width: 80, height: 60, type: 'user' as const, status: 'idle' as const, description: 'End user' },
        { id: 'coordinator', label: 'Coordinator\nAgent', x: 250, y: 220, width: 100, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'Orchestrates other agents' },
        { id: 'research', label: 'Research\nAgent', x: 450, y: 140, width: 80, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'Specialized for research' },
        { id: 'analysis', label: 'Analysis\nAgent', x: 450, y: 220, width: 80, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'Specialized for analysis' },
        { id: 'writing', label: 'Writing\nAgent', x: 450, y: 300, width: 80, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'Specialized for writing' },
        { id: 'web_search', label: 'Web Search\nAPI', x: 650, y: 140, width: 80, height: 60, type: 'tool' as const, status: 'idle' as const, description: 'Web search capability' },
        { id: 'knowledge_base', label: 'Knowledge\nBase', x: 650, y: 220, width: 80, height: 60, type: 'database' as const, status: 'idle' as const, description: 'Internal knowledge' },
        { id: 'document_store', label: 'Document\nStore', x: 650, y: 300, width: 80, height: 60, type: 'database' as const, status: 'idle' as const, description: 'Document storage' }
      ],
      steps: [
        { from: 'user', to: 'coordinator', content: 'Complex Query', type: 'query' as const, description: 'User sends complex query' },
        { from: 'coordinator', to: 'research', content: 'Research Task', type: 'tool_call' as const, description: 'Coordinator delegates research' },
        { from: 'research', to: 'web_search', content: 'Search Query', type: 'tool_call' as const, description: 'Research agent searches web' },
        { from: 'web_search', to: 'research', content: 'Search Results', type: 'data' as const, description: 'Web search returns results' },
        { from: 'research', to: 'coordinator', content: 'Research Results', type: 'response' as const, description: 'Research agent reports findings' },
        { from: 'coordinator', to: 'analysis', content: 'Analysis Task', type: 'tool_call' as const, description: 'Coordinator requests analysis' },
        { from: 'analysis', to: 'knowledge_base', content: 'KB Query', type: 'tool_call' as const, description: 'Analysis agent queries knowledge base' },
        { from: 'knowledge_base', to: 'analysis', content: 'KB Results', type: 'data' as const, description: 'Knowledge base returns data' },
        { from: 'analysis', to: 'coordinator', content: 'Analysis Results', type: 'response' as const, description: 'Analysis agent reports findings' },
        { from: 'coordinator', to: 'writing', content: 'Writing Task', type: 'tool_call' as const, description: 'Coordinator requests writing' },
        { from: 'writing', to: 'document_store', content: 'Template Query', type: 'tool_call' as const, description: 'Writing agent gets templates' },
        { from: 'document_store', to: 'writing', content: 'Templates', type: 'data' as const, description: 'Document store returns templates' },
        { from: 'writing', to: 'coordinator', content: 'Draft Content', type: 'response' as const, description: 'Writing agent provides draft' },
        { from: 'coordinator', to: 'user', content: 'Final Answer', type: 'response' as const, description: 'Coordinator provides final answer' }
      ]
    },
    acp: {
      title: "Agent Communication Protocol (ACP)",
      description: "Standardized RESTful API for agent interoperability",
      components: [
        { id: 'client_app', label: 'Client\nApplication', x: 80, y: 220, width: 80, height: 60, type: 'user' as const, status: 'idle' as const, description: 'Client application' },
        { id: 'acp_gateway', label: 'ACP\nGateway', x: 250, y: 220, width: 100, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'ACP protocol gateway' },
        { id: 'agent_registry', label: 'Agent\nRegistry', x: 450, y: 140, width: 80, height: 60, type: 'database' as const, status: 'idle' as const, description: 'Agent discovery service' },
        { id: 'agent_a', label: 'Agent A\n(Python)', x: 450, y: 220, width: 80, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'Python-based agent' },
        { id: 'agent_b', label: 'Agent B\n(Node.js)', x: 450, y: 300, width: 80, height: 60, type: 'agent' as const, status: 'idle' as const, description: 'Node.js-based agent' },
        { id: 'load_balancer', label: 'Load\nBalancer', x: 650, y: 220, width: 80, height: 60, type: 'tool' as const, status: 'idle' as const, description: 'Load balancing' },
        { id: 'monitoring', label: 'Monitoring\n& Logging', x: 650, y: 140, width: 80, height: 60, type: 'tool' as const, status: 'idle' as const, description: 'System monitoring' },
        { id: 'metrics', label: 'Metrics\nDB', x: 650, y: 300, width: 80, height: 60, type: 'database' as const, status: 'idle' as const, description: 'Metrics storage' }
      ],
      steps: [
        { from: 'client_app', to: 'acp_gateway', content: 'HTTP Request', type: 'query' as const, description: 'Client makes HTTP request' },
        { from: 'acp_gateway', to: 'agent_registry', content: 'Agent Discovery', type: 'tool_call' as const, description: 'Gateway discovers available agents' },
        { from: 'agent_registry', to: 'acp_gateway', content: 'Agent List', type: 'data' as const, description: 'Registry returns agent list' },
        { from: 'acp_gateway', to: 'monitoring', content: 'Log Request', type: 'tool_call' as const, description: 'Gateway logs request' },
        { from: 'acp_gateway', to: 'load_balancer', content: 'Route Request', type: 'tool_call' as const, description: 'Gateway routes through load balancer' },
        { from: 'load_balancer', to: 'agent_a', content: 'Delegate to Agent A', type: 'tool_call' as const, description: 'Load balancer selects Agent A' },
        { from: 'agent_a', to: 'agent_b', content: 'Collaborate', type: 'protocol_handshake' as const, description: 'Agent A collaborates with Agent B' },
        { from: 'agent_b', to: 'agent_a', content: 'Partial Result', type: 'response' as const, description: 'Agent B returns partial result' },
        { from: 'agent_a', to: 'load_balancer', content: 'Final Result', type: 'response' as const, description: 'Agent A returns final result' },
        { from: 'load_balancer', to: 'acp_gateway', content: 'Response', type: 'response' as const, description: 'Load balancer returns response' },
        { from: 'acp_gateway', to: 'metrics', content: 'Store Metrics', type: 'tool_call' as const, description: 'Gateway stores metrics' },
        { from: 'acp_gateway', to: 'client_app', content: 'HTTP Response', type: 'response' as const, description: 'Gateway returns HTTP response' }
      ]
    }
  };

  useEffect(() => {
    const scenario = scenarios[selectedScenario];
    setComponents(scenario.components.map(comp => ({ ...comp, status: 'idle' })));
    setMessages([]);
    setCurrentStep(0);
  }, [selectedScenario]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const scenario = scenarios[selectedScenario];
      if (currentStep < scenario.steps.length) {
        const step = scenario.steps[currentStep];
        const fromComponent = components.find(c => c.id === step.from);
        const toComponent = components.find(c => c.id === step.to);
        
        if (fromComponent && toComponent) {
          // Create message path
          const path = [
            { x: fromComponent.x + fromComponent.width / 2, y: fromComponent.y + fromComponent.height / 2 },
            { x: toComponent.x + toComponent.width / 2, y: toComponent.y + toComponent.height / 2 }
          ];
          
          const newMessage: Message = {
            id: `msg-${currentStep}`,
            from: step.from,
            to: step.to,
            content: step.content,
            type: step.type,
            timestamp: Date.now(),
            path
          };
          
          setMessages(prev => {
            // Add new message and limit to last 6 messages to prevent too much overlap
            const updatedMessages = [...prev, newMessage];
            return updatedMessages.slice(-6);
          });
          
          // Update component states
          setComponents(prev => prev.map(comp => {
            if (comp.id === step.from) return { ...comp, status: 'responding' };
            if (comp.id === step.to) return { ...comp, status: 'processing' };
            return comp;
          }));
          
          // Reset component states after animation
          setTimeout(() => {
            setComponents(prev => prev.map(comp => ({ ...comp, status: 'idle' })));
          }, 1000);
        }
        
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentStep(0);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, selectedScenario, components]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setMessages([]);
    setComponents(prev => prev.map(comp => ({ ...comp, status: 'idle' })));
  };

  const getStatusColor = (status: ComponentState['status']) => {
    switch (status) {
      case 'processing': return colors.warning;
      case 'responding': return colors.success;
      case 'error': return colors.error;
      default: return colors.border;
    }
  };

  const getTypeColor = (type: ComponentState['type']) => {
    switch (type) {
      case 'user': return colors.user;
      case 'agent': return colors.agent;
      case 'mcp_server': return colors.primary;
      case 'tool': return colors.tool;
      case 'database': return colors.data;
      case 'api': return colors.accent;
      default: return colors.secondary;
    }
  };

  const getMessageColor = (type: Message['type']) => {
    switch (type) {
      case 'query': return colors.user;
      case 'response': return colors.success;
      case 'tool_call': return colors.tool;
      case 'data': return colors.data;
      case 'protocol_handshake': return colors.primary;
      default: return colors.secondary;
    }
  };

  const currentScenario = scenarios[selectedScenario];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gear size={24} className="text-primary" />
          Agent Communication Playground
        </CardTitle>
        <CardDescription>
          Interactive visualization of agent communication patterns inspired by real-world architectures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Scenario Selection */}
          <div className="flex gap-2 mb-4">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <Button
                key={key}
                variant={selectedScenario === key ? "default" : "outline"}
                onClick={() => setSelectedScenario(key as keyof typeof scenarios)}
              >
                {scenario.title}
              </Button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={handlePlay} variant="outline">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={handleReset} variant="outline">
              <ArrowClockwise size={16} />
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step: {currentStep} / {currentScenario.steps.length}
              </span>
              <Badge variant="outline">
                {currentScenario.description}
              </Badge>
            </div>
          </div>

          {/* Main Visualization */}
          <div className="w-full overflow-x-auto">
            <svg
              width="850"
              height="480"
              viewBox="0 0 850 480"
              className="w-full h-auto border rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Message paths */}
              {messages.map((message, index) => {
                // Calculate label position with offset to avoid overlapping
                const centerX = (message.path[0].x + message.path[1].x) / 2;
                const centerY = (message.path[0].y + message.path[1].y) / 2;
                
                // Check for overlapping messages and create offset
                const overlappingMessages = messages.filter((m, i) => {
                  if (i >= index) return false;
                  const mCenterX = (m.path[0].x + m.path[1].x) / 2;
                  const mCenterY = (m.path[0].y + m.path[1].y) / 2;
                  const distance = Math.sqrt(Math.pow(mCenterX - centerX, 2) + Math.pow(mCenterY - centerY, 2));
                  return distance < 80; // Messages within 80px are considered overlapping
                });
                
                // Create alternating offsets (up and down) for better distribution
                const offsetIndex = overlappingMessages.length;
                const isEven = offsetIndex % 2 === 0;
                const offsetDirection = isEven ? 1 : -1;
                const offsetMagnitude = Math.ceil(offsetIndex / 2) * 18; // 18px offset per level
                const yOffset = offsetDirection * offsetMagnitude;
                const labelY = centerY - 5 + yOffset;
                
                return (
                  <g key={message.id}>
                    <line
                      x1={message.path[0].x}
                      y1={message.path[0].y}
                      x2={message.path[1].x}
                      y2={message.path[1].y}
                      stroke={getMessageColor(message.type)}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.7"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;-10"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </line>
                    
                    {/* Message label with background for better readability */}
                    <rect
                      x={centerX - (message.content.length * 3.5)}
                      y={labelY - 8}
                      width={message.content.length * 7}
                      height="16"
                      fill={colors.background}
                      stroke={getMessageColor(message.type)}
                      strokeWidth="1"
                      rx="3"
                      opacity="0.95"
                    />
                    <text
                      x={centerX}
                      y={labelY}
                      fill={getMessageColor(message.type)}
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="bold"
                      dominantBaseline="middle"
                    >
                      {message.content}
                    </text>
                  </g>
                );
              })}

              {/* Components */}
              {components.map((component) => (
                <g key={component.id}>
                  {/* Component background */}
                  <rect
                    x={component.x}
                    y={component.y}
                    width={component.width}
                    height={component.height}
                    fill={getTypeColor(component.type)}
                    stroke={getStatusColor(component.status)}
                    strokeWidth="2"
                    rx="8"
                    opacity="0.8"
                  />
                  
                  {/* Component label */}
                  <text
                    x={component.x + component.width / 2}
                    y={component.y + component.height / 2}
                    fill={colors.text}
                    fontSize="12"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                  >
                    {component.label.split('\n').map((line, i) => (
                      <tspan key={i} x={component.x + component.width / 2} dy={i === 0 ? 0 : 14}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                  
                  {/* Status indicator */}
                  {component.status !== 'idle' && (
                    <circle
                      cx={component.x + component.width - 8}
                      cy={component.y + 8}
                      r="4"
                      fill={getStatusColor(component.status)}
                    >
                      <animate
                        attributeName="r"
                        values="4;6;4"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Step Description */}
          {currentStep > 0 && currentStep <= currentScenario.steps.length && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">
                Step {currentStep}: {currentScenario.steps[currentStep - 1].description}
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Legend</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.user }}></div>
                <span>User/Client</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.agent }}></div>
                <span>Agent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.primary }}></div>
                <span>MCP Server</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.tool }}></div>
                <span>Tool/Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.data }}></div>
                <span>Database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.accent }}></div>
                <span>API</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.warning }}></div>
                <span>Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.success }}></div>
                <span>Responding</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCommunicationPlayground;
