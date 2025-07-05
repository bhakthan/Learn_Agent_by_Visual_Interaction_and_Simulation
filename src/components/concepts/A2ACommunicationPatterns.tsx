import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, ArrowClockwise } from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';

const A2ACommunicationPatterns: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<'direct' | 'broadcast' | 'hierarchical'>('direct');
  const [activeMicroLesson, setActiveMicroLesson] = useState<string | null>(null);
  const [userKnowledgeLevel, setUserKnowledgeLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  const colors = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#d1d5db',
    text: isDarkMode ? '#f9fafb' : '#111827',
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    secondary: isDarkMode ? '#6b7280' : '#6b7280',
    active: isDarkMode ? '#10b981' : '#059669',
    coordinator: isDarkMode ? '#f59e0b' : '#d97706',
    specialist: isDarkMode ? '#8b5cf6' : '#7c3aed',
    message: isDarkMode ? '#ef4444' : '#dc2626',
    accent: isDarkMode ? '#f59e0b' : '#d97706'
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

  // Micro-learning content for A2A patterns
  const microLearningContent = {
    direct: {
      beginner: {
        title: "Direct Communication - Peer-to-Peer",
        content: "Agents communicate directly with each other as equals, like friends discussing a project.",
        codeExample: `// Direct agent communication
const researchAgent = new Agent("Research");
const writingAgent = new Agent("Writing");

// Direct message passing
researchAgent.sendMessage(writingAgent, {
  type: "findings",
  data: researchResults
});`,
        keyPoints: ["Peer-to-peer communication", "No central authority", "Direct message passing", "Flexible interactions"],
        useCases: ["Collaborative problem solving", "Distributed decision making", "Peer review systems"]
      },
      intermediate: {
        title: "Direct Communication Protocol",
        content: "Agents use standardized protocols to exchange information, negotiate, and coordinate actions directly.",
        codeExample: `// Protocol-based direct communication
class DirectCommunicationProtocol {
  async negotiate(agent1, agent2, proposal) {
    const offer = await agent1.makeOffer(proposal);
    const response = await agent2.evaluate(offer);
    return this.resolveNegotiation(offer, response);
  }
}`,
        keyPoints: ["Protocol standardization", "Negotiation mechanisms", "Conflict resolution", "Bilateral agreements"],
        useCases: ["Resource sharing", "Task allocation", "Consensus building"]
      },
      advanced: {
        title: "Advanced Direct Communication",
        content: "Sophisticated direct communication with reputation systems, trust models, and adaptive protocols.",
        codeExample: `// Advanced direct communication
class AdvancedDirectComm {
  constructor() {
    this.trustModel = new TrustModel();
    this.reputationSystem = new ReputationSystem();
  }
  
  async communicateWithTrust(agent, message) {
    const trustScore = this.trustModel.evaluate(agent);
    const adaptedProtocol = this.adaptProtocol(trustScore);
    return adaptedProtocol.send(agent, message);
  }
}`,
        keyPoints: ["Trust-based communication", "Reputation systems", "Adaptive protocols", "Security mechanisms"],
        useCases: ["Autonomous trading", "Secure collaboration", "Decentralized systems"]
      }
    },
    broadcast: {
      beginner: {
        title: "Broadcast Pattern - One-to-Many",
        content: "One coordinator agent sends messages to multiple specialist agents, like a team leader giving assignments.",
        codeExample: `// Broadcast communication
const coordinator = new CoordinatorAgent();
const specialists = [dataAgent, nlpAgent, visionAgent];

// Broadcast task to all specialists
coordinator.broadcast(specialists, {
  type: "task_assignment",
  task: "process_document",
  deadline: "2024-01-15"
});`,
        keyPoints: ["One-to-many communication", "Centralized coordination", "Parallel task execution", "Efficient distribution"],
        useCases: ["Task distribution", "Information dissemination", "Parallel processing"]
      },
      intermediate: {
        title: "Coordinator-Specialist Architecture",
        content: "A sophisticated coordinator manages multiple specialists, handling load balancing and result aggregation.",
        codeExample: `// Advanced broadcast with load balancing
class SmartCoordinator {
  async distributeTask(task, specialists) {
    const loadBalanced = this.balanceLoad(specialists);
    const assignments = this.createAssignments(task, loadBalanced);
    
    const results = await Promise.all(
      assignments.map(assignment => 
        this.assignToSpecialist(assignment)
      )
    );
    
    return this.aggregateResults(results);
  }
}`,
        keyPoints: ["Load balancing", "Result aggregation", "Fault tolerance", "Performance optimization"],
        useCases: ["Distributed computing", "Microservices", "Parallel data processing"]
      },
      advanced: {
        title: "Dynamic Broadcast Networks",
        content: "Self-organizing broadcast networks that adapt topology based on performance and reliability.",
        codeExample: `// Dynamic broadcast network
class DynamicBroadcastNetwork {
  constructor() {
    this.topology = new AdaptiveTopology();
    this.performanceMonitor = new PerformanceMonitor();
  }
  
  async optimizeBroadcast(message, targets) {
    const performance = this.performanceMonitor.analyze();
    const optimizedTopology = this.topology.adapt(performance);
    return this.broadcast(message, targets, optimizedTopology);
  }
}`,
        keyPoints: ["Adaptive topology", "Self-organization", "Performance monitoring", "Network optimization"],
        useCases: ["Cloud orchestration", "Edge computing", "Resilient systems"]
      }
    },
    hierarchical: {
      beginner: {
        title: "Hierarchical Pattern - Chain of Command",
        content: "Agents are organized in levels, like a company structure with managers and employees.",
        codeExample: `// Hierarchical communication
const master = new MasterAgent();
const subAgents = [subAgent1, subAgent2];
const workers = [worker1, worker2, worker3];

// Top-down delegation
master.delegate(subAgent1, "taskA");
subAgent1.assign(worker1, "subtaskA1");
subAgent1.assign(worker2, "subtaskA2");`,
        keyPoints: ["Multi-level organization", "Top-down delegation", "Bottom-up reporting", "Clear authority"],
        useCases: ["Organizational workflows", "Project management", "Command structures"]
      },
      intermediate: {
        title: "Multi-Level Agent Hierarchy",
        content: "Complex hierarchies with multiple management levels, delegation strategies, and reporting mechanisms.",
        codeExample: `// Multi-level hierarchy
class HierarchicalOrganization {
  constructor() {
    this.levels = new Map();
    this.delegationStrategy = new DelegationStrategy();
  }
  
  async executeHierarchicalTask(task) {
    const decomposed = this.decomposeTask(task);
    const assignments = this.delegationStrategy.assign(decomposed);
    
    return this.executeWithReporting(assignments);
  }
}`,
        keyPoints: ["Task decomposition", "Delegation strategies", "Progress reporting", "Hierarchy management"],
        useCases: ["Enterprise systems", "Manufacturing", "Government processes"]
      },
      advanced: {
        title: "Adaptive Hierarchical Networks",
        content: "Dynamic hierarchies that reorganize based on task requirements, agent capabilities, and performance.",
        codeExample: `// Adaptive hierarchy
class AdaptiveHierarchy {
  constructor() {
    this.organizationManager = new OrganizationManager();
    this.capabilityMatcher = new CapabilityMatcher();
  }
  
  async adaptToTask(task) {
    const requirements = this.analyzeRequirements(task);
    const optimalStructure = this.organizationManager
      .designOptimalHierarchy(requirements);
    
    return this.reorganize(optimalStructure);
  }
}`,
        keyPoints: ["Dynamic reorganization", "Capability matching", "Performance optimization", "Adaptive structures"],
        useCases: ["Agile organizations", "Crisis response", "Adaptive systems"]
      }
    }
  };

  const showMicroLesson = (agentId: string) => {
    setActiveMicroLesson(agentId);
  };

  const hideMicroLesson = () => {
    setActiveMicroLesson(null);
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
            
            {/* Micro-learning trigger for pattern-level learning */}
            {agent.id === currentAgents[0].id && (
              <>
                <circle
                  cx={agent.x + 50}
                  cy={agent.y + 10}
                  r="8"
                  fill={colors.accent}
                  stroke={colors.border}
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => showMicroLesson(selectedPattern)}
                />
                <text
                  x={agent.x + 50}
                  y={agent.y + 15}
                  textAnchor="middle"
                  fill={colors.background}
                  className="text-xs font-bold pointer-events-none"
                >
                  ?
                </text>
              </>
            )}
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
              <ArrowClockwise size={16} />
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

        {/* Micro-learning display area */}
        {activeMicroLesson === selectedPattern && (
          <div className="mt-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl border border-purple-200 dark:border-purple-800 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  🤖
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {microLearningContent[selectedPattern][userKnowledgeLevel].title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPattern.charAt(0).toUpperCase() + selectedPattern.slice(1)} Communication Pattern
                  </p>
                </div>
              </div>
              <button
                onClick={hideMicroLesson}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close micro-learning"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Knowledge level selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose your knowledge level:
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setUserKnowledgeLevel(level)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      userKnowledgeLevel === level
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Overview</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {microLearningContent[selectedPattern][userKnowledgeLevel].content}
                </p>
              </div>

              {/* Code example */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Code Example</h4>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400">
                    <code>{microLearningContent[selectedPattern][userKnowledgeLevel].codeExample}</code>
                  </pre>
                </div>
              </div>

              {/* Key points */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Points</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {microLearningContent[selectedPattern][userKnowledgeLevel].keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use cases */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Use Cases</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {microLearningContent[selectedPattern][userKnowledgeLevel].useCases.map((useCase, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-xs font-bold">→</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{useCase}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick tip */}
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 dark:text-amber-400 text-sm">💡</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Quick Tip</h5>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Switch between different communication patterns using the tabs above to see how agents can coordinate differently. 
                      Each pattern has its own strengths depending on the task complexity and team size.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
