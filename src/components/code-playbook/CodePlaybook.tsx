import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Code, Play, ListChecks, FileCode, FlowArrow, Graph, Bug } from "@phosphor-icons/react"
import { Steps } from './Steps'
import { PatternData } from '@/lib/data/patterns'
import PatternDemo from '../interactive-demos/PatternDemo'
import { ReactFlowProvider } from 'reactflow'
import BestPractices from './BestPractices'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Button } from '@/components/ui/button'
import { pythonPatterns } from '@/lib/data/pythonPatterns'
import CodeStepVisualizer from './CodeStepVisualizer'
import EnhancedCodeVisualizer from './EnhancedCodeVisualizer'
import AlgorithmVisualizer from './AlgorithmVisualizer'
import CodeDebugger from './CodeDebugger'
import { getCodeExecutionSteps } from '@/lib/utils/codeExecutionSteps'
import InteractiveCodeExecution from './InteractiveCodeExecution'
import { getCodeExecutionExample } from '@/lib/data/codeExamples'
import { getAlgorithmVisualization } from '@/lib/utils/algorithmVisualization'
import { getDebugExample } from '@/lib/utils/codeDebugExamples'

interface CodePlaybookProps {
  patternData: PatternData
}

const CodePlaybook = ({ patternData }: CodePlaybookProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [language, setLanguage] = useState<'python' | 'typescript'>('python')
  const [visualizationMode, setVisualizationMode] = useState<'static' | 'interactive'>('static')
  
  const getCodeExample = () => {
    if (language === 'python') {
      return pythonPatterns[patternData.id] || patternData.pythonCodeExample || "# Python implementation not available for this pattern"
    }
    return patternData.codeExample
  }
  
  // Get execution steps for the current pattern and language if available
  const executionSteps = getCodeExecutionSteps(patternData.id, language)
  
  // Get interactive execution blocks if available
  const interactiveExecution = getCodeExecutionExample(patternData.id, language)
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{patternData.name} Implementation</CardTitle>
          <CardDescription>
            Step-by-step guide to implementing the {patternData.name} pattern
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="steps" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="steps" className="flex items-center gap-2">
                <ListChecks size={16} /> Implementation Steps
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code size={16} /> Complete Code
              </TabsTrigger>
              <TabsTrigger value="visualizer" className="flex items-center gap-2">
                <FileCode size={16} /> Code Visualizer
              </TabsTrigger>
              <TabsTrigger value="debugger" className="flex items-center gap-2">
                <Bug size={16} /> Debugger
              </TabsTrigger>
              <TabsTrigger value="algorithm" className="flex items-center gap-2">
                <Graph size={16} /> Algorithm Steps
              </TabsTrigger>
              <TabsTrigger value="practices" className="flex items-center gap-2">
                <Check size={16} /> Best Practices
              </TabsTrigger>
              <TabsTrigger value="interactive" className="flex items-center gap-2">
                <Play size={16} /> Interactive Example
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="steps" className="py-4">
              <Steps 
                steps={patternData.implementation} 
                currentStep={currentStep} 
                setCurrentStep={setCurrentStep} 
              />
            </TabsContent>
            
            <TabsContent value="code" className="py-4">
              <div className="flex items-center justify-end mb-2 space-x-2">
                <span className="text-sm text-muted-foreground mr-2">Language:</span>
                <Button
                  size="sm"
                  variant={language === 'python' ? 'default' : 'outline'}
                  onClick={() => setLanguage('python')}
                >
                  Python
                </Button>
                <Button
                  size="sm"
                  variant={language === 'typescript' ? 'default' : 'outline'}
                  onClick={() => setLanguage('typescript')}
                >
                  TypeScript
                </Button>
              </div>
              
              <div className="relative">
                <SyntaxHighlighter 
                  language={language} 
                  style={nightOwl}
                  customStyle={{
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    maxHeight: '500px',
                    overflow: 'auto'
                  }}
                >
                  {getCodeExample()}
                </SyntaxHighlighter>
                <div className="absolute top-4 right-4">
                  <button 
                    className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(getCodeExample())
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <Alert className="mt-6">
                <AlertDescription>
                  This code demonstrates a basic implementation of the pattern. You may need to adapt it to your specific use case.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="visualizer" className="py-4">
              <div className="flex items-center justify-end mb-2 space-x-2">
                <span className="text-sm text-muted-foreground mr-2">Language:</span>
                <Button
                  size="sm"
                  variant={language === 'python' ? 'default' : 'outline'}
                  onClick={() => setLanguage('python')}
                >
                  Python
                </Button>
                <Button
                  size="sm"
                  variant={language === 'typescript' ? 'default' : 'outline'}
                  onClick={() => setLanguage('typescript')}
                >
                  TypeScript
                </Button>
              </div>
              
              {executionSteps ? (
                <EnhancedCodeVisualizer 
                  code={getCodeExample()} 
                  language={language}
                  steps={executionSteps}
                  title={`${patternData.name} Pattern Execution`}
                />
              ) : interactiveExecution ? (
                <InteractiveCodeExecution
                  codeBlocks={interactiveExecution.blocks}
                  description={interactiveExecution.description}
                  showConsole={true}
                />
              ) : (
                <div className="border rounded-md p-6 text-center text-muted-foreground">
                  <FileCode size={32} className="mx-auto mb-2" />
                  <p>Step-by-step visualization not available for this pattern in {language}.</p>
                  {language === 'python' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setLanguage('typescript')}
                      className="mt-2"
                    >
                      Try TypeScript Version
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setLanguage('python')}
                      className="mt-2"
                    >
                      Try Python Version
                    </Button>
                  )}
                </div>
              )}
              
              <Alert className="mt-6">
                <AlertDescription>
                  Step through the code execution to understand how the {patternData.name} pattern works under the hood.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="practices" className="py-4">
              <BestPractices patternId={patternData.id} />
            </TabsContent>
            
            <TabsContent value="algorithm" className="py-4">
              {getAlgorithmVisualization(patternData.id) ? (
                <AlgorithmVisualizer visualization={getAlgorithmVisualization(patternData.id)!} />
              ) : (
                <div className="border rounded-md p-6 text-center text-muted-foreground">
                  <Graph size={32} className="mx-auto mb-2" />
                  <p>Algorithm visualization not available for this pattern.</p>
                </div>
              )}
              
              <Alert className="mt-6">
                <AlertDescription>
                  Step through the algorithm execution to understand the decision-making process in the {patternData.name} pattern.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="debugger" className="py-4">
              <div className="flex items-center justify-end mb-2 space-x-2">
                <span className="text-sm text-muted-foreground mr-2">Language:</span>
                <Button
                  size="sm"
                  variant={language === 'python' ? 'default' : 'outline'}
                  onClick={() => setLanguage('python')}
                >
                  Python
                </Button>
                <Button
                  size="sm"
                  variant={language === 'typescript' ? 'default' : 'outline'}
                  onClick={() => setLanguage('typescript')}
                >
                  TypeScript
                </Button>
              </div>
              
              {getDebugExample(patternData.id, language) ? (
                <CodeDebugger
                  code={getDebugExample(patternData.id, language)!.code}
                  language={language}
                  steps={getDebugExample(patternData.id, language)!.steps}
                  title={`${patternData.name} Pattern Debug Mode`}
                />
              ) : (
                <div className="border rounded-md p-6 text-center text-muted-foreground">
                  <Bug size={32} className="mx-auto mb-2" />
                  <p>Interactive debugger not available for this pattern in {language}.</p>
                  {language === 'python' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setLanguage('typescript')}
                      className="mt-2"
                    >
                      Try TypeScript Version
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setLanguage('python')}
                      className="mt-2"
                    >
                      Try Python Version
                    </Button>
                  )}
                </div>
              )}
              
              <Alert className="mt-6">
                <AlertDescription>
                  Step through code execution line-by-line to understand how the {patternData.name} pattern works, with variable state tracking and console output.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="interactive" className="py-4">
              <ReactFlowProvider>
                <PatternDemo patternData={patternData} />
              </ReactFlowProvider>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Available in both Python and TypeScript for Azure AI SDK
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Check className="mr-1" size={16} /> Pattern validated with Azure OpenAI
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default CodePlaybook
