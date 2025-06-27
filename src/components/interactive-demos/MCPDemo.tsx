import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowsClockwise, ArrowRight, User, Robot } from "@phosphor-icons/react"

interface Message {
  id: string;
  role: 'user' | 'agent1' | 'agent2';
  content: string;
  metadata?: {
    protocol?: string;
    contextId?: string;
    intent?: string;
    [key: string]: any;
  };
  timestamp: number;
}

const MCPDemo = () => {
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contextId, setContextId] = useState<string | null>(null);
  
  const resetDemo = () => {
    setMessages([]);
    setContextId(null);
    setIsRunning(false);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isRunning) return;
    
    setIsRunning(true);
    
    // Generate a context ID if one doesn't exist yet
    const currentContextId = contextId || `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    if (!contextId) setContextId(currentContextId);
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: userInput,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create first agent response with MCP protocol
    const agent1Message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'agent1',
      content: `Processing your request regarding "${userInput}"`,
      metadata: {
        protocol: 'MCP/1.0',
        contextId: currentContextId,
        intent: 'process_user_input',
        confidence: 0.85,
        requiresExpertise: true
      },
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, agent1Message]);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Create handoff to second agent
    const handoffMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'agent1',
      content: `Delegating to specialized expert agent for domain-specific knowledge`,
      metadata: {
        protocol: 'MCP/1.0',
        contextId: currentContextId,
        intent: 'delegate',
        targetAgent: 'expert-agent',
        handoffReason: 'specialized_knowledge_required'
      },
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, handoffMessage]);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create second agent response
    const agent2Message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'agent2',
      content: `As the specialized expert agent, I can provide detailed information on your request about "${userInput}". This shows how the ModelContextProtocol allows agents to maintain context across handoffs and collaborate effectively.`,
      metadata: {
        protocol: 'MCP/1.0',
        contextId: currentContextId,
        intent: 'provide_expert_response',
        sourceContext: userMessage.id,
        confidenceScore: 0.92
      },
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, agent2Message]);
    
    setIsRunning(false);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>ModelContextProtocol (MCP) Demo</CardTitle>
        <CardDescription>
          See how MCP enables structured communication and context preservation between agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ScrollArea className="h-[400px] rounded-md border border-border p-4">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p>Send a message to start the MCP demo</p>
                <p className="text-sm mt-2">You'll see how agents use structured protocols to communicate</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <div className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user' ? 'bg-primary/10 text-foreground' :
                        message.role === 'agent1' ? 'bg-secondary/10 text-foreground' :
                        'bg-accent/10 text-foreground'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {message.role === 'user' ? (
                            <>
                              <span className="font-medium">You</span>
                              <User size={16} />
                            </>
                          ) : message.role === 'agent1' ? (
                            <>
                              <Robot size={16} />
                              <span className="font-medium">General Agent</span>
                            </>
                          ) : (
                            <>
                              <Robot size={16} />
                              <span className="font-medium">Expert Agent</span>
                            </>
                          )}
                        </div>
                        <p>{message.content}</p>
                      </div>
                    </div>
                    
                    {message.metadata && (
                      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[80%] rounded border border-border bg-muted/50 p-2 text-xs text-muted-foreground font-mono">
                          <details>
                            <summary className="cursor-pointer">MCP Metadata</summary>
                            <pre className="mt-2 whitespace-pre-wrap">
                              {JSON.stringify(message.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              placeholder="Type a message to see MCP in action..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isRunning}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!userInput.trim() || isRunning}
            >
              {isRunning ? (
                <ArrowsClockwise className="animate-spin" size={16} />
              ) : (
                <ArrowRight size={16} />
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetDemo} 
              disabled={isRunning || messages.length === 0}
            >
              Reset
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">About MCP</h3>
            <p className="text-sm text-muted-foreground">
              ModelContextProtocol (MCP) provides a structured format for agent communication. 
              The demo above shows how agents maintain conversation context, include metadata for 
              coordination, and perform handoffs while preserving the full interaction history.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Learn more at <a href="https://modelcontextprotocol.io/introduction" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">modelcontextprotocol.io</a> and explore the <a href="https://github.com/microsoft/mcp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft MCP GitHub repository</a>.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MCPDemo;