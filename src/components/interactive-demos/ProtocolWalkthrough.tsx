import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play,
  Pause,
  ArrowsCounterClockwise,
  CaretRight,
  CaretLeft,
  ArrowRight
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

// Simple implementation without ReactFlow to avoid rendering issues

interface ProtocolMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  protocolType: 'ACP' | 'MCP';
  timestamp: number;
}

interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  messages: ProtocolMessage[];
  participants: string[];
}

const ProtocolWalkthrough = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<ProtocolMessage[]>([]);
  const [activeParticipants, setActiveParticipants] = useState<string[]>([]);
  
  const steps: ProtocolStep[] = [
    {
      id: "request_init",
      title: "1. Request Initiation",
      description: "Client initiates a request to the agent system",
      messages: [
        {
          id: "msg-1",
          from: "Client",
          to: "ACP Server",
          content: "Request: Generate a report on sales trends",
          protocolType: 'ACP',
          timestamp: 0
        }
      ],
      participants: ["Client", "ACP Server"]
    },
    {
      id: "acp_routing",
      title: "2. ACP Server Routing",
      description: "ACP server routes the request to appropriate agent",
      messages: [
        {
          id: "msg-2",
          from: "ACP Server",
          to: "Coordinator Agent",
          content: "Request forwarded with ACP metadata",
          protocolType: 'ACP',
          timestamp: 1000
        }
      ],
      participants: ["ACP Server", "Coordinator Agent"]
    },
    {
      id: "mcp_context",
      title: "3. MCP Context Management",
      description: "Agent processes request within MCP context framework",
      messages: [
        {
          id: "msg-3",
          from: "Coordinator Agent",
          to: "Coordinator Agent",
          content: "Processing with MCP context tracking",
          protocolType: 'MCP',
          timestamp: 2000
        }
      ],
      participants: ["Coordinator Agent"]
    },
    {
      id: "agent_delegation",
      title: "4. Agent Delegation",
      description: "Agent delegates subtask with MCP metadata",
      messages: [
        {
          id: "msg-4",
          from: "Coordinator Agent",
          to: "Specialist Agent",
          content: "Delegated task with preserved context",
          protocolType: 'MCP',
          timestamp: 3000
        }
      ],
      participants: ["Coordinator Agent", "Specialist Agent"]
    },
    {
      id: "agent_response",
      title: "5. Agent Response",
      description: "Second agent responds with results",
      messages: [
        {
          id: "msg-5",
          from: "Specialist Agent",
          to: "Coordinator Agent",
          content: "Task results with maintained context",
          protocolType: 'MCP',
          timestamp: 4000
        }
      ],
      participants: ["Specialist Agent", "Coordinator Agent"]
    },
    {
      id: "acp_response",
      title: "6. ACP Response",
      description: "Response returned via ACP server",
      messages: [
        {
          id: "msg-6",
          from: "Coordinator Agent",
          to: "ACP Server",
          content: "Final result compiled",
          protocolType: 'ACP',
          timestamp: 5000
        },
        {
          id: "msg-7",
          from: "ACP Server",
          to: "Client",
          content: "HTTP response with results",
          protocolType: 'ACP',
          timestamp: 6000
        }
      ],
      participants: ["Coordinator Agent", "ACP Server", "Client"]
    }
  ];
  
  // Handle step transition
  useEffect(() => {
    let messageTimerId: NodeJS.Timeout | null = null;
    let stepTimerId: NodeJS.Timeout | null = null;

    if (isPlaying) {
      const currentStep = steps[currentStepIndex];
      
      if (currentMessageIndex < currentStep.messages.length) {
        messageTimerId = setTimeout(() => {
          const message = currentStep.messages[currentMessageIndex];
          
          // Add message to display
          setDisplayedMessages(prev => [...prev, message]);
          
          // Highlight active participants
          setActiveParticipants([message.from, message.to]);
          
          // Advance to next message
          setCurrentMessageIndex(prev => prev + 1);
        }, 1500);
      } else {
        // We've shown all messages for this step
        
        // If there are more steps, move to the next one after a delay
        if (currentStepIndex < steps.length - 1) {
          stepTimerId = setTimeout(() => {
            setCurrentStepIndex(prev => prev + 1);
            setCurrentMessageIndex(0);
          }, 2000);
        } else {
          // We've completed all steps
          setIsPlaying(false);
        }
      }
    }

    // Cleanup function to clear any active timers
    return () => {
      if (messageTimerId) clearTimeout(messageTimerId);
      if (stepTimerId) clearTimeout(stepTimerId);
    };
  }, [isPlaying, currentStepIndex, currentMessageIndex, steps.length]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setCurrentMessageIndex(0);
    setDisplayedMessages([]);
    setActiveParticipants([]);
  };
  
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setIsPlaying(false);
      
      // Calculate messages to keep
      const messagesFromPreviousSteps = steps
        .slice(0, currentStepIndex)
        .reduce((acc, step) => acc + step.messages.length, 0);
      
      // Keep only messages from steps before the previous step
      setDisplayedMessages(prev => prev.slice(0, messagesFromPreviousSteps));
      
      // Go to previous step
      setCurrentStepIndex(prev => prev - 1);
      setCurrentMessageIndex(0);
      
      // Update active participants based on previous step
      const previousStep = steps[currentStepIndex - 1];
      setActiveParticipants(previousStep.participants);
    }
  };
  
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setIsPlaying(false);
      
      // Skip any remaining messages in current step
      const currentStep = steps[currentStepIndex];
      
      if (currentMessageIndex < currentStep.messages.length) {
        const remainingMessages = currentStep.messages.slice(currentMessageIndex);
        setDisplayedMessages(prev => [...prev, ...remainingMessages]);
      }
      
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
      setCurrentMessageIndex(0);
      
      // Update active participants based on next step
      const nextStep = steps[currentStepIndex + 1];
      setActiveParticipants(nextStep.participants);
    }
  };
  
  const currentStep = steps[currentStepIndex];
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{currentStep.title}</h3>
              <p className="text-muted-foreground text-sm">{currentStep.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={currentStepIndex >= 2 && currentStepIndex <= 4 ? 'bg-secondary/10' : 'bg-primary/10'}>
                {currentStepIndex >= 2 && currentStepIndex <= 4 ? 'MCP Phase' : 'ACP Phase'}
              </Badge>
              <div className="text-sm">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
            </div>
          </div>
          
          {/* Simple static diagram */}
          <div className="border rounded-md p-6 bg-muted/20" style={{ minHeight: 250 }}>
            <div className="grid grid-cols-4 gap-4">
              <div className={`p-4 border-2 rounded-lg flex flex-col items-center text-center ${
                activeParticipants.includes("Client") ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <div className="font-semibold">Client</div>
                <div className="text-xs text-muted-foreground">Application</div>
              </div>
              
              <div className={`p-4 border-2 rounded-lg flex flex-col items-center text-center ${
                activeParticipants.includes("ACP Server") ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <div className="font-semibold">ACP Server</div>
                <div className="text-xs text-muted-foreground">Protocol Handler</div>
              </div>
              
              <div className={`p-4 border-2 rounded-lg flex flex-col items-center text-center ${
                activeParticipants.includes("Coordinator Agent") ? 'border-secondary bg-secondary/5' : 'border-border'
              }`}>
                <div className="font-semibold">Coordinator Agent</div>
                <div className="text-xs text-muted-foreground">Request Handler</div>
              </div>
              
              <div className={`p-4 border-2 rounded-lg flex flex-col items-center text-center ${
                activeParticipants.includes("Specialist Agent") ? 'border-secondary bg-secondary/5' : 'border-border'
              }`}>
                <div className="font-semibold">Specialist Agent</div>
                <div className="text-xs text-muted-foreground">Task Processor</div>
              </div>
            </div>
            
            {/* Simple animation for active message */}
            {displayedMessages.length > 0 && (
              <div className="mt-8 flex justify-center">
                <AnimatePresence mode="wait">
                  {isPlaying && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={displayedMessages.length}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                        displayedMessages[displayedMessages.length - 1].protocolType === 'ACP' 
                          ? 'bg-primary/10' 
                          : 'bg-secondary/10'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {displayedMessages[displayedMessages.length - 1].from}
                      </div>
                      <ArrowRight size={16} />
                      <div className="font-medium text-sm">
                        {displayedMessages[displayedMessages.length - 1].to}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handlePreviousStep}
                disabled={currentStepIndex === 0 || isPlaying}
              >
                <CaretLeft className="mr-1" size={14} />
                Previous
              </Button>
              
              <Button 
                variant={isPlaying ? "secondary" : "default"}
                size="sm"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-1" size={14} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1" size={14} />
                    Play
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={handleNextStep}
                disabled={currentStepIndex === steps.length - 1 || isPlaying}
              >
                Next
                <CaretRight className="ml-1" size={14} />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={displayedMessages.length === 0}
            >
              <ArrowsCounterClockwise className="mr-1" size={14} />
              Reset
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">Message Log</h4>
            
            <div className="border rounded-md p-3 h-[200px] overflow-y-auto">
              {displayedMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">Press Play to start the protocol walkthrough</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                    >
                      <Badge variant="outline" className={message.protocolType === 'ACP' ? 'bg-primary/10' : 'bg-secondary/10'}>
                        {message.protocolType}
                      </Badge>
                      <div>
                        <div className="text-xs">
                          <span className="font-medium">{message.from}</span>
                          <span className="px-2">→</span>
                          <span className="font-medium">{message.to}</span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>ACP Communication</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span>MCP Communication</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProtocolWalkthrough;