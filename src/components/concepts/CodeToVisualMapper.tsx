import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from '@/components/theme/ThemeProvider';
import { Code, Eye, Play, Lightbulb } from '@phosphor-icons/react';
import CodeBlock from '@/components/ui/CodeBlock';

interface CodeBlock {
  id: string;
  code: string;
  explanation: string;
  visualElements: VisualElement[];
  lineStart: number;
  lineEnd: number;
}

interface VisualElement {
  type: 'agent' | 'tool' | 'data_flow' | 'decision' | 'loop' | 'function_call';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  connections?: { to: string; type: 'data' | 'control' | 'async' }[];
}

interface ExecutionState {
  currentLine: number;
  variables: Record<string, any>;
  callStack: string[];
  output: string[];
}

const CodeToVisualMapper: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [selectedPattern, setSelectedPattern] = useState<'react' | 'codeact' | 'self-reflection'>('react');
  const [currentBlock, setCurrentBlock] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionState, setExecutionState] = useState<ExecutionState>({
    currentLine: 0,
    variables: {},
    callStack: [],
    output: []
  });

  const colors = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#d1d5db',
    text: isDarkMode ? '#f9fafb' : '#111827',
    primary: isDarkMode ? '#3b82f6' : '#2563eb',
    secondary: isDarkMode ? '#6b7280' : '#6b7280',
    agent: '#3b82f6',
    tool: '#f59e0b',
    data: '#10b981',
    decision: '#8b5cf6',
    loop: '#ef4444',
    function: '#06b6d4'
  };

  const patternCodeMaps = {
    react: {
      title: "ReAct Agent Pattern",
      description: "See how reasoning and acting cycles translate to visual flow",
      codeBlocks: [
        {
          id: 'init',
          code: `class ReActAgent:
    def __init__(self, client, model="gpt-4"):
        self.client = client
        self.model = model`,
          explanation: "Initialize the ReAct agent with LLM client",
          lineStart: 1,
          lineEnd: 4,
          visualElements: [
            { type: 'agent', label: 'ReAct Agent', x: 150, y: 100, width: 120, height: 60, color: colors.agent }
          ]
        },
        {
          id: 'main_loop',
          code: `    while not done and current_cycle < max_cycles:
        current_cycle += 1
        
        # Reasoning phase
        reasoning_response = await llm(reasoning_prompt)`,
          explanation: "Main reasoning and acting loop with cycle control",
          lineStart: 5,
          lineEnd: 9,
          visualElements: [
            { type: 'agent', label: 'ReAct Agent', x: 50, y: 100, width: 100, height: 60, color: colors.agent },
            { type: 'loop', label: 'Cycle Control', x: 200, y: 50, width: 100, height: 40, color: colors.loop },
            { type: 'function_call', label: 'LLM Reasoning', x: 200, y: 150, width: 100, height: 60, color: colors.function, 
              connections: [{ to: 'tools', type: 'control' }] },
            { type: 'tool', label: 'Tools', x: 350, y: 150, width: 80, height: 60, color: colors.tool }
          ]
        },
        {
          id: 'action_phase',
          code: `        # Action phase - call tools
        if tool_name in tools:
            tool_result = await tools[tool_name](tool_input)
            context_history.append(f"Observation: {tool_result}")`,
          explanation: "Action execution and observation collection",
          lineStart: 10,
          lineEnd: 13,
          visualElements: [
            { type: 'agent', label: 'Agent', x: 50, y: 100, width: 80, height: 60, color: colors.agent },
            { type: 'decision', label: 'Tool\nSelection', x: 180, y: 100, width: 80, height: 60, color: colors.decision },
            { type: 'tool', label: 'Search Tool', x: 320, y: 50, width: 80, height: 50, color: colors.tool },
            { type: 'tool', label: 'Calculator', x: 320, y: 120, width: 80, height: 50, color: colors.tool },
            { type: 'tool', label: 'Web API', x: 320, y: 190, width: 80, height: 50, color: colors.tool },
            { type: 'data_flow', label: 'Observations', x: 450, y: 100, width: 100, height: 60, color: colors.data }
          ]
        }
      ]
    },
    codeact: {
      title: "CodeAct Agent Pattern",
      description: "Watch Python code generation and execution in action",
      codeBlocks: [
        {
          id: 'code_generation',
          code: `# Generate Python code
agent_response = await llm(f"""
Write Python code to solve: {query}
Format as:
\`\`\`python
# Your code here
\`\`\`
""")`,
          explanation: "Agent generates Python code to solve the problem",
          lineStart: 1,
          lineEnd: 7,
          visualElements: [
            { type: 'agent', label: 'CodeAct Agent', x: 80, y: 100, width: 120, height: 60, color: colors.agent },
            { type: 'function_call', label: 'Code\nGeneration', x: 250, y: 100, width: 100, height: 60, color: colors.function },
            { type: 'data_flow', label: 'Python Code', x: 400, y: 100, width: 100, height: 60, color: colors.data }
          ]
        },
        {
          id: 'code_execution',
          code: `# Extract and execute code
code_match = re.search(r'\`\`\`python\\s*([\\s\\S]*?)\\s*\`\`\`', agent_response)
if code_match:
    code = code_match.group(1).strip()
    execution_result = execute_code(code)`,
          explanation: "Extract Python code from response and execute it safely",
          lineStart: 8,
          lineEnd: 12,
          visualElements: [
            { type: 'data_flow', label: 'Raw Response', x: 50, y: 50, width: 100, height: 40, color: colors.data },
            { type: 'function_call', label: 'Code\nExtraction', x: 200, y: 50, width: 100, height: 60, color: colors.function },
            { type: 'tool', label: 'Python\nExecutor', x: 350, y: 50, width: 100, height: 60, color: colors.tool },
            { type: 'data_flow', label: 'Execution\nResult', x: 500, y: 50, width: 100, height: 60, color: colors.data },
            { type: 'decision', label: 'Safety\nCheck', x: 200, y: 150, width: 80, height: 60, color: colors.decision }
          ]
        },
        {
          id: 'feedback_loop',
          code: `# Add result to context for next iteration
context_history.append(f"Code: {code}")
context_history.append(f"Result: {execution_result}")

# Continue or finish based on result
if "error" not in str(execution_result).lower():
    # Success - agent can use this result
    continue_processing(execution_result)`,
          explanation: "Feedback loop incorporating execution results",
          lineStart: 13,
          lineEnd: 19,
          visualElements: [
            { type: 'data_flow', label: 'Context\nHistory', x: 100, y: 100, width: 100, height: 60, color: colors.data },
            { type: 'decision', label: 'Success\nCheck', x: 250, y: 100, width: 80, height: 60, color: colors.decision },
            { type: 'loop', label: 'Continue\nLoop', x: 380, y: 50, width: 80, height: 50, color: colors.loop },
            { type: 'function_call', label: 'Generate\nResponse', x: 380, y: 150, width: 100, height: 60, color: colors.function }
          ]
        }
      ]
    },
    'self-reflection': {
      title: "Self-Reflection Pattern",
      description: "Observe how agents critique and improve their own outputs",
      codeBlocks: [
        {
          id: 'initial_response',
          code: `# Generate initial response
initial_response = await llm(f"""
Answer this query: {query}
Provide your best response.
""")

responses.append(initial_response)`,
          explanation: "Generate the first response to the user query",
          lineStart: 1,
          lineEnd: 6,
          visualElements: [
            { type: 'agent', label: 'Reflection\nAgent', x: 80, y: 100, width: 100, height: 60, color: colors.agent },
            { type: 'function_call', label: 'Initial\nGeneration', x: 230, y: 100, width: 100, height: 60, color: colors.function },
            { type: 'data_flow', label: 'First Response', x: 380, y: 100, width: 100, height: 60, color: colors.data }
          ]
        },
        {
          id: 'self_critique',
          code: `# Self-reflection phase
reflection = await llm(f"""
Critically evaluate this response:
Query: {query}
Response: {current_response}

Identify areas for improvement:
1. Accuracy  2. Completeness  3. Clarity
""")`,
          explanation: "Agent critiques its own response across multiple dimensions",
          lineStart: 7,
          lineEnd: 14,
          visualElements: [
            { type: 'data_flow', label: 'Current\nResponse', x: 50, y: 50, width: 100, height: 50, color: colors.data },
            { type: 'function_call', label: 'Self-Critique\nLLM', x: 200, y: 50, width: 100, height: 80, color: colors.function },
            { type: 'decision', label: 'Quality\nAssessment', x: 350, y: 50, width: 100, height: 80, color: colors.decision },
            { type: 'data_flow', label: 'Improvement\nSuggestions', x: 500, y: 50, width: 100, height: 80, color: colors.data }
          ]
        },
        {
          id: 'improvement',
          code: `# Generate improved response
improved_response = await llm(f"""
Original: {current_response}
Critique: {reflection}

Provide an improved response addressing the feedback.
""")

current_response = improved_response`,
          explanation: "Generate an improved response based on self-critique",
          lineStart: 15,
          lineEnd: 21,
          visualElements: [
            { type: 'data_flow', label: 'Critique\nFeedback', x: 50, y: 100, width: 80, height: 60, color: colors.data },
            { type: 'function_call', label: 'Improvement\nGeneration', x: 180, y: 100, width: 100, height: 60, color: colors.function },
            { type: 'data_flow', label: 'Improved\nResponse', x: 330, y: 100, width: 100, height: 60, color: colors.data },
            { type: 'loop', label: 'Iteration\nControl', x: 480, y: 100, width: 80, height: 60, color: colors.loop }
          ]
        }
      ]
    }
  };

  const currentPattern = patternCodeMaps[selectedPattern];
  const currentCodeBlock = currentPattern.codeBlocks[currentBlock];

  useEffect(() => {
    if (!isExecuting) return;

    const timer = setTimeout(() => {
      setExecutionState(prev => ({
        ...prev,
        currentLine: prev.currentLine + 1,
        output: [...prev.output, `Executing line ${prev.currentLine + 1}...`]
      }));

      if (executionState.currentLine >= currentCodeBlock.lineEnd) {
        setIsExecuting(false);
        setExecutionState(prev => ({
          ...prev,
          output: [...prev.output, "Execution complete!"]
        }));
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [isExecuting, executionState.currentLine, currentCodeBlock.lineEnd]);

  const handleExecute = () => {
    setIsExecuting(true);
    setExecutionState({
      currentLine: currentCodeBlock.lineStart,
      variables: {},
      callStack: [`${selectedPattern}_block_${currentBlock}`],
      output: [`Starting execution of ${currentCodeBlock.id}...`]
    });
  };

  const resetExecution = () => {
    setIsExecuting(false);
    setExecutionState({
      currentLine: 0,
      variables: {},
      callStack: [],
      output: []
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code size={24} className="text-primary" />
          Code-to-Visual Pattern Mapper
        </CardTitle>
        <CardDescription>
          See how Python agent code translates to visual execution patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pattern Selection */}
          <div className="flex gap-2">
            {Object.entries(patternCodeMaps).map(([key, pattern]) => (
              <Button
                key={key}
                variant={selectedPattern === key ? "default" : "outline"}
                onClick={() => {
                  setSelectedPattern(key as keyof typeof patternCodeMaps);
                  setCurrentBlock(0);
                  resetExecution();
                }}
              >
                {pattern.title}
              </Button>
            ))}
          </div>

          {/* Current Pattern Info */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{currentPattern.title}</CardTitle>
              <CardDescription>{currentPattern.description}</CardDescription>
            </CardHeader>
          </Card>

          {/* Code Block Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {currentPattern.codeBlocks.map((_, index) => (
                <Button
                  key={index}
                  variant={currentBlock === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCurrentBlock(index);
                    resetExecution();
                  }}
                >
                  Block {index + 1}
                </Button>
              ))}
            </div>
            <Badge variant="outline">
              Lines {currentCodeBlock.lineStart}-{currentCodeBlock.lineEnd}
            </Badge>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visual">
                <Eye size={16} className="mr-2" />
                Visual Flow
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code size={16} className="mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="execution">
                <Play size={16} className="mr-2" />
                Execution
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{currentCodeBlock.id.replace('_', ' ').toUpperCase()}</CardTitle>
                  <CardDescription>{currentCodeBlock.explanation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                    <svg
                      width="600"
                      height="300"
                      viewBox="0 0 600 300"
                      className="w-full h-auto border rounded-lg"
                      style={{ backgroundColor: colors.background }}
                    >
                      {/* Grid background */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={colors.border} strokeWidth="0.5" opacity="0.3"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Visual Elements */}
                      {currentCodeBlock.visualElements.map((element, index) => (
                        <g key={index}>
                          {/* Element rectangle */}
                          <rect
                            x={element.x}
                            y={element.y}
                            width={element.width}
                            height={element.height}
                            fill={element.color}
                            stroke={colors.border}
                            strokeWidth="2"
                            rx="8"
                            opacity="0.8"
                          />
                          
                          {/* Element label */}
                          <text
                            x={element.x + element.width / 2}
                            y={element.y + element.height / 2}
                            fill="white"
                            fontSize="12"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontWeight="bold"
                          >
                            {element.label.split('\n').map((line, i) => (
                              <tspan key={i} x={element.x + element.width / 2} dy={i === 0 ? 0 : 14}>
                                {line}
                              </tspan>
                            ))}
                          </text>

                          {/* Connections */}
                          {element.connections?.map((conn, connIndex) => {
                            const targetElement = currentCodeBlock.visualElements.find(e => e.label.includes(conn.to));
                            if (!targetElement) return null;
                            
                            return (
                              <line
                                key={connIndex}
                                x1={element.x + element.width}
                                y1={element.y + element.height / 2}
                                x2={targetElement.x}
                                y2={targetElement.y + targetElement.height / 2}
                                stroke={conn.type === 'data' ? colors.data : conn.type === 'async' ? colors.loop : colors.secondary}
                                strokeWidth="2"
                                strokeDasharray={conn.type === 'async' ? "5,5" : "none"}
                                markerEnd="url(#arrowhead)"
                              />
                            );
                          })}
                        </g>
                      ))}

                      {/* Arrow marker definition */}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill={colors.secondary}
                          />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <CodeBlock language="typescript">
                    {currentCodeBlock.code}
                  </CodeBlock>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    <Lightbulb size={16} className="text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300">Explanation</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {currentCodeBlock.explanation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="execution" className="space-y-4">
              <div className="flex gap-4 items-center">
                <Button onClick={handleExecute} disabled={isExecuting}>
                  <Play size={16} className="mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute Block'}
                </Button>
                <Button onClick={resetExecution} variant="outline">
                  Reset
                </Button>
                {isExecuting && (
                  <Badge variant="outline" className="animate-pulse">
                    Line {executionState.currentLine}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Execution Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 overflow-y-auto bg-black text-green-400 p-3 rounded font-mono text-xs">
                      {executionState.output.map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                      {isExecuting && <div className="animate-pulse">_</div>}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Execution State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div><strong>Current Line:</strong> {executionState.currentLine}</div>
                      <div><strong>Call Stack:</strong> {executionState.callStack.join(' → ')}</div>
                      <div><strong>Status:</strong> {isExecuting ? 'Running' : 'Idle'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeToVisualMapper;
