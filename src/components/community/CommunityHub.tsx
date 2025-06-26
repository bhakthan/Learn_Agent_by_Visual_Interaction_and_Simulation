import { useState, useEffect } from 'react';
import { communityPatterns, CommunityPattern } from '@/lib/data/communitySharing';
import CommunityPatternCard from './CommunityPatternCard';
import CommunityPatternDetails from './CommunityPatternDetails';
import CommunityPatternForm from './CommunityPatternForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  MagnifyingGlass, 
  Plus, 
  SortAscending, 
  SortDescending, 
  ClockCounterClockwise,
  ThumbsUp
} from '@phosphor-icons/react';
import { PatternType } from '@/lib/data/patterns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

export default function CommunityHub() {
  // Get the patterns from the KV store, with initial data from communityPatterns
  const [storedPatterns, setStoredPatterns, deleteStoredPatterns] = useKV<CommunityPattern[]>('community-patterns', communityPatterns);
  
  const [view, setView] = useState<'list' | 'details' | 'form'>('list');
  const [selectedPattern, setSelectedPattern] = useState<CommunityPattern | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PatternType | 'all'>('all');
  const [sortMethod, setSortMethod] = useState<'newest' | 'popular'>('newest');
  
  const filteredPatterns = storedPatterns
    .filter(pattern => {
      // Filter by search term
      if (searchTerm && !pattern.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      // Filter by pattern type
      if (filterType !== 'all' && pattern.patternType !== filterType) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by creation date (newest first)
      if (sortMethod === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      // Sort by votes (most popular)
      return b.votes - a.votes;
    });
    
  const handlePatternSelect = (pattern: CommunityPattern) => {
    setSelectedPattern(pattern);
    setView('details');
  };
  
  const handleCreateSubmit = (newPatternData: Omit<CommunityPattern, 'id' | 'votes' | 'createdAt'>) => {
    // Create a new pattern with generated id and current date
    const newPattern: CommunityPattern = {
      ...newPatternData,
      id: `comm-${Date.now()}`,
      votes: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    // Add to the patterns list
    setStoredPatterns([...storedPatterns, newPattern]);
    setView('list');
    
    // Show success message
    toast.success('Your pattern has been shared with the community!');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Community Hub</h2>
          <p className="text-muted-foreground">
            Share and discover Azure AI agent patterns from the community.
          </p>
        </div>
        {view === 'list' && (
          <Button onClick={() => setView('form')}>
            <Plus size={18} className="mr-2" />
            Share Your Pattern
          </Button>
        )}
      </div>
      
      {view === 'list' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patterns by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value) => setFilterType(value as PatternType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pattern Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="react">ReAct</SelectItem>
                  <SelectItem value="codeact">CodeAct</SelectItem>
                  <SelectItem value="reflexion">Reflexion</SelectItem>
                  <SelectItem value="rag">RAG</SelectItem>
                  <SelectItem value="plan-and-execute">Plan & Execute</SelectItem>
                  <SelectItem value="orchestrator-worker">Orchestrator</SelectItem>
                  <SelectItem value="evaluator-optimizer">Evaluator</SelectItem>
                  <SelectItem value="self-reflection">Self-Reflection</SelectItem>
                  <SelectItem value="routing">Routing</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortMethod} onValueChange={(value) => setSortMethod(value as 'newest' | 'popular')}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center">
                      <ClockCounterClockwise size={14} className="mr-2" />
                      <span>Newest</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center">
                      <ThumbsUp size={14} className="mr-2" />
                      <span>Popular</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredPatterns.length === 0 ? (
            <Alert>
              <div className="flex items-center">
                <MagnifyingGlass className="h-4 w-4 mr-2" />
                <AlertTitle>No patterns found</AlertTitle>
              </div>
              <AlertDescription>
                Try adjusting your search criteria or be the first to share a pattern matching these filters!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatterns.map(pattern => (
                <CommunityPatternCard 
                  key={pattern.id} 
                  pattern={pattern} 
                  onSelect={handlePatternSelect} 
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {view === 'details' && selectedPattern && (
        <CommunityPatternDetails 
          pattern={selectedPattern} 
          onBack={() => setView('list')} 
        />
      )}
      
      {view === 'form' && (
        <CommunityPatternForm 
          onSubmit={handleCreateSubmit}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  );
}