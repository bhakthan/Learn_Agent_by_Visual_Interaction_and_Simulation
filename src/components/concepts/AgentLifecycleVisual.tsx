import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "@phosphor-icons/react";
import { useTheme } from '@/components/theme/ThemeProvider';

interface AgentLifecycleProps {
  autoPlay?: boolean;
}

const AgentLifecycleVisual: React.FC<AgentLifecycleProps> = ({ autoPlay = false }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  const colors = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#d1d5db',
    text: isDarkMode ? '#f9fafb' : '#111827',
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    secondary: isDarkMode ? '#6b7280' : '#6b7280',
    active: isDarkMode ? '#10b981' : '#059669',
    inactive: isDarkMode ? '#4b5563' : '#9ca3af',
    accent: isDarkMode ? '#f59e0b' : '#d97706'
  };

  const steps = [
    {
      id: 0,
      title: "Input Received",
      description: "User provides query or task",
      icon: "📥",
      position: { x: 50, y: 125 }
    },
    {
      id: 1,
      title: "Task Analysis",
      description: "Agent analyzes and understands the request",
      icon: "🧠",
      position: { x: 200, y: 60 }
    },
    {
      id: 2,
      title: "Planning",
      description: "Creates step-by-step execution plan",
      icon: "📋",
      position: { x: 400, y: 30 }
    },
    {
      id: 3,
      title: "Tool Selection",
      description: "Identifies required tools and resources",
      icon: "🔧",
      position: { x: 600, y: 60 }
    },
    {
      id: 4,
      title: "Execution",
      description: "Performs actions and gathers information",
      icon: "⚡",
      position: { x: 720, y: 125 }
    },
    {
      id: 5,
      title: "Evaluation",
      description: "Assesses results and determines next steps",
      icon: "✅",
      position: { x: 600, y: 220 }
    },
    {
      id: 6,
      title: "Response",
      description: "Delivers final answer or continues iteration",
      icon: "💬",
      position: { x: 400, y: 250 }
    },
    {
      id: 7,
      title: "Learning",
      description: "Updates knowledge for future tasks",
      icon: "📚",
      position: { x: 200, y: 220 }
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, steps.length]);

  const getStepColor = (stepId: number) => {
    if (stepId === currentStep) return colors.active;
    if (stepId < currentStep) return colors.primary;
    return colors.inactive;
  };

  const getConnectionPath = (from: number, to: number) => {
    const fromStep = steps[from];
    const toStep = steps[to];
    const startX = fromStep.position.x + 40;
    const startY = fromStep.position.y + 40;
    const endX = toStep.position.x + 40;
    const endY = toStep.position.y + 40;
    
    // Create curved path
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const controlX = midX + (startY - endY) * 0.1;
    const controlY = midY + (endX - startX) * 0.1;
    
    return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  };

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 1] // Cycle back to analysis
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Agent Lifecycle & Decision Flow</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
              }}
            >
              <RotateCcw size={16} />
              Reset
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Watch how an AI agent processes tasks through its cognitive cycle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            width="800"
            height="300"
            viewBox="0 0 800 400"
            className="w-full h-auto border rounded-lg"
            style={{ backgroundColor: colors.background }}
          >
            {/* Definitions */}
            <defs>
              <marker
                id="agent-arrow"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 8 3, 0 6"
                  fill={colors.secondary}
                />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Connection paths */}
            {connections.map(([from, to], index) => (
              <path
                key={`connection-${from}-${to}`}
                d={getConnectionPath(from, to)}
                stroke={currentStep >= from ? colors.primary : colors.inactive}
                strokeWidth="2"
                fill="none"
                markerEnd="url(#agent-arrow)"
                className={currentStep === from ? "animate-pulse" : ""}
                strokeDasharray={currentStep === from ? "5,5" : "none"}
              />
            ))}

            {/* Step nodes */}
            {steps.map((step) => (
              <g key={step.id}>
                {/* Node circle */}
                <circle
                  cx={step.position.x + 40}
                  cy={step.position.y + 40}
                  r="35"
                  fill={getStepColor(step.id)}
                  stroke={colors.border}
                  strokeWidth="2"
                  filter={step.id === currentStep ? "url(#glow)" : "none"}
                  className={step.id === currentStep ? "animate-pulse" : ""}
                />
                
                {/* Step icon */}
                <text
                  x={step.position.x + 40}
                  y={step.position.y + 48}
                  textAnchor="middle"
                  className="text-lg"
                >
                  {step.icon}
                </text>
                
                {/* Step title */}
                <text
                  x={step.position.x + 40}
                  y={step.position.y + 100}
                  textAnchor="middle"
                  fill={colors.text}
                  className="text-sm font-medium"
                >
                  {step.title}
                </text>
                
                {/* Step description */}
                <text
                  x={step.position.x + 40}
                  y={step.position.y + 115}
                  textAnchor="middle"
                  fill={colors.secondary}
                  className="text-xs"
                >
                  {step.description}
                </text>
                
                {/* Current step indicator - subtle highlight */}
                {step.id === currentStep && (
                  <circle
                    cx={step.position.x + 40}
                    cy={step.position.y + 40}
                    r="42"
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth="3"
                    opacity="0.6"
                  />
                )}
              </g>
            ))}

            {/* Central legend - moved to top right to avoid occlusion */}
            <rect
              x="680"
              y="20"
              width="180"
              height="70"
              rx="8"
              fill={colors.background}
              stroke={colors.border}
              strokeWidth="1"
              fillOpacity="0.95"
              strokeDasharray="3,3"
            />
            <text x="770" y="40" textAnchor="middle" fill={colors.text} className="text-sm font-semibold">
              Agent Cognitive Cycle
            </text>
            <text x="770" y="55" textAnchor="middle" fill={colors.secondary} className="text-xs">
              Continuous learning and adaptation
            </text>
            <text x="770" y="70" textAnchor="middle" fill={colors.secondary} className="text-xs">
              through experience and feedback
            </text>
          </svg>
        </div>
        
        {/* Step details */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold text-lg mb-2">
            Current Step: {steps[currentStep].title}
          </h4>
          <p className="text-muted-foreground text-sm">
            {steps[currentStep].description}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentLifecycleVisual;
