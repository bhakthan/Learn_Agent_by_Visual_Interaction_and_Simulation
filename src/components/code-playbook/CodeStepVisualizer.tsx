import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, ArrowRight, ArrowsClockwise } from '@phosphor-icons/react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface CodeStepVisualizerProps {
  code: string;
  language: string;
  steps?: CodeExecutionStep[];
}

export interface CodeExecutionStep {
  lineStart: number;
  lineEnd: number;
  description: string;
  output?: string;
  variableState?: Record<string, string>;
}

const CodeStepVisualizer = ({ code, language, steps }: CodeStepVisualizerProps) => {
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1 = normal speed
  const codeLines = code.split('\n');
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // If no steps are provided, generate basic ones based on line count
  const executionSteps = steps || codeLines.map((_, index) => ({
    lineStart: index,
    lineEnd: index,
    description: `Line ${index + 1} execution`,
  }));

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (currentStep === executionSteps.length - 1) {
      setCurrentStep(-1); // Reset to start if at the end
    }
  };

  const nextStep = () => {
    if (currentStep < executionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const resetVisualization = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  // Auto-advance when playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      // Calculate delay based on speed (faster speed = lower delay)
      const delay = 2000 / speed;
      timer = setTimeout(nextStep, delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep, speed]);

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
        container.scrollTop = activeLineTop;
      } else if (activeLineBottom > containerBottom) {
        container.scrollTop = activeLineBottom - container.clientHeight;
      }
    }
  }, [currentStep]);

  const activeStep = currentStep >= 0 ? executionSteps[currentStep] : null;
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-muted p-2 border-b">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={togglePlay}
            className="flex items-center gap-1"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={nextStep}
            disabled={currentStep >= executionSteps.length - 1 || isPlaying}
            className="flex items-center gap-1"
          >
            <ArrowRight size={14} />
            Next
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={resetVisualization}
            className="flex items-center gap-1"
          >
            <ArrowsClockwise size={14} />
            Reset
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-1/3">
          <span className="text-xs text-muted-foreground">Speed:</span>
          <Slider
            value={[speed]}
            min={0.25}
            max={3}
            step={0.25}
            onValueChange={(values) => setSpeed(values[0])}
            className="w-full"
          />
          <Badge variant="outline" className="text-xs">
            {speed === 1 ? 'Normal' : speed < 1 ? 'Slow' : 'Fast'}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        <div 
          className="w-full md:w-2/3 overflow-auto font-mono text-sm bg-card"
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
        
        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l p-4 bg-muted/30">
          {activeStep ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-medium mb-1">Step {currentStep + 1} of {executionSteps.length}</h4>
                <p className="text-sm text-muted-foreground">{activeStep.description}</p>
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
                  <h4 className="text-sm font-medium mb-1">Variable State:</h4>
                  <div className="bg-background/80 p-2 rounded border">
                    {Object.entries(activeStep.variableState).map(([key, value]) => (
                      <div key={key} className="flex text-sm">
                        <span className="font-medium text-primary w-1/3">{key}:</span>
                        <span className="font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <ArrowPlay size={24} className="mb-2" />
              <p className="text-sm">Press Play to start the step-by-step code visualization</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ArrowPlay icon component
const ArrowPlay = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

export default CodeStepVisualizer;