import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from '@phosphor-icons/react';
import EnlightenMe from './EnlightenMe';
import { cn } from '@/lib/utils';

interface EnlightenMeButtonProps {
  title: string;
  contextDescription: string;
  className?: string;
}

export function EnlightenMeButton({ title, contextDescription, className }: EnlightenMeButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Create a detailed prompt based on the context description
  const defaultPrompt = `I want to understand more about "${title}" in the context of Azure AI Agents and Large Language Models.
  
Context: ${contextDescription}

Please explain this concept in detail, covering:
1. What it is and why it's important
2. How it works and its key components
3. Real-world applications and use cases
4. Best practices when implementing it
5. How it relates to other agent patterns or concepts`;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "absolute top-2 right-2 px-2 h-8 w-8 rounded-full hover:bg-yellow-100 hover:text-yellow-900 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400 transition-colors",
          className
        )}
        onClick={() => setIsDialogOpen(true)}
        aria-label={`Learn more about ${title}`}
        title="Enlighten me about this topic"
      >
        <Lightbulb size={18} weight="fill" className="text-yellow-500" />
      </Button>

      <EnlightenMe 
        title={title}
        defaultPrompt={defaultPrompt}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

export default EnlightenMeButton;