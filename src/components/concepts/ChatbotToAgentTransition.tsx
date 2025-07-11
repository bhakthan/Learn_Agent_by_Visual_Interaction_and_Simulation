import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimationStep {
  id: string;
  title: string;
  description: string;
  chatbotResponse?: string;
  agentThought?: string;
  agentAction?: string;
  agentObservation?: string;
  agentResponse?: string;
  duration: number;
  highlight: string[];
}

const ChatbotToAgentTransition: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const animationSteps: AnimationStep[] = [
    {
      id: 'user-query',
      title: 'User Query',
      description: 'User asks a complex question requiring multiple steps',
      duration: 2000,
      highlight: ['user-input']
    },
    {
      id: 'chatbot-response',
      title: 'Traditional Chatbot',
      description: 'Provides a direct but limited response',
      chatbotResponse: 'I can help you with scheduling. Please provide more details about what you need.',
      duration: 3000,
      highlight: ['chatbot-response']
    },
    {
      id: 'agent-thinking',
      title: 'Azure AI Agent - Planning',
      description: 'Agent analyzes the query and creates a multi-step plan',
      agentThought: 'I need to: 1) Check calendar availability, 2) Calculate optimal meeting times, 3) Send invitations, 4) Set reminders',
      duration: 3500,
      highlight: ['agent-planning', 'memory']
    },
    {
      id: 'agent-tool-1',
      title: 'Tool Usage - Calendar',
      description: 'Agent uses calendar tool to check availability',
      agentAction: 'calendar.getAvailability(participants, timeRange)',
      agentObservation: 'Found 3 available slots: 2pm-3pm, 4pm-5pm, 9am-10am tomorrow',
      duration: 3000,
      highlight: ['tools', 'calendar-tool']
    },
    {
      id: 'agent-tool-2',
      title: 'Tool Usage - Calculator',
      description: 'Agent calculates optimal meeting time based on preferences',
      agentAction: 'calculator.findOptimalTime(availableSlots, preferences)',
      agentObservation: 'Optimal time: 2pm-3pm today (highest preference score: 0.95)',
      duration: 3000,
      highlight: ['tools', 'calculator-tool']
    },
    {
      id: 'agent-reflection',
      title: 'Self-Reflection',
      description: 'Agent reviews its plan and considers next steps',
      agentThought: 'I have found the optimal time. Now I should send calendar invitations and set up reminders.',
      duration: 2500,
      highlight: ['reflection', 'planning']
    },
    {
      id: 'agent-final-action',
      title: 'Final Actions',
      description: 'Agent executes remaining tasks autonomously',
      agentAction: 'calendar.sendInvitations() + reminder.schedule()',
      agentObservation: 'Invitations sent to 3 participants. Reminders set for 1 hour and 15 minutes before.',
      duration: 3000,
      highlight: ['tools', 'action']
    },
    {
      id: 'agent-response',
      title: 'Complete Response',
      description: 'Agent provides comprehensive results',
      agentResponse: 'I\'ve scheduled your team meeting for today 2-3pm. All participants have been invited and reminders are set. The meeting room is booked and I\'ve prepared the agenda based on your requirements.',
      duration: 4000,
      highlight: ['agent-response', 'memory']
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < animationSteps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, animationSteps[currentStep].duration);
    } else if (currentStep >= animationSteps.length - 1) {
      setIsPlaying(false);
      setShowComparison(true);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, animationSteps]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setShowComparison(false);
  };

  const currentStepData = animationSteps[currentStep];

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>From Chatbot to Azure AI Agent</span>
          <Badge variant="secondary">Interactive Demo</Badge>
        </CardTitle>
        <p className="text-muted-foreground">
          Watch how Azure AI Agents differ from traditional chatbots through autonomous reasoning and tool usage
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Control Buttons */}
          <div className="flex gap-2 justify-center">
            <Button onClick={handlePlay} variant="outline" size="sm">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / animationSteps.length) * 100}%` }}
            />
          </div>

          {/* Main Animation Area */}
          <div className="relative">
            <svg
              viewBox="0 0 1200 900"
              className="w-full h-auto border rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900"
            >
              {/* Define styles for dark mode compatibility */}
              <defs>
                <style>
                  {`
                    /* Text colors for light and dark modes with improved readability */
                    .svg-text-primary { fill: rgb(30 41 59); font-family: 'Inter', sans-serif; }
                    .svg-text-secondary { fill: rgb(71 85 105); font-family: 'Inter', sans-serif; }
                    .svg-text-white { fill: rgb(255 255 255); font-family: 'Inter', sans-serif; }
                    .svg-text-muted { fill: rgb(100 116 139); font-family: 'Inter', sans-serif; }
                    
                    /* Connection lines and arrows with better visibility */
                    .svg-line { 
                      stroke: rgb(59 130 246); 
                      stroke-width: 3; 
                      opacity: 0.8;
                    }
                    .svg-line-muted { 
                      stroke: rgb(100 116 139); 
                      stroke-width: 2; 
                      opacity: 0.6;
                    }
                    
                    /* Animated flow lines */
                    .svg-line-animated {
                      stroke: rgb(59 130 246);
                      stroke-width: 3;
                      opacity: 0.9;
                      stroke-dasharray: 8 4;
                      animation: flowAnimation 2s linear infinite;
                    }
                    .svg-line-muted-animated {
                      stroke: rgb(100 116 139);
                      stroke-width: 2;
                      opacity: 0.8;
                      stroke-dasharray: 6 3;
                      animation: flowAnimation 1.5s linear infinite;
                    }
                    
                    @keyframes flowAnimation {
                      0% { stroke-dashoffset: 0; }
                      100% { stroke-dashoffset: 12; }
                    }
                    
                    @media (prefers-color-scheme: dark) {
                      .svg-text-primary { fill: rgb(248 250 252); }
                      .svg-text-secondary { fill: rgb(226 232 240); }
                      .svg-text-muted { fill: rgb(148 163 184); }
                      
                      .svg-line { 
                        stroke: rgb(147 197 253); 
                        stroke-width: 3; 
                        opacity: 0.9;
                      }
                      .svg-line-muted { 
                        stroke: rgb(148 163 184); 
                        stroke-width: 2; 
                        opacity: 0.7;
                      }
                      
                      .svg-line-animated {
                        stroke: rgb(147 197 253);
                        stroke-width: 3;
                        opacity: 1;
                      }
                      .svg-line-muted-animated {
                        stroke: rgb(148 163 184);
                        stroke-width: 2;
                        opacity: 0.9;
                      }
                    }
                    
                    /* User input - Professional blue gradient */
                    .svg-bg-user { 
                      fill: linear-gradient(135deg, rgb(59 130 246) 0%, rgb(37 99 235) 100%);
                      filter: drop-shadow(0 4px 6px rgba(59, 130, 246, 0.2));
                    }
                    .svg-bg-user-active { 
                      fill: linear-gradient(135deg, rgb(29 78 216) 0%, rgb(30 64 175) 100%);
                      filter: drop-shadow(0 6px 12px rgba(29, 78, 216, 0.4));
                    }
                    
                    /* Chatbot - Clean neutral with professional borders */
                    .svg-bg-chatbot { 
                      fill: rgb(255 255 255); 
                      stroke: rgb(203 213 225); 
                      stroke-width: 3;
                      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                    }
                    .svg-bg-chatbot-active { 
                      fill: rgb(254 242 242); 
                      stroke: rgb(248 113 113); 
                      stroke-width: 3;
                      filter: drop-shadow(0 4px 8px rgba(248, 113, 113, 0.3));
                    }
                    
                    /* Agent core - Rich purple gradient */
                    .svg-bg-agent { 
                      fill: linear-gradient(135deg, rgb(129 140 248) 0%, rgb(99 102 241) 100%);
                      filter: drop-shadow(0 4px 8px rgba(129, 140, 248, 0.3));
                    }
                    .svg-bg-agent-active { 
                      fill: linear-gradient(135deg, rgb(79 70 229) 0%, rgb(67 56 202) 100%);
                      filter: drop-shadow(0 6px 16px rgba(79, 70, 229, 0.4));
                    }
                    
                    /* Memory - Professional slate with green active state */
                    .svg-bg-memory { 
                      fill: rgb(100 116 139); 
                      filter: drop-shadow(0 2px 4px rgba(100, 116, 139, 0.2));
                    }
                    .svg-bg-memory-active { 
                      fill: linear-gradient(135deg, rgb(34 197 94) 0%, rgb(22 163 74) 100%);
                      filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3));
                    }
                    
                    /* Tools - Slate with orange active state */
                    .svg-bg-tools { 
                      fill: rgb(71 85 105); 
                      filter: drop-shadow(0 2px 4px rgba(71, 85, 105, 0.2));
                    }
                    .svg-bg-tools-active { 
                      fill: linear-gradient(135deg, rgb(251 146 60) 0%, rgb(249 115 22) 100%);
                      filter: drop-shadow(0 4px 8px rgba(251, 146, 60, 0.3));
                    }
                    
                    /* Planning - Slate with indigo active state */
                    .svg-bg-planning { 
                      fill: rgb(71 85 105);
                      filter: drop-shadow(0 2px 4px rgba(71, 85, 105, 0.2));
                    }
                    .svg-bg-planning-active { 
                      fill: linear-gradient(135deg, rgb(124 58 237) 0%, rgb(109 40 217) 100%);
                      filter: drop-shadow(0 4px 8px rgba(124, 58, 237, 0.3));
                    }
                    
                    /* Reflection - Slate with purple active state */
                    .svg-bg-reflection { 
                      fill: rgb(71 85 105);
                      filter: drop-shadow(0 2px 4px rgba(71, 85, 105, 0.2));
                    }
                    .svg-bg-reflection-active { 
                      fill: linear-gradient(135deg, rgb(168 85 247) 0%, rgb(147 51 234) 100%);
                      filter: drop-shadow(0 4px 8px rgba(168, 85, 247, 0.3));
                    }
                    
                    /* Action - Slate with red active state */
                    .svg-bg-action { 
                      fill: rgb(71 85 105);
                      filter: drop-shadow(0 2px 4px rgba(71, 85, 105, 0.2));
                    }
                    .svg-bg-action-active { 
                      fill: linear-gradient(135deg, rgb(239 68 68) 0%, rgb(220 38 38) 100%);
                      filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3));
                    }
                    
                    /* Response - Clean white with green active state */
                    .svg-bg-response { 
                      fill: rgb(255 255 255); 
                      stroke: rgb(203 213 225); 
                      stroke-width: 3;
                      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                    }
                    .svg-bg-response-active { 
                      fill: rgb(240 253 244); 
                      stroke: rgb(34 197 94); 
                      stroke-width: 3;
                      filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3));
                    }
                    
                    /* Dark mode overrides with improved contrast */
                    @media (prefers-color-scheme: dark) {
                      .svg-bg-user { 
                        fill: linear-gradient(135deg, rgb(79 70 229) 0%, rgb(67 56 202) 100%);
                      }
                      .svg-bg-user-active { 
                        fill: linear-gradient(135deg, rgb(55 48 163) 0%, rgb(49 46 129) 100%);
                      }
                      
                      .svg-bg-chatbot { 
                        fill: rgb(51 65 85); 
                        stroke: rgb(100 116 139); 
                        stroke-width: 3;
                      }
                      .svg-bg-chatbot-active { 
                        fill: rgb(127 29 29); 
                        stroke: rgb(185 28 28); 
                        stroke-width: 3;
                      }
                      
                      .svg-bg-agent { 
                        fill: linear-gradient(135deg, rgb(99 102 241) 0%, rgb(79 70 229) 100%);
                      }
                      .svg-bg-agent-active { 
                        fill: linear-gradient(135deg, rgb(67 56 202) 0%, rgb(55 48 163) 100%);
                      }
                      
                      .svg-bg-memory { 
                        fill: rgb(51 65 85);
                      }
                      .svg-bg-memory-active { 
                        fill: linear-gradient(135deg, rgb(22 163 74) 0%, rgb(21 128 61) 100%);
                      }
                      
                      .svg-bg-tools { 
                        fill: rgb(51 65 85);
                      }
                      .svg-bg-tools-active { 
                        fill: linear-gradient(135deg, rgb(234 88 12) 0%, rgb(194 65 12) 100%);
                      }
                      
                      .svg-bg-planning { 
                        fill: rgb(51 65 85);
                      }
                      .svg-bg-planning-active { 
                        fill: linear-gradient(135deg, rgb(109 40 217) 0%, rgb(91 33 182) 100%);
                      }
                      
                      .svg-bg-reflection { 
                        fill: rgb(51 65 85);
                      }
                      .svg-bg-reflection-active { 
                        fill: linear-gradient(135deg, rgb(147 51 234) 0%, rgb(126 34 206) 100%);
                      }
                      
                      .svg-bg-action { 
                        fill: rgb(51 65 85);
                      }
                      .svg-bg-action-active { 
                        fill: linear-gradient(135deg, rgb(220 38 38) 0%, rgb(185 28 28) 100%);
                      }
                      
                      .svg-bg-response { 
                        fill: rgb(51 65 85); 
                        stroke: rgb(100 116 139); 
                        stroke-width: 3;
                      }
                      .svg-bg-response-active { 
                        fill: rgb(22 101 52); 
                        stroke: rgb(34 197 94); 
                        stroke-width: 3;
                      }
                    }
                  `}
                </style>
                <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="rgb(59 130 246)" />
                </marker>
                <marker id="arrowhead-dark" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                  <polygon points="0 0, 10 4, 0 8" fill="rgb(147 197 253)" />
                </marker>
              </defs>

              {/* User Input */}
              <g>
                <rect
                  x="50"
                  y="50"
                  width="240"
                  height="100"
                  rx="12"
                  className={currentStepData.highlight.includes('user-input') ? 'svg-bg-user-active' : 'svg-bg-user'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="170" y="90" textAnchor="middle" className="svg-text-white" fontSize="18" fontWeight="700">
                  User Query
                </text>
                <text x="170" y="115" textAnchor="middle" className="svg-text-white" fontSize="15">
                  "Schedule a team meeting"
                </text>
              </g>

              {/* Chatbot Side */}
              <g>
                <text x="170" y="180" textAnchor="middle" className="svg-text-primary" fontSize="18" fontWeight="700">
                  Traditional Chatbot
                </text>
                <rect
                  x="50"
                  y="200"
                  width="240"
                  height="150"
                  rx="12"
                  className={currentStepData.highlight.includes('chatbot-response') ? 'svg-bg-chatbot-active' : 'svg-bg-chatbot'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="170" y="240" textAnchor="middle" className="svg-text-primary" fontSize="16" fontWeight="600">
                  Direct Response
                </text>
                {currentStepData.chatbotResponse && (
                  <AnimatePresence>
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <text x="70" y="270" className="svg-text-secondary" fontSize="14">
                        <tspan x="70" dy="0">{currentStepData.chatbotResponse.slice(0, 25)}</tspan>
                        <tspan x="70" dy="20">{currentStepData.chatbotResponse.slice(25, 50)}</tspan>
                        <tspan x="70" dy="20">{currentStepData.chatbotResponse.slice(50, 75)}</tspan>
                        <tspan x="70" dy="20">{currentStepData.chatbotResponse.slice(75)}</tspan>
                      </text>
                    </motion.g>
                  </AnimatePresence>
                )}
              </g>

              {/* Agent Side */}
              <g>
                <text x="600" y="180" textAnchor="middle" className="svg-text-primary" fontSize="18" fontWeight="700">
                  Azure AI Agent
                </text>
                
                {/* Agent Core */}
                <rect
                  x="470"
                  y="300"
                  width="260"
                  height="120"
                  rx="15"
                  className={currentStepData.highlight.includes('agent-planning') ? 'svg-bg-agent-active' : 'svg-bg-agent'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="600" y="350" textAnchor="middle" className="svg-text-white" fontSize="18" fontWeight="700">
                  Agent Core
                </text>
                <text x="600" y="375" textAnchor="middle" className="svg-text-white" fontSize="15">
                  (Planning & Reasoning)
                </text>

                {/* Memory components with larger text */}
                <rect
                  x="420"
                  y="200"
                  width="150"
                  height="80"
                  rx="12"
                  className={currentStepData.highlight.includes('memory') ? 'svg-bg-memory-active' : 'svg-bg-memory'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="495" y="235" textAnchor="middle" className="svg-text-white" fontSize="15" fontWeight="600">
                  Short-term
                </text>
                <text x="495" y="255" textAnchor="middle" className="svg-text-white" fontSize="15" fontWeight="600">
                  Memory
                </text>

                <rect
                  x="630"
                  y="200"
                  width="150"
                  height="80"
                  rx="12"
                  className={currentStepData.highlight.includes('memory') ? 'svg-bg-memory-active' : 'svg-bg-memory'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="705" y="235" textAnchor="middle" className="svg-text-white" fontSize="15" fontWeight="600">
                  Long-term
                </text>
                <text x="705" y="255" textAnchor="middle" className="svg-text-white" fontSize="15" fontWeight="600">
                  Memory
                </text>

                {/* Tools with larger text and boxes */}
                <rect
                  x="300"
                  y="320"
                  width="130"
                  height="70"
                  rx="12"
                  className={currentStepData.highlight.includes('tools') || currentStepData.highlight.includes('calendar-tool') ? 'svg-bg-tools-active' : 'svg-bg-tools'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="365" y="365" textAnchor="middle" className="svg-text-white" fontSize="15" fontWeight="600">
                  Calendar()
                </text>

                <rect
                  x="300"
                  y="400"
                  width="130"
                  height="70"
                  rx="12"
                  className={currentStepData.highlight.includes('tools') || currentStepData.highlight.includes('calculator-tool') ? 'svg-bg-tools-active' : 'svg-bg-tools'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="365" y="445" textAnchor="middle" className="svg-text-white" fontSize="15" fontWeight="600">
                  Calculator()
                </text>

                <rect
                  x="300"
                  y="480"
                  width="130"
                  height="70"
                  rx="12"
                  className={currentStepData.highlight.includes('tools') ? 'svg-bg-tools-active' : 'svg-bg-tools'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="365" y="525" textAnchor="middle" className="svg-text-white" fontSize="15" fontWeight="600">
                  Search()
                </text>

                <rect
                  x="300"
                  y="560"
                  width="130"
                  height="50"
                  rx="12"
                  className={currentStepData.highlight.includes('tools') ? 'svg-bg-tools-active' : 'svg-bg-tools'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="365" y="590" textAnchor="middle" className="svg-text-white" fontSize="14" fontWeight="600">
                  ...more
                </text>

                {/* Planning with larger text */}
                <rect
                  x="770"
                  y="320"
                  width="150"
                  height="80"
                  rx="12"
                  className={currentStepData.highlight.includes('planning') ? 'svg-bg-planning-active' : 'svg-bg-planning'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="845" y="370" textAnchor="middle" className="svg-text-white" fontSize="16" fontWeight="600">
                  Planning
                </text>

                {/* Reflection capabilities with larger text */}
                <rect
                  x="950"
                  y="280"
                  width="150"
                  height="55"
                  rx="12"
                  className={currentStepData.highlight.includes('reflection') ? 'svg-bg-reflection-active' : 'svg-bg-reflection'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="1025" y="315" textAnchor="middle" className="svg-text-white" fontSize="15" fontWeight="600">
                  Reflection
                </text>

                <rect
                  x="950"
                  y="345"
                  width="150"
                  height="55"
                  rx="12"
                  className={currentStepData.highlight.includes('reflection') ? 'svg-bg-reflection-active' : 'svg-bg-reflection'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="1025" y="380" textAnchor="middle" className="svg-text-white" fontSize="15" fontWeight="600">
                  Self-critics
                </text>

                <rect
                  x="950"
                  y="410"
                  width="150"
                  height="55"
                  rx="12"
                  className={currentStepData.highlight.includes('reflection') ? 'svg-bg-reflection-active' : 'svg-bg-reflection'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="1025" y="445" textAnchor="middle" className="svg-text-white" fontSize="14" fontWeight="600">
                  Chain of thoughts
                </text>

                <rect
                  x="950"
                  y="475"
                  width="150"
                  height="65"
                  rx="12"
                  className={currentStepData.highlight.includes('reflection') ? 'svg-bg-reflection-active' : 'svg-bg-reflection'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="1025" y="500" textAnchor="middle" className="svg-text-white" fontSize="14" fontWeight="600">
                  Subgoal
                </text>
                <text x="1025" y="520" textAnchor="middle" className="svg-text-white" fontSize="14" fontWeight="600">
                  decomposition
                </text>

                {/* Action */}
                <rect
                  x="770"
                  y="420"
                  width="150"
                  height="80"
                  rx="12"
                  className={currentStepData.highlight.includes('action') ? 'svg-bg-action-active' : 'svg-bg-action'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="845" y="470" textAnchor="middle" className="svg-text-white" fontSize="16" fontWeight="600">
                  Action
                </text>

                {/* Connection lines with animation during active states */}
                <line x1="570" y1="240" x2="580" y2="300" className={currentStepData.highlight.includes('memory') || currentStepData.highlight.includes('agent-planning') ? 'svg-line-muted-animated' : 'svg-line-muted'} />
                <line x1="630" y1="240" x2="620" y2="300" className={currentStepData.highlight.includes('memory') || currentStepData.highlight.includes('agent-planning') ? 'svg-line-muted-animated' : 'svg-line-muted'} />
                <line x1="430" y1="360" x2="470" y2="360" className={currentStepData.highlight.includes('tools') || currentStepData.highlight.includes('calendar-tool') || currentStepData.highlight.includes('calculator-tool') ? 'svg-line-muted-animated' : 'svg-line-muted'} />
                <line x1="730" y1="360" x2="770" y2="360" className={currentStepData.highlight.includes('planning') || currentStepData.highlight.includes('action') ? 'svg-line-muted-animated' : 'svg-line-muted'} />
                <line x1="730" y1="360" x2="770" y2="460" className={currentStepData.highlight.includes('planning') || currentStepData.highlight.includes('action') ? 'svg-line-muted-animated' : 'svg-line-muted'} />
                <line x1="920" y1="360" x2="950" y2="360" className={currentStepData.highlight.includes('reflection') ? 'svg-line-muted-animated' : 'svg-line-muted'} />

                {/* Agent Response with larger size for better text display */}
                <rect
                  x="450"
                  y="680"
                  width="300"
                  height="180"
                  rx="12"
                  className={currentStepData.highlight.includes('agent-response') ? 'svg-bg-response-active' : 'svg-bg-response'}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x="600" y="715" textAnchor="middle" className="svg-text-primary" fontSize="16" fontWeight="700">
                  Comprehensive Response
                </text>
                {currentStepData.agentResponse && (
                  <AnimatePresence>
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <text x="470" y="745" className="svg-text-secondary" fontSize="14">
                        <tspan x="470" dy="0">{currentStepData.agentResponse.slice(0, 35)}</tspan>
                        <tspan x="470" dy="20">{currentStepData.agentResponse.slice(35, 70)}</tspan>
                        <tspan x="470" dy="20">{currentStepData.agentResponse.slice(70, 105)}</tspan>
                        <tspan x="470" dy="20">{currentStepData.agentResponse.slice(105, 140)}</tspan>
                        <tspan x="470" dy="20">{currentStepData.agentResponse.slice(140, 175)}</tspan>
                        <tspan x="470" dy="20">{currentStepData.agentResponse.slice(175, 210)}</tspan>
                        <tspan x="470" dy="20">{currentStepData.agentResponse.slice(210)}</tspan>
                      </text>
                    </motion.g>
                  </AnimatePresence>
                )}
              </g>

              {/* Flow arrows with animation during simulation */}
              <line x1="170" y1="150" x2="170" y2="180" className={currentStepData.highlight.includes('user-input') || currentStepData.highlight.includes('chatbot-response') ? 'svg-line-animated' : 'svg-line'} markerEnd="url(#arrowhead)" />
              <line x1="320" y1="100" x2="460" y2="100" className={currentStep >= 2 ? 'svg-line-animated' : 'svg-line'} markerEnd="url(#arrowhead)" />
              <line x1="480" y1="100" x2="480" y2="200" className={currentStep >= 2 ? 'svg-line-animated' : 'svg-line'} markerEnd="url(#arrowhead)" />

            </svg>
          </div>

          {/* Step Information */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-muted/50 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Step {currentStep + 1}</Badge>
                <h3 className="font-semibold">{currentStepData.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{currentStepData.description}</p>
              
              {currentStepData.agentThought && (
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-md mb-2">
                  <p className="text-sm"><strong>Agent Thought:</strong> {currentStepData.agentThought}</p>
                </div>
              )}
              
              {currentStepData.agentAction && (
                <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-md mb-2">
                  <p className="text-sm"><strong>Action:</strong> <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{currentStepData.agentAction}</code></p>
                </div>
              )}
              
              {currentStepData.agentObservation && (
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-md mb-2">
                  <p className="text-sm"><strong>Observation:</strong> {currentStepData.agentObservation}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Comparison Summary */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
              >
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-600 dark:text-red-400">Traditional Chatbot</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-sm">Reactive responses only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-sm">Limited to single interactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-sm">No autonomous planning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-sm">Cannot use external tools</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-600 dark:text-green-400">Azure AI Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm">Multi-step autonomous planning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm">Tool usage and API integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm">Memory and context tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm">Self-reflection and adaptation</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotToAgentTransition;
