import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, ArrowClockwise } from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';

interface MCPArchitectureProps {
  autoPlay?: boolean;
}

const MCPArchitectureDiagram: React.FC<MCPArchitectureProps> = ({ autoPlay = false }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [activeMicroLesson, setActiveMicroLesson] = useState<string | null>(null);
  const [userKnowledgeLevel, setUserKnowledgeLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [currentFlow, setCurrentFlow] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  const colors = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#d1d5db',
    text: isDarkMode ? '#f9fafb' : '#111827',
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    secondary: isDarkMode ? '#6b7280' : '#6b7280',
    accent: isDarkMode ? '#10b981' : '#059669',
    user: isDarkMode ? '#8b5cf6' : '#7c3aed',
    client: isDarkMode ? '#06b6d4' : '#0891b2',
    server: isDarkMode ? '#f59e0b' : '#d97706',
    data: isDarkMode ? '#ef4444' : '#dc2626'
  };

  // Data flow animation steps
  const dataFlowSteps = [
    {
      id: 0,
      title: "Client Request",
      description: "AI client sends request to MCP server",
      activeComponents: ["client"],
      flowPath: "client->server"
    },
    {
      id: 1,
      title: "Server Processing",
      description: "MCP server processes request and identifies data source",
      activeComponents: ["server"],
      flowPath: "server"
    },
    {
      id: 2,
      title: "Data Access",
      description: "Server accesses requested data or tool",
      activeComponents: ["server", "data"],
      flowPath: "server->data"
    },
    {
      id: 3,
      title: "Response Processing",
      description: "Server formats response according to MCP protocol",
      activeComponents: ["server"],
      flowPath: "data->server"
    },
    {
      id: 4,
      title: "Client Response",
      description: "Formatted response sent back to AI client",
      activeComponents: ["client", "server"],
      flowPath: "server->client"
    }
  ];

  // Micro-learning content for MCP components
  const microLearningContent = {
    mcp_servers: {
      beginner: {
        title: "MCP Servers - The Bridge",
        content: "MCP Servers act like translators between AI clients and your data sources. They speak both languages!",
        codeExample: `// Simple MCP Server
class SimpleMCPServer {
  constructor() {
    this.tools = new Map();
  }
  
  addTool(name, handler) {
    this.tools.set(name, handler);
  }
  
  async handleRequest(request) {
    const tool = this.tools.get(request.tool);
    return await tool(request.params);
  }
}`,
        keyPoints: ["Bridges AI and data", "Protocol translation", "Tool management", "Secure access"],
        useCases: ["File system access", "Database queries", "API integration"]
      },
      intermediate: {
        title: "MCP Protocol Implementation",
        content: "MCP Servers implement the Model Context Protocol spec, handling authentication, tool discovery, and resource access.",
        codeExample: `// MCP Protocol Server
class MCPServer {
  constructor(config) {
    this.capabilities = config.capabilities;
    this.tools = new ToolRegistry();
    this.resources = new ResourceManager();
  }
  
  async initialize() {
    await this.registerCapabilities();
    await this.setupAuthentication();
    this.startServer();
  }
  
  async handleMCPRequest(request) {
    const { method, params } = request;
    
    switch (method) {
      case 'tools/list':
        return this.tools.list();
      case 'tools/call':
        return this.tools.execute(params);
      case 'resources/read':
        return this.resources.read(params);
      default:
        throw new Error(\`Unknown method: \${method}\`);
    }
  }
}`,
        keyPoints: ["Protocol compliance", "Tool registry", "Resource management", "Authentication", "Error handling"],
        useCases: ["Enterprise integrations", "Multi-tool orchestration", "Secure data access"]
      },
      advanced: {
        title: "Advanced MCP Architecture",
        content: "Production MCP servers feature advanced capabilities like streaming, caching, load balancing, and monitoring.",
        codeExample: `// Production MCP Server
class ProductionMCPServer {
  constructor() {
    this.loadBalancer = new LoadBalancer();
    this.cache = new DistributedCache();
    this.monitor = new PerformanceMonitor();
    this.security = new SecurityManager();
  }
  
  async handleRequest(request) {
    const securityContext = await this.security.validate(request);
    
    // Check cache first
    const cached = await this.cache.get(request);
    if (cached) return cached;
    
    // Load balance across workers
    const worker = this.loadBalancer.selectWorker();
    const result = await worker.execute(request);
    
    // Cache and monitor
    await this.cache.set(request, result);
    this.monitor.recordMetrics(request, result);
    
    return result;
  }
}`,
        keyPoints: ["High availability", "Performance optimization", "Security hardening", "Monitoring", "Scalability"],
        useCases: ["Enterprise-scale deployments", "Mission-critical systems", "High-throughput applications"]
      }
    },
    clients: {
      beginner: {
        title: "MCP Clients - The Requesters",
        content: "MCP Clients are AI applications that need to access your data and tools. They make requests through the MCP protocol.",
        codeExample: `// Simple MCP Client
class SimpleMCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }
  
  async callTool(toolName, params) {
    const response = await fetch(\`\${this.serverUrl}/tools/call\`, {
      method: 'POST',
      body: JSON.stringify({
        tool: toolName,
        params: params
      })
    });
    return response.json();
  }
}`,
        keyPoints: ["AI application interface", "Protocol communication", "Tool invocation", "Data requests"],
        useCases: ["AI assistants", "Development tools", "Automation systems"]
      },
      intermediate: {
        title: "Client-Server Protocol",
        content: "MCP Clients manage connections, handle authentication, and implement protocol features like capability negotiation.",
        codeExample: `// Full MCP Client
class MCPClient {
  constructor(config) {
    this.config = config;
    this.connection = null;
    this.capabilities = new Set();
  }
  
  async connect() {
    this.connection = await this.establishConnection();
    await this.negotiateCapabilities();
    await this.authenticate();
  }
  
  async discoverTools() {
    const response = await this.sendRequest({
      method: 'tools/list'
    });
    return response.tools;
  }
  
  async executeWithRetry(toolName, params, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.callTool(toolName, params);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.delay(1000 * (i + 1));
      }
    }
  }
}`,
        keyPoints: ["Connection management", "Capability negotiation", "Authentication", "Error handling", "Retry logic"],
        useCases: ["Robust AI applications", "Production systems", "Multi-server clients"]
      },
      advanced: {
        title: "Intelligent MCP Clients",
        content: "Advanced clients feature adaptive behavior, intelligent caching, and sophisticated error recovery.",
        codeExample: `// Intelligent MCP Client
class IntelligentMCPClient {
  constructor() {
    this.adaptiveCache = new AdaptiveCache();
    this.circuitBreaker = new CircuitBreaker();
    this.loadBalancer = new ClientLoadBalancer();
    this.contextManager = new ContextManager();
  }
  
  async intelligentExecute(request) {
    const context = this.contextManager.getCurrentContext();
    const optimizedRequest = this.optimizeRequest(request, context);
    
    // Adaptive caching based on request patterns
    const cacheKey = this.adaptiveCache.generateKey(optimizedRequest);
    const cached = await this.adaptiveCache.get(cacheKey);
    if (cached && this.adaptiveCache.isValid(cached, context)) {
      return cached;
    }
    
    // Circuit breaker pattern
    const result = await this.circuitBreaker.execute(
      () => this.loadBalancer.execute(optimizedRequest)
    );
    
    await this.adaptiveCache.set(cacheKey, result, context);
    return result;
  }
}`,
        keyPoints: ["Adaptive caching", "Circuit breaker", "Context awareness", "Intelligent routing", "Performance optimization"],
        useCases: ["Enterprise AI platforms", "High-performance systems", "Resilient architectures"]
      }
    },
    data_sources: {
      beginner: {
        title: "Data Sources - Your Information",
        content: "Data sources are where your actual information lives - files, databases, APIs, and cloud services.",
        codeExample: `// Simple data source access
const dataSources = {
  files: {
    read: (path) => fs.readFileSync(path, 'utf8'),
    write: (path, data) => fs.writeFileSync(path, data)
  },
  database: {
    query: (sql) => db.execute(sql),
    update: (table, data) => db.update(table, data)
  },
  api: {
    get: (url) => fetch(url).then(r => r.json()),
    post: (url, data) => fetch(url, { method: 'POST', body: JSON.stringify(data) })
  }
};`,
        keyPoints: ["Various data types", "Direct access", "Simple operations", "Local and remote"],
        useCases: ["Personal files", "Local databases", "Simple APIs"]
      },
      intermediate: {
        title: "Integrated Data Management",
        content: "Data sources are integrated through standardized interfaces with proper error handling and security.",
        codeExample: `// Integrated data source manager
class DataSourceManager {
  constructor() {
    this.sources = new Map();
    this.security = new SecurityManager();
    this.cache = new DataCache();
  }
  
  registerSource(name, source) {
    this.sources.set(name, {
      ...source,
      lastAccess: null,
      accessCount: 0
    });
  }
  
  async accessData(sourceName, operation, params) {
    const source = this.sources.get(sourceName);
    if (!source) throw new Error(\`Source not found: \${sourceName}\`);
    
    await this.security.checkPermissions(sourceName, operation);
    
    const cacheKey = \`\${sourceName}:\${operation}:\${JSON.stringify(params)}\`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    const result = await source[operation](params);
    await this.cache.set(cacheKey, result, { ttl: 300 });
    
    source.lastAccess = new Date();
    source.accessCount++;
    
    return result;
  }
}`,
        keyPoints: ["Unified interface", "Security integration", "Caching layer", "Access tracking", "Error handling"],
        useCases: ["Enterprise data", "Multi-source queries", "Secure environments"]
      },
      advanced: {
        title: "Enterprise Data Architecture",
        content: "Advanced data source management with federation, real-time sync, and intelligent data governance.",
        codeExample: `// Enterprise data federation
class EnterpriseDataFederation {
  constructor() {
    this.federation = new DataFederation();
    this.governance = new DataGovernance();
    this.syncEngine = new RealTimeSyncEngine();
    this.analytics = new DataAnalytics();
  }
  
  async federatedQuery(query) {
    const optimizedQuery = this.federation.optimizeQuery(query);
    const executionPlan = this.federation.createExecutionPlan(optimizedQuery);
    
    // Check governance policies
    await this.governance.validateQuery(optimizedQuery);
    
    // Execute across federated sources
    const results = await Promise.all(
      executionPlan.map(plan => this.executeOnSource(plan))
    );
    
    // Merge and analyze results
    const merged = this.federation.mergeResults(results);
    this.analytics.trackQueryPerformance(query, merged);
    
    return merged;
  }
  
  async realTimeSync(sourceName, changeEvent) {
    const affectedSources = this.federation.getAffectedSources(changeEvent);
    await this.syncEngine.propagateChange(affectedSources, changeEvent);
    
    // Update dependent views and caches
    await this.updateDependentViews(changeEvent);
  }
}`,
        keyPoints: ["Data federation", "Real-time sync", "Governance policies", "Query optimization", "Analytics"],
        useCases: ["Large enterprises", "Multi-cloud environments", "Regulated industries"]
      }
    }
  };

  // Animation useEffect
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentFlow((prev) => (prev + 1) % dataFlowSteps.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isPlaying, dataFlowSteps.length]);

  // Helper functions
  const isComponentActive = (componentType: string) => {
    return dataFlowSteps[currentFlow].activeComponents.includes(componentType);
  };

  const showMicroLesson = (componentType: string) => {
    setActiveMicroLesson(componentType);
  };

  const hideMicroLesson = () => {
    setActiveMicroLesson(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Model Context Protocol (MCP) Architecture</span>
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
                setCurrentFlow(0);
                setIsPlaying(false);
              }}
            >
              <ArrowClockwise size={16} />
              Reset
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Watch how data flows through the MCP protocol components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            width="800"
            height="500"
            viewBox="0 0 800 500"
            className="w-full h-auto border rounded-lg"
            style={{ backgroundColor: colors.background }}
          >
            {/* Definitions for arrows */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={colors.secondary}
                />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* User */}
            <g>
              <circle cx="80" cy="150" r="30" fill={colors.user} stroke={colors.border} strokeWidth="2"/>
              <text x="80" y="155" textAnchor="middle" fill={colors.background} className="text-sm font-medium">
                USER
              </text>
              <text x="80" y="200" textAnchor="middle" fill={colors.text} className="text-xs">
                (Me)
              </text>
            </g>

            {/* Frontend Clients Section */}
            <g>
              <rect x="150" y="50" width="180" height="200" rx="10" fill="none" stroke={colors.border} strokeWidth="2" strokeDasharray="5,5"/>
              <text x="240" y="40" textAnchor="middle" fill={colors.text} className="text-sm font-semibold">
                My Front End Clients (HOST)
              </text>
              
              {/* Micro-learning trigger for Clients */}
              <circle
                cx="320"
                cy="30"
                r="8"
                fill={colors.accent}
                stroke={colors.border}
                strokeWidth="1"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => showMicroLesson('clients')}
              />
              <text
                x="320"
                y="35"
                textAnchor="middle"
                fill={colors.background}
                className="text-xs font-bold pointer-events-none"
              >
                ?
              </text>
              
              {/* Claude Client */}
              <rect 
                x="160" 
                y="70" 
                width="80" 
                height="50" 
                rx="5" 
                fill={colors.client} 
                stroke={colors.border} 
                strokeWidth={isComponentActive('client') ? "3" : "1"}
                filter={isComponentActive('client') ? "url(#glow)" : "none"}
                className={isComponentActive('client') ? "animate-pulse" : ""}
              />
              <text x="200" y="90" textAnchor="middle" fill={colors.background} className="text-xs font-medium">Claude</text>
              <text x="200" y="105" textAnchor="middle" fill={colors.background} className="text-xs">MCP Client</text>
              
              {/* LLM Application */}
              <rect 
                x="160" 
                y="140" 
                width="80" 
                height="50" 
                rx="5" 
                fill={colors.client} 
                stroke={colors.border} 
                strokeWidth={isComponentActive('client') ? "3" : "1"}
                filter={isComponentActive('client') ? "url(#glow)" : "none"}
                className={isComponentActive('client') ? "animate-pulse" : ""}
              />
              <text x="200" y="155" textAnchor="middle" fill={colors.background} className="text-xs font-medium">LLM</text>
              <text x="200" y="165" textAnchor="middle" fill={colors.background} className="text-xs">Application</text>
              <text x="200" y="175" textAnchor="middle" fill={colors.background} className="text-xs">MCP Client</text>
              
              {/* IDE */}
              <rect 
                x="250" 
                y="140" 
                width="70" 
                height="50" 
                rx="5" 
                fill={colors.client} 
                stroke={colors.border} 
                strokeWidth={isComponentActive('client') ? "3" : "1"}
                filter={isComponentActive('client') ? "url(#glow)" : "none"}
                className={isComponentActive('client') ? "animate-pulse" : ""}
              />
              <text x="285" y="155" textAnchor="middle" fill={colors.background} className="text-xs font-medium">IDE</text>
              <text x="285" y="165" textAnchor="middle" fill={colors.background} className="text-xs">(e.g. VS Code)</text>
              <text x="285" y="175" textAnchor="middle" fill={colors.background} className="text-xs">MCP Client</text>
              
              {/* Other Client */}
              <rect 
                x="160" 
                y="210" 
                width="60" 
                height="30" 
                rx="5" 
                fill={colors.client} 
                stroke={colors.border} 
                strokeWidth={isComponentActive('client') ? "3" : "1"}
                filter={isComponentActive('client') ? "url(#glow)" : "none"}
                className={isComponentActive('client') ? "animate-pulse" : ""}
              />
              <text x="190" y="220" textAnchor="middle" fill={colors.background} className="text-xs">Other</text>
              <text x="190" y="230" textAnchor="middle" fill={colors.background} className="text-xs">Clients</text>
            </g>

            {/* MCP Servers */}
            <g>
              <rect 
                x="400" 
                y="120" 
                width="120" 
                height="80" 
                rx="10" 
                fill={colors.server} 
                stroke={colors.border} 
                strokeWidth={isComponentActive('server') ? "4" : "2"}
                filter={isComponentActive('server') ? "url(#glow)" : "none"}
                className={isComponentActive('server') ? "animate-pulse" : ""}
              />
              <text x="460" y="140" textAnchor="middle" fill={colors.background} className="text-lg font-bold">MCP</text>
              <text x="460" y="160" textAnchor="middle" fill={colors.background} className="text-lg font-bold">SERVERS</text>
              
              {/* Micro-learning trigger for MCP Servers */}
              <circle
                cx="510"
                cy="130"
                r="8"
                fill={colors.accent}
                stroke={colors.border}
                strokeWidth="1"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => showMicroLesson('mcp_servers')}
              />
              <text
                x="510"
                y="135"
                textAnchor="middle"
                fill={colors.background}
                className="text-xs font-bold pointer-events-none"
              >
                ?
              </text>
            </g>

            {/* Data Sources Section */}
            <g>
              <rect x="580" y="50" width="180" height="200" rx="10" fill="none" stroke={colors.border} strokeWidth="2" strokeDasharray="5,5"/>
              <text x="670" y="40" textAnchor="middle" fill={colors.text} className="text-sm font-semibold">
                My Data Sources
              </text>
              <text x="720" y="55" textAnchor="middle" fill={colors.secondary} className="text-xs">
                on-prem, external
              </text>
              
              {/* Micro-learning trigger for Data Sources */}
              <circle
                cx="750"
                cy="30"
                r="8"
                fill={colors.accent}
                stroke={colors.border}
                strokeWidth="1"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => showMicroLesson('data_sources')}
              />
              <text
                x="750"
                y="35"
                textAnchor="middle"
                fill={colors.background}
                className="text-xs font-bold pointer-events-none"
              >
                ?
              </text>
              
              {/* NFS/Local Files */}
              <rect 
                x="590" 
                y="80" 
                width="70" 
                height="50" 
                rx="5" 
                fill={colors.data} 
                stroke={colors.border} 
                strokeWidth={isComponentActive('data') ? "3" : "1"}
                filter={isComponentActive('data') ? "url(#glow)" : "none"}
                className={isComponentActive('data') ? "animate-pulse" : ""}
              />
              <text x="625" y="95" textAnchor="middle" fill={colors.background} className="text-xs font-medium">NFS</text>
              <text x="625" y="105" textAnchor="middle" fill={colors.background} className="text-xs">Local</text>
              <text x="625" y="115" textAnchor="middle" fill={colors.background} className="text-xs">Files/Links</text>
              
              {/* Database */}
              <rect 
                x="680" 
                y="80" 
                width="70" 
                height="50" 
                rx="5" 
                fill={colors.data} 
                stroke={colors.border} 
                strokeWidth={isComponentActive('data') ? "3" : "1"}
                filter={isComponentActive('data') ? "url(#glow)" : "none"}
                className={isComponentActive('data') ? "animate-pulse" : ""}
              />
              <text x="715" y="100" textAnchor="middle" fill={colors.background} className="text-xs font-medium">Data</text>
              <text x="715" y="115" textAnchor="middle" fill={colors.background} className="text-xs">Base</text>
              
              {/* Cloud Service */}
              <ellipse 
                cx="670" 
                cy="180" 
                rx="60" 
                ry="30" 
                fill={colors.data} 
                stroke={colors.border} 
                strokeWidth={isComponentActive('data') ? "3" : "1"}
                filter={isComponentActive('data') ? "url(#glow)" : "none"}
                className={isComponentActive('data') ? "animate-pulse" : ""}
              />
              <text x="670" y="175" textAnchor="middle" fill={colors.background} className="text-xs font-medium">Cloud</text>
              <text x="670" y="185" textAnchor="middle" fill={colors.background} className="text-xs">Service</text>
              
              {/* SaaS */}
              <ellipse 
                cx="625" 
                cy="220" 
                rx="40" 
                ry="20" 
                fill={colors.data} 
                stroke={colors.border} 
                strokeWidth={isComponentActive('data') ? "3" : "1"}
                filter={isComponentActive('data') ? "url(#glow)" : "none"}
                className={isComponentActive('data') ? "animate-pulse" : ""}
              />
              <text x="625" y="215" textAnchor="middle" fill={colors.background} className="text-xs font-medium">Slack</text>
              <text x="625" y="225" textAnchor="middle" fill={colors.background} className="text-xs">SaaS</text>
              <text x="715" y="240" textAnchor="middle" fill={colors.secondary} className="text-xs">CRM</text>
            </g>

            {/* Connection Arrows and Labels */}
            
            {/* User to Clients */}
            <line x1="110" y1="150" x2="150" y2="150" stroke={colors.secondary} strokeWidth="2" markerEnd="url(#arrowhead)"/>
            
            {/* Clients to MCP Servers */}
            <line x1="330" y1="120" x2="400" y2="140" stroke={colors.secondary} strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <text x="350" y="115" fill={colors.text} className="text-xs">MCP Protocol</text>
            
            <line x1="330" y1="165" x2="400" y2="160" stroke={colors.secondary} strokeWidth="2" markerEnd="url(#arrowhead)"/>
            
            {/* MCP Servers to Data Sources */}
            <line x1="520" y1="140" x2="580" y2="105" stroke={colors.secondary} strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <text x="535" y="110" fill={colors.text} className="text-xs">TCP</text>
            
            <line x1="520" y1="160" x2="580" y2="160" stroke={colors.secondary} strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <text x="535" y="155" fill={colors.text} className="text-xs">HTTPS</text>
            
            <line x1="520" y1="180" x2="580" y2="200" stroke={colors.secondary} strokeWidth="2" markerEnd="url(#arrowhead)"/>
            <text x="535" y="205" fill={colors.text} className="text-xs">API</text>

            {/* Protocol Labels */}
            <text x="400" y="320" fill={colors.text} className="text-sm font-semibold">Key Benefits:</text>
            <text x="400" y="340" fill={colors.text} className="text-xs">• Standardized communication between AI tools and data sources</text>
            <text x="400" y="355" fill={colors.text} className="text-xs">• Context preservation across interactions</text>
            <text x="400" y="370" fill={colors.text} className="text-xs">• Secure access to local and remote resources</text>
            <text x="400" y="385" fill={colors.text} className="text-xs">• Easy integration with existing infrastructure</text>
            

          </svg>
        </div>
        
        {/* Current flow details */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-lg mb-2">
            Current Flow: {dataFlowSteps[currentFlow].title}
          </h4>
          <p className="text-muted-foreground text-sm">
            {dataFlowSteps[currentFlow].description}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            Step {currentFlow + 1} of {dataFlowSteps.length}
          </div>
        </div>

        {/* Micro-learning display area */}
        {activeMicroLesson && (
          <div className="mt-4 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                  {activeMicroLesson === 'mcp_servers' ? '🔧' : activeMicroLesson === 'clients' ? '💻' : '🔗'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {microLearningContent[activeMicroLesson][userKnowledgeLevel].title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Model Context Protocol - {activeMicroLesson.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                        ? 'bg-emerald-500 text-white shadow-md'
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
                  {microLearningContent[activeMicroLesson][userKnowledgeLevel].content}
                </p>
              </div>

              {/* Code example */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Code Example</h4>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400">
                    <code>{microLearningContent[activeMicroLesson][userKnowledgeLevel].codeExample}</code>
                  </pre>
                </div>
              </div>

              {/* Key points */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Points</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {microLearningContent[activeMicroLesson][userKnowledgeLevel].keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">{idx + 1}</span>
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
                  {microLearningContent[activeMicroLesson][userKnowledgeLevel].useCases.map((useCase, idx) => (
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
                      Click the "?" buttons on different parts of the MCP architecture diagram to explore how servers, clients, and protocols work together. 
                      Each component plays a crucial role in enabling AI systems to access and interact with external resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default MCPArchitectureDiagram;
