import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Circle, ArrowsHorizontal } from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';

const ProtocolComparison: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  
  const colors = {
    mcp: isDarkMode ? '#3b82f6' : '#2563eb',
    acp: isDarkMode ? '#10b981' : '#059669',
    neutral: isDarkMode ? '#6b7280' : '#6b7280',
    high: isDarkMode ? '#10b981' : '#059669',
    medium: isDarkMode ? '#f59e0b' : '#d97706',
    low: isDarkMode ? '#ef4444' : '#dc2626'
  };

  const comparisonData = {
    overview: {
      mcp: {
        name: "Model Context Protocol",
        purpose: "Connect AI models with context sources",
        focus: "Context management and data access",
        scope: "Model-to-data communication"
      },
      acp: {
        name: "Agent Communication Protocol",
        purpose: "Enable agent interoperability",
        focus: "Agent coordination and messaging",
        scope: "Agent-to-agent communication"
      }
    },
    features: [
      {
        feature: "Standardized Messaging",
        mcp: { support: "full", score: 5, details: "JSON-RPC based with strict schemas" },
        acp: { support: "full", score: 5, details: "Open standard with flexible message formats" }
      },
      {
        feature: "Context Preservation",
        mcp: { support: "full", score: 5, details: "Built-in context tracking and state management" },
        acp: { support: "partial", score: 3, details: "Context sharing through message metadata" }
      },
      {
        feature: "Agent Discovery",
        mcp: { support: "limited", score: 2, details: "Manual server configuration" },
        acp: { support: "full", score: 5, details: "Dynamic agent registry and discovery" }
      },
      {
        feature: "Security & Auth",
        mcp: { support: "full", score: 4, details: "TLS, authentication tokens" },
        acp: { support: "full", score: 5, details: "End-to-end encryption, identity verification" }
      },
      {
        feature: "Scalability",
        mcp: { support: "full", score: 4, details: "Designed for high-throughput data access" },
        acp: { support: "full", score: 5, details: "Distributed architecture support" }
      },
      {
        feature: "Tool Integration",
        mcp: { support: "full", score: 5, details: "Native tool and resource management" },
        acp: { support: "partial", score: 3, details: "Through agent capability advertisement" }
      },
      {
        feature: "Real-time Communication",
        mcp: { support: "full", score: 4, details: "Persistent connections supported" },
        acp: { support: "full", score: 5, details: "Optimized for real-time agent coordination" }
      },
      {
        feature: "Cross-Platform Support",
        mcp: { support: "full", score: 4, details: "Multiple language implementations" },
        acp: { support: "full", score: 5, details: "Platform-agnostic design" }
      }
    ],
    useCases: {
      mcp: [
        "AI assistants accessing local files",
        "Models querying databases",
        "Context-aware AI applications",
        "Enterprise data integration",
        "Personal AI with private data"
      ],
      acp: [
        "Multi-agent collaboration",
        "Distributed AI systems",
        "Agent marketplaces",
        "Cross-organization AI cooperation",
        "Autonomous agent networks"
      ]
    },
    architecture: {
      mcp: {
        components: ["Client", "Server", "Resources", "Tools"],
        flow: "Client ↔ MCP Server ↔ Data Sources",
        pattern: "Hub-and-spoke"
      },
      acp: {
        components: ["Agents", "Registry", "Message Router", "Capabilities"],
        flow: "Agent ↔ Message Router ↔ Agent",
        pattern: "Peer-to-peer with coordination"
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return colors.high;
    if (score >= 3) return colors.medium;
    return colors.low;
  };

  const getSupportIcon = (support: string) => {
    switch (support) {
      case "full": return <CheckCircle className="text-green-500" size={16} />;
      case "partial": return <Circle className="text-yellow-500" size={16} />;
      case "limited": return <XCircle className="text-red-500" size={16} />;
      default: return <Circle className="text-gray-500" size={16} />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Protocol Comparison: MCP vs ACP</CardTitle>
        <CardDescription>
          Technical comparison between Model Context Protocol and Agent Communication Protocol
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="usecases">Use Cases</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MCP Overview */}
              <div className="p-6 border rounded-lg" style={{ borderColor: colors.mcp }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.mcp }} />
                  <h3 className="text-lg font-semibold">{comparisonData.overview.mcp.name}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Purpose:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.overview.mcp.purpose}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Focus:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.overview.mcp.focus}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Scope:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.overview.mcp.scope}</p>
                  </div>
                </div>
              </div>
              
              {/* ACP Overview */}
              <div className="p-6 border rounded-lg" style={{ borderColor: colors.acp }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.acp }} />
                  <h3 className="text-lg font-semibold">{comparisonData.overview.acp.name}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Purpose:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.overview.acp.purpose}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Focus:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.overview.acp.focus}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Scope:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.overview.acp.scope}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Feature</th>
                    <th className="text-center p-3 font-medium" style={{ color: colors.mcp }}>MCP</th>
                    <th className="text-center p-3 font-medium" style={{ color: colors.acp }}>ACP</th>
                    <th className="text-center p-3 font-medium">Comparison</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.features.map((item, index) => (
                    <tr 
                      key={item.feature} 
                      className={`border-b hover:bg-muted/50 transition-colors ${
                        selectedMetric === item.feature ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedMetric(selectedMetric === item.feature ? null : item.feature)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="p-3 font-medium">{item.feature}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getSupportIcon(item.mcp.support)}
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: getScoreColor(item.mcp.score),
                              color: getScoreColor(item.mcp.score)
                            }}
                          >
                            {item.mcp.score}/5
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getSupportIcon(item.acp.support)}
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getScoreColor(item.acp.score),
                              color: getScoreColor(item.acp.score)
                            }}
                          >
                            {item.acp.score}/5
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center">
                          {item.mcp.score > item.acp.score ? (
                            <span style={{ color: colors.mcp }}>MCP</span>
                          ) : item.acp.score > item.mcp.score ? (
                            <span style={{ color: colors.acp }}>ACP</span>
                          ) : (
                            <ArrowsHorizontal className="text-muted-foreground" size={16} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {selectedMetric && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">{selectedMetric} - Detailed Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2" style={{ color: colors.mcp }}>MCP</h5>
                    <p className="text-sm text-muted-foreground">
                      {comparisonData.features.find(f => f.feature === selectedMetric)?.mcp.details}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2" style={{ color: colors.acp }}>ACP</h5>
                    <p className="text-sm text-muted-foreground">
                      {comparisonData.features.find(f => f.feature === selectedMetric)?.acp.details}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="architecture" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg" style={{ borderColor: colors.mcp }}>
                <h3 className="font-semibold mb-3" style={{ color: colors.mcp }}>MCP Architecture</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Components:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {comparisonData.architecture.mcp.components.map((comp) => (
                        <Badge key={comp} variant="outline">{comp}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Data Flow:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.architecture.mcp.flow}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Pattern:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.architecture.mcp.pattern}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg" style={{ borderColor: colors.acp }}>
                <h3 className="font-semibold mb-3" style={{ color: colors.acp }}>ACP Architecture</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Components:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {comparisonData.architecture.acp.components.map((comp) => (
                        <Badge key={comp} variant="outline">{comp}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Data Flow:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.architecture.acp.flow}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Pattern:</span>
                    <p className="text-sm text-muted-foreground">{comparisonData.architecture.acp.pattern}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="usecases" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg" style={{ borderColor: colors.mcp }}>
                <h3 className="font-semibold mb-3" style={{ color: colors.mcp }}>MCP Use Cases</h3>
                <ul className="space-y-2">
                  {comparisonData.useCases.mcp.map((useCase, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="text-green-500 mt-0.5" size={16} />
                      <span className="text-sm">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg" style={{ borderColor: colors.acp }}>
                <h3 className="font-semibold mb-3" style={{ color: colors.acp }}>ACP Use Cases</h3>
                <ul className="space-y-2">
                  {comparisonData.useCases.acp.map((useCase, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="text-green-500 mt-0.5" size={16} />
                      <span className="text-sm">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProtocolComparison;
