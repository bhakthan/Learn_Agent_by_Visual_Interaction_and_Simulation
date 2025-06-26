import { useState } from 'react';
import { CommunityPattern } from '@/lib/data/communitySharing';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ChatCircle, Code, Copy } from '@phosphor-icons/react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';

interface CommunityPatternCardProps {
  pattern: CommunityPattern;
  onSelect: (pattern: CommunityPattern) => void;
}

export default function CommunityPatternCard({ pattern, onSelect }: CommunityPatternCardProps) {
  const [votes, setVotes] = useState(pattern.votes);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = (value: number) => {
    if (!hasVoted) {
      setVotes(prev => prev + value);
      setHasVoted(true);
      toast.success('Vote recorded! Thank you for your feedback.');
    } else {
      toast.error('You have already voted on this pattern');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pattern.codeSnippet);
    toast.success('Code copied to clipboard!');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={pattern.authorAvatar} alt={pattern.author} />
              <AvatarFallback>{pattern.author.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{pattern.author}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(pattern.createdAt).toLocaleDateString()}
          </div>
        </div>
        <h3 className="font-medium text-lg">{pattern.title}</h3>
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-xs">
            {pattern.patternType}
          </Badge>
          {pattern.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {pattern.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{pattern.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{pattern.description}</p>
        <div className="text-xs mb-2 font-medium">Use Cases:</div>
        <ul className="text-xs text-muted-foreground mb-4 pl-4 list-disc">
          {pattern.useCases.slice(0, 2).map((useCase, i) => (
            <li key={i} className="line-clamp-1">{useCase}</li>
          ))}
          {pattern.useCases.length > 2 && <li className="text-xs text-muted-foreground">+{pattern.useCases.length - 2} more</li>}
        </ul>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between border-t">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVote(1)}>
              <ArrowUp size={16} />
            </Button>
            <span className="text-sm mx-1">{votes}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVote(-1)}>
              <ArrowDown size={16} />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyCode}>
            <Copy size={16} />
          </Button>
        </div>
        <div>
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onSelect(pattern)}>
            <Code className="mr-2" size={14} />
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}