import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, SpinnerGap } from '@phosphor-icons/react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnlightenMe } from '../enlighten/EnlightenMeProvider';
import { useKV } from '@github/spark/hooks';

interface EnlightenMeButtonProps {
  title: string;
  conceptId: string;
  description?: string;
  customPrompt?: string;
}

const EnlightenMeButton: React.FC<EnlightenMeButtonProps> = ({ 
  title, 
  conceptId, 
  description,
  customPrompt 
}) => {
  // Get previously saved insights from KV store if available
  const [savedInsights, setSavedInsights] = useKV<Record<string, string>>('enlighten-insights', {});
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  
  // Check if we have a previously saved response for this concept
  const hasSavedResponse = savedInsights && savedInsights[conceptId];
  
  // Generate a default prompt based on the concept details
  const generateDefaultPrompt = () => {
    if (customPrompt) return customPrompt;
    
    return `Explain the concept of "${title}" in detail in the context of Azure AI Agents.
    
${description ? `Context: ${description}` : ''}

Please provide:
1. What it is and why it's important
2. How it works and its key components
3. Real-world applications and examples
4. Best practices for implementation
5. How it relates to other AI agent concepts`;
  };
  
  const [prompt, setPrompt] = useState<string>(generateDefaultPrompt());
  const [response, setResponse] = useState<string | null>(hasSavedResponse ? savedInsights[conceptId] : null);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // When opening, check if we have a saved response
      if (hasSavedResponse) {
        setResponse(savedInsights[conceptId]);
        setShowResponse(true);
      } else {
        setPrompt(generateDefaultPrompt());
        setShowResponse(false);
      }
    }
  };
  
  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setShowResponse(true);
    
    try {
      // Create the LLM prompt using the spark API
      const generatedPrompt = window.spark.llmPrompt`${prompt}`;
      
      // Call the LLM
      const result = await window.spark.llm(generatedPrompt);
      
      // Update the response and save it to KV store
      setResponse(result);
      setSavedInsights(current => ({
        ...current,
        [conceptId]: result
      }));
    } catch (error) {
      console.error('Error in EnlightenMeButton:', error);
      setResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setShowResponse(false);
    setPrompt(generateDefaultPrompt());
    setResponse(null);
  };

  return (
    <div className="absolute top-3 right-3 z-10">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-yellow-100 hover:text-yellow-900 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400"
        onClick={() => setIsOpen(true)}
        title="Learn more about this topic"
      >
        <Lightbulb size={16} weight="fill" className="text-yellow-500" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="text-yellow-500" size={20} weight="fill" />
              Learn about: {title}
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
                    <Button variant="outline" onClick={handleReset}>Ask Something Else</Button>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnlightenMeButton;