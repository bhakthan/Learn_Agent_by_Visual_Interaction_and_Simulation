import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from '@/components/theme/ThemeProvider';

const ACPProtocolStack: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  
  const colors = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#d1d5db',
    text: isDarkMode ? '#f9fafb' : '#111827',
    application: isDarkMode ? '#3b82f6' : '#2563eb',
    protocol: isDarkMode ? '#10b981' : '#059669',
    transport: isDarkMode ? '#f59e0b' : '#d97706',
    network: isDarkMode ? '#8b5cf6' : '#7c3aed',
    physical: isDarkMode ? '#ef4444' : '#dc2626',
    highlight: isDarkMode ? '#fbbf24' : '#f59e0b'
  };

  const layers = [
    {
      id: 'application',
      name: 'Application Layer',
      color: colors.application,
      height: 80,
      components: ['Agent Apps', 'AI Services', 'User Interfaces'],
      description: 'Where AI agents and applications interact with users and business logic',
      protocols: ['Custom Agent Logic', 'Business Rules', 'User Experience']
    },
    {
      id: 'acp',
      name: 'Agent Communication Protocol (ACP)',
      color: colors.protocol,
      height: 100,
      components: ['Message Format', 'Agent Discovery', 'Capability Exchange'],
      description: 'Standardized protocol for agent-to-agent communication and coordination',
      protocols: ['ACP Messages', 'Agent Registry', 'Capability Negotiation']
    },
    {
      id: 'transport',
      name: 'Transport Layer',
      color: colors.transport,
      height: 60,
      components: ['HTTP/HTTPS', 'WebSocket', 'gRPC'],
      description: 'Reliable data transmission between agents across networks',
      protocols: ['TCP', 'TLS', 'HTTP/2']
    },
    {
      id: 'network',
      name: 'Network Layer',
      color: colors.network,
      height: 60,
      components: ['IP Routing', 'Load Balancing', 'Service Discovery'],
      description: 'Routing and addressing for agent communications',
      protocols: ['IPv4/IPv6', 'DNS', 'Service Mesh']
    },
    {
      id: 'physical',
      name: 'Physical/Infrastructure',
      color: colors.physical,
      height: 60,
      components: ['Cloud Providers', 'Data Centers', 'Edge Devices'],
      description: 'Physical infrastructure where agents are deployed',
      protocols: ['Ethernet', 'WiFi', 'Cellular']
    }
  ];

  const dataFlow = [
    { from: 'Agent A', to: 'Agent B', steps: [
      'Agent A creates ACP message',
      'Message serialized to JSON/Protocol Buffers',
      'Sent via HTTPS/WebSocket',
      'Routed through network infrastructure',
      'Received by Agent B',
      'ACP message parsed and processed'
    ]}
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agent Communication Protocol (ACP) Stack</CardTitle>
        <CardDescription>
          Technical architecture showing how ACP enables standardized agent communication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          
          {/* Protocol Stack Visualization */}
          <div className="w-full">
            <svg
              width="100%"
              height="400"
              viewBox="0 0 800 400"
              className="w-full border rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              {/* Stack layers */}
              {layers.map((layer, index) => {
                const y = 50 + (layers.length - 1 - index) * 60;
                const isHovered = hoveredLayer === layer.id;
                
                return (
                  <g key={layer.id}>
                    {/* Layer rectangle */}
                    <rect
                      x="50"
                      y={y}
                      width="500"
                      height={layer.height}
                      fill={layer.color}
                      stroke={isHovered ? colors.highlight : colors.border}
                      strokeWidth={isHovered ? "3" : "1"}
                      rx="8"
                      opacity={isHovered ? "1" : "0.8"}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredLayer(layer.id)}
                      onMouseLeave={() => setHoveredLayer(null)}
                    />
                    
                    {/* Layer name */}
                    <text
                      x="70"
                      y={y + 25}
                      fill={colors.background}
                      className="text-sm font-bold"
                    >
                      {layer.name}
                    </text>
                    
                    {/* Layer components */}
                    <text
                      x="70"
                      y={y + 45}
                      fill={colors.background}
                      className="text-xs"
                    >
                      {layer.components.join(' • ')}
                    </text>
                    
                    {/* Protocols */}
                    <text
                      x="70"
                      y={y + 60}
                      fill={colors.background}
                      className="text-xs opacity-80"
                    >
                      Protocols: {layer.protocols.join(', ')}
                    </text>
                  </g>
                );
              })}
              
              {/* Agent A */}
              <g>
                <rect x="600" y="80" width="80" height="60" rx="10" fill={colors.application} stroke={colors.border} strokeWidth="2"/>
                <text x="640" y="105" textAnchor="middle" fill={colors.background} className="text-sm font-medium">Agent A</text>
                <text x="640" y="120" textAnchor="middle" fill={colors.background} className="text-xs">Research Bot</text>
              </g>
              
              {/* Agent B */}
              <g>
                <rect x="600" y="260" width="80" height="60" rx="10" fill={colors.application} stroke={colors.border} strokeWidth="2"/>
                <text x="640" y="285" textAnchor="middle" fill={colors.background} className="text-sm font-medium">Agent B</text>
                <text x="640" y="300" textAnchor="middle" fill={colors.background} className="text-xs">Writing Bot</text>
              </g>
              
              {/* Communication flow arrows */}
              <defs>
                <marker id="acp-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={colors.protocol} />
                </marker>
              </defs>
              
              <path
                d="M 600 110 Q 575 180 600 280"
                stroke={colors.protocol}
                strokeWidth="3"
                fill="none"
                markerEnd="url(#acp-arrow)"
                strokeDasharray="5,5"
              />
              
              <text x="570" y="185" textAnchor="middle" fill={colors.protocol} className="text-xs font-medium">
                ACP Message
              </text>
              <text x="570" y="200" textAnchor="middle" fill={colors.protocol} className="text-xs">
                "Find research on AI"
              </text>
              
              {/* Response arrow */}
              <path
                d="M 680 280 Q 705 200 680 140"
                stroke={colors.transport}
                strokeWidth="2"
                fill="none"
                markerEnd="url(#acp-arrow)"
                strokeDasharray="10,5"
              />
              
              <text x="710" y="205" textAnchor="middle" fill={colors.transport} className="text-xs font-medium">
                Response
              </text>
              <text x="710" y="220" textAnchor="middle" fill={colors.transport} className="text-xs">
                "Research complete"
              </text>
            </svg>
          </div>

          {/* Layer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  hoveredLayer === layer.id 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : 'border-border hover:border-primary/50'
                }`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredLayer(layer.id)}
                onMouseLeave={() => setHoveredLayer(null)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: layer.color }}
                  />
                  <h4 className="font-medium">{layer.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {layer.description}
                </p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium">Components:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {layer.components.map((component) => (
                        <Badge key={component} variant="outline" className="text-xs">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium">Protocols:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {layer.protocols.map((protocol) => (
                        <Badge key={protocol} variant="secondary" className="text-xs">
                          {protocol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ACP Message Structure */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3">Sample ACP Message Structure</h4>
            <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`{
  "acp_version": "1.0",
  "message_type": "request",
  "sender": {
    "agent_id": "research-agent-001",
    "capabilities": ["web_search", "document_analysis"],
    "endpoint": "https://research.agent.com/api"
  },
  "recipient": {
    "agent_id": "writing-agent-002",
    "required_capabilities": ["text_generation"]
  },
  "content": {
    "task": "research_request",
    "parameters": {
      "topic": "AI agent communication protocols",
      "depth": "comprehensive",
      "format": "structured_data"
    }
  },
  "context": {
    "conversation_id": "conv-12345",
    "priority": "normal",
    "deadline": "2024-01-15T10:00:00Z"
  },
  "security": {
    "signature": "...",
    "encryption": "TLS1.3"
  }
}`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ACPProtocolStack;
