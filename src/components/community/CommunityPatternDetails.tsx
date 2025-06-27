import { useState } from 'react';
import { CommunityPattern } from '@/lib/data/communitySharing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, ArrowLeft, ChatCircle, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommunityPatternDetailsProps {
  pattern: CommunityPattern;
  onBack: () => void;
}

export default function CommunityPatternDetails({ pattern, onBack }: CommunityPatternDetailsProps) {
  const [votes, setVotes] = useState(pattern.votes);
  const [hasVoted, setHasVoted] = useState(false);
  const [comments, setComments] = useState<Array<{id: number, text: string, author: string, date: string}>>([
    {id: 1, text: "Great implementation! I\'ve been looking for something like this.", author: "Azure Developer", date: "3 days ago"},
    {id: 2, text: "Have you considered adding Azure Monitor integration for observability?", author: "Cloud Architect", date: "1 day ago"},
  ]);
  const [commentText, setCommentText] = useState("");

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

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      // This would normally make an API call
      const newComment = {
        id: comments.length + 1,
        text: commentText,
        author: "You",
        date: "Just now"
      };
      
      setComments([...comments, newComment]);
      setCommentText("");
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" className="mb-2" onClick={onBack}>
        <ArrowLeft className="mr-2" size={16} />
        Back to All Patterns
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{pattern.title}</h2>
          <div className="flex items-center mt-2 space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={pattern.authorAvatar} alt={pattern.author} />
              <AvatarFallback>{pattern.author.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{pattern.author}</span>
            <span className="text-xs text-muted-foreground">
              • {new Date(pattern.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center border rounded-md px-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVote(1)}>
              <ArrowUp size={16} />
            </Button>
            <span className="text-sm font-medium px-1">{votes}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleVote(-1)}>
              <ArrowDown size={16} />
            </Button>
          </div>
          <Button size="sm" onClick={handleCopyCode}>
            <Copy className="mr-2" size={16} />
            Copy Code
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 my-4">
        <Badge variant="outline" className="bg-primary/10 border-primary/20">
          {pattern.patternType}
        </Badge>
        {pattern.tags.map(tag => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      
      <p className="text-muted-foreground">{pattern.description}</p>

      <Tabs defaultValue="code" className="w-full mt-6">
        <TabsList>
          <TabsTrigger value="code">Implementation</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
          <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
          <TabsTrigger value="discussion">
            Discussion
            <Badge variant="secondary" className="ml-2">{comments.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="mt-4">
          <div className="bg-muted rounded-md p-4 overflow-x-auto relative">
            <pre className="font-mono text-sm">
              <code>{pattern.codeSnippet}</code>
            </pre>
            <Button 
              variant="outline" 
              size="sm"
              className="absolute top-2 right-2 opacity-80"
              onClick={handleCopyCode}
            >
              <Copy size={14} />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="best-practices" className="mt-4">
          <div className="bg-card rounded-md p-4">
            <h3 className="font-medium mb-4">Azure AI Best Practices</h3>
            <ul className="space-y-3">
              {pattern.bestPractices.map((practice, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="use-cases" className="mt-4">
          <div className="bg-card rounded-md p-4">
            <h3 className="font-medium mb-4">Potential Applications</h3>
            <ul className="space-y-3">
              {pattern.useCases.map((useCase, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 text-primary">•</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="discussion" className="mt-4">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-card rounded-md p-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                  </div>
                  <p className="text-sm mt-1">{comment.text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="mt-4 flex gap-2">
            <textarea 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={1}
            />
            <Button onClick={handleAddComment}>
              <ChatCircle className="mr-2" size={16} />
              Comment
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}