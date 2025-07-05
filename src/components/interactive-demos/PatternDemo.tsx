import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PatternData } from '@/lib/data/patterns';
import { Play, ArrowsClockwise, CheckCircle, Clock, WarningCircle, ArrowBendDownRight } from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';
import StandardFlowVisualizerWithProvider from '../visualization/StandardFlowVisualizer';
import { createStableNodes, createStableEdges } from '@/lib/utils/flows/StableFlowUtils';

// Simple step controller class
class StepController {
  private waitingCallback: (() => void) | null = null;
  private isWaiting = false;
  
  constructor(private onWaitingChange: (isWaiting: boolean) => void) {}
  
  waitForNextStep(callback: () => void) {
    this.waitingCallback = callback;
    this.isWaiting = true;
    this.onWaitingChange(true);
  }
  
  advanceToNextStep() {
    if (this.waitingCallback) {
      const callback = this.waitingCallback;
      this.waitingCallback = null;
      this.isWaiting = false;
      this.onWaitingChange(false);
      callback();
    }
  }
  
  stop() {
    this.waitingCallback = null;
    this.isWaiting = false;
    this.onWaitingChange(false);
  }
}

// Real-world business scenario examples for each pattern
const getBusinessScenarios = (patternId: string) => {
  const scenarios = {
    'react-agent': {
      placeholder: 'What are the latest Azure OpenAI pricing changes and how do they compare to our current costs?',
      examples: [
        'Research our competitor\'s new AI product features and pricing strategy',
        'Find the latest compliance requirements for GDPR in our industry',
        'Analyze market trends for cloud computing services in 2024'
      ]
    },
    'codeact-agent': {
      placeholder: 'Analyze our Q4 sales data CSV file and create a performance dashboard',
      examples: [
        'Process customer feedback CSV and generate sentiment analysis charts',
        'Clean and merge multiple Excel files from different departments',
        'Build automated report generator for monthly KPI tracking'
      ]
    },
    'self-reflection': {
      placeholder: 'Draft a comprehensive business proposal for our new AI consulting services',
      examples: [
        'Write a detailed technical white paper on our cloud migration strategy',
        'Create a comprehensive risk assessment report for our new product launch',
        'Develop a strategic plan for digital transformation in our organization'
      ]
    },
    'agentic-rag': {
      placeholder: 'What are the best practices for implementing zero-trust security in our enterprise?',
      examples: [
        'Find implementation guidelines for SOC 2 compliance in our industry',
        'Research Azure security features relevant to our healthcare application',
        'Analyze our company\'s security policy documents for compliance gaps'
      ]
    },
    'modern-tool-use': {
      placeholder: 'Generate a comprehensive market analysis report using multiple data sources',
      examples: [
        'Create a competitor analysis using web search, financial data, and social media',
        'Build a customer insights dashboard pulling from CRM, surveys, and analytics',
        'Develop a risk assessment using news data, market feeds, and regulatory sources'
      ]
    },
    'model-context-protocol': {
      placeholder: 'Analyze our employee handbook for policy updates needed for remote work',
      examples: [
        'Review our legal contracts for compliance with new data protection laws',
        'Assess our technical documentation for security best practices',
        'Evaluate our customer service protocols against industry standards'
      ]
    },
    'agent-to-agent': {
      placeholder: 'Plan and execute a comprehensive digital marketing campaign for our new product',
      examples: [
        'Coordinate a multi-team product launch involving marketing, sales, and support',
        'Develop a crisis management response plan with legal, PR, and operations teams',
        'Create a comprehensive business case with market research, financial analysis, and risk assessment'
      ]
    },
    'prompt-chaining': {
      placeholder: 'Transform our technical documentation into user-friendly customer guides',
      examples: [
        'Convert legal contracts into plain language summaries for customers',
        'Transform technical specifications into marketing materials',
        'Create training materials from complex operational procedures'
      ]
    },
    'parallelization': {
      placeholder: 'Evaluate three different cloud providers for our infrastructure migration',
      examples: [
        'Compare multiple software vendors for our ERP system upgrade',
        'Analyze different market entry strategies for our new product',
        'Assess various investment opportunities for our growth capital'
      ]
    },
    'routing': {
      placeholder: 'Help me with my customer service inquiry about billing and technical support',
      examples: [
        'I need assistance with both HR policies and IT equipment setup',
        'Route my request to the appropriate team for product refund and feedback',
        'Direct my inquiry to sales, technical support, or account management'
      ]
    },
    'orchestrator-worker': {
      placeholder: 'Manage our quarterly business review process across all departments',
      examples: [
        'Coordinate our annual audit across finance, operations, and compliance teams',
        'Orchestrate our product development cycle from design to launch',
        'Manage our customer onboarding process across sales, support, and technical teams'
      ]
    },
    'plan-and-execute': {
      placeholder: 'Plan and implement a company-wide digital transformation initiative',
      examples: [
        'Develop and execute a comprehensive cybersecurity improvement plan',
        'Create and implement a customer experience optimization strategy',
        'Plan and execute a merger integration across all business functions'
      ]
    },
    'computer-using-agent': {
      placeholder: 'Automate our monthly invoice processing workflow across multiple systems',
      examples: [
        'Set up automated customer onboarding process using our CRM and email systems',
        'Create automated data backup and reporting routine using our business applications',
        'Build automated quality assurance testing workflow for our web application'
      ]
    },
    'deep-researcher': {
      placeholder: 'Research emerging AI regulations and their impact on our business operations',
      examples: [
        'Conduct comprehensive market research for our new product category',
        'Analyze industry trends and competitive landscape for strategic planning',
        'Research best practices for sustainable business operations in our sector'
      ]
    },
    'voice-agent': {
      placeholder: 'Set up our customer service voice assistant for handling common inquiries',
      examples: [
        'Create an internal IT helpdesk voice assistant for employee support',
        'Build a voice-powered meeting assistant for scheduling and note-taking',
        'Develop a voice interface for our warehouse inventory management system'
      ]
    },
    'evaluator-optimizer': {
      placeholder: 'Optimize our customer service response quality and efficiency metrics',
      examples: [
        'Improve our marketing campaign performance through A/B testing and optimization',
        'Enhance our hiring process by evaluating and refining interview procedures',
        'Optimize our supply chain operations for cost and delivery performance'
      ]
    },
    'reflexion': {
      placeholder: 'Analyze and improve our quarterly business strategy presentation',
      examples: [
        'Review and enhance our product development roadmap for better market fit',
        'Evaluate and refine our customer acquisition strategy',
        'Assess and improve our risk management framework'
      ]
    },
    'autonomous-workflow': {
      placeholder: 'Monitor and optimize our e-commerce website performance automatically',
      examples: [
        'Automatically manage our social media content scheduling and engagement',
        'Monitor and respond to customer service tickets based on priority and type',
        'Automatically optimize our cloud infrastructure costs based on usage patterns'
      ]
    }
  };

  return scenarios[patternId] || {
    placeholder: 'Enter your business scenario to see how this pattern works...',
    examples: [
      'Try describing a real business challenge you\'re facing',
      'Explain a workflow or process you want to improve',
      'Describe a task that requires multiple steps or decisions'
    ]
  };
};

