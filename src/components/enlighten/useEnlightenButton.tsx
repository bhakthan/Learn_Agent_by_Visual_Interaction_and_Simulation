import { useState } from 'react';
import { useEnlightenMe } from './EnlightenMeProvider';

interface UseEnlightenButtonProps {
  conceptId: string;
  defaultPrompt?: string;
}

interface UseEnlightenButtonResult {
  isOpen: boolean;
  isLoading: boolean;
  prompt: string;
  response: string | null;
  showResponse: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  submitPrompt: () => Promise<void>;
  setPrompt: (value: string) => void;
  resetPrompt: () => void;
}

export const useEnlightenButton = ({
  conceptId,
  defaultPrompt,
}: UseEnlightenButtonProps): UseEnlightenButtonResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  
  const { getInsight, saveInsight } = useEnlightenMe();
  
  // Generate a default prompt based on the conceptId
  const generateDefaultPrompt = () => {
    if (defaultPrompt) {
      return defaultPrompt;
    }
    
    return `Explain the concept of ${conceptId} in detail, including:
1. What it is and why it's important
2. How it works and its key components
3. Real-world applications and examples
4. Best practices for implementation
5. How it relates to other AI agent concepts`;
  };
  
  const openDialog = () => {
    // Set the default prompt when opening
    setPrompt(generateDefaultPrompt());
    
    // Check if we have a saved response
    const savedInsight = getInsight(conceptId);
    if (savedInsight) {
      setResponse(savedInsight);
      setShowResponse(true);
    } else {
      setShowResponse(false);
    }
    
    setIsOpen(true);
  };
  
  const closeDialog = () => {
    setIsOpen(false);
  };
  
  const resetPrompt = () => {
    setPrompt(generateDefaultPrompt());
  };
  
  const submitPrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      // Ensure window.spark is defined
      if (!window.spark || typeof window.spark.llmPrompt !== 'function') {
        throw new Error('Spark API is not available');
      }
      
      // Create a prompt using the spark.llmPrompt template format
      const llmPrompt = window.spark.llmPrompt`${prompt}`;
      
      // Call the LLM with the prompt
      const result = await window.spark.llm(llmPrompt, "gpt-4o");
      
      setResponse(result);
      setShowResponse(true);
      
      // Save this response for future reference
      saveInsight(conceptId, result);
    } catch (error) {
      setResponse(`An error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowResponse(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isOpen,
    isLoading,
    prompt,
    response,
    showResponse,
    openDialog,
    closeDialog,
    submitPrompt,
    setPrompt,
    resetPrompt,
  };
};