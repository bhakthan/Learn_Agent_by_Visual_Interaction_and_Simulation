import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, ArrowRight, ArrowsClockwise, Gauge, ArrowsCounterClockwise } from '@phosphor-icons/react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodeExecutionStep } from './CodeStepVisualizer';

interface EnhancedCodeVisualizerProps {
  code: string;
  language: string;
  steps?: CodeExecutionStep[];
  title?: string;
}

/**
 * Enhanced code execution visualizer with additional features:
 * - Better variable state visualization
 * - Memory model visualization
 * - Execution flow diagram
 * - Detailed explanations at each step
 */
const EnhancedCodeVisualizer = ({ code, language, steps, title = "Code Execution" }: EnhancedCodeVisualizerProps) => {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1 = normal speed
  const [activeTab, setActiveTab] = useState<string>("code");
  const [executionHistory, setExecutionHistory] = useState<string[]>([]);
  
  const codeLines = code.split('\n');
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // If no steps are provided, generate basic ones based on line count
  const executionSteps = steps || codeLines.map((_, index) => ({
    lineStart: index,
    lineEnd: index,
    description: `Line ${index + 1} execution`,
  }));

  // Toggle play/pause state
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    
    // If at the end, reset to beginning
    if (currentStep === executionSteps.length - 1) {
      setCurrentStep(-1);
      setExecutionHistory([]);
    }
    
    // If not started yet, move to first step
    if (currentStep === -1 && !isPlaying) {
      nextStep();
    }
  };

  // Move to the next execution step
  const nextStep = () => {
    if (currentStep < executionSteps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      
      // Add to execution history
      const step = executionSteps[nextIdx];
      if (step.output) {
        setExecutionHistory(prev => [...prev, step.output || '']);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Reset the visualization to initial state
  const resetVisualization = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
    setExecutionHistory([]);
    setActiveTab("code"); // Reset to code tab for better user experience
  };

  // Auto-advance when playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < executionSteps.length - 1) {
      // Calculate delay based on speed (faster speed = lower delay)
      const baseDelay = 2000; // 2 seconds base delay
      const delay = baseDelay / speed;
      timer = setTimeout(nextStep, delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep, speed, executionSteps.length]);

  // Scroll active line into view
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeLine = activeLineRef.current;
      
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const activeLineTop = activeLine.offsetTop;
      const activeLineBottom = activeLineTop + activeLine.clientHeight;
      
      if (activeLineTop < containerTop) {
        container.scrollTop = activeLineTop - 50; // Add some padding
      } else if (activeLineBottom > containerBottom) {
        container.scrollTop = activeLineBottom - container.clientHeight + 50;
      }
    }
  }, [currentStep]);

  const activeStep = currentStep >= 0 ? executionSteps[currentStep] : null;
  
  // Get variables from all steps up to the current step
  const getAllVariables = () => {
    if (currentStep < 0) return {};
    
    // Collect all variables up to the current step
    const allVars: Record<string, string> = {};
    for (let i = 0; i <= currentStep; i++) {
      const stepVars = executionSteps[i].variableState || {};
      Object.entries(stepVars).forEach(([key, value]) => {
        allVars[key] = value;
      });
    }
    
    return allVars;
  };
  
  const currentVariables = getAllVariables();

  // Function to render the memory model visualization
  const renderMemoryModel = () => {
    const variables = getAllVariables();
    if (Object.keys(variables).length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          No variables in memory yet
        </div>
      );
    }
    
    // Group variables by type (primitive vs complex)
    const primitiveVars: [string, string][] = [];
    const complexVars: [string, string][] = [];
    
    Object.entries(variables).forEach(([key, value]) => {
      // Simple heuristic - if it starts with [ or { or contains "..." it's complex
      if (
        (typeof value === 'string' && (value.trim().startsWith('[') || value.trim().startsWith('{'))) ||
        (typeof value === 'string' && value.includes('...'))
      ) {
        complexVars.push([key, value]);
      } else {
        primitiveVars.push([key, value]);
      }
    });
    
    return (
      <div className="space-y-4">
        {/* Primitive variables */}
        {primitiveVars.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Primitive Values</h4>
            <div className="grid grid-cols-2 gap-2">
              {primitiveVars.map(([key, value], idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="bg-card p-2 rounded-md border flex items-center"
                >
                  <div className="font-medium text-primary mr-2">{key}:</div>
                  <div className="font-mono text-sm overflow-hidden text-ellipsis">{value}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Complex variables */}
        {complexVars.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Complex Values</h4>
            <div className="space-y-2">
              {complexVars.map(([key, value], idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="bg-card p-2 rounded-md border"
                >
                  <div className="font-medium text-primary mb-1">{key}:</div>
                  <pre className="font-mono text-xs overflow-x-auto p-1">{value}</pre>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Calculate progress percentage
  const progressPercentage = 
    currentStep === -1 ? 0 : 
    ((currentStep + 1) / executionSteps.length) * 100;
    
  return (
    <div className="border rounded-md overflow-hidden">
      {/* Control panel */}
      <div className="p-3 bg-muted border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="font-medium">{title}</h3>
            {activeStep && (
              <div className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {executionSteps.length}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Speed:</span>
            <Slider
              value={[speed]}
              min={0.5}
              max={3}
              step={0.5}
              onValueChange={(values) => setSpeed(values[0])}
              className="w-32"
            />
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {speed === 1 ? 'Normal' : speed < 1 ? 'Slow' : 'Fast'}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={togglePlay}
            className="flex items-center gap-1"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : currentStep === -1 ? 'Start' : currentStep === executionSteps.length - 1 ? 'Restart' : 'Continue'}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={nextStep}
            disabled={currentStep >= executionSteps.length - 1 || isPlaying}
            className="flex items-center gap-1"
          >
            <ArrowRight size={14} />
            Next Step
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={resetVisualization}
            disabled={currentStep === -1}
            className="flex items-center gap-1"
          >
            <ArrowsClockwise size={14} />
            Reset
          </Button>
          
          {currentStep > -1 && (
            <div className="ml-auto text-xs text-muted-foreground flex items-center">
              <Gauge size={14} className="mr-1" />
              {Math.round(progressPercentage)}% complete
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b rounded-none">
          <TabsTrigger value="code">Code View</TabsTrigger>
          <TabsTrigger value="memory">Memory Model</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="p-0 border-none">
          <div className="flex flex-col md:flex-row">
            {/* Code panel */}
            <div 
              className="w-full md:w-3/5 overflow-auto font-mono text-sm bg-card"
              style={{ maxHeight: '500px' }}
              ref={containerRef}
            >
              <div className="p-4">
                {codeLines.map((line, idx) => {
                  const isActive = activeStep && 
                    idx >= activeStep.lineStart && 
                    idx <= activeStep.lineEnd;
                  
                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLineRef : null}
                      className={`flex px-2 py-0.5 rounded ${
                        isActive ? 'bg-primary/10 border-l-2 border-primary' : ''
                      }`}
                    >
                      <div className="w-8 text-muted-foreground text-right mr-4">{idx + 1}</div>
                      <div className="flex-1">
                        <pre className="whitespace-pre-wrap break-all">{line || ' '}</pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Explanation panel */}
            <div className="w-full md:w-2/5 border-t md:border-t-0 md:border-l p-4 bg-muted/30">
              {activeStep ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h4 className="text-sm font-medium mb-1">What's happening:</h4>
                      <p className="text-sm">{activeStep.description}</p>
                    </div>
                    
                    {activeStep.output && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Output:</h4>
                        <div className="bg-background/80 p-2 rounded border text-sm font-mono whitespace-pre-wrap">
                          {activeStep.output}
                        </div>
                      </div>
                    )}
                    
                    {activeStep.variableState && Object.keys(activeStep.variableState).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Updated Variables:</h4>
                        <div className="bg-background/80 p-2 rounded border">
                          {Object.entries(activeStep.variableState).map(([key, value]) => (
                            <div key={key} className="flex text-sm mb-1">
                              <span className="font-medium text-primary w-1/3">{key}:</span>
                              <span className="font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                  <Play size={32} weight="duotone" className="mb-3 text-muted-foreground" />
                  <p>Press Start to begin the step-by-step execution</p>
                  <p className="text-xs mt-2 max-w-xs">Follow along as the code executes line by line, with detailed explanations at each step</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="memory" className="p-4 border-none">
          {currentStep === -1 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
              <ArrowsCounterClockwise size={32} weight="duotone" className="mb-3" />
              <p>Start execution to see memory state</p>
            </div>
          ) : (
            renderMemoryModel()
          )}
        </TabsContent>
        
        <TabsContent value="output" className="p-0 border-none">
          <div className="p-4 bg-black text-green-400 font-mono rounded-md min-h-[200px] max-h-[500px] overflow-auto">
            {executionHistory.length === 0 ? (
              <div className="text-gray-500">// Output will appear here during execution</div>
            ) : (
              executionHistory.map((output, idx) => (
                <div key={idx} className="mb-2">
                  {output}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {currentStep === executionSteps.length - 1 && (
        <Alert className="m-4">
          <AlertDescription>
            Execution complete! You can restart to see the process again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedCodeVisualizer;