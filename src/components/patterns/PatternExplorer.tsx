import { useState } from 'react'
import { agentPatterns } from '@/lib/data/patterns'
import PatternVisualizer from '@/components/visualization/PatternVisualizer'
import CodePlaybook from '@/components/code-playbook/CodePlaybook'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const PatternExplorer = () => {
  const [selectedPattern, setSelectedPattern] = useState(agentPatterns[0])
  
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
          <TabsList>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualization">
            <PatternVisualizer patternData={selectedPattern} />
          </TabsContent>
          
          <TabsContent value="implementation">
            <CodePlaybook patternData={selectedPattern} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PatternExplorer