// Enhanced mock response generation with business-focused outputs
const generateMockResponse = (text: string, patternId: string) => {
  return new Promise<string>((resolve) => {
    // Add random delay for realistic effect
    const delay = 500 + Math.random() * 1500;
    setTimeout(() => {
      const responses = {
        'react-agent': `I'll research Azure OpenAI pricing by searching current documentation, analyzing cost comparison tools, and calculating potential savings. Based on my research, I found that Azure OpenAI recently updated their pricing model with tiered rates and bulk discounts that could reduce your costs by 15-20%.`,
        'codeact-agent': `I'll analyze your Q4 sales data by loading the CSV file, cleaning the data, performing statistical analysis, and creating interactive charts. The analysis shows a 23% increase in sales volume with strong performance in the enterprise segment.`,
        'self-reflection': `I've drafted a comprehensive business proposal for AI consulting services. After self-review, I've identified areas for improvement in market positioning and competitive analysis. The refined proposal now includes stronger value propositions and clearer service differentiation.`,
        'agentic-rag': `Based on our enterprise security knowledge base, I've compiled best practices for zero-trust implementation including identity verification, least-privilege access, and continuous monitoring. I've also identified specific Azure security services that align with your requirements.`,
        'modern-tool-use': `I've generated a comprehensive market analysis by integrating data from multiple sources: web search for industry trends, financial APIs for market data, and social media analytics for sentiment. The report shows promising growth opportunities in the enterprise AI sector.`,
        'model-context-protocol': `I've analyzed your employee handbook using our secure document processing system. The analysis identifies 8 policy areas requiring updates for remote work compliance, including data security, communication protocols, and performance management frameworks.`,
        'agent-to-agent': `Our marketing team has developed creative concepts, the analytics team has identified target segments, and the sales team has created conversion strategies. Together, we've created a comprehensive campaign projected to increase product awareness by 40% and drive 25% more qualified leads.`,
        'prompt-chaining': `I've transformed your technical documentation through a structured process: simplified complex terminology, reorganized content for user flow, added visual examples, and created quick reference guides. The result is customer-friendly documentation that reduces support tickets by an estimated 30%.`,
        'parallelization': `I've evaluated three cloud providers simultaneously: AWS offers best enterprise features, Azure provides seamless integration with your existing Microsoft stack, and Google Cloud delivers competitive pricing. Based on parallel analysis, Azure appears to be the optimal choice for your infrastructure needs.`,
        'routing': `I've analyzed your inquiry and determined it requires both billing support and technical assistance. I'm routing your billing questions to our accounts team and your technical issues to our engineering support. You'll receive responses from both teams within 2 business hours.`,
        'orchestrator-worker': `I've coordinated your quarterly business review across all departments. Finance provided budget analysis, Sales shared pipeline updates, Operations reported on efficiency metrics, and Marketing delivered campaign performance. The consolidated report shows 18% growth with strong performance indicators across all areas.`,
        'plan-and-execute': `I've developed a comprehensive digital transformation plan with 4 phases: assessment, infrastructure upgrade, staff training, and system integration. The plan includes specific timelines, resource requirements, and success metrics. Implementation begins with cloud migration and proceeds through process digitization.`,
        'computer-using-agent': `I've automated your monthly invoice processing workflow by integrating your accounting system with email processing and approval workflows. The automation reduces processing time by 70% and eliminates manual data entry errors. Monthly invoices will now be processed automatically with exception handling for unusual cases.`,
        'deep-researcher': `I've conducted extensive research on emerging AI regulations across multiple jurisdictions. The research reveals significant compliance requirements for data handling, algorithm transparency, and bias mitigation. I've compiled a comprehensive impact assessment with recommended action items for your business operations.`,
        'voice-agent': `I've configured your customer service voice assistant to handle common inquiries including billing questions, technical support, and account management. The system recognizes natural speech patterns and can escalate complex issues to human agents. Initial testing shows 85% success rate for routine inquiries.`,
        'evaluator-optimizer': `I've analyzed your customer service metrics and identified optimization opportunities. Current response quality scores averaging 3.2/5 can be improved through enhanced training protocols and automated response suggestions. Implementing these changes should increase satisfaction scores to 4.2/5 within 90 days.`,
        'reflexion': `I've analyzed your quarterly business strategy presentation and identified several areas for improvement. After reflection, I've strengthened the market analysis section, clarified financial projections, and enhanced the competitive positioning. The revised presentation now provides more compelling arguments for the proposed strategic direction.`,
        'autonomous-workflow': `I've set up continuous monitoring of your e-commerce website performance with automated optimization responses. The system tracks loading times, conversion rates, and user behavior patterns. When performance drops below thresholds, it automatically adjusts caching, scales resources, and optimizes content delivery for improved user experience.`
      };

      resolve(responses[patternId] || `I've processed your request "${text}" using the ${patternId} pattern to deliver business-focused results tailored to your specific needs.`);
    }, delay);
  });
};

