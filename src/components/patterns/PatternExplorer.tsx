import { useState, useEffect } from 'react'
import { agentPatterns } from '@/lib/data/patterns'
import PatternVisualizer from '@/components/visualization/PatternVisualizer'
import AdvancedPatternVisualizer from '@/components/visualization/AdvancedPatternVisualizer'
import CodePlaybook from '@/components/code-playbook/CodePlaybook'
import PatternDetails from './PatternDetails'
import MultiPatternVisualizer from './MultiPatternVisualizer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ReactFlowProvider } from 'reactflow'
import { ChartLine, Code, Info, Swap } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { PatternSidebar } from './PatternSidebar'

const PatternExplorer = () => {
  const [selectedPattern, setSelectedPattern] = useState(agentPatterns[0])
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single')
  const [useAdvancedVisualizer, setUseAdvancedVisualizer] = useState<boolean>(true)
  
  // Ensure agentPatterns is loaded with the new patterns
  useEffect(() => {
    // Force a re-render if patterns were updated
    if (agentPatterns.length > 2) {
      console.log(`Loaded ${agentPatterns.length} agent patterns`);
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
          <Toggle
            className="flex gap-2 items-center"
            pressed={useAdvancedVisualizer}
            onPressedChange={setUseAdvancedVisualizer}
          >
            <Info className="h-4 w-4" />
            {useAdvancedVisualizer ? "Advanced Mode" : "Standard Mode"}
          </Toggle>
          
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
        <div className="flex">
          {/* Sidebar */}
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
          <div className="flex-1">
            <Tabs defaultValue="visualization" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visualization" className="flex items-center gap-2">
                  <ChartLine size={16} /> Visualization
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Info size={16} /> Educational Content
                </TabsTrigger>
                <TabsTrigger value="implementation" className="flex items-center gap-2">
                  <Code size={16} /> Implementation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="visualization">
                <ReactFlowProvider>
                  {useAdvancedVisualizer ? (
                    <AdvancedPatternVisualizer key={selectedPattern.id} patternData={selectedPattern} />
                  ) : (
                    <PatternVisualizer key={selectedPattern.id} patternData={selectedPattern} />
                  )}
                </ReactFlowProvider>
              </TabsContent>
              
              <TabsContent value="details">
                <PatternDetails pattern={selectedPattern} />
              </TabsContent>
              
              <TabsContent value="implementation">
                <ReactFlowProvider>
                  <CodePlaybook patternData={selectedPattern} />
                </ReactFlowProvider>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <ReactFlowProvider>
          <MultiPatternVisualizer initialPatterns={[selectedPattern.id]} />
        </ReactFlowProvider>
      )}
    </div>
  )
}

export default PatternExplorer