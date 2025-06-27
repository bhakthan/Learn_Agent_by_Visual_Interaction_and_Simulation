import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Code, Play, ListChecks, FileCode, FlowArrow, Graph, Bug, ShieldCheck } from "@phosphor-icons/react"
import { Steps } from './Steps'
import { PatternData } from '@/lib/data/patterns'
import PatternDemo from '../interactive-demos/PatternDemo'
import { ReactFlowProvider } from 'reactflow'
import BestPractices from './BestPractices'
import PatternSecurityControls from './PatternSecurityControls'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Button } from '@/components/ui/button'
import { pythonPatterns } from '@/lib/pythonPatterns'
import CodeStepVisualizer from './CodeStepVisualizer'
import EnhancedCodeVisualizer from './EnhancedCodeVisualizer'
import AlgorithmVisualizer from './AlgorithmVisualizer'
import CodeDebugger from './CodeDebugger'
import { getCodeExecutionSteps } from '@/lib/utils/codeExecutionSteps'
import InteractiveCodeExecution from './InteractiveCodeExecution'
import { getCodeExecutionExample } from '@/lib/data/codeExamples'
import { getAlgorithmVisualization } from '@/lib/utils/algorithmVisualization'
import { getDebugExample } from '@/lib/utils/codeDebugExamples'
import { useSidebarCollapse } from '@/hooks/use-sidebar-collapse'
import { cn } from '@/lib/utils'

interface CodePlaybookProps {
  patternData: PatternData
}

