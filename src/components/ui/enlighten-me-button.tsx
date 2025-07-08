import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Lightbulb } from '@phosphor-icons/react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface EnlightenMeButtonProps {
  topic: string;
  defaultPrompt?: string;
  className?: string;
}

export function EnlightenMeButton({ topic, defaultPrompt, className }: EnlightenMeButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt || `Explain the concept of ${topic} in detail, including key principles, implementation details, and best practices.`);
  const [response, setResponse] = useState<string | null>(null);

  const handleEnlighten = async () => {
    try {
      setLoading(true);
      // Create a prompt using the spark.llmPrompt template string
      const formattedPrompt = spark.llmPrompt`${prompt}`;
      
      // Send request to LLM
      const result = await spark.llm(formattedPrompt);
      setResponse(result);
    } catch (error) {
      console.error('Failed to get enlightenment:', error);
      setResponse('Sorry, I encountered an error while trying to enlighten you. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={className}
        onClick={() => setOpen(true)}
        title={`Learn more about ${topic}`}
      >
        <Lightbulb size={18} className="text-primary" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb size={20} className="text-primary" />
              Enlighten Me About {topic}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col flex-1 gap-4">
            <Textarea 
              placeholder="Customize your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] resize-y"
            />

            <Button 
              onClick={handleEnlighten} 
              disabled={loading || !prompt.trim()}
              className="w-full"
            >
              {loading ? 'Thinking...' : 'Enlighten Me'}
            </Button>

            {response && (
              <>
                <Separator />
                <ScrollArea className="flex-1 pr-4">
                  <div className="whitespace-pre-wrap">
                    {response}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}