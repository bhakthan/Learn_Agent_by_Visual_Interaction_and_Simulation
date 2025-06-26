import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Plus, X, Check, Upload } from '@phosphor-icons/react';
import { CommunityPattern } from '@/lib/data/communitySharing';
import { PatternType } from '@/lib/data/patterns';

interface CommunityPatternFormProps {
  onSubmit: (pattern: Omit<CommunityPattern, 'id' | 'votes' | 'createdAt'>) => void;
  onCancel: () => void;
}

const patternTypes: PatternType[] = [
  "react",
  "codeact",
  "reflexion",
  "rag",
  "plan-and-execute",
  "orchestrator-worker",
  "evaluator-optimizer",
  "self-reflection",
  "routing"
];

export default function CommunityPatternForm({ onSubmit, onCancel }: CommunityPatternFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [patternType, setPatternType] = useState<PatternType>("react");
  const [codeSnippet, setCodeSnippet] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<string[]>(['']);
  const [bestPractices, setBestPractices] = useState<string[]>(['']);

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUseCaseChange = (index: number, value: string) => {
    const newUseCases = [...useCases];
    newUseCases[index] = value;
    setUseCases(newUseCases);
  };

  const handleAddUseCase = () => {
    setUseCases([...useCases, '']);
  };

  const handleRemoveUseCase = (index: number) => {
    if (useCases.length === 1) return;
    const newUseCases = useCases.filter((_, i) => i !== index);
    setUseCases(newUseCases);
  };

  const handleBestPracticeChange = (index: number, value: string) => {
    const newBestPractices = [...bestPractices];
    newBestPractices[index] = value;
    setBestPractices(newBestPractices);
  };

  const handleAddBestPractice = () => {
    setBestPractices([...bestPractices, '']);
  };

  const handleRemoveBestPractice = (index: number) => {
    if (bestPractices.length === 1) return;
    const newBestPractices = bestPractices.filter((_, i) => i !== index);
    setBestPractices(newBestPractices);
  };

  const handleSubmit = () => {
    // Form validation
    if (!title.trim()) {
      toast.error('Pattern title is required');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    
    if (!author.trim()) {
      toast.error('Author name is required');
      return;
    }
    
    if (!codeSnippet.trim()) {
      toast.error('Code snippet is required');
      return;
    }
    
    if (!useCases[0].trim()) {
      toast.error('At least one use case is required');
      return;
    }
    
    if (!bestPractices[0].trim()) {
      toast.error('At least one best practice is required');
      return;
    }
    
    // Filter out empty items
    const filteredUseCases = useCases.filter(uc => uc.trim().length > 0);
    const filteredBestPractices = bestPractices.filter(bp => bp.trim().length > 0);
    
    const newPattern = {
      title,
      author,
      authorAvatar: undefined, // Would be populated from user profile in a real app
      patternType,
      description,
      codeSnippet,
      useCases: filteredUseCases,
      bestPractices: filteredBestPractices,
      tags: tags.length ? tags : [`${patternType}`],
    };
    
    onSubmit(newPattern);
    toast.success('Pattern submitted successfully!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-xl font-medium">Share Your Agent Pattern</h3>
        <p className="text-sm text-muted-foreground">
          Contribute to the community by sharing your Azure AI agent pattern implementation.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pattern Title</label>
          <Input
            placeholder="e.g., Enhanced ReAct Pattern with Azure Content Safety"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Author Name</label>
            <Input
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Base Pattern Type</label>
            <Select value={patternType} onValueChange={(value) => setPatternType(value as PatternType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select pattern type" />
              </SelectTrigger>
              <SelectContent>
                {patternTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            placeholder="Describe your pattern and its unique features..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-24"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Code Implementation</label>
          <Textarea
            placeholder="Paste your code implementation here..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            className="h-48 font-mono text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag e.g., azure-openai"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" onClick={handleAddTag} size="icon">
              <Plus size={16} />
            </Button>
          </div>
        </div>
        
        {/* Use Cases */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Use Cases</label>
          {useCases.map((useCase, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Use case ${index + 1}`}
                value={useCase}
                onChange={(e) => handleUseCaseChange(index, e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveUseCase(index)}
                disabled={useCases.length === 1}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddUseCase} className="w-full">
            <Plus size={16} className="mr-2" /> Add Use Case
          </Button>
        </div>
        
        {/* Best Practices */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Azure Best Practices</label>
          {bestPractices.map((practice, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Best practice ${index + 1}`}
                value={practice}
                onChange={(e) => handleBestPracticeChange(index, e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveBestPractice(index)}
                disabled={bestPractices.length === 1}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddBestPractice} className="w-full">
            <Plus size={16} className="mr-2" /> Add Best Practice
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>
          <Check size={16} className="mr-2" />
          Submit Pattern
        </Button>
      </CardFooter>
    </Card>
  );
}