const CodePlaybook = ({ patternData }: CodePlaybookProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [language, setLanguage] = useState<'python' | 'typescript'>('python')
  const [visualizationMode, setVisualizationMode] = useState<'static' | 'interactive'>('static')
  const { isCollapsed } = useSidebarCollapse();
  
  // Listen to sidebar state changes to trigger resize/layout adjustments
  useEffect(() => {
    // Adding a small delay to ensure layout updates after transition completes
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isCollapsed]);
  
  const getCodeExample = () => {
    if (language === 'python') {
      return (pythonPatterns[patternData.id] || patternData.pythonCodeExample || "# Python implementation not available for this pattern")
    }
    return patternData.codeExample || "// TypeScript implementation not available for this pattern"
  }
  
  // Get execution steps for the current pattern and language if available
  const executionSteps = getCodeExecutionSteps(patternData.id, language)
  
  // Get interactive execution blocks if available
  const interactiveExecution = getCodeExecutionExample(patternData.id, language)
  
  // Get algorithm visualization steps if available
  const algorithmSteps = getAlgorithmVisualization(patternData.id)
  
  // Get debug example if available
  const debugExample = getDebugExample(patternData.id, language)
  
  // Language selector component for reuse
  const LanguageSelector = () => (
    <div className="flex items-center mb-2 space-x-2 justify-between sm:justify-end">
      <span className="text-sm text-muted-foreground">Language:</span>
      <div className="space-x-1">
        <Button
          size="sm"
          variant={language === 'python' ? 'default' : 'outline'}
          onClick={() => setLanguage('python')}
          className="px-2 sm:px-3"
        >
          Python
        </Button>
        <Button
          size="sm"
          variant={language === 'typescript' ? 'default' : 'outline'}
          onClick={() => setLanguage('typescript')}
          className="px-2 sm:px-3"
        >
          TypeScript
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6 w-full">
      <Card className={cn("w-full transition-all duration-300", isCollapsed ? "max-w-full" : "")}>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>{patternData.name} Implementation</CardTitle>
          <CardDescription>
            Step-by-step guide to implementing the {patternData.name} pattern
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="general" className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="flex w-full flex-nowrap gap-1">
                <TabsTrigger value="general" className="flex items-center gap-1 h-8 px-2 py-1 text-xs">
                  <ListChecks size={14} /> <span className="hidden sm:inline">General Guide</span><span className="sm:hidden">Guide</span>
                </TabsTrigger>
                <TabsTrigger value="steps" className="flex items-center gap-1 h-8 px-2 py-1 text-xs">
                  <ListChecks size={14} /> <span className="hidden sm:inline">Implementation Steps</span><span className="sm:hidden">Steps</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-1 h-8 px-2 py-1 text-xs">
                  <Code size={14} /> <span className="hidden sm:inline">Complete Code</span><span className="sm:hidden">Code</span>
                </TabsTrigger>
                <TabsTrigger value="visualizer" className="flex items-center gap-1 h-8 px-2 py-1 text-xs">
                  <FileCode size={14} /> <span className="hidden sm:inline">Code Visualizer</span><span className="sm:hidden">Visualizer</span>
                </TabsTrigger>
                <TabsTrigger value="interactive" className="flex items-center gap-1 h-8 px-2 py-1 text-xs">
                  <Play size={14} /> <span className="hidden sm:inline">Interactive Example</span><span className="sm:hidden">Example</span>
                </TabsTrigger>
                <TabsTrigger value="debugger" className="flex items-center gap-1 h-8 px-2 py-1 text-xs">
                  <Bug size={14} /> <span className="hidden sm:inline">Debugger</span><span className="sm:hidden">Debug</span>
                </TabsTrigger>
                <TabsTrigger value="algorithm" className="flex items-center gap-1 h-8 px-2 py-1 text-xs">
                  <Graph size={14} /> <span className="hidden sm:inline">Algorithm Steps</span><span className="sm:hidden">Algorithm</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1 h-8 px-2 py-1 text-xs">
                  <ShieldCheck size={14} /> <span className="hidden sm:inline">Security Controls</span><span className="sm:hidden">Security</span>
                </TabsTrigger>
                <TabsTrigger value="practices" className="flex items-center gap-1 h-8 px-2 py-1 text-xs">
                  <Check size={14} /> <span className="hidden sm:inline">Best Practices</span><span className="sm:hidden">Practices</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="general" className="py-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-card w-full transition-all duration-300">
                  <h3 className="text-lg font-medium mb-2">About {patternData.name}</h3>
                  <p className="text-muted-foreground mb-4">{patternData.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Use Cases</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {patternData.useCases && patternData.useCases.length > 0 ? patternData.useCases.map((useCase, i) => (
                          <li key={i}>{useCase}</li>
                        )) : (
                          <li>Use case information not available</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">When To Use</h4>
                      <p className="text-sm text-muted-foreground">{patternData.whenToUse || 'Information not available'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/20 w-full transition-all duration-300">
                  <h3 className="text-base font-medium mb-2">Implementation Overview</h3>
                  <p className="text-sm text-muted-foreground mb-3">This pattern can be implemented using the following components:</p>
                  
                  <div className="space-y-2">
                    {patternData.implementation && patternData.implementation.length > 0 ? patternData.implementation.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <span className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-5 h-5 text-xs font-medium mr-2 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </div>
                    )) : (
                      <div className="text-sm text-muted-foreground">Implementation steps not available</div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <Card className="h-full">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-2">Choose this pattern when:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                        <li>You need {patternData.advantages && patternData.advantages.length > 0 ? patternData.advantages[0].toLowerCase() : 'improved agent capabilities'}</li>
                        <li>Your application requires {patternData.advantages && patternData.advantages.length > 1 ? patternData.advantages[1].toLowerCase() : 'advanced pattern implementation'}</li>
                        <li>You want to {patternData.description.split(' ').slice(0, 5).join(' ').toLowerCase()}...</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="h-full">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-2">Consider alternatives when:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                        <li>You need simpler implementation with fewer components</li>
                        <li>Direct API calls would be more efficient</li>
                        <li>You have limited computational resources</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => document.querySelector('[value="steps"]')?.dispatchEvent(new Event('click'))}>
                    View Implementation Steps →
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="steps" className="py-4">
              <Steps 
                steps={patternData.implementation || []} 
                currentStep={currentStep} 
                setCurrentStep={setCurrentStep} 
              />
            </TabsContent>
            
            <TabsContent value="code" className="py-4">
              <LanguageSelector />
              
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
              <LanguageSelector />
              
              {executionSteps ? (
                <EnhancedCodeVisualizer 
                  code={getCodeExample()} 
                  language={language}
                  steps={executionSteps}
                  title={`${patternData.name} Pattern Execution`}
                />
              ) : interactiveExecution && interactiveExecution.blocks ? (
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
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Review best practices for implementing the {patternData.name} pattern, including general guidelines 
                  and specific Azure AI service integrations.
                </p>
              </div>
              <BestPractices patternId={patternData.id} patternName={patternData.name} />
            </TabsContent>
            
            <TabsContent value="security" className="py-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Implement these security controls to protect your {patternData.name} pattern implementation against potential threats,
                  following Azure security best practices and Microsoft's Secure Future Initiative guidelines.
                </p>
              </div>
              <PatternSecurityControls patternId={patternData.id} patternName={patternData.name} />
            </TabsContent>
            
            <TabsContent value="algorithm" className="py-4">
              {(() => {
                const algorithmVis = getAlgorithmVisualization(patternData.id);
                return algorithmVis ? (
                  <AlgorithmVisualizer visualization={algorithmVis} />
                ) : (
                  <div className="border rounded-md p-6 text-center text-muted-foreground">
                    <Graph size={32} className="mx-auto mb-2" />
                    <p>Algorithm visualization not available for this pattern.</p>
                  </div>
                );
              })()}
              
              <Alert className="mt-6">
                <AlertDescription>
                  Step through the algorithm execution to understand the decision-making process in the {patternData.name} pattern.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="debugger" className="py-4">
              <LanguageSelector />
              
              {(() => {
                const debugExample = getDebugExample(patternData.id, language);
                return debugExample ? (
                  <CodeDebugger
                    code={debugExample.code}
                    language={language}
                    steps={debugExample.steps}
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
                );
              })()}
              
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
        <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between border-t p-4 sm:p-6">
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