import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowsCounterClockwise, Play, Stop, ArrowsHorizontal, ChartLine, Table } from '@phosphor-icons/react'
import { PatternData, agentPatterns } from '@/lib/data/patterns'
import SimplePatternVisualizer from '@/components/visualization/SimplePatternVisualizer'
import SimpleMultiPatternVisualizer from '@/components/visualization/SimpleMultiPatternVisualizer'
import ComparisonTimelineVisualizer from '@/components/visualization/ComparisonTimelineVisualizer'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import { toast } from 'sonner'

interface MultiPatternVisualizerProps {
  initialPatterns?: string[]
  useAdvancedVisualizer?: boolean
}

const MultiPatternVisualizer = ({ initialPatterns, useAdvancedVisualizer = true }: MultiPatternVisualizerProps) => {
  // Default to comparing the first two patterns if not specified
  const defaultPatterns = initialPatterns || 
    [agentPatterns[0]?.id, agentPatterns[1]?.id].filter(Boolean);
  
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>(defaultPatterns);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showPatternSelector, setShowPatternSelector] = useState(false);
  const [useAdvanced, setUseAdvanced] = useState<boolean>(useAdvancedVisualizer);
  const [viewMode, setViewMode] = useState<'individual' | 'timeline'>('individual');
  
  // Get actual pattern data objects from IDs
  const selectedPatterns = agentPatterns.filter(pattern => 
    selectedPatternIds.includes(pattern.id)
  );

  const togglePatternSelection = useCallback((patternId: string) => {
    setSelectedPatternIds(current => {
      // If already selected, remove it
      if (current.includes(patternId)) {
        return current.filter(id => id !== patternId);
      }
      
      // If we already have 3 patterns in timeline mode, replace the last one
      if (viewMode === 'timeline' && current.length >= 3) {
        return [...current.slice(0, 2), patternId];
      }
      
      // If we already have 2 patterns in individual mode, replace the last one
      if (viewMode === 'individual' && current.length >= 2) {
        return [current[0], patternId];
      }
      
      // Otherwise add it
      return [...current, patternId];
    });
  }, [viewMode]);

  const simulateAll = () => {
    setIsSimulating(true);
    // The simulation is handled by child PatternVisualizer components
    // We just need to update UI state here
    
    setTimeout(() => {
      setIsSimulating(false);
    }, 20000); // Assume simulations take at most 20 seconds
    
    toast.success('Running simulations on all patterns');
  };

  const resetAll = () => {
    setIsSimulating(false);
    // Reset is handled by child components when they detect prop changes
    toast.info('All pattern visualizations reset');
  };

  const toggleViewMode = () => {
    setViewMode(current => current === 'individual' ? 'timeline' : 'individual');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pattern Comparison</h2>
          <p className="text-muted-foreground">
            Compare how different agent patterns handle similar tasks
          </p>
        </div>
        
        <div className="flex gap-2">
          <Tabs 
            value={viewMode} 
            onValueChange={(value: string) => setViewMode(value as 'individual' | 'timeline')}
            className="mr-2"
          >
            <TabsList>
              <TabsTrigger value="individual" className="flex items-center gap-1">
                <ChartLine size={14} />
                Side by Side
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-1">
                <Table size={14} />
                Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Toggle
            className="flex gap-2 items-center"
            pressed={useAdvanced}
            onPressedChange={setUseAdvanced}
            disabled={viewMode === 'timeline'}
          >
            Advanced Visualization
          </Toggle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPatternSelector(!showPatternSelector)}
          >
            <ArrowsHorizontal className="mr-2" size={16} />
            {showPatternSelector ? 'Hide Pattern Selector' : 'Change Patterns'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetAll}
            disabled={isSimulating}
          >
            <ArrowsCounterClockwise className="mr-2" size={16} />
            Reset
          </Button>
          
          <Button 
            size="sm"
            onClick={simulateAll}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <Stop className="mr-2" size={16} />
            ) : (
              <Play className="mr-2" size={16} />
            )}
            {isSimulating ? 'Simulating...' : 'Simulate All'}
          </Button>
        </div>
      </div>
      
      {showPatternSelector && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle>Select Patterns to Compare</CardTitle>
            <CardDescription>
              {viewMode === 'timeline' 
                ? 'Choose up to 3 patterns to compare in timeline view' 
                : 'Choose up to 2 patterns to compare side by side'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {agentPatterns.map((pattern) => (
                  <div 
                    key={pattern.id}
                    className={`p-3 rounded-md cursor-pointer border ${
                      selectedPatternIds.includes(pattern.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => togglePatternSelection(pattern.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{pattern.name}</h3>
                      {selectedPatternIds.includes(pattern.id) && (
                        <Badge variant="outline" className="ml-2">Selected</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {pattern.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {viewMode === 'individual' ? (
        <>
          <div className={`grid gap-6 ${selectedPatterns.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {selectedPatterns.map((pattern) => (
              <div key={pattern.id}>
                <SimplePatternVisualizer patternData={pattern} />
              </div>
            ))}
            
            {selectedPatterns.length === 0 && (
              <div className="p-8 text-center border border-dashed rounded-lg">
                <p className="text-muted-foreground">Select at least one pattern to visualize</p>
              </div>
            )}
          </div>
          
          {selectedPatterns.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Pattern Comparison Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {selectedPatterns.map((pattern) => (
                    <div key={pattern.id} className="space-y-4">
                      <div>
                        <h3 className="font-medium text-lg">{pattern.name}</h3>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">Best For:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pattern.useCases && Array.isArray(pattern.useCases) ? pattern.useCases.map((useCase, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{useCase}</Badge>
                          )) : <Badge variant="outline" className="text-xs">General use</Badge>}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">Key Characteristics:</h4>
                        <ul className="mt-1 space-y-1 list-disc list-inside text-sm">
                          <li>Node Count: {pattern.nodes.length}</li>
                          <li>Connection Count: {pattern.edges.length}</li>
                          <li>Complexity: {
                            pattern.edges.length / pattern.nodes.length > 1.5 ? 'High' : 
                            pattern.edges.length / pattern.nodes.length > 1 ? 'Medium' : 'Low'
                          }</li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Key Differences</h3>
                  
                  {selectedPatterns.length === 2 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary"></div>
                        <p className="text-sm">
                          <span className="font-medium">{selectedPatterns[0]?.name || 'First pattern'}</span> vs <span className="font-medium">{selectedPatterns[1]?.name || 'Second pattern'}</span>
                        </p>
                      </div>
                      
                      <ul className="space-y-2 text-sm pl-5">
                        {/* Dynamically calculate differences */}
                        {selectedPatterns[0] && selectedPatterns[1] && (
                          <>
                            <li>
                              <span className="font-medium">{selectedPatterns[0].name}</span> uses {selectedPatterns[0].nodes.length} nodes compared to {selectedPatterns[1].nodes.length} in <span className="font-medium">{selectedPatterns[1].name}</span>
                            </li>
                            <li>
                              <span className="font-medium">Communication path:</span> {
                                selectedPatterns[0].nodes.some(n => n.data.nodeType === 'router') ? 
                                `${selectedPatterns[0].name} uses routing for decision-making` : 
                                `${selectedPatterns[0].name} has a more linear communication flow`
                              }
                            </li>
                            <li>
                              <span className="font-medium">Complexity trade-offs:</span> {
                                selectedPatterns[0].nodes.length > selectedPatterns[1].nodes.length ? 
                                `${selectedPatterns[0].name} is more complex but potentially more powerful` : 
                                `${selectedPatterns[1].name} is more complex but potentially more powerful`
                              }
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <ComparisonTimelineVisualizer 
          patterns={selectedPatterns}
          onSimulate={simulateAll}
          onReset={resetAll}
          isSimulating={isSimulating}
        />
      )}
    </div>
  )
}

export default MultiPatternVisualizer