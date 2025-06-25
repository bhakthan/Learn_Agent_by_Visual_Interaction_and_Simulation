import { useState, useEffect } from 'react'
import { agentPatterns } from '@/lib/data/patterns'
import PatternVisualizer from '@/components/visualization/PatternVisualizer'
import CodePlaybook from '@/components/code-playbook/CodePlaybook'
import PatternDetails from './PatternDetails'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ReactFlowProvider } from 'reactflow'
import { ChartLine, Code, Info } from '@phosphor-icons/react'

const PatternExplorer = () => {
  const [selectedPattern, setSelectedPattern] = useState(agentPatterns[0])
  
  // Ensure agentPatterns is loaded with the new patterns
  useEffect(() => {
    // Force a re-render if patterns were updated
    if (agentPatterns.length > 2) {
      console.log(`Loaded ${agentPatterns.length} agent patterns`);
    }
  }, []);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Agent Patterns</CardTitle>
          <CardDescription>Select a pattern to explore</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {agentPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedPattern.id === pattern.id
                      ? 'bg-primary/10 border-l-2 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <h3 className="font-medium">{pattern.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {pattern.description}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="lg:col-span-2 space-y-6">
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
              <PatternVisualizer key={selectedPattern.id} patternData={selectedPattern} />
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
  )
}

export default PatternExplorer