import { useState, useEffect, useMemo } from 'react';
import { PatternData } from '@/lib/data/patterns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Play, Stop, ArrowsCounterClockwise, Info, Table } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

// Flow event data structure
interface FlowEvent {
  id: string;
  patternId: string;
  timestamp: number;
  source: string;
  sourceType: string;
  target: string;
  targetType: string;
  message: string;
  type: 'message' | 'data' | 'response' | 'error';
  context?: string;
}

interface ComparisonTimelineVisualizerProps {
  patterns: PatternData[];
  onSimulate: () => void;
  onReset: () => void;
  isSimulating: boolean;
}

const ComparisonTimelineVisualizer = ({ 
  patterns, 
  onSimulate, 
  onReset, 
  isSimulating 
}: ComparisonTimelineVisualizerProps) => {
  const [eventsData, setEventsData] = useState<FlowEvent[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'table' | 'gantt'>('timeline');
  const [filter, setFilter] = useState<{
    patternIds: string[];
    messageTypes: string[];
    nodeTypes: string[];
  }>({
    patternIds: patterns.map(p => p.id),
    messageTypes: ['message', 'data', 'response', 'error'],
    nodeTypes: []
  });

  // Initialize node types from all patterns
  useEffect(() => {
    const nodeTypes = new Set<string>();
    
    patterns.forEach(pattern => {
      pattern.nodes.forEach(node => {
        if (node.data.nodeType) {
          nodeTypes.add(node.data.nodeType);
        }
      });
    });
    
    setFilter(prev => ({
      ...prev,
      nodeTypes: Array.from(nodeTypes)
    }));
  }, [patterns]);

  // Sample events generation for demonstration
  useEffect(() => {
    if (isSimulating) {
      const simulatedEvents: FlowEvent[] = [];
      
      // Add random events for each pattern
      patterns.forEach(pattern => {
        const patternNodes = pattern.nodes;
        const patternEdges = pattern.edges;
        
        // Generate events based on the pattern structure
        patternEdges.forEach(edge => {
          const sourceNode = patternNodes.find(n => n.id === edge.source);
          const targetNode = patternNodes.find(n => n.id === edge.target);
          
          if (sourceNode && targetNode) {
            // Create a simulated flow event
            simulatedEvents.push({
              id: `event-${pattern.id}-${edge.id}`,
              patternId: pattern.id,
              timestamp: Date.now() + Math.random() * 10000, // Random time within 10 seconds
              source: edge.source,
              sourceType: sourceNode.data.nodeType || 'unknown',
              target: edge.target,
              targetType: targetNode.data.nodeType || 'unknown',
              message: edge.label || 'Data transfer',
              type: Math.random() > 0.8 ? 'response' : Math.random() > 0.5 ? 'data' : 'message',
              context: pattern.name
            });
          }
        });
      });
      
      // Sort events by timestamp
      simulatedEvents.sort((a, b) => a.timestamp - b.timestamp);
      
      // Set the events data with a delay to simulate animation
      const timer = setTimeout(() => {
        setEventsData(simulatedEvents);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Clear events when simulation stops
      setEventsData([]);
    }
  }, [isSimulating, patterns]);

  // Apply filters to events data
  const filteredEvents = useMemo(() => {
    return eventsData.filter(event => {
      return (
        filter.patternIds.includes(event.patternId) &&
        filter.messageTypes.includes(event.type) &&
        (
          filter.nodeTypes.includes(event.sourceType) ||
          filter.nodeTypes.includes(event.targetType)
        )
      );
    });
  }, [eventsData, filter]);

  // Toggle pattern filter
  const togglePatternFilter = (patternId: string) => {
    setFilter(prev => {
      if (prev.patternIds.includes(patternId)) {
        return {
          ...prev,
          patternIds: prev.patternIds.filter(id => id !== patternId)
        };
      } else {
        return {
          ...prev,
          patternIds: [...prev.patternIds, patternId]
        };
      }
    });
  };

  // Toggle message type filter
  const toggleMessageTypeFilter = (type: string) => {
    setFilter(prev => {
      if (prev.messageTypes.includes(type)) {
        return {
          ...prev,
          messageTypes: prev.messageTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          messageTypes: [...prev.messageTypes, type]
        };
      }
    });
  };

  // Toggle node type filter
  const toggleNodeTypeFilter = (type: string) => {
    setFilter(prev => {
      if (prev.nodeTypes.includes(type)) {
        return {
          ...prev,
          nodeTypes: prev.nodeTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          nodeTypes: [...prev.nodeTypes, type]
        };
      }
    });
  };

  // Color mapping for different message types
  const getEventColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-primary/20 border-primary';
      case 'data': return 'bg-green-500/20 border-green-500';
      case 'response': return 'bg-secondary/20 border-secondary';
      case 'error': return 'bg-destructive/20 border-destructive';
      default: return 'bg-muted border-muted-foreground';
    }
  };

  // Get node name from ID
  const getNodeName = (patternId: string, nodeId: string): string => {
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return nodeId;
    
    const node = pattern.nodes.find(n => n.id === nodeId);
    return node?.data.label || nodeId;
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Advanced Pattern Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualize and compare communication patterns between different agent configurations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            disabled={isSimulating}
          >
            <ArrowsCounterClockwise className="mr-2" size={16} />
            Reset
          </Button>
          <Button 
            size="sm"
            onClick={onSimulate}
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
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">Filter:</span>
            
            {/* Pattern filters */}
            <div className="flex flex-wrap gap-1">
              {patterns.map(pattern => (
                <Badge 
                  key={pattern.id}
                  variant={filter.patternIds.includes(pattern.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => togglePatternFilter(pattern.id)}
                >
                  {pattern.name}
                </Badge>
              ))}
            </div>
            
            {/* Message type filters */}
            <div className="flex gap-1 ml-2">
              {['message', 'data', 'response', 'error'].map(type => (
                <Badge 
                  key={type}
                  variant={filter.messageTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleMessageTypeFilter(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {viewMode === 'timeline' && (
          <div className="relative border rounded-md h-[400px] p-4 overflow-hidden">
            {isSimulating ? (
              <ScrollArea className="h-full">
                <div className="space-y-2 pr-4">
                  {filteredEvents.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">Generating communication data...</p>
                    </div>
                  ) : (
                    filteredEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border-l-4 pl-3 py-2 rounded-md ${getEventColor(event.type)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {patterns.find(p => p.id === event.patternId)?.name}
                            </Badge>
                            <Badge className="text-xs">{event.type}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="mt-1">
                          <div className="flex items-center text-sm">
                            <span className="font-medium">{getNodeName(event.patternId, event.source)}</span>
                            <span className="mx-1">→</span>
                            <span className="font-medium">{getNodeName(event.patternId, event.target)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{event.message}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <Info size={32} className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Click "Simulate All" to visualize communication between agents</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {viewMode === 'table' && (
          <div className="border rounded-md h-[400px] overflow-hidden">
            <ScrollArea className="h-full">
              <table className="w-full">
                <thead className="bg-muted/50 border-b sticky top-0">
                  <tr>
                    <th className="text-left p-2 text-xs">Time</th>
                    <th className="text-left p-2 text-xs">Pattern</th>
                    <th className="text-left p-2 text-xs">From</th>
                    <th className="text-left p-2 text-xs">To</th>
                    <th className="text-left p-2 text-xs">Type</th>
                    <th className="text-left p-2 text-xs">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <tr key={event.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 text-xs">{new Date(event.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {patterns.find(p => p.id === event.patternId)?.name}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs">{getNodeName(event.patternId, event.source)}</td>
                        <td className="p-2 text-xs">{getNodeName(event.patternId, event.target)}</td>
                        <td className="p-2">
                          <Badge size="sm" className="text-xs">{event.type}</Badge>
                        </td>
                        <td className="p-2 text-xs">{event.message}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        {isSimulating 
                          ? "Generating communication data..." 
                          : "Click 'Simulate All' to generate data"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}
        
        {viewMode === 'gantt' && (
          <div className="border rounded-md h-[400px] p-4 overflow-hidden relative">
            {filteredEvents.length > 0 ? (
              <ScrollArea className="h-full">
                <div className="relative">
                  {/* Timeline ruler */}
                  <div className="flex border-b mb-4 sticky top-0 bg-background z-10">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="flex-1 text-xs text-muted-foreground text-center border-r py-1">
                        {i * 500}ms
                      </div>
                    ))}
                  </div>
                  
                  {/* Pattern rows */}
                  <div className="space-y-4">
                    {patterns
                      .filter(p => filter.patternIds.includes(p.id))
                      .map(pattern => {
                        // Get events for this pattern
                        const patternEvents = filteredEvents.filter(e => e.patternId === pattern.id);
                        const minTime = patternEvents.length > 0 ? 
                          Math.min(...patternEvents.map(e => e.timestamp)) : Date.now();
                            
                        return (
                          <div key={pattern.id} className="space-y-2">
                            <div className="font-medium">{pattern.name}</div>
                            
                            {/* Node rows */}
                            {pattern.nodes.map(node => {
                              const nodeEvents = patternEvents.filter(
                                e => e.source === node.id || e.target === node.id
                              );
                              
                              if (nodeEvents.length === 0) return null;
                              
                              return (
                                <div key={node.id} className="flex items-center">
                                  <div className="w-32 text-xs truncate pr-2">{node.data.label}</div>
                                  <div className="flex-1 h-6 relative">
                                    {nodeEvents.map(event => {
                                      const position = ((event.timestamp - minTime) / 10000) * 100;
                                      const width = 2; // Fixed width for events
                                      
                                      return (
                                        <div
                                          key={event.id}
                                          className={`absolute top-0 h-full border rounded-sm ${getEventColor(event.type)}`}
                                          style={{
                                            left: `${Math.min(position, 95)}%`,
                                            width: `${width}%`
                                          }}
                                          title={`${event.message}: ${event.source} → ${event.target}`}
                                        ></div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                            
                            <Separator className="my-2" />
                          </div>
                        );
                      })}
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <Table size={32} className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isSimulating 
                      ? "Generating timeline data..." 
                      : "Click 'Simulate All' to generate Gantt chart visualization"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Analysis Summary</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.filter(p => filter.patternIds.includes(p.id)).map(pattern => {
              const patternEvents = filteredEvents.filter(e => e.patternId === pattern.id);
              const messageCount = patternEvents.length;
              const messageTypes = patternEvents.reduce((acc, event) => {
                acc[event.type] = (acc[event.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              return (
                <div key={pattern.id} className="border rounded-md p-3 bg-muted/20">
                  <div className="font-medium">{pattern.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 mb-2">{pattern.description}</div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total Messages:</span>
                      <span className="font-medium">{messageCount}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Average Processing Time:</span>
                      <span className="font-medium">
                        {patternEvents.length > 0 ? `${Math.round(Math.random() * 500)}ms` : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="text-sm mt-2">Message Types:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(messageTypes).map(([type, count]) => (
                        <Badge key={type} variant="outline" className={`text-xs ${getEventColor(type)}`}>
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonTimelineVisualizer;