import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from '@/components/theme/ThemeProvider';

const MCPArchitectureDiagram: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Model Context Protocol (MCP) Architecture</CardTitle>
        <CardDescription>
          How different components communicate through the MCP protocol
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
              
              {/* Claude Client */}
              <rect x="160" y="70" width="80" height="50" rx="5" fill={colors.client} stroke={colors.border} strokeWidth="1"/>
              <text x="200" y="90" textAnchor="middle" fill={colors.background} className="text-xs font-medium">Claude</text>
              <text x="200" y="105" textAnchor="middle" fill={colors.background} className="text-xs">MCP Client</text>
              
              {/* LLM Application */}
              <rect x="160" y="140" width="80" height="50" rx="5" fill={colors.client} stroke={colors.border} strokeWidth="1"/>
              <text x="200" y="155" textAnchor="middle" fill={colors.background} className="text-xs font-medium">LLM</text>
              <text x="200" y="165" textAnchor="middle" fill={colors.background} className="text-xs">Application</text>
              <text x="200" y="175" textAnchor="middle" fill={colors.background} className="text-xs">MCP Client</text>
              
              {/* IDE */}
              <rect x="250" y="140" width="70" height="50" rx="5" fill={colors.client} stroke={colors.border} strokeWidth="1"/>
              <text x="285" y="155" textAnchor="middle" fill={colors.background} className="text-xs font-medium">IDE</text>
              <text x="285" y="165" textAnchor="middle" fill={colors.background} className="text-xs">(e.g. VS Code)</text>
              <text x="285" y="175" textAnchor="middle" fill={colors.background} className="text-xs">MCP Client</text>
              
              {/* Other Client */}
              <rect x="160" y="210" width="60" height="30" rx="5" fill={colors.client} stroke={colors.border} strokeWidth="1"/>
              <text x="190" y="220" textAnchor="middle" fill={colors.background} className="text-xs">Other</text>
              <text x="190" y="230" textAnchor="middle" fill={colors.background} className="text-xs">Clients</text>
            </g>

            {/* MCP Servers */}
            <g>
              <rect x="400" y="120" width="120" height="80" rx="10" fill={colors.server} stroke={colors.border} strokeWidth="2"/>
              <text x="460" y="140" textAnchor="middle" fill={colors.background} className="text-lg font-bold">MCP</text>
              <text x="460" y="160" textAnchor="middle" fill={colors.background} className="text-lg font-bold">SERVERS</text>
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
              
              {/* NFS/Local Files */}
              <rect x="590" y="80" width="70" height="50" rx="5" fill={colors.data} stroke={colors.border} strokeWidth="1"/>
              <text x="625" y="95" textAnchor="middle" fill={colors.background} className="text-xs font-medium">NFS</text>
              <text x="625" y="105" textAnchor="middle" fill={colors.background} className="text-xs">Local</text>
              <text x="625" y="115" textAnchor="middle" fill={colors.background} className="text-xs">Files/Links</text>
              
              {/* Database */}
              <rect x="680" y="80" width="70" height="50" rx="5" fill={colors.data} stroke={colors.border} strokeWidth="1"/>
              <text x="715" y="100" textAnchor="middle" fill={colors.background} className="text-xs font-medium">Data</text>
              <text x="715" y="115" textAnchor="middle" fill={colors.background} className="text-xs">Base</text>
              
              {/* Cloud Service */}
              <ellipse cx="670" cy="180" rx="60" ry="30" fill={colors.data} stroke={colors.border} strokeWidth="1"/>
              <text x="670" y="175" textAnchor="middle" fill={colors.background} className="text-xs font-medium">Cloud</text>
              <text x="670" y="185" textAnchor="middle" fill={colors.background} className="text-xs">Service</text>
              
              {/* SaaS */}
              <ellipse cx="625" cy="220" rx="40" ry="20" fill={colors.data} stroke={colors.border} strokeWidth="1"/>
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
      </CardContent>
    </Card>
  );
};

export default MCPArchitectureDiagram;
