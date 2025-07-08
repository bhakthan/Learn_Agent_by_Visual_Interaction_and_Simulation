import React, { useState } from 'react';
import { Lightbulb, SpinnerGap } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Define spark API type to avoid TypeScript errors
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
      user: () => Promise<{
        avatarUrl: string;
        email: string;
        id: string;
        isOwner: boolean;
        login: string;
      }>;
      kv: {
        keys: () => Promise<string[]>;
        get: <T>(key: string) => Promise<T | undefined>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
    };
  }
}

interface EnlightenMeButtonProps {
  title: string;
  conceptId: string;
  description?: string;
  customPrompt?: string;
  className?: string;
}

const EnlightenMeButton: React.FC<EnlightenMeButtonProps> = ({
  title,
  conceptId,
  description,
  customPrompt,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [showResponse, setShowResponse] = useState(false);

  // Create a detailed prompt based on the context description
  const generateDefaultPrompt = () => {
    // The default prompt will be based on the concept's title and description
    const basePrompt = `Explain the concept of ${title} in detail, covering:
1. What it is and why it's important in the context of Azure AI Agents
2. How it works and its key components
3. Real-world applications and use cases
4. Best practices when implementing it
5. How it relates to other agent patterns or concepts`;
    
    if (customPrompt) {
      return customPrompt;
    }
    
    return basePrompt;
  };

  const handleOpen = () => {
    setIsOpen(true);
    setPrompt(generateDefaultPrompt());
    setShowResponse(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setResponse('');
    setShowResponse(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Ensure window.spark is defined
      if (!window.spark || typeof window.spark.llmPrompt !== 'function') {
        throw new Error('Spark API is not available');
      }
      
      // Create a prompt using the spark.llmPrompt template format
      // Use tagged template literals correctly
      const llmPrompt = window.spark.llmPrompt`${prompt}`;
      
      // Call the LLM with the prompt
      const result = await window.spark.llm(llmPrompt, "gpt-4o");
      
      setResponse(result);
      setShowResponse(true);
    } catch (error) {
      setResponse(`An error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowResponse(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "absolute top-2 right-2 px-2 h-8 w-8 rounded-full hover:bg-yellow-100 hover:text-yellow-900 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 transition-colors",
          className
        )}
        onClick={handleOpen}
        aria-label={`Learn more about ${title}`}
        title="Enlighten me about this topic"
      >
        <Lightbulb size={18} weight="fill" className="text-yellow-500" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb size={24} weight="fill" className="text-yellow-500" />
              Enlighten Me: {title}
            </DialogTitle>
            <DialogDescription>
              Learn more about this concept with AI assistance. Edit the prompt if you'd like to ask something specific.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-grow">
            <div>
              <label htmlFor="prompt" className="text-sm font-medium mb-1 block">
                Your Learning Prompt:
              </label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="min-h-[120px]"
              />
              <div className="flex justify-end mt-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setPrompt(generateDefaultPrompt())}>
                  Reset to Default
                </Badge>
              </div>
            </div>

            {showResponse && (
              <div className="mt-2">
                <label className="text-sm font-medium mb-1 block">Response:</label>
                <Card className="p-4 overflow-hidden">
                  <ScrollArea className="h-[220px]">
                    <div className="whitespace-pre-wrap">{response}</div>
                  </ScrollArea>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 items-center">
            {isLoading && <SpinnerGap size={20} className="animate-spin mr-2" />}
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || prompt.trim().length === 0}>
              {isLoading ? 'Processing...' : 'Get Insights'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnlightenMeButton;

</invoke>