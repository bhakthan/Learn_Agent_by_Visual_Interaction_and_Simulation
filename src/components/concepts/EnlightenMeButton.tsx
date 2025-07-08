import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, SpinnerGap, Copy, Check } from '@phosphor-icons/react';
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
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

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

  // State for tracking copied code blocks
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Custom code block component with copy functionality
  const CodeBlock = ({ children, className, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const codeString = String(children).replace(/\n$/, '');
    const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(codeString);
        setCopiedStates(prev => ({ ...prev, [codeId]: true }));
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [codeId]: false }));
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    };

    return (
      <div className="relative group">
        <div className="absolute right-2 top-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={copyToClipboard}
          >
            {copiedStates[codeId] ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}
          </Button>
        </div>
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          className="rounded-md text-sm"
          showLineNumbers={language && codeString.split('\n').length > 3}
          wrapLines={true}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  };

  // Custom components for markdown rendering
  const markdownComponents = {
    code: CodeBlock,
    pre: ({ children }: any) => <div className="my-4">{children}</div>,
    h1: ({ children }: any) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-semibold mt-5 mb-3 text-foreground">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-base font-medium mt-3 mb-2 text-foreground">{children}</h4>,
    p: ({ children }: any) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc list-inside mb-3 space-y-1 text-foreground">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground">{children}</ol>,
    li: ({ children }: any) => <li className="text-foreground">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r">
        {children}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="my-4 overflow-x-auto">
        <table className="min-w-full border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-muted">{children}</thead>,
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => <tr className="border-b border-border">{children}</tr>,
    th: ({ children }: any) => <th className="px-4 py-2 text-left font-semibold text-foreground">{children}</th>,
    td: ({ children }: any) => <td className="px-4 py-2 text-foreground">{children}</td>,
    a: ({ children, href }: any) => (
      <a href={href} className="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-foreground">{children}</em>,
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
        <DialogContent className="sm:max-w-6xl max-w-[95vw] h-[90vh] max-h-[95vh] min-h-[80vh] flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <Lightbulb className="text-yellow-600 dark:text-yellow-400" size={24} weight="fill" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Enlighten Me:
                </span>{" "}
                <span className="text-foreground">{title}</span>
              </div>
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {showResponse 
                ? "🎯 Here's your personalized AI insight about this topic" 
                : "💡 Customize your query or use our intelligent default prompt to learn about this topic"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col min-h-0">
            {!showResponse ? (
              <div className="flex flex-col gap-4 flex-1">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    ✨ Smart Prompt Builder
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Our AI has crafted a comprehensive prompt based on "{title}". Feel free to customize it or use it as-is for the best insights.
                  </p>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium mb-2 text-muted-foreground">Your Custom Query:</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1 min-h-[200px] text-sm leading-relaxed resize-none"
                    placeholder="Enter your question about this topic..."
                  />
                </div>
                
                <DialogFooter className="flex justify-between gap-3">
                  <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                    🚀 Generate Insights
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="flex flex-col gap-4 flex-1 min-h-0">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-4">
                    <div className="relative">
                      <SpinnerGap size={48} className="animate-spin text-yellow-500" />
                      <div className="absolute inset-0 animate-pulse">
                        <Lightbulb size={24} className="text-yellow-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" weight="fill" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-foreground">Generating your personalized insights...</p>
                      <p className="text-sm text-muted-foreground mt-1">Our AI is analyzing and crafting a comprehensive response</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1 flex items-center gap-2">
                        🎯 Your Personalized AI Insight
                      </h4>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Generated based on your query about "{title}"
                      </p>
                    </div>
                    
                    <div className="flex-1 min-h-0">
                      <ScrollArea className="h-[calc(90vh-300px)]">
                        <div className="prose prose-base dark:prose-invert max-w-none pr-4">
                          <ReactMarkdown
                            components={markdownComponents}
                            remarkPlugins={[remarkGfm]}
                          >
                            {response || ''}
                          </ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <DialogFooter className="flex justify-between gap-3 border-t pt-4">
                      <Button variant="outline" onClick={handleReset} className="flex-1">
                        ✨ Ask Something Else
                      </Button>
                      <Button onClick={() => setIsOpen(false)} className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white">
                        👍 Close
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnlightenMeButton;