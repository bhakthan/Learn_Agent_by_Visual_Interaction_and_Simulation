import React, { useState } from 'react';
import { LightbulbFilament } from '@phosphor-icons/react';
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
import { Spinner } from '@/components/ui/spinner';
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
  position?: 'top-right' | 'top-left';
  className?: string;
}

const EnlightenMeButton: React.FC<EnlightenMeButtonProps> = ({
  title,
  conceptId,
  description,
  customPrompt,
  position = 'top-right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [showResponse, setShowResponse] = useState(false);

  // Generate default prompt based on the concept when dialog opens
  const generateDefaultPrompt = () => {
    // The default prompt will be based on the concept's title and description
    const basePrompt = `Explain the concept of ${title} in detail, covering key components, benefits, and practical applications. Include specific examples related to Azure AI services where relevant.`;
    
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
        size="icon"
        className={cn(
          'absolute z-10 rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-200',
          position === 'top-right' ? 'right-2 top-2' : 'left-2 top-2',
          className
        )}
        onClick={handleOpen}
        title="Enlighten Me"
      >
        <LightbulbFilament size={18} weight="duotone" className="text-primary" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LightbulbFilament size={24} weight="duotone" className="text-primary" />
              Enlighten Me: {title}
            </DialogTitle>
            <DialogDescription>
              Customize the prompt to learn more about this concept, or use the suggested prompt.
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
            {isLoading && <Spinner className="mr-2" />}
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || prompt.trim().length === 0}>
              {isLoading ? 'Processing...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnlightenMeButton;

</invoke>