import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { PatternData } from '@/lib/data/patterns'
import { Play, ArrowsClockwise, CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react"

// Mock response generation to simulate LLM calls
const generateMockResponse = (text: string, patternId: string) => {
  return new Promise<string>((resolve) => {
    // Add random delay for realistic effect
    const delay = 500 + Math.random() * 1500;
    setTimeout(() => {
      if (patternId === 'prompt-chaining') {
        resolve(`This is an analysis of your input "${text}" using a chain of specialized prompts to extract meaning, determine intent, and formulate a response.`);
      } else if (patternId === 'parallelization') {
        resolve(`Three independent analyses of "${text}" run in parallel and aggregated to provide a more robust response with diverse perspectives.`);
      } else {
        resolve(`Processed your input "${text}" using the ${patternId} pattern.`);
      }
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

const PatternDemo = ({ patternData }: PatternDemoProps) => {
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, StepState>>({});
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  
  const resetDemo = () => {
    setIsRunning(false);
    setOutput(null);
    setSteps({});
    setCurrentNodeId(null);
  };

  const runDemo = async () => {
    if (!userInput.trim() || isRunning) return;
    
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
      
      // Process input node
      await processNode(inputNode.id);
      
      // Final output
      setIsRunning(false);
    } catch (error) {
      console.error('Error in demo:', error);
      setIsRunning(false);
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };
  
  const processNode = async (nodeId: string) => {
    // Mark node as running
    setCurrentNodeId(nodeId);
    setSteps(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], status: 'running', startTime: Date.now() }
    }));
    
    const node = patternData.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    
    try {
      // Process node based on type
      let result = '';
      
      if (node.data.nodeType === 'input') {
        result = `Processing input: "${userInput}"`;
        await new Promise(resolve => setTimeout(resolve, 500)); // Short delay for input
      } else if (node.data.nodeType === 'llm') {
        result = await generateMockResponse(userInput, patternData.id);
      } else if (node.data.nodeType === 'router') {
        result = 'Determining next steps based on input analysis...';
        await new Promise(resolve => setTimeout(resolve, 800)); // Delay for router decision
        
        // Router logic - randomly choose a path for demo purposes
        const shouldSucceed = Math.random() > 0.2; // 80% success rate
        if (!shouldSucceed) {
          throw new Error('Router determined input cannot be processed further');
        }
      } else if (node.data.nodeType === 'aggregator') {
        result = 'Combining results from parallel processes...';
        await new Promise(resolve => setTimeout(resolve, 1200)); // Longer delay for aggregation
      } else {
        result = `Processed by ${node.data.label}`;
        await new Promise(resolve => setTimeout(resolve, 700));
      }
      
      // Mark node as complete
      setSteps(prev => ({
        ...prev,
        [nodeId]: { 
          ...prev[nodeId], 
          status: 'complete', 
          result, 
          endTime: Date.now() 
        }
      }));
      
      // If output node, set final output
      if (node.data.nodeType === 'output') {
        setOutput(result);
        return;
      }
      
      // Find next nodes
      const outgoingEdges = patternData.edges.filter(edge => edge.source === nodeId);
      
      // Process next nodes sequentially
      for (const edge of outgoingEdges) {
        // Animate edge
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Process target node
        await processNode(edge.target);
      }
    } catch (error) {
      console.error(`Error processing node ${nodeId}:`, error);
      
      // Mark node as failed
      setSteps(prev => ({
        ...prev,
        [nodeId]: { 
          ...prev[nodeId], 
          status: 'failed', 
          result: error instanceof Error ? error.message : 'Unknown error',
          endTime: Date.now()
        }
      }));
      
      // Check if there are failure edges
      const failureEdge = patternData.edges.find(edge => 
        edge.source === nodeId && 
        patternData.nodes.find(n => n.id === edge.target)?.data.label?.toLowerCase().includes('fail')
      );
      
      if (failureEdge) {
        // Process failure path
        await processNode(failureEdge.target);
      } else {
        throw error; // Propagate error if no failure path
      }
    }
  };
  
  // Calculate execution time for a step
  const getExecutionTime = (step: StepState) => {
    if (step.startTime && step.endTime) {
      return `${((step.endTime - step.startTime) / 1000).toFixed(1)}s`;
    }
    return '';
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Interactive {patternData.name} Demo</CardTitle>
        <CardDescription>
          See how this pattern processes user input in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter some text to process..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isRunning}
              className="flex-1"
            />
            <Button 
              onClick={runDemo} 
              disabled={!userInput.trim() || isRunning}
            >
              {isRunning ? <ArrowsClockwise className="mr-2 animate-spin" size={16} /> : <Play className="mr-2" size={16} />}
              {isRunning ? 'Running...' : 'Run Demo'}
            </Button>
          </div>
          
          {Object.keys(steps).length > 0 && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Execution Flow</h3>
                
                <div className="space-y-3">
                  {patternData.nodes.map((node) => {
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
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {step.status === 'running' && <Clock className="text-amber-500" size={16} />}
                            {step.status === 'complete' && <CheckCircle className="text-green-500" size={16} />}
                            {step.status === 'failed' && <WarningCircle className="text-destructive" size={16} />}
                            
                            <span className="font-medium">{node.data.label}</span>
                            
                            <Badge variant="outline" className="ml-1">
                              {node.data.nodeType}
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
                            {step.result}
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
                  <AlertDescription className="whitespace-pre-wrap">
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
};

export default PatternDemo;