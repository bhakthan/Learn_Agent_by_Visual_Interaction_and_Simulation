import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Funnel, Eye, EyeClosed, ArrowsClockwise, PaintBucket, List } from '@phosphor-icons/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface DataFlowFilter {
  messageTypes: string[];
  nodeTypes: string[];
  connections: {source: string; target: string}[];
  visualizationMode: 'basic' | 'detailed' | 'timeline';
  highlightPattern: string | null;
}

interface DataFlowControlsProps {
  availableNodes: Array<{id: string; type: string; data: {label: string; nodeType: string}}>;
  availableEdges: Array<{id: string; source: string; target: string; label?: string}>;
  availableMessageTypes: string[];
  onFilterChange: (filter: DataFlowFilter) => void;
  onVisualizationModeChange: (mode: 'basic' | 'detailed' | 'timeline') => void;
}

const DataFlowControls = ({
  availableNodes,
  availableEdges,
  availableMessageTypes,
  onFilterChange,
  onVisualizationModeChange
}: DataFlowControlsProps) => {
  // Default to showing all message types and node types
  const [messageTypeFilters, setMessageTypeFilters] = useState<string[]>(availableMessageTypes);
  const [nodeTypeFilters, setNodeTypeFilters] = useState<string[]>(
    Array.from(new Set(availableNodes.map(node => node.data.nodeType)))
  );
  const [selectedConnections, setSelectedConnections] = useState<{source: string; target: string}[]>([]);
  const [visualizationMode, setVisualizationMode] = useState<'basic' | 'detailed' | 'timeline'>('basic');
  const [highlightPattern, setHighlightPattern] = useState<string | null>(null);
  
  // Patterns that can be highlighted to show different data flow paths
  const availablePatterns = [
    { id: 'sequential', name: 'Sequential Flow' },
    { id: 'branching', name: 'Branching Decisions' },
    { id: 'parallel', name: 'Parallel Processing' },
    { id: 'feedback', name: 'Feedback Loop' }
  ];
  
  // Group nodes by type for filter selection
  const nodeTypeGroups = Array.from(
    new Set(availableNodes.map(node => node.data.nodeType))
  ).sort();
  
  // Apply filters whenever they change
  useEffect(() => {
    onFilterChange({
      messageTypes: messageTypeFilters,
      nodeTypes: nodeTypeFilters,
      connections: selectedConnections,
      visualizationMode,
      highlightPattern
    });
  }, [messageTypeFilters, nodeTypeFilters, selectedConnections, visualizationMode, highlightPattern, onFilterChange]);
  
  // Handle visualization mode change
  const handleVisualizationModeChange = (mode: 'basic' | 'detailed' | 'timeline') => {
    setVisualizationMode(mode);
    onVisualizationModeChange(mode);
  };
  
  // Toggle all message types
  const toggleAllMessageTypes = () => {
    if (messageTypeFilters.length === availableMessageTypes.length) {
      setMessageTypeFilters([]);
    } else {
      setMessageTypeFilters([...availableMessageTypes]);
    }
  };
  
  // Toggle all node types
  const toggleAllNodeTypes = () => {
    if (nodeTypeFilters.length === nodeTypeGroups.length) {
      setNodeTypeFilters([]);
    } else {
      setNodeTypeFilters([...nodeTypeGroups]);
    }
  };
  
  // Toggle selection of a specific connection
  const toggleConnection = (source: string, target: string) => {
    const connectionKey = `${source}-${target}`;
    const exists = selectedConnections.some(
      conn => conn.source === source && conn.target === target
    );
    
    if (exists) {
      setSelectedConnections(selectedConnections.filter(
        conn => !(conn.source === source && conn.target === target)
      ));
    } else {
      setSelectedConnections([...selectedConnections, { source, target }]);
    }
  };
  
  // Reset all filters to default state
  const resetFilters = () => {
    setMessageTypeFilters(availableMessageTypes);
    setNodeTypeFilters(Array.from(new Set(availableNodes.map(node => node.data.nodeType))));
    setSelectedConnections([]);
    setHighlightPattern(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Data Flow Visualization Options</div>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <ArrowsClockwise className="mr-1 h-4 w-4" />
          Reset
        </Button>
      </div>
      
      {/* Visualization Mode Selection */}
      <div className="mb-3">
        <div className="text-sm text-muted-foreground mb-1">Visualization Mode</div>
        <ToggleGroup type="single" value={visualizationMode} onValueChange={(value) => {
          if (value) handleVisualizationModeChange(value as 'basic' | 'detailed' | 'timeline');
        }}>
          <ToggleGroupItem value="basic" aria-label="Basic visualization">
            <Eye className="h-4 w-4 mr-2" />
            Basic
          </ToggleGroupItem>
          <ToggleGroupItem value="detailed" aria-label="Detailed visualization">
            <List className="h-4 w-4 mr-2" />
            Detailed
          </ToggleGroupItem>
          <ToggleGroupItem value="timeline" aria-label="Timeline visualization">
            <ArrowsClockwise className="h-4 w-4 mr-2" />
            Timeline
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Message Type Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start">
              <Funnel className="mr-2 h-4 w-4" />
              Message Types
              <Badge variant="secondary" className="ml-2 rounded-full">
                {messageTypeFilters.length}/{availableMessageTypes.length}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Message Types</h4>
                <Button variant="ghost" size="sm" onClick={toggleAllMessageTypes}>
                  {messageTypeFilters.length === availableMessageTypes.length ? "Clear All" : "Select All"}
                </Button>
              </div>
              
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {availableMessageTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={messageTypeFilters.includes(type)}
                        onCheckedChange={(checked) => {
                          setMessageTypeFilters(
                            checked
                              ? [...messageTypeFilters, type]
                              : messageTypeFilters.filter(t => t !== type)
                          );
                        }}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Node Type Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start">
              <PaintBucket className="mr-2 h-4 w-4" />
              Agent Types
              <Badge variant="secondary" className="ml-2 rounded-full">
                {nodeTypeFilters.length}/{nodeTypeGroups.length}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Agent Types</h4>
                <Button variant="ghost" size="sm" onClick={toggleAllNodeTypes}>
                  {nodeTypeFilters.length === nodeTypeGroups.length ? "Clear All" : "Select All"}
                </Button>
              </div>
              
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {nodeTypeGroups.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`nodetype-${type}`}
                        checked={nodeTypeFilters.includes(type)}
                        onCheckedChange={(checked) => {
                          setNodeTypeFilters(
                            checked
                              ? [...nodeTypeFilters, type]
                              : nodeTypeFilters.filter(t => t !== type)
                          );
                        }}
                      />
                      <label
                        htmlFor={`nodetype-${type}`}
                        className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Connection Filters */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="justify-start mt-2">
            <ArrowsClockwise className="mr-2 h-4 w-4" />
            Filter Connections
            {selectedConnections.length > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full">
                {selectedConnections.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Focus on Specific Agent Interactions</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedConnections([])}
                disabled={selectedConnections.length === 0}
              >
                Clear
              </Button>
            </div>
            
            <ScrollArea className="h-60">
              <div className="space-y-3">
                {availableEdges.map((edge) => {
                  const sourceNode = availableNodes.find(n => n.id === edge.source);
                  const targetNode = availableNodes.find(n => n.id === edge.target);
                  
                  if (!sourceNode || !targetNode) return null;
                  
                  const isSelected = selectedConnections.some(
                    conn => conn.source === edge.source && conn.target === edge.target
                  );
                  
                  return (
                    <div 
                      key={edge.id}
                      className={`flex items-center border rounded-md p-2 cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20'
                      }`}
                      onClick={() => toggleConnection(edge.source, edge.target)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">{sourceNode.data.label}</span>
                          <span className="mx-2 text-muted-foreground">→</span>
                          <span className="text-sm font-medium">{targetNode.data.label}</span>
                        </div>
                        {edge.label && (
                          <span className="text-xs text-muted-foreground">{edge.label}</span>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Highlight Common Patterns */}
      <div className="mt-2">
        <div className="text-sm text-muted-foreground mb-1">Highlight Common Patterns</div>
        <Select
          value={highlightPattern || ""}
          onValueChange={(value) => setHighlightPattern(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a pattern to highlight" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {availablePatterns.map(pattern => (
              <SelectItem key={pattern.id} value={pattern.id}>
                {pattern.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Active Filters Summary */}
      {(messageTypeFilters.length < availableMessageTypes.length || 
          nodeTypeFilters.length < nodeTypeGroups.length ||
          selectedConnections.length > 0 ||
          highlightPattern) && (
        <Card className="p-2 mt-2 bg-muted/30">
          <div className="text-xs">
            <strong>Active Filters:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {messageTypeFilters.length < availableMessageTypes.length && (
                <Badge variant="outline" className="text-xs">
                  {messageTypeFilters.length} message types
                </Badge>
              )}
              
              {nodeTypeFilters.length < nodeTypeGroups.length && (
                <Badge variant="outline" className="text-xs">
                  {nodeTypeFilters.length} agent types
                </Badge>
              )}
              
              {selectedConnections.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedConnections.length} connections
                </Badge>
              )}
              
              {highlightPattern && (
                <Badge variant="outline" className="text-xs">
                  Highlighting: {availablePatterns.find(p => p.id === highlightPattern)?.name}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default React.memo(DataFlowControls, (prevProps, nextProps) => {
  // Shallow compare most props
  if (prevProps.availableMessageTypes.length !== nextProps.availableMessageTypes.length) return false;
  if (prevProps.availableNodes.length !== nextProps.availableNodes.length) return false;
  if (prevProps.availableEdges.length !== nextProps.availableEdges.length) return false;
  
  // Deep compare for available nodes if lengths match (to detect data changes)
  const prevNodeIds = prevProps.availableNodes.map(n => n.id).sort().join(',');
  const nextNodeIds = nextProps.availableNodes.map(n => n.id).sort().join(',');
  if (prevNodeIds !== nextNodeIds) return false;
  
  // Functions in props are assumed stable (via useCallback in parent)
  return true;
});