interface PatternDemoProps {
  patternData: PatternData;
}

interface StepState {
  status: 'idle' | 'running' | 'complete' | 'failed';
  result?: string;
  startTime?: number;
  endTime?: number;
}

interface DataFlowMessage {
  id: string;
  edgeId: string;
  source: string;
  target: string;
  content: string;
  timestamp: number;
  type: 'message' | 'data' | 'response' | 'error';
  progress: number;
  complete?: boolean;
}

// Create a DragHint component that shows a helpful message when nodes are dragged
const DragHint = React.memo(() => {
  const [showDragHint, setShowDragHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDragHint(false);
    }, 4000); // Reduced time to 4 seconds
    
    return () => clearTimeout(timer);
  }, []);

  if (!showDragHint) return null;

  return (
    <div 
      className="absolute bottom-4 right-4 bg-background/95 border border-border px-3 py-2 rounded-md shadow-md z-20 animate-fade-in flex items-center max-w-[200px]"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div className="mr-2 text-primary">👆</div>
      <div className="text-xs">Drag nodes around!</div>
      <button 
        className="ml-2 text-muted-foreground hover:text-foreground text-xs"
        onClick={() => setShowDragHint(false)}
      >
        ✕
      </button>
    </div>
  );
});

// Custom node component
const CustomDemoNode = React.memo(({ data, id }: { data: any, id: string }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Basic node styling
  const getNodeStyle = () => {
    const baseStyle = {
      padding: '10px 20px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      width: '180px',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      cursor: 'grab',
      position: 'relative' as const,
      zIndex: 1,
      display: 'block' as const,
      visibility: 'visible' as const,
      transform: 'translateZ(0)',
      boxShadow: '0 0 0 1px var(--border)',
      backgroundColor: isDarkMode ? 'var(--card)' : 'white',
      opacity: 1,
    };
    
    // Add status-specific styling
    const statusStyle = data.status === 'running' ? {
      boxShadow: `0 0 0 2px var(--primary), 0 0 15px ${isDarkMode ? 'rgba(66, 153, 225, 0.3)' : 'rgba(66, 153, 225, 0.5)'}`,
    } : data.status === 'complete' ? {
      boxShadow: `0 0 0 2px ${isDarkMode ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.6)'}`,
    } : data.status === 'failed' ? {
      boxShadow: `0 0 0 2px ${isDarkMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.6)'}`,
    } : {};
    
    // Apply type-specific and status-specific styling
    switch(data.nodeType) {
      case 'input':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgb(226, 232, 240)', 
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.8)' : 'rgb(203, 213, 225)'}`, 
          ...statusStyle 
        };
      case 'llm':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(30, 58, 138, 0.4)' : 'rgb(219, 234, 254)', 
          border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgb(147, 197, 253)'}`, 
          ...statusStyle 
        };
      case 'output':
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(20, 83, 45, 0.4)' : 'rgb(220, 252, 231)', 
          border: `1px solid ${isDarkMode ? 'rgba(34, 197, 94, 0.5)' : 'rgb(134, 239, 172)'}`, 
          ...statusStyle 
        };
      default:
        return { 
          ...baseStyle, 
          backgroundColor: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'white', 
          border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.6)' : 'rgb(226, 232, 240)'}`, 
          ...statusStyle 
        };
    }
  };

  // Calculate the truncated result text
  const resultText = data.result ? 
    (data.result.length > 40 ? `${data.result.substring(0, 40)}...` : data.result) : 
    null;

  return (
    <div style={getNodeStyle()}>
      <div>
        <div className="flex items-center gap-2">
          {data.status === 'running' && <Clock className="text-amber-500" size={16} />}
          {data.status === 'complete' && <CheckCircle className="text-green-500" size={16} />}
          {data.status === 'failed' && <WarningCircle className="text-destructive" size={16} />}
          <strong>{data.label}</strong>
        </div>
        
        {resultText && (
          <div className={`mt-2 text-xs p-1.5 rounded border ${isDarkMode ? 'bg-background/80 border-border text-foreground' : 'bg-background/50 border-border/50 text-foreground'}`}>
            {resultText}
          </div>
        )}
      </div>
    </div>
  );
});

