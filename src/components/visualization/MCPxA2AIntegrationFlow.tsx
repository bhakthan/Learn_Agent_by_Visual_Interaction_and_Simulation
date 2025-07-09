import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, ArrowRight, ArrowDown } from '@phosphor-icons/react';
import EnlightenMeButton from '../concepts/EnlightenMeButton';

// Animation states for the 5-layer architecture flow
type AnimationPhase = 'idle' | 'user-interface' | 'agent-management' | 'core-protocol' | 'tool-integration' | 'security' | 'complete';

const MCPxA2AIntegrationFlow: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<AnimationPhase>('idle');
  const [phaseIndex, setPhaseIndex] = useState(0);

  const animationPhases: { phase: AnimationPhase; description: string; duration: number; activeElements: string[] }[] = [
    {
      phase: 'user-interface',
      description: 'User Interface Layer processes multimodal content and user requests',
      activeElements: ['ui-layer', 'multimodal', 'user-request'],
      duration: 2500
    },
    {
      phase: 'agent-management', 
      description: 'Agent Management Layer handles agent discovery, registry, and task management via A2A',
      activeElements: ['agent-layer', 'agent-cards', 'task-manager', 'a2a-flow'],
      duration: 3000
    },
    {
      phase: 'core-protocol',
      description: 'Core Protocol Layer manages A2A messaging formats and MCP content protocols',
      activeElements: ['protocol-layer', 'a2a-message', 'mcp-content', 'state-tracker'],
      duration: 3000
    },
    {
      phase: 'tool-integration',
      description: 'Tool Integration Layer connects to external tools via MCP function calls and schema validation',
      activeElements: ['tool-layer', 'function-caller', 'schema-validator', 'mcp-flow'],
      duration: 3000
    },
    {
      phase: 'security',
      description: 'Security & Authentication Layer ensures OAuth2, JWT, TLS, and access control across all layers',
      activeElements: ['security-layer', 'auth', 'encryption', 'access-control'],
      duration: 2500
    },
    {
      phase: 'complete',
      description: 'Complete MCP×A2A integration: Agents coordinate via A2A while accessing tools via MCP',
      activeElements: ['all'],
      duration: 3000
    }
  ];

  const updateAnimation = useCallback(() => {
    if (!isPlaying) return;

    const currentAnimationPhase = animationPhases[phaseIndex];
    setCurrentPhase(currentAnimationPhase.phase);

    setTimeout(() => {
      setPhaseIndex((prev) => {
        const next = (prev + 1) % animationPhases.length;
        if (next === 0) {
          setIsPlaying(false);
          setCurrentPhase('idle');
        }
        return next;
      });
    }, currentAnimationPhase.duration);
  }, [isPlaying, phaseIndex]);

  const resetAnimation = useCallback(() => {
    setPhaseIndex(0);
    setCurrentPhase('idle');
  }, []);

  const toggleAnimation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      resetAnimation();
    } else {
      setIsPlaying(true);
      setPhaseIndex(0);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      updateAnimation();
    }
  }, [isPlaying, phaseIndex, updateAnimation]);

  const isActive = (element: string) => {
    if (currentPhase === 'idle') return false;
    if (currentPhase === 'complete') return true;
    const currentAnimationPhase = animationPhases.find(p => p.phase === currentPhase);
    return currentAnimationPhase?.activeElements.includes(element) || false;
  };

  return (
    <Card className="relative">
      <EnlightenMeButton 
        title="MCP×A2A Integration Architecture" 
        conceptId="mcpxa2a-architecture"
        description="Comprehensive 5-layer architecture showing how MCP and A2A protocols integrate for enterprise LLM-based autonomous agents"
        customPrompt="Explain the MCP×A2A Integration Architecture in comprehensive detail. Cover: 1) The 5-layer architecture (User Interface, Agent Management, Core Protocol, Tool Integration, Security & Authentication), 2) How MCP handles agent-to-tool communication with JSON schemas and function calls, 3) How A2A manages agent-to-agent coordination with agent cards and task management, 4) The complementary roles where MCP connects agents to external tools while A2A connects agents to each other, 5) Enterprise implementation strategies using Google's ADK and LangGraph frameworks, 6) Real-world performance benefits (70% code reduction, 65% faster integration), 7) Security considerations with OAuth2, JWT, TLS, and access control, 8) Use cases like recruitment automation, customer support, and stock information systems, 9) How this differs from traditional APIs with context-aware function calls and task-oriented messaging, 10) Emerging trends in interoperability, composable architectures, and multimodal agent support."
      />
      
      <CardHeader>
        <CardTitle>MCP × A2A Integration Architecture</CardTitle>
        <CardDescription>
          Interactive visualization of the 5-layer architecture integrating Agent-to-Agent (A2A) communication with Model Context Protocol (MCP) for enterprise autonomous systems
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button onClick={toggleAnimation} variant="outline" size="sm">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Start'} Animation
            </Button>
            <Button onClick={resetAnimation} variant="outline" size="sm">
              <RotateCcw size={16} />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={currentPhase === 'idle' ? 'secondary' : 'default'}>
              Phase: {currentPhase === 'idle' ? 'Ready' : currentPhase.replace('-', ' ')}
            </Badge>
          </div>
        </div>

        {currentPhase !== 'idle' && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {animationPhases.find(p => p.phase === currentPhase)?.description}
            </p>
          </div>
        )}

        {/* Architecture SVG */}
        <div className="mb-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-lg border">
          <svg viewBox="0 0 900 600" className="w-full h-auto">
            {/* Title */}
            <text x="450" y="25" textAnchor="middle" className="text-lg font-bold fill-slate-800 dark:fill-slate-200">
              MCP × A2A Integration Architecture for LLM-based Autonomous Agents
            </text>

            {/* User Interface Layer */}
            <g className={`transition-all duration-500 ${isActive('ui-layer') ? 'opacity-100' : 'opacity-70'}`}>
              <rect x="100" y="50" width="700" height="80" fill="#e8f5e8" stroke="#4caf50" strokeWidth="2" rx="8" 
                    className={isActive('ui-layer') ? 'animate-pulse' : ''}/>
              <text x="450" y="75" textAnchor="middle" className="text-sm font-semibold fill-green-800">User Interface Layer</text>
              
              <rect x="120" y="85" width="150" height="35" fill="white" stroke="#4caf50" rx="4" 
                    className={isActive('multimodal') ? 'animate-pulse' : ''}/>
              <text x="195" y="107" textAnchor="middle" className="text-xs fill-green-800">Multimodal Content Processing</text>
              
              <rect x="290" y="85" width="120" height="35" fill="white" stroke="#4caf50" rx="4" 
                    className={isActive('user-request') ? 'animate-pulse' : ''}/>
              <text x="350" y="107" textAnchor="middle" className="text-xs fill-green-800">User Request Handler</text>
              
              <rect x="430" y="85" width="100" height="35" fill="white" stroke="#4caf50" rx="4"/>
              <text x="480" y="107" textAnchor="middle" className="text-xs fill-green-800">UX Negotiation</text>
              
              <rect x="550" y="85" width="120" height="35" fill="white" stroke="#4caf50" rx="4"/>
              <text x="610" y="107" textAnchor="middle" className="text-xs fill-green-800">Response Display</text>
            </g>

            {/* Agent Management Layer */}
            <g className={`transition-all duration-500 ${isActive('agent-layer') ? 'opacity-100' : 'opacity-70'}`}>
              <rect x="100" y="150" width="700" height="80" fill="#e3f2fd" stroke="#2196f3" strokeWidth="2" rx="8" 
                    className={isActive('agent-layer') ? 'animate-pulse' : ''}/>
              <text x="450" y="175" textAnchor="middle" className="text-sm font-semibold fill-blue-800">Agent Management Layer</text>
              
              <rect x="120" y="185" width="120" height="35" fill="white" stroke="#2196f3" rx="4" 
                    className={isActive('agent-cards') ? 'animate-pulse' : ''}/>
              <text x="180" y="207" textAnchor="middle" className="text-xs fill-blue-800">Agent Card Manager</text>
              
              <rect x="260" y="185" width="100" height="35" fill="white" stroke="#2196f3" rx="4"/>
              <text x="310" y="207" textAnchor="middle" className="text-xs fill-blue-800">Agent Registry</text>
              
              <rect x="380" y="185" width="100" height="35" fill="white" stroke="#2196f3" rx="4" 
                    className={isActive('task-manager') ? 'animate-pulse' : ''}/>
              <text x="430" y="207" textAnchor="middle" className="text-xs fill-blue-800">Task Manager</text>
              
              <rect x="500" y="185" width="120" height="35" fill="white" stroke="#2196f3" rx="4"/>
              <text x="560" y="207" textAnchor="middle" className="text-xs fill-blue-800">Agent Discovery</text>
            </g>

            {/* Core Protocol Layer */}
            <g className={`transition-all duration-500 ${isActive('protocol-layer') ? 'opacity-100' : 'opacity-70'}`}>
              <rect x="100" y="250" width="700" height="80" fill="#f3e5f5" stroke="#9c27b0" strokeWidth="2" rx="8" 
                    className={isActive('protocol-layer') ? 'animate-pulse' : ''}/>
              <text x="450" y="275" textAnchor="middle" className="text-sm font-semibold fill-purple-800">Core Protocol Layer</text>
              
              <rect x="120" y="285" width="130" height="35" fill="white" stroke="#9c27b0" rx="4" 
                    className={isActive('a2a-message') ? 'animate-pulse' : ''}/>
              <text x="185" y="307" textAnchor="middle" className="text-xs fill-purple-800">A2A Message Format</text>
              
              <rect x="270" y="285" width="120" height="35" fill="white" stroke="#9c27b0" rx="4" 
                    className={isActive('mcp-content') ? 'animate-pulse' : ''}/>
              <text x="330" y="307" textAnchor="middle" className="text-xs fill-purple-800">MCP Content Protocol</text>
              
              <rect x="410" y="285" width="100" height="35" fill="white" stroke="#9c27b0" rx="4"/>
              <text x="460" y="307" textAnchor="middle" className="text-xs fill-purple-800">Artifact Manager</text>
              
              <rect x="530" y="285" width="100" height="35" fill="white" stroke="#9c27b0" rx="4" 
                    className={isActive('state-tracker') ? 'animate-pulse' : ''}/>
              <text x="580" y="307" textAnchor="middle" className="text-xs fill-purple-800">State Tracker</text>
            </g>

            {/* Tool Integration Layer */}
            <g className={`transition-all duration-500 ${isActive('tool-layer') ? 'opacity-100' : 'opacity-70'}`}>
              <rect x="100" y="350" width="700" height="80" fill="#fff3e0" stroke="#ff9800" strokeWidth="2" rx="8" 
                    className={isActive('tool-layer') ? 'animate-pulse' : ''}/>
              <text x="450" y="375" textAnchor="middle" className="text-sm font-semibold fill-orange-800">Tool Integration Layer</text>
              
              <rect x="120" y="385" width="130" height="35" fill="white" stroke="#ff9800" rx="4"/>
              <text x="185" y="407" textAnchor="middle" className="text-xs fill-orange-800">Tool Description Manager</text>
              
              <rect x="270" y="385" width="100" height="35" fill="white" stroke="#ff9800" rx="4" 
                    className={isActive('function-caller') ? 'animate-pulse' : ''}/>
              <text x="320" y="407" textAnchor="middle" className="text-xs fill-orange-800">Function Caller</text>
              
              <rect x="390" y="385" width="120" height="35" fill="white" stroke="#ff9800" rx="4" 
                    className={isActive('schema-validator') ? 'animate-pulse' : ''}/>
              <text x="450" y="407" textAnchor="middle" className="text-xs fill-orange-800">Schema Validator</text>
              
              <rect x="530" y="385" width="100" height="35" fill="white" stroke="#ff9800" rx="4"/>
              <text x="580" y="407" textAnchor="middle" className="text-xs fill-orange-800">Result Handler</text>
            </g>

            {/* Security & Authentication Layer */}
            <g className={`transition-all duration-500 ${isActive('security-layer') ? 'opacity-100' : 'opacity-70'}`}>
              <rect x="100" y="450" width="700" height="80" fill="#fce4ec" stroke="#e91e63" strokeWidth="2" rx="8" 
                    className={isActive('security-layer') ? 'animate-pulse' : ''}/>
              <text x="450" y="475" textAnchor="middle" className="text-sm font-semibold fill-pink-800">Security & Authentication Layer</text>
              
              <rect x="150" y="485" width="100" height="35" fill="white" stroke="#e91e63" rx="4" 
                    className={isActive('auth') ? 'animate-pulse' : ''}/>
              <text x="200" y="507" textAnchor="middle" className="text-xs fill-pink-800">OAuth2 / JWT</text>
              
              <rect x="270" y="485" width="100" height="35" fill="white" stroke="#e91e63" rx="4"/>
              <text x="320" y="507" textAnchor="middle" className="text-xs fill-pink-800">Authorization</text>
              
              <rect x="390" y="485" width="100" height="35" fill="white" stroke="#e91e63" rx="4" 
                    className={isActive('encryption') ? 'animate-pulse' : ''}/>
              <text x="440" y="507" textAnchor="middle" className="text-xs fill-pink-800">TLS Encryption</text>
              
              <rect x="510" y="485" width="100" height="35" fill="white" stroke="#e91e63" rx="4" 
                    className={isActive('access-control') ? 'animate-pulse' : ''}/>
              <text x="560" y="507" textAnchor="middle" className="text-xs fill-pink-800">Access Control</text>
            </g>

            {/* Agent Environment (Left) */}
            <g className={`transition-all duration-500 ${isActive('a2a-flow') ? 'opacity-100' : 'opacity-70'}`}>
              <rect x="10" y="150" width="80" height="200" fill="#e1f5fe" stroke="#0277bd" strokeWidth="2" rx="8" 
                    className={isActive('a2a-flow') ? 'animate-pulse' : ''}/>
              <text x="50" y="175" textAnchor="middle" className="text-sm font-semibold fill-blue-800">Agent</text>
              <text x="50" y="195" textAnchor="middle" className="text-sm font-semibold fill-blue-800">Environment</text>
              
              <circle cx="50" cy="220" r="15" fill="#81c784" stroke="#4caf50" strokeWidth="2"/>
              <text x="50" y="227" textAnchor="middle" className="text-xs fill-green-800">A1</text>
              
              <circle cx="50" cy="260" r="15" fill="#64b5f6" stroke="#2196f3" strokeWidth="2"/>
              <text x="50" y="267" textAnchor="middle" className="text-xs fill-blue-800">A2</text>
              
              <circle cx="50" cy="300" r="15" fill="#ffb74d" stroke="#ff9800" strokeWidth="2"/>
              <text x="50" y="307" textAnchor="middle" className="text-xs fill-orange-800">A3</text>
              
              <text x="50" y="335" textAnchor="middle" className="text-xs fill-blue-800">A2A Coordination</text>
            </g>

            {/* Tool Environment (Right) */}
            <g className={`transition-all duration-500 ${isActive('mcp-flow') ? 'opacity-100' : 'opacity-70'}`}>
              <rect x="810" y="250" width="80" height="180" fill="#fff3e0" stroke="#ff9800" strokeWidth="2" rx="8" 
                    className={isActive('mcp-flow') ? 'animate-pulse' : ''}/>
              <text x="850" y="275" textAnchor="middle" className="text-sm font-semibold fill-orange-800">External</text>
              <text x="850" y="295" textAnchor="middle" className="text-sm font-semibold fill-orange-800">Tools</text>
              
              <rect x="820" y="310" width="60" height="25" fill="white" stroke="#ff9800" rx="4"/>
              <text x="850" y="327" textAnchor="middle" className="text-xs fill-orange-800">Database</text>
              
              <rect x="820" y="345" width="60" height="25" fill="white" stroke="#ff9800" rx="4"/>
              <text x="850" y="362" textAnchor="middle" className="text-xs fill-orange-800">API</text>
              
              <rect x="820" y="380" width="60" height="25" fill="white" stroke="#ff9800" rx="4"/>
              <text x="850" y="397" textAnchor="middle" className="text-xs fill-orange-800">Service</text>
              
              <text x="850" y="420" textAnchor="middle" className="text-xs fill-orange-800">MCP Integration</text>
            </g>

            {/* Flow Arrows */}
            <g className={`transition-all duration-500 ${isActive('a2a-flow') ? 'opacity-100' : 'opacity-40'}`}>
              <path d="M 90 250 Q 120 250 140 200" stroke="#2196f3" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)"
                    className={isActive('a2a-flow') ? 'animate-pulse' : ''}/>
              <text x="110" y="210" className="text-xs fill-blue-800">A2A</text>
            </g>

            <g className={`transition-all duration-500 ${isActive('mcp-flow') ? 'opacity-100' : 'opacity-40'}`}>
              <path d="M 800 390 Q 770 390 640 400" stroke="#ff9800" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)"
                    className={isActive('mcp-flow') ? 'animate-pulse' : ''}/>
              <text x="720" y="405" className="text-xs fill-orange-800">MCP</text>
            </g>

            {/* Arrow marker definition */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#2196f3"/>
              </marker>
            </defs>

            {/* Protocol Labels */}
            <text x="30" y="580" className="text-sm font-semibold fill-purple-800">A2A Protocol: Agent ↔ Agent Communication</text>
            <text x="500" y="580" className="text-sm font-semibold fill-orange-800">MCP Protocol: Agent ↔ Tool Communication</text>
          </svg>
        </div>

        {/* Protocol Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                A2A Protocol Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-2">Core Capabilities</h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Agent Cards: JSON metadata defining functions and authentication</li>
                  <li>• Task Management: Structured task creation with unique IDs and state tracking</li>
                  <li>• Message Validation: Standardized request/response formats</li>
                  <li>• Multimodal Support: Text, images, audio, and video communication</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md">
                <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm mb-2">Enterprise Features</h4>
                <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <li>• OAuth2 and JWT token authentication</li>
                  <li>• TLS encryption for secure communication</li>
                  <li>• Role-based access control</li>
                  <li>• Audit logging and compliance tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                MCP Protocol Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-md">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm mb-2">Core Capabilities</h4>
                <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                  <li>• Tool Descriptions: JSON schemas for function definitions</li>
                  <li>• Function Calls: Parameter validation and execution</li>
                  <li>• Context Management: Session and state tracking</li>
                  <li>• Error Handling: Standard error codes and recovery</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-md">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-2">Integration Features</h4>
                <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Type safety with JSON schema validation</li>
                  <li>• Streaming support for real-time data</li>
                  <li>• Resource management and cleanup</li>
                  <li>• Capability discovery and negotiation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
              Real-World Implementation Results
            </CardTitle>
            <CardDescription>Performance improvements from MCP×A2A framework adoption in production systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">70%</div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Code Reduction</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">Using LangGraph framework</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">65%</div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Faster Integration</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Tool integration time reduction</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">∞</div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Scalability</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Coordinate dozens of agents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              Enterprise Use Cases
            </CardTitle>
            <CardDescription>Production applications demonstrating MCP×A2A integration benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-sm">Recruitment Automation</h4>
                  <p className="text-xs text-muted-foreground">Screening agents use MCP for resume parsing, scheduling agents use MCP for calendar APIs, with A2A coordination for candidate context sharing</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-sm">Customer Support</h4>
                  <p className="text-xs text-muted-foreground">Multi-agent workflow: initial response → diagnosis → solution → escalation with MCP-CRM integration and A2A coordination</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-sm">Stock Information System</h4>
                  <p className="text-xs text-muted-foreground">Orchestrator plans, stock price agent queries APIs via MCP, news agent scrapes data, analysis agent synthesizes via A2A</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-sm">Developer Support</h4>
                  <p className="text-xs text-muted-foreground">Code generation, debugging, documentation agents collaborate via A2A while accessing repos and tools via MCP</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default MCPxA2AIntegrationFlow;
