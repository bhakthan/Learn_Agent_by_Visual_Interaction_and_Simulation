import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, ArrowRight, ArrowsClockwise, Bug, Terminal } from '@phosphor-icons/react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DebuggerStep {
  lineNumbers: number[];
  variables: Record<string, any>;
  output?: string;
  explanation: string;
}

interface CodeDebuggerProps {
  code: string;
  language: string;
  steps: DebuggerStep[];
  title?: string;
}

/**
 * Interactive code debugger that shows execution with variable state and console output
 */
const CodeDebugger = ({ code, language, steps, title = "Code Debugging" }: CodeDebuggerProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'console' | 'variables'>('console');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  
  const codeLines = code.split('\n');
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  
  const currentStep = steps[currentStepIndex];

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Move to next step
  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      
      // Add any console output from this step
      if (steps[currentStepIndex + 1].output) {
        setConsoleOutput(prev => [...prev, steps[currentStepIndex + 1].output || '']);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Reset to beginning
  const resetDebugger = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setConsoleOutput([]);
  };

  // Auto-advance when playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      // Calculate delay based on speed
      const baseDelay = 2000;
      const delay = baseDelay / speed;
      timer = setTimeout(nextStep, delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, speed, steps.length]);

  // Scroll active line into view
  useEffect(() => {
    if (activeLineRef.current && codeContainerRef.current) {
      const container = codeContainerRef.current;
      const activeLine = activeLineRef.current;
      
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const activeLineTop = activeLine.offsetTop;
      const activeLineBottom = activeLineTop + activeLine.clientHeight;
      
      if (activeLineTop < containerTop || activeLineBottom > containerBottom) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStepIndex]);

  // Initialize with first step's output if available
  useEffect(() => {
    if (steps[0]?.output) {
      setConsoleOutput([steps[0].output]);
    }
  }, []);

  // Calculate progress percentage
  const progressPercentage = (currentStepIndex + 1) / steps.length * 100;

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Header and controls */}
      <div className="bg-muted p-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Bug size={18} />
            <h3 className="font-medium">{title}</h3>
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
            <Badge variant="outline" className="text-xs">
              {speed === 1 ? 'Normal' : speed < 1 ? 'Slow' : 'Fast'}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={togglePlay}
              className="flex items-center gap-1"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Pause' : 'Run'}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={nextStep}
              disabled={isPlaying || currentStepIndex >= steps.length - 1}
              className="flex items-center gap-1"
            >
              <ArrowRight size={14} />
              Step
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={resetDebugger}
              disabled={currentStepIndex === 0 && consoleOutput.length === 0}
              className="flex items-center gap-1"
            >
              <ArrowsClockwise size={14} />
              Reset
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-muted-foreground/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Code panel */}
        <div className="border-r">
          <div
            ref={codeContainerRef}
            className="h-[400px] overflow-auto p-4 font-mono text-sm"
          >
            {codeLines.map((line, idx) => {
              const isActiveLine = currentStep?.lineNumbers.includes(idx);
              
              return (
                <div
                  key={idx}
                  ref={isActiveLine ? activeLineRef : null}
                  className={`flex px-2 py-0.5 rounded ${
                    isActiveLine
                      ? 'bg-primary/10 border-l-2 border-primary'
                      : ''
                  }`}
                >
                  <div className="w-8 text-muted-foreground text-right mr-4">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <pre className="whitespace-pre-wrap break-all">{line || ' '}</pre>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Debug info panel */}
        <div className="flex flex-col">
          {/* Explanation of current step */}
          <div className="p-4 border-b">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="mb-2"
              >
                <h4 className="text-sm font-medium mb-1">Current Operation:</h4>
                <p>{currentStep?.explanation}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Console and variables tabs */}
          <Tabs defaultValue="console" value={activeTab} onValueChange={(v) => setActiveTab(v as 'console' | 'variables')}>
            <TabsList className="grid grid-cols-2 w-full rounded-none border-b">
              <TabsTrigger value="console" className="flex items-center gap-1">
                <Terminal size={14} /> Console
              </TabsTrigger>
              <TabsTrigger value="variables" className="flex items-center gap-1">
                <Bug size={14} /> Variables
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="console" className="p-0 border-none m-0">
              <div className="h-[204px] bg-black text-green-400 font-mono p-4 overflow-auto">
                {consoleOutput.length === 0 ? (
                  <div className="text-gray-500">// Console output will appear here</div>
                ) : (
                  consoleOutput.map((output, idx) => (
                    <div key={idx} className="mb-1">
                      {output}
                    </div>
                  ))
                )}
                {/* Blinking cursor */}
                <div className="flex items-center">
                  <span className="text-gray-400">&gt;</span>
                  <motion.div
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-4 ml-1 bg-green-400"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="variables" className="p-0 border-none m-0">
              <div className="h-[204px] p-4 overflow-auto">
                {currentStep?.variables && Object.keys(currentStep.variables).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(currentStep.variables).map(([key, value], idx) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-card border rounded-md p-2"
                      >
                        <div className="flex items-start">
                          <span className="text-primary font-medium mr-2">{key}:</span>
                          <code className="text-sm font-mono break-all">
                            {typeof value === 'string' 
                              ? value 
                              : JSON.stringify(value, null, 2)}
                          </code>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No variables to display
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CodeDebugger;