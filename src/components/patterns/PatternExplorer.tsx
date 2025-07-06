import { useState, useEffect } from 'react'
import { agentPatterns } from '@/lib/data/patterns'
import SimplePatternVisualizer from '@/components/visualization/SimplePatternVisualizer'
import CodePlaybook from '@/components/code-playbook/CodePlaybook'
import PatternDetails from './PatternDetails'
import SimpleMultiPatternVisualizer from './SimpleMultiPatternVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChartLine, Code, Info, Swap } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { PatternSidebar } from './PatternSidebar'
import { EnhancedTutorialButton, pagesSynopsis } from '../tutorial/EnhancedTutorialButton'
import { useTutorialContext } from '../tutorial/TutorialProvider'
import { agentPatternsTutorial } from '@/lib/tutorial'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const PatternExplorer = () => {
  const [selectedPattern, setSelectedPattern] = useState(agentPatterns[0] || null)
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single')
  
  const { startTutorial, registerTutorial, hasCompletedTutorial } = useTutorialContext();
  
  // Register the agent patterns tutorial
  useEffect(() => {
    registerTutorial(agentPatternsTutorial.id, agentPatternsTutorial);
  }, [registerTutorial]);
  
  // Ensure agentPatterns is loaded with the new patterns
  useEffect(() => {
    // Force a re-render if patterns were updated
    if (agentPatterns.length > 2) {
      console.log("Loaded " + agentPatterns.length + " agent patterns");
    }
    
    // Debug: Log pattern data structure
    console.log("Agent patterns data:", agentPatterns);
    if (agentPatterns.length > 0) {
      console.log("First pattern structure:", agentPatterns[0]);
    }
  }, []);
  
  const handlePatternSelect = (patternId: string) => {
    const pattern = agentPatterns.find(p => p.id === patternId);
    if (pattern) {
      setSelectedPattern(pattern);
    }
  };
  
  const toggleViewMode = () => {
    setViewMode(current => current === 'single' ? 'compare' : 'single');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Agent Patterns</h2>
        <div className="flex items-center gap-2">
          <EnhancedTutorialButton
            hasCompleted={hasCompletedTutorial(agentPatternsTutorial.id)}
            onClick={() => startTutorial(agentPatternsTutorial.id)}
            tooltip="Learn about Agent Patterns"
            pageSynopsis={pagesSynopsis['agent-patterns']}
            showDetailedView={true}
          />
          
          <Button 
            variant="outline" 
            onClick={toggleViewMode}
            className="flex items-center gap-2"
          >
            <Swap size={16} />
            {viewMode === 'single' ? 'Compare Patterns' : 'Single Pattern View'}
          </Button>
        </div>
      </div>
      
      {viewMode === 'single' ? (
        <div className="flex relative">
          {/* Sidebar */}
          {selectedPattern ? (
            <>
              <div className="hidden md:block">
                <PatternSidebar 
                  activePatternId={selectedPattern.id} 
                  onPatternSelect={handlePatternSelect}
                />
              </div>
              
              {/* Mobile Pattern Selector */}
              <Card className="md:hidden mb-4 w-full">
                <CardHeader className="py-3">
                  <h3 className="text-sm font-medium">Select Pattern</h3>
                </CardHeader>
                <CardContent className="py-2">
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2">
                      {agentPatterns.map((pattern) => (
                        <div
                          key={pattern.id}
                          className={`p-2 rounded-md cursor-pointer transition-colors ${
                            selectedPattern.id === pattern.id
                              ? 'bg-primary/10 border-l-2 border-primary'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedPattern(pattern)}
                        >
                          <h3 className="text-sm font-medium">{pattern.name}</h3>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Main Content Area */}
              <div className="flex-1 md:pl-[260px]">
                <Tabs defaultValue="visualization" className="w-full">
                  <TabsList className="grid w-full grid-cols-3" data-tab-list>
                    <TabsTrigger value="visualization" className="flex items-center gap-2" data-tab="visualization">
                      <ChartLine size={16} /> Visualization
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2" data-tab="details">
                      <Info size={16} /> Educational Content
                    </TabsTrigger>
                    <TabsTrigger value="implementation" className="flex items-center gap-2" data-tab="implementation">
                      <Code size={16} /> Implementation
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="visualization">
                    <div className="flow-container" data-flow>
                      <ErrorBoundary>
                        <SimplePatternVisualizer patternData={selectedPattern} />
                      </ErrorBoundary>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details">
                    <ErrorBoundary>
                      <PatternDetails pattern={selectedPattern} />
                    </ErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="implementation">
                    <CodePlaybook patternData={selectedPattern} />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="w-full p-8 text-center border border-dashed rounded-lg">
              <p className="text-muted-foreground">No patterns available to display</p>
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="comparison">
          <TabsContent value="comparison">
            {selectedPattern ? (
              <SimpleMultiPatternVisualizer initialPatterns={[selectedPattern.id]} />
            ) : (
              <div className="w-full p-8 text-center border border-dashed rounded-lg">
                <p className="text-muted-foreground">No patterns available to compare</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default PatternExplorer