const PatternDemo = React.memo(({ patternData }: PatternDemoProps) => {
  // Ensure patternData exists to prevent errors
  if (!patternData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Demo Unavailable</CardTitle>
          <CardDescription>Pattern data is missing or invalid</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              The pattern demo cannot be loaded due to missing data. Please try a different pattern.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { theme } = useTheme();
  
  // Get business scenarios for the current pattern and set default input
  const currentScenarios = getBusinessScenarios(patternData.id);
  const [userInput, setUserInput] = useState(currentScenarios.placeholder);
  
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, StepState>>({});
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [dataFlows, setDataFlows] = useState<DataFlowMessage[]>([]);
  const [waitingForNextStep, setWaitingForNextStep] = useState<boolean>(false);
  const [iterations, setIterations] = useState<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // Default to normal speed (1x)
  const [animationMode, setAnimationMode] = useState<'auto' | 'step-by-step'>('auto'); 
  
  // Prepare nodes and edges for visualization with state
  const initialNodes = useMemo(() => createStableNodes(patternData.nodes?.map(node => ({
    ...node,
    type: 'demoNode',
    data: {
      ...node.data,
      status: 'idle',
      nodeType: node.data?.nodeType || 'default'
    },
    draggable: true,
    selectable: true,
    // Explicitly preserve position with stronger typing
    position: { 
      x: typeof node.position?.x === 'number' ? node.position.x : 0, 
      y: typeof node.position?.y === 'number' ? node.position.y : 0 
    }
  })) || []), [patternData.id, patternData.nodes]);
  
  const [demoNodes, setDemoNodes] = useState(initialNodes);
  
  const demoEdges = useMemo(() => createStableEdges(patternData.edges?.map(edge => ({
    ...edge,
    animated: false,
    style: { 
      strokeWidth: 2,
      stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined
    },
  })) || []), [patternData.edges, theme]);
  
  // Step controller for managing execution flow
  const stepControllerRef = useRef<StepController | null>(null);
  
  // Initialize step controller
  useEffect(() => {
    stepControllerRef.current = new StepController((isWaiting) => {
      setWaitingForNextStep(isWaiting);
    });
    
    return () => {
      if (stepControllerRef.current) {
        stepControllerRef.current.stop();
      }
    };
  }, []);
  
  // Sync demoNodes with initialNodes when pattern changes
  useEffect(() => {
    setDemoNodes(initialNodes);
  }, [initialNodes]);
  
  // Flow container ref (simple version without useReactFlow dependency)
  const flowContainerRef = useRef<HTMLDivElement>(null);
  const resetFlow = useCallback(() => {
    // Simple reset function - the actual flow reset is handled by the visualizer
    console.log('Flow reset requested');
  }, []);
  
  // Reset the demo state
  const resetDemo = useCallback(() => {
    setIsRunning(false);
    setOutput(null);
    setSteps({});
    setCurrentNodeId(null);
    setDataFlows([]);
    setIterations(0);
    setWaitingForNextStep(false);
    
    // Reset nodes to idle state while preserving positions
    setDemoNodes(prev => prev.map(node => ({
      ...node,
      // Preserve the position explicitly
      position: node.position,
      data: { ...node.data, status: 'idle', result: undefined }
    })));
    
    // Reset flow visualization
    resetFlow();
    
    // Don't call fitView as it causes clustering
    // setTimeout(() => {
    //   if (!isRunning) {
    //     fitView();
    //   }
    // }, 100);
  }, [resetFlow]);

  // Update node status in the visualization
  const updateNodeStatus = useCallback((nodeId: string, status: 'idle' | 'running' | 'complete' | 'failed', result?: string) => {
    // Update the visual nodes while preserving positions
    setDemoNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, position: node.position, data: { ...node.data, status, result } }
        : node
    ));
    
    setDataFlows(prev => {
      // If the node is complete, also complete any flows targeting it
      if (status === 'complete') {
        return prev.map(flow => 
          flow.target === nodeId ? { ...flow, progress: 1 } : flow
        );
      }
      return prev;
    });
    
    // Update the step state
    setSteps(prev => ({
      ...prev,
      [nodeId]: { 
        ...prev[nodeId], 
        status, 
        result,
        endTime: status === 'complete' || status === 'failed' ? Date.now() : undefined
      }
    }));
  }, []);
  
  // Helper function for step-by-step control
  const waitForNextStep = useCallback(async () => {
    if (!stepControllerRef.current) return;
    
    setWaitingForNextStep(true);
    return new Promise<void>(resolve => {
      stepControllerRef.current?.waitForNextStep(() => {
        resolve();
      });
    });
  }, []);
  
  // Create a data flow between nodes
  const createDataFlow = useCallback((source: string, target: string, content: string, type: 'message' | 'data' | 'response' | 'error') => {
    const id = `flow-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const edgeId = `${source}-${target}`;
    
    // Create the flow object
    const flow = {
      id,
      edgeId,
      source,
      target,
      content,
      timestamp: Date.now(),
      type,
      progress: 0,
      label: content.length > 15 ? content.substring(0, 15) + '...' : content
    };
    
    setDataFlows(prev => [...prev, flow]);
  }, []);

  // Process node based on type
  const processNode = async (nodeId: string) => {
    if (!patternData || !Array.isArray(patternData.nodes) || !Array.isArray(patternData.edges)) {
      throw new Error('Invalid pattern data');
    }
    
    // Mark node as running
    setCurrentNodeId(nodeId);
    setSteps(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], status: 'running', startTime: Date.now() }
    }));
    
    // Increment iterations counter
    setIterations(prev => prev + 1);
    
    // Update node status in visualization
    updateNodeStatus(nodeId, 'running');
    
    try {
      const node = patternData.nodes.find(n => n.id === nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);
      
      // Process node based on type
      let result = '';
      
      if (node.data.nodeType === 'input') {
        result = `Processing input: "${userInput}"`;
        await new Promise(resolve => setTimeout(resolve, 500 / animationSpeed));
      } else if (node.data.nodeType === 'llm') {
        result = await generateMockResponse(userInput, patternData.id);
      } else {
        result = `Processed by ${node.data?.label || nodeId}`;
        await new Promise(resolve => setTimeout(resolve, 700 / animationSpeed));
      }
      
      // Mark node as complete
      updateNodeStatus(nodeId, 'complete', result);
      
      // If output node, set final output
      if (node.data.nodeType === 'output') {
        setOutput(result);
        return;
      }
      
      // Find next nodes
      const outgoingEdges = patternData.edges.filter(edge => edge.source === nodeId);
      
      // Process next nodes sequentially
      for (const edge of outgoingEdges) {
        // Create data flow visualization
        createDataFlow(
          edge.source,
          edge.target,
          result,
          node.data?.nodeType === 'llm' ? 'response' : 'message'
        );
        
        // Wait proportionally to the animation speed
        await new Promise(resolve => setTimeout(resolve, 800 / animationSpeed));
        
        // If step-by-step mode is active, wait for user to click "Next Step" button
        if (animationMode === 'step-by-step' && stepControllerRef.current) {
          await waitForNextStep();
        }
        
        // Process target node
        await processNode(edge.target);
      }
    } catch (error) {
      console.error(`Error processing node ${nodeId}:`, error);
      
      // Mark node as failed
      updateNodeStatus(nodeId, 'failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Run the demo
  const runDemo = async () => {
    if (!userInput.trim() || isRunning || !patternData || !Array.isArray(patternData.nodes)) return;
    
    resetDemo();
    setIsRunning(true);
    
    // Initialize all nodes as idle
    const initialSteps = patternData.nodes.reduce((acc, node) => {
      acc[node.id] = { status: 'idle' };
      return acc;
    }, {} as Record<string, StepState>);
    setSteps(initialSteps);

    try {
      // Find input node
      const inputNode = patternData.nodes.find(node => node.data.nodeType === 'input');
      if (!inputNode) throw new Error('No input node found');
      
      // Apply a small delay to ensure UI is ready
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Process input node
      await processNode(inputNode.id);
      
      setIsRunning(false);
      setWaitingForNextStep(false);
    } catch (error) {
      console.error('Error in demo:', error);
      setIsRunning(false);
      setWaitingForNextStep(false);
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Calculate execution time for a step
  const getExecutionTime = (step: StepState) => {
    if (step.startTime && step.endTime) {
      return ((step.endTime - step.startTime) / 1000).toFixed(1) + 's';
    }
    return '';
  };

  // Define nodeTypes for ReactFlow
  const nodeTypes = {
    demoNode: CustomDemoNode
  };

  // Flow completion handler
  const handleFlowComplete = useCallback((flowId: string) => {
    setDataFlows(prev => prev.filter(flow => flow.id !== flowId));
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{patternData.name} Pattern Demo</CardTitle>
        <CardDescription>
          Interactive demonstration of the {patternData.name} agent pattern with real-world business scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Business scenario examples */}
          <div className="p-4 bg-muted/30 border border-border rounded-md">
            <h4 className="text-sm font-medium mb-2">Try these business scenarios:</h4>
            <div className="grid grid-cols-1 gap-2">
              {currentScenarios.examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setUserInput(example)}
                  disabled={isRunning}
                  className="text-left text-xs p-2 rounded border border-border/50 bg-background hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <Input
              placeholder={currentScenarios.placeholder}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isRunning}
              className="flex-1"
            />
            <Button 
              onClick={runDemo} 
              disabled={!userInput.trim() || isRunning}
              className="whitespace-nowrap"
            >
              {isRunning ? <ArrowsClockwise className="mr-2 animate-spin" size={16} /> : <Play className="mr-2" size={16} />}
              {isRunning ? 'Running...' : 'Start Simulation'}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetDemo}
              disabled={isRunning}
              className="ml-2"
            >
              Reset
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Animation Mode:</div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                variant={animationMode === 'auto' ? "default" : "outline"}
                onClick={() => {
                  setAnimationMode('auto');
                  // Resume execution if we were waiting for next step
                  if (waitingForNextStep && stepControllerRef.current) {
                    stepControllerRef.current.advanceToNextStep();
                  }
                }}
                disabled={isRunning && !waitingForNextStep}
              >
                Auto
              </Button>
              <Button 
                size="sm"
                variant={animationMode === 'step-by-step' ? "default" : "outline"}
                onClick={() => setAnimationMode('step-by-step')}
                disabled={isRunning && !waitingForNextStep}
              >
                Step-by-Step
              </Button>
              {waitingForNextStep && (
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (stepControllerRef.current) {
                      stepControllerRef.current.advanceToNextStep();
                    }
                  }}
                  className="pulse-animation"
                >
                  Next Step
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Animation Speed:</div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                variant={animationSpeed === 0.5 ? "default" : "outline"}
                onClick={() => setAnimationSpeed(0.5)}
                disabled={isRunning && animationMode === 'auto'}
              >
                Slow
              </Button>
              <Button 
                size="sm"
                variant={animationSpeed === 1 ? "default" : "outline"}
                onClick={() => setAnimationSpeed(1)}
                disabled={isRunning && animationMode === 'auto'}
              >
                Normal
              </Button>
              <Button 
                size="sm"
                variant={animationSpeed === 2 ? "default" : "outline"}
                onClick={() => setAnimationSpeed(2)}
                disabled={isRunning && animationMode === 'auto'}
              >
                Fast
              </Button>
              <span className="ml-4 text-xs text-muted-foreground">
                Iterations: {iterations || 0}
              </span>
            </div>
          </div>
          
          {/* Flow visualization */}
          <div 
            ref={(el) => {
              // Set the container ref
              if (flowContainerRef) {
                // @ts-ignore - Set the ref directly
                flowContainerRef.current = el;
              }
            }}
            className="border border-border rounded-md overflow-hidden relative"
            style={{ height: '500px', minHeight: '500px' }}
          >
            <StandardFlowVisualizerWithProvider
              nodes={demoNodes}
              edges={demoEdges}
              flows={dataFlows}
              onFlowComplete={handleFlowComplete}
              animationSpeed={animationSpeed}
              nodeTypes={nodeTypes}
              showControls={true}
              autoFitView={false}
            />
            <DragHint />
          </div>
          
          {Object.keys(steps).length > 0 && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Execution Log</h3>
                
                <div className="space-y-3">
                  {Array.isArray(patternData?.nodes) && patternData.nodes.map((node) => {
                    const step = steps[node.id];
                    if (!step) return null;
                    
                    return (
                      <div 
                        key={node.id} 
                        className={`p-3 rounded-md border ${
                          node.id === currentNodeId ? 'border-primary bg-primary/5' :
                          step.status === 'complete' ? 'border-green-500/20 bg-green-500/5' :
                          step.status === 'failed' ? 'border-destructive/20 bg-destructive/5' :
                          step.status === 'running' ? 'border-amber-500/20 bg-amber-500/5' :
                          'border-border'
                        } ${theme === 'dark' ? 'text-foreground' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {step.status === 'running' && <Clock className="text-amber-500" size={16} />}
                            {step.status === 'complete' && <CheckCircle className="text-green-500" size={16} />}
                            {step.status === 'failed' && <WarningCircle className="text-destructive" size={16} />}
                            
                            <span className="font-medium">{node.data?.label || 'Unknown Node'}</span>
                            
                            <Badge variant="outline" className="ml-1">
                              {node.data?.nodeType || 'node'}
                            </Badge>
                          </div>
                          
                          {step.status !== 'idle' && (
                            <span className="text-xs text-muted-foreground">
                              {getExecutionTime(step)}
                            </span>
                          )}
                        </div>
                        
                        {step.result && (
                          <div className="text-sm mt-1">
                            <div className="flex items-start gap-1 text-muted-foreground">
                              <ArrowBendDownRight size={14} className="mt-1" />
                              <span>{step.result}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          
          {output && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Final Output</h3>
                <Alert>
                  <AlertDescription>
                    {output}
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default PatternDemo;