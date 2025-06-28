import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowsClockwise, Robot, ArrowRight } from "@phosphor-icons/react"

interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  icon: React.ReactNode;
}

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

const agents: Agent[] = [
  {
    id: 'manager',
    name: 'Manager Agent',
    role: 'Orchestrator',
    expertise: ['Task Planning', 'Delegation', 'Coordination'],
    icon: <Robot size={20} weight="duotone" />
  },
  {
    id: 'research',
    name: 'Research Agent',
    role: 'Information Specialist',
    expertise: ['Data Analysis', 'Information Retrieval'],
    icon: <Robot size={20} weight="duotone" />
  },
  {
    id: 'writer',
    name: 'Writer Agent',
    role: 'Content Creator',
    expertise: ['Content Generation', 'Summarization'],
    icon: <Robot size={20} weight="duotone" />
  },
  {
    id: 'critic',
    name: 'Critic Agent',
    role: 'Quality Control',
    expertise: ['Evaluation', 'Improvement Suggestions'],
    icon: <Robot size={20} weight="duotone" />
  }
];

// Define example tasks
const tasks = [
  "Generate a blog post about cloud computing trends",
  "Create a market analysis report for electric vehicles",
  "Write a technical summary of machine learning algorithms",
  "Prepare an executive brief on renewable energy technologies"
];

