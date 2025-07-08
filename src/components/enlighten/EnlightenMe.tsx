import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, SpinnerGap } from '@phosphor-icons/react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnlightenMeProps {
  title: string;
  defaultPrompt: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnlightenMe({ title, defaultPrompt, isOpen, onOpenChange }: EnlightenMeProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setSubmitted(true);

      // Create the LLM prompt using the spark API
      const generatedPrompt = spark.llmPrompt`${prompt}`;
      
      // Call the LLM
      const result = await spark.llm(generatedPrompt);
      
      // Update the response
      setResponse(result);
    } catch (error) {
      setResponse("Sorry, I couldn't process your request. Please try again.");
      console.error("Error in EnlightenMe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setResponse('');
    setPrompt(defaultPrompt);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={20} weight="fill" />
            Enlighten Me: {title}
          </DialogTitle>
          <DialogDescription>
            Learn more about this concept with AI assistance. Edit the prompt if you'd like to ask something specific.
          </DialogDescription>
        </DialogHeader>
        
        {!submitted ? (
          <>
            <Textarea 
              className="min-h-[150px] text-sm" 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Edit your prompt here..."
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Get Insights</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="border rounded-md bg-muted/30 p-4">
              <p className="text-sm font-medium mb-2">Your prompt:</p>
              <p className="text-sm text-muted-foreground">{prompt}</p>
            </div>
            
            <div className="border rounded-md p-4 min-h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <SpinnerGap size={24} className="animate-spin text-primary" />
                  <span className="ml-2">Generating insights...</span>
                </div>
              ) : (
                <ScrollArea className="h-[250px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {response.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            <DialogFooter className="flex items-center justify-between flex-row">
              <Button variant="ghost" onClick={handleReset}>
                Edit Prompt
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EnlightenMe;