import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw } from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';

const A2ACommunicationPatterns: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<'direct' | 'broadcast' | 'hierarchical'>('direct');
  
  const colors = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#d1d5db',
    text: isDarkMode ? '#f9fafb' : '#111827',
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    secondary: isDarkMode ? '#6b7280' : '#6b7280',
    active: isDarkMode ? '#10b981' : '#059669',
    coordinator: isDarkMode ? '#f59e0b' : '#d97706',
    specialist: isDarkMode ? '#8b5cf6' : '#7c3aed',
    message: isDarkMode ? '#ef4444' : '#dc2626'
  };

  const agents = {
    direct: [
      { id: 'research', name: 'Research Agent', type: 'specialist', x: 120, y: 100, icon: '🔍' },
      { id: 'writing', name: 'Writing Agent', type: 'specialist', x: 400, y: 100, icon: '✍️' },
      { id: 'analysis', name: 'Analysis Agent', type: 'specialist', x: 260, y: 200, icon: '📊' }
    ],
    broadcast: [
      { id: 'coordinator', name: 'Coordinator', type: 'coordinator', x: 260, y: 80, icon: '🎯' },
      { id: 'data', name: 'Data Agent', type: 'specialist', x: 120, y: 180, icon: '📊' },
      { id: 'nlp', name: 'NLP Agent', type: 'specialist', x: 260, y: 230, icon: '🗣️' },
      { id: 'vision', name: 'Vision Agent', type: 'specialist', x: 400, y: 180, icon: '👁️' }
    ],
    hierarchical: [
      { id: 'master', name: 'Master Agent', type: 'coordinator', x: 260, y: 60, icon: '👑' },
      { id: 'sub1', name: 'Sub-Agent 1', type: 'coordinator', x: 180, y: 140, icon: '🔧' },
      { id: 'sub2', name: 'Sub-Agent 2', type: 'coordinator', x: 340, y: 140, icon: '🔧' },
      { id: 'worker1', name: 'Worker 1', type: 'specialist', x: 100, y: 220, icon: '⚙️' },
      { id: 'worker2', name: 'Worker 2', type: 'specialist', x: 260, y: 220, icon: '⚙️' },
      { id: 'worker3', name: 'Worker 3', type: 'specialist', x: 420, y: 220, icon: '⚙️' }
    ]
  };

  const communications = {
    direct: [
      { from: 'research', to: 'writing', message: 'Research findings', color: colors.message },
      { from: 'writing', to: 'analysis', message: 'Draft content', color: colors.message },
      { from: 'analysis', to: 'research', message: 'Feedback request', color: colors.message }
    ],
    broadcast: [
      { from: 'coordinator', to: 'data', message: 'Task assignment', color: colors.coordinator },
      { from: 'coordinator', to: 'nlp', message: 'Task assignment', color: colors.coordinator },
      { from: 'coordinator', to: 'vision', message: 'Task assignment', color: colors.coordinator },
      { from: 'data', to: 'coordinator', message: 'Results', color: colors.specialist },
      { from: 'nlp', to: 'coordinator', message: 'Results', color: colors.specialist },
      { from: 'vision', to: 'coordinator', message: 'Results', color: colors.specialist }
    ],
    hierarchical: [
      { from: 'master', to: 'sub1', message: 'Delegate task A', color: colors.coordinator },
      { from: 'master', to: 'sub2', message: 'Delegate task B', color: colors.coordinator },
      { from: 'sub1', to: 'worker1', message: 'Execute subtask', color: colors.primary },
      { from: 'sub1', to: 'worker2', message: 'Execute subtask', color: colors.primary },
      { from: 'sub2', to: 'worker3', message: 'Execute subtask', color: colors.primary },
      { from: 'worker1', to: 'sub1', message: 'Subtask complete', color: colors.specialist },
      { from: 'worker2', to: 'sub1', message: 'Subtask complete', color: colors.specialist },
      { from: 'worker3', to: 'sub2', message: 'Subtask complete', color: colors.specialist },
      { from: 'sub1', to: 'master', message: 'Task A complete', color: colors.active },
      { from: 'sub2', to: 'master', message: 'Task B complete', color: colors.active }
    ]
  };

  useEffect(() => {
    if (isPlaying) {
      const comms = communications[selectedPattern];
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % comms.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isPlaying, selectedPattern]);

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'coordinator': return colors.coordinator;
      case 'specialist': return colors.specialist;
      default: return colors.primary;
    }
  };

  const renderCommunication = () => {
    const currentAgents = agents[selectedPattern];
    const currentComms = communications[selectedPattern];
    const currentComm = currentComms[currentMessage];

    return (
      <svg width="600" height="320" viewBox="0 0 600 320" className="w-full h-auto border rounded-lg" style={{ backgroundColor: colors.background }}>
        <defs>
          <marker id="comm-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={currentComm?.color || colors.secondary} />
          </marker>
          <filter id="pulse">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Draw communication lines */}
        {currentComms.map((comm, index) => {
          const fromAgent = currentAgents.find(a => a.id === comm.from);
          const toAgent = currentAgents.find(a => a.id === comm.to);
          
          if (!fromAgent || !toAgent) return null;
          
          const isActive = index === currentMessage && isPlaying;
          
          return (
            <g key={`comm-${index}`}>
              <line
                x1={fromAgent.x + 30}
                y1={fromAgent.y + 30}
                x2={toAgent.x + 30}
                y2={toAgent.y + 30}
                stroke={isActive ? comm.color : colors.border}
                strokeWidth={isActive ? "3" : "1"}
                markerEnd="url(#comm-arrow)"
                className={isActive ? "animate-pulse" : ""}
                strokeDasharray={isActive ? "5,5" : "none"}
              />
              {isActive && (
                <text
                  x={(fromAgent.x + toAgent.x) / 2 + 30}
                  y={(fromAgent.y + toAgent.y) / 2 + 20}
                  textAnchor="middle"
                  fill={comm.color}
                  className="text-xs font-medium animate-pulse"
                >
                  {comm.message}
                </text>
              )}
            </g>
          );
        })}

        {/* Draw agents */}
        {currentAgents.map((agent) => (
          <g key={agent.id}>
            <circle
              cx={agent.x + 30}
              cy={agent.y + 30}
              r="25"
              fill={getAgentColor(agent.type)}
              stroke={colors.border}
              strokeWidth="2"
              filter={
                (currentComm?.from === agent.id || currentComm?.to === agent.id) && isPlaying
                  ? "url(#pulse)"
                  : "none"
              }
            />
            <text
              x={agent.x + 30}
              y={agent.y + 35}
              textAnchor="middle"
              className="text-lg"
            >
              {agent.icon}
            </text>
            <text
              x={agent.x + 30}
              y={agent.y + 65}
              textAnchor="middle"
              fill={colors.text}
              className="text-xs font-medium"
            >
              {agent.name}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Agent-to-Agent Communication Patterns</span>
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
                setCurrentMessage(0);
                setIsPlaying(false);
              }}
            >
              <RotateCcw size={16} />
              Reset
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Explore different communication patterns between AI agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedPattern} onValueChange={(value) => {
          setSelectedPattern(value as 'direct' | 'broadcast' | 'hierarchical');
          setCurrentMessage(0);
          setIsPlaying(false);
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="direct">Direct Communication</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast Pattern</TabsTrigger>
            <TabsTrigger value="hierarchical">Hierarchical Pattern</TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <strong>Direct Communication:</strong> Agents communicate directly with each other as peers, 
              sharing information and coordinating tasks through point-to-point messages.
            </div>
            {renderCommunication()}
          </TabsContent>
          
          <TabsContent value="broadcast" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <strong>Broadcast Pattern:</strong> A coordinator agent distributes tasks to multiple specialist agents 
              and collects their results, managing the overall workflow.
            </div>
            {renderCommunication()}
          </TabsContent>
          
          <TabsContent value="hierarchical" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <strong>Hierarchical Pattern:</strong> Multi-level organization with master agents delegating to 
              sub-agents, which in turn coordinate worker agents for complex task decomposition.
            </div>
            {renderCommunication()}
          </TabsContent>
        </Tabs>

        {isPlaying && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">
              Current Communication: {communications[selectedPattern][currentMessage]?.message}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              From: {communications[selectedPattern][currentMessage]?.from} → 
              To: {communications[selectedPattern][currentMessage]?.to}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default A2ACommunicationPatterns;
