import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Stop, ArrowRight, ArrowsClockwise, Gauge } from '@phosphor-icons/react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InteractiveCodeExecutionProps {
  codeBlocks: ExecutionBlock[];
  description: string;
  showConsole?: boolean;
}

interface ExecutionBlock {
  code: string;
  explanation: string;
  output?: string;
  variableState?: Record<string, string>;
  duration?: number; // Execution time in ms
}

/**
 * A component that demonstrates code execution in an interactive step-by-step format
 * Shows code, console output, and variables state as execution progresses
 */
const InteractiveCodeExecution = ({ 
  codeBlocks, 
  description,
  showConsole = true
}: InteractiveCodeExecutionProps) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(-1);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1); // 1 = normal speed
  const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);

  // Start execution
  const startExecution = () => {
    if (currentBlockIndex >= codeBlocks.length - 1) {
      // Reset if we're at the end
      resetExecution();
      return;
    }
    
    setIsRunning(true);
    if (currentBlockIndex === -1) {
      moveToNextBlock();
    }
  };
  
  // Stop execution
  const stopExecution = () => {
    setIsRunning(false);
  };
  
  // Reset the execution
  const resetExecution = () => {
    setCurrentBlockIndex(-1);
    setConsoleOutput([]);
    setVariables({});
    setIsRunning(false);
    setCompletedBlocks([]);
  };
  
  // Execute current block
  const executeCurrentBlock = () => {
    if (currentBlockIndex < 0 || currentBlockIndex >= codeBlocks.length) return;
    
    const block = codeBlocks[currentBlockIndex];
    
    // Add any output to console
    if (block.output) {
      setConsoleOutput(prev => [...prev, block.output || '']);
    }
    
    // Update variable state
    if (block.variableState) {
      setVariables(prev => ({...prev, ...block.variableState}));
    }
    
    // Mark block as completed
    setCompletedBlocks(prev => [...prev, currentBlockIndex]);
  };
  
  // Move to the next block
  const moveToNextBlock = () => {
    if (currentBlockIndex < codeBlocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    } else {
      setIsRunning(false);
    }
  };
  
  // Auto-advance when running
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && currentBlockIndex >= 0 && currentBlockIndex < codeBlocks.length) {
      const currentBlock = codeBlocks[currentBlockIndex];
      
      // Execute the current block
      executeCurrentBlock();
      
      // Calculate delay - either use block's specified duration or a default
      const baseDelay = currentBlock.duration || 1500; 
      const adjustedDelay = baseDelay / speed;
      
      // Set timer for next block
      timer = setTimeout(() => {
        moveToNextBlock();
      }, adjustedDelay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRunning, currentBlockIndex, codeBlocks, speed]);
  
  // Stop running when reached the end
  useEffect(() => {
    if (currentBlockIndex >= codeBlocks.length - 1) {
      setIsRunning(false);
    }
  }, [currentBlockIndex, codeBlocks]);
  
  const currentBlock = currentBlockIndex >= 0 ? codeBlocks[currentBlockIndex] : null;
  
  return (
    <div className="border rounded-md">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium">Interactive Code Execution</div>
          
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
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={isRunning ? stopExecution : startExecution}
            className="flex items-center gap-1"
          >
            {isRunning ? <Stop size={14} /> : <Play size={14} />}
            {isRunning ? 'Pause' : currentBlockIndex >= codeBlocks.length - 1 ? 'Restart' : 'Run'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={moveToNextBlock}
            disabled={isRunning || currentBlockIndex >= codeBlocks.length - 1}
            className="flex items-center gap-1"
          >
            <ArrowRight size={14} />
            Next Step
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetExecution}
            disabled={isRunning || currentBlockIndex === -1}
            className="flex items-center gap-1"
          >
            <ArrowsClockwise size={14} />
            Reset
          </Button>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Code section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Code Execution</h3>
          
          {currentBlockIndex === -1 ? (
            <div className="bg-card p-4 rounded-md border min-h-[150px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Click "Run" to start execution</p>
            </div>
          ) : (
            <div className="bg-card p-4 rounded-md border">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={isRunning ? "default" : "outline"}>
                  {isRunning ? "Running" : "Paused"} - Step {currentBlockIndex + 1}/{codeBlocks.length}
                </Badge>
                
                <span className="text-xs text-muted-foreground">
                  <Gauge size={14} className="inline mr-1" />
                  {codeBlocks[currentBlockIndex]?.duration || 1500}ms
                </span>
              </div>
              
              <pre className="bg-muted p-3 rounded font-mono text-sm whitespace-pre overflow-x-auto">
                {currentBlock?.code}
              </pre>
              
              <div className="mt-2 text-sm">
                <p>{currentBlock?.explanation}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Output and variable state */}
        <div className="space-y-4">
          {showConsole && (
            <>
              <h3 className="text-sm font-medium">Console Output</h3>
              <div className="bg-black text-green-400 font-mono p-4 rounded-md min-h-[100px] max-h-[150px] overflow-auto">
                {consoleOutput.length === 0 ? (
                  <span className="text-gray-500 text-sm">// Console output will appear here</span>
                ) : (
                  consoleOutput.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))
                )}
              </div>
            </>
          )}
          
          <h3 className="text-sm font-medium">Variables</h3>
          <div className="bg-card border rounded-md p-4 min-h-[100px]">
            {Object.keys(variables).length === 0 ? (
              <p className="text-muted-foreground text-sm">No variables initialized yet</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} className="flex">
                    <div className="font-medium text-primary mr-2">{key}:</div>
                    <div className="font-mono text-sm">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {currentBlockIndex === codeBlocks.length - 1 && !isRunning && (
        <Alert className="m-4">
          <AlertDescription>
            Execution complete! You can restart to see the process again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default InteractiveCodeExecution;