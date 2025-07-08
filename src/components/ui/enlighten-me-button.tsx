import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from '@phosphor-icons/react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { SpinnerGap } from '@phosphor-icons/react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnlightenMeButtonProps {
  topic: string;
  defaultPrompt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'icon';
}

export function EnlightenMeButton({ 
  topic, 
  defaultPrompt, 
  className = '', 
  size = 'sm',
  variant = 'icon'
}: EnlightenMeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setShowResponse(true);
    
    try {
      const generatedPrompt = window.spark.llmPrompt`${prompt}`;
      const result = await window.spark.llm(generatedPrompt);
      setResponse(result);
    } catch (error) {
      console.error('Error in EnlightenMeButton:', error);
      setResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPrompt = () => {
    setPrompt(defaultPrompt);
    setShowResponse(false);
    setResponse(null);
  };

  // Different button variants
  const renderButton = () => {
    switch (variant) {
      case 'default':
        return (
          <Button 
            onClick={() => setIsOpen(true)}
            size={size} 
            className={className}
          >
            <Lightbulb className="mr-2 text-yellow-500" size={16} weight="fill" />
            Enlighten Me
          </Button>
        );
      case 'subtle':
        return (
          <Button 
            variant="ghost"
            onClick={() => setIsOpen(true)}
            size={size} 
            className={`hover:bg-yellow-100 hover:text-yellow-900 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 ${className}`}
          >
            <Lightbulb className="mr-2 text-yellow-500" size={16} weight="fill" />
            Enlighten Me
          </Button>
        );
      case 'icon':
      default:
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className={`h-8 w-8 rounded-full hover:bg-yellow-100 hover:text-yellow-900 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 ${className}`}
            title="Learn more about this topic"
          >
            <Lightbulb size={16} weight="fill" className="text-yellow-500" />
          </Button>
        );
    }
  };

  return (
    <>
      {renderButton()}

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetPrompt();
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="text-yellow-500" size={20} weight="fill" />
              Learn about: {topic}
            </DialogTitle>
            <DialogDescription>
              {showResponse 
                ? "Here's what I've found about this topic" 
                : "Customize your query or use the default prompt to learn about this topic"}
            </DialogDescription>
          </DialogHeader>

          {!showResponse ? (
            <>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px]"
                placeholder="Enter your question..."
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Get Insights</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <SpinnerGap size={32} className="animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating insights...</p>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[350px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {response?.split('\n').map((paragraph, i) => (
                        paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <DialogFooter className="flex justify-between flex-row">
                    <Button variant="outline" onClick={resetPrompt}>Ask Something Else</Button>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}