const A2ADemo = () => {
  const [selectedTask, setSelectedTask] = useState('');
  const [customTask, setCustomTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [finalOutput, setFinalOutput] = useState<string | null>(null);
  
  const resetDemo = () => {
    setMessages([]);
    setActiveAgents([]);
    setFinalOutput(null);
    setIsRunning(false);
  };

  const runDemo = async () => {
    const task = selectedTask || customTask;
    if ((!selectedTask && !customTask.trim()) || isRunning) return;
    
    resetDemo();
    setIsRunning(true);
    
    try {
      // Activate manager agent
      await activateAgent('manager');
      
      // Manager agent starts the process
      await sendMessage({
        from: 'manager',
        to: 'system',
        content: `Initiating task processing for: ${task}`
      });
      
      // Manager delegates to research agent
      await sendMessage({
        from: 'manager',
        to: 'research',
        content: `Please research information related to: ${task}`
      });
      
      // Activate research agent
      await activateAgent('research');
      
      // Research agent works
      await sendMessage({
        from: 'research',
        to: 'manager',
        content: `Researching "${task}". Gathering relevant data and analyzing trends.`
      });
      
      // Short delay to simulate research
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Research agent returns results
      await sendMessage({
        from: 'research',
        to: 'manager',
        content: `Research complete. Found 5 key insights and 3 relevant statistics about "${task.split(' ').slice(0, 3).join(' ')}..."`
      });
      
      // Manager delegates to writer agent
      await sendMessage({
        from: 'manager',
        to: 'writer',
        content: `Using the research results, please generate content for: ${task}`
      });
      
      // Activate writer agent
      await activateAgent('writer');
      
      // Writer agent acknowledges
      await sendMessage({
        from: 'writer',
        to: 'manager',
        content: `Beginning content creation based on research results.`
      });
      
      // Short delay to simulate writing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Writer provides draft
      await sendMessage({
        from: 'writer',
        to: 'manager',
        content: `Draft complete. Created comprehensive content addressing all aspects of "${task}".`
      });
      
      // Manager delegates to critic agent
      await sendMessage({
        from: 'manager',
        to: 'critic',
        content: `Please review and evaluate the content for: ${task}`
      });
      
      // Activate critic agent
      await activateAgent('critic');
      
      // Critic agent evaluates
      await sendMessage({
        from: 'critic',
        to: 'manager',
        content: `Evaluating content quality, accuracy, and relevance.`
      });
      
      // Short delay to simulate evaluation
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Critic provides feedback
      await sendMessage({
        from: 'critic',
        to: 'manager',
        content: `Evaluation complete. Content is high quality with some minor improvement suggestions.`
      });
      
      // Critic communicates with writer directly
      await sendMessage({
        from: 'critic',
        to: 'writer',
        content: `Please add more concrete examples and improve the conclusion section.`
      });
      
      // Writer makes revisions
      await sendMessage({
        from: 'writer',
        to: 'critic',
        content: `Implementing suggested changes to examples and conclusion.`
      });
      
      // Short delay for revisions
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Writer informs completion
      await sendMessage({
        from: 'writer',
        to: 'critic',
        content: `Revisions complete. Added three specific examples and expanded the conclusion with future implications.`
      });
      
      // Critic approves
      await sendMessage({
        from: 'critic',
        to: 'manager',
        content: `Final review complete. Content now meets all quality standards.`
      });
      
      // Manager finalizes task
      await sendMessage({
        from: 'manager',
        to: 'system',
        content: `Task completed successfully through agent collaboration. Final output ready.`
      });
      
      // Generate final output for display - use a functional update to avoid closure issues
      setFinalOutput(`Completed task: "${task}"\n\nThis demonstrates A2A collaboration between ${activeAgents.length} specialized agents:\n- Manager orchestrated the workflow\n- Research gathered key information\n- Writer created content\n- Critic ensured quality\n\nThe agents communicated directly when needed and coordinated through the manager when appropriate, showing different A2A communication patterns.`);
      
    } catch (error) {
      console.error("Error in A2A demo:", error);
    } finally {
      setIsRunning(false);
    }
  };
  
  const activateAgent = async (agentId: string) => {
    if (!activeAgents.includes(agentId)) {
      setActiveAgents(prev => [...prev, agentId]);
      // Small delay to visualize agent activation
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };
  
  const sendMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
  };
  
  const getAgentName = (agentId: string): string => {
    if (agentId === 'system') return 'System';
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : agentId;
  };
  
  const getAgentColor = (agentId: string): string => {
    switch (agentId) {
      case 'manager': return 'bg-primary/10 text-primary';
      case 'research': return 'bg-secondary/10 text-secondary';
      case 'writer': return 'bg-accent/10 text-accent-foreground';
      case 'critic': return 'bg-blue-500/10 text-blue-600';
      case 'system': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Agent-to-Agent (A2A) Communication Demo</CardTitle>
        <CardDescription>
          See how multiple specialized agents collaborate to complete a complex task
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">1. Select a Task</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tasks.map((task, index) => (
                <Button
                  key={index}
                  variant={selectedTask === task ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTask(task);
                    setCustomTask('');
                  }}
                  className="justify-start h-auto py-3 px-4"
                  disabled={isRunning}
                >
                  <span className="text-left">{task}</span>
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="...or enter a custom task"
                value={customTask}
                onChange={(e) => {
                  setCustomTask(e.target.value);
                  setSelectedTask('');
                }}
                disabled={isRunning}
                className="flex-1"
              />
              <Button 
                onClick={runDemo} 
                disabled={((!selectedTask && !customTask.trim()) || isRunning)}
              >
                {isRunning ? (
                  <ArrowsClockwise className="mr-2 animate-spin" size={16} />
                ) : (
                  <ArrowRight className="mr-2" size={16} />
                )}
                {isRunning ? 'Running...' : 'Run Demo'}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader className="py-3">
                <CardTitle className="text-base">Active Agents</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div 
                      key={agent.id} 
                      className={`p-3 rounded-md border ${
                        activeAgents.includes(agent.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted bg-card opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {agent.icon}
                          <span className="font-medium">{agent.name}</span>
                        </div>
                        
                        <Badge variant={activeAgents.includes(agent.id) ? "default" : "outline"}>
                          {activeAgents.includes(agent.id) ? 'Active' : 'Idle'}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {agent.role}
                      </p>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        {agent.expertise.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="col-span-1 md:col-span-2">
              <Tabs defaultValue="messages">
                <TabsList>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="output">Final Output</TabsTrigger>
                </TabsList>
                
                <TabsContent value="messages">
                  <Card>
                    <CardContent className="p-3">
                      <ScrollArea className="h-[400px] pr-4">
                        {messages.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center p-6">
                            <div className="text-muted-foreground">
                              <p>Run the demo to see agent communication</p>
                              <p className="text-sm mt-1">Messages will appear here as agents collaborate</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {messages.map((message) => (
                              <div 
                                key={message.id}
                                className={`p-3 rounded-md ${getAgentColor(message.from)}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">{getAgentName(message.from)}</span>
                                    <ArrowRight size={12} />
                                    <span>{getAgentName(message.to)}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="output">
                  <Card>
                    <CardContent className="p-6">
                      {finalOutput ? (
                        <div className="whitespace-pre-wrap">{finalOutput}</div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">Run the demo to generate output</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default A2ADemo;