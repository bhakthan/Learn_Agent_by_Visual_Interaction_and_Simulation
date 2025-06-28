import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Pause, ArrowRight, ArrowsClockwise, CaretRight } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlgorithmVisualizationData } from '@/lib/utils/algorithmVisualization';

interface AlgorithmVisualizerProps {
  visualization: AlgorithmVisualizationData;
}

/**
 * Interactive visualization of algorithm execution steps
 */
const AlgorithmVisualizer = ({ visualization }: AlgorithmVisualizerProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubsteps, setShowSubsteps] = useState(false);
  const [expandedData, setExpandedData] = useState<{ [key: string]: boolean }>({});

  // Ensure visualization.steps exists and is an array
  const steps = visualization?.steps || [];
  const currentStep = steps[currentStepIndex] || null;
  const totalSteps = steps.length;

  // Toggle play/pause
  const togglePlay = () => {
    if (currentStepIndex >= totalSteps - 1) {
      // Reset to beginning if at the end
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Move to next step
  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  // Reset visualization
  const resetVisualization = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Auto-advance when playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < totalSteps - 1) {
      timer = setTimeout(nextStep, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, totalSteps]);

  // Toggle data expansion
  const toggleDataExpansion = (key: string) => {
    setExpandedData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!visualization || !steps.length) {
    return (
      <div className="border rounded-md p-6 text-center text-muted-foreground">
        <ArrowsClockwise size={32} className="mx-auto mb-2" />
        <p>Algorithm visualization data is not available for this pattern.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-3 bg-muted border-b">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-medium">{visualization.patternId}</h3>
            <p className="text-sm text-muted-foreground">Algorithm visualization</p>
          </div>
          <div className="flex items-center space-x-2">
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
              disabled={currentStepIndex >= totalSteps - 1 || isPlaying}
              className="flex items-center gap-1"
            >
              <ArrowRight size={14} />
              Next
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={resetVisualization}
              disabled={currentStepIndex === 0 && !isPlaying}
              className="flex items-center gap-1"
            >
              <ArrowsClockwise size={14} />
              Reset
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            Step {currentStepIndex + 1} of {totalSteps}
          </div>
          
          {currentStep?.substeps && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowSubsteps(!showSubsteps)}
              className="text-xs"
            >
              {showSubsteps ? 'Hide Details' : 'Show Details'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {/* Step Progress Visualization */}
        <div className="flex items-center mb-6 overflow-x-auto pb-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center flex-shrink-0">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  idx < currentStepIndex 
                    ? 'bg-primary text-primary-foreground' 
                    : idx === currentStepIndex 
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </div>
              
              {idx < steps.length - 1 && (
                <div 
                  className={`h-1 w-12 ${
                    idx < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Current Step Details */}
        {currentStep && (
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <h3 className="text-lg font-medium mb-2">{currentStep.name}</h3>
            <p className="text-muted-foreground mb-4">{currentStep.description}</p>
            
            {/* Step Data Visualization */}
            {currentStep.data && (
              <Card className="p-4 mb-4">
                <h4 className="text-sm font-medium mb-2">Step Data:</h4>
                <div className="space-y-2">
                  {Object.entries(currentStep.data).map(([key, value]) => {
                    const isExpanded = expandedData[key] || false;
                    const isExpandable = typeof value === 'string' && value.length > 50;
                    
                    return (
                      <div key={key} className="flex flex-col">
                        <div className="flex items-center">
                          <span className="font-medium text-primary mr-2">{key}:</span>
                          {isExpandable ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleDataExpansion(key)}
                              className="text-xs h-6 px-2 py-0"
                            >
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </Button>
                          ) : null}
                        </div>
                        <div className={`font-mono text-sm mt-1 ${isExpandable && !isExpanded ? 'line-clamp-2' : ''}`}>
                          {Array.isArray(value) ? (
                            <ul className="list-disc list-inside">
                              {value.map((item, idx) => (
                                <li key={idx} className="ml-2">{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <pre className="whitespace-pre-wrap break-all">{value}</pre>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
            
            {/* Substeps Visualization */}
            {currentStep.substeps && showSubsteps && (
              <div className="bg-muted/30 p-4 rounded-md border mt-4">
                <h4 className="text-sm font-medium mb-2">Detailed Steps:</h4>
                <ol className="space-y-2 ml-4">
                  {currentStep.substeps.map((substep, idx) => (
                    <li key={idx} className="flex items-start">
                      <CaretRight size={16} className="mt-0.5 text-primary mr-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{substep.name}</div>
                        <div className="text-sm text-muted-foreground">{substep.description}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-muted w-full">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

export default AlgorithmVisualizer;

