import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, BookOpen, Code, Users, Sparkle, ChevronRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { PageSynopsis } from './EnhancedTutorialButton';

interface FloatingContextualHelpProps {
  pageSynopsis: PageSynopsis;
  pageKey: string;
  isVisible: boolean;
  onClose: () => void;
  onToggle?: () => void;
  onStartTutorial?: () => void;
  className?: string;
}

export const FloatingContextualHelp: React.FC<FloatingContextualHelpProps> = ({
  pageSynopsis,
  pageKey,
  isVisible,
  onClose,
  onToggle,
  onStartTutorial,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setIsExpanded(false);
    }
  }, [isVisible]);

  const nextStep = () => {
    if (currentStep < pageSynopsis.learningCategories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsExpanded(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepIcon = (index: number) => {
    const icons = [<BookOpen size={16} />, <Code size={16} />, <Users size={16} />, <Sparkle size={16} />];
    return icons[index % icons.length];
  };

  return (
    <>
      {/* Trigger Button - Always visible in bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggle}
          variant="default"
          size="sm"
          className={cn(
            "h-10 w-10 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            isVisible ? "bg-primary/80" : "bg-primary"
          )}
          aria-label="Toggle Learning Guide"
        >
          <Lightbulb size={18} />
        </Button>
      </div>

      {/* Learning Guide Sidebar */}
      {isVisible && (
        <div className={cn(
          "fixed bottom-20 right-6 z-50 transition-all duration-300 ease-in-out",
          isVisible ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95",
          className
        )}>
          <Card className="w-80 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <Lightbulb size={16} className="text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold">
                    {isExpanded ? 'Quick Start Guide' : 'Learning Path'}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0 hover:bg-destructive/10 rounded-full transition-all duration-200 hover:rotate-90"
                  aria-label="Close Learning Guide"
                >
                  <X size={14} />
                </Button>
              </div>
              <CardDescription className="text-xs">
                {isExpanded 
                  ? `Complete overview of ${pageSynopsis.title}`
                  : `Step ${currentStep + 1} of ${pageSynopsis.learningCategories.length}`
                }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isExpanded ? (
            // Step-by-step introduction
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 p-1.5 bg-muted rounded-md">
                  {getStepIcon(currentStep)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">
                      {pageSynopsis.learningCategories[currentStep]?.name}
                    </h4>
                    <Badge 
                      className={cn(
                        "text-xs px-2 py-0.5 border",
                        getDifficultyColor(pageSynopsis.learningCategories[currentStep]?.difficulty)
                      )}
                    >
                      {pageSynopsis.learningCategories[currentStep]?.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pageSynopsis.learningCategories[currentStep]?.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1">
                  {pageSynopsis.learningCategories.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentStep ? "bg-primary w-4" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                <Button 
                  size="sm" 
                  onClick={nextStep}
                  className="h-7 px-3 text-xs"
                >
                  {currentStep < pageSynopsis.learningCategories.length - 1 ? 'Next' : 'Complete'}
                  <ChevronRight size={12} className="ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            // Full overview
            <div className="space-y-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">{pageSynopsis.title}</h4>
                <p className="text-xs text-muted-foreground">{pageSynopsis.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {pageSynopsis.learningCategories.map((category, index) => (
                  <div key={index} className="p-2 bg-muted/30 rounded-md">
                    <div className="flex items-center gap-1 mb-1">
                      {getStepIcon(index)}
                      <span className="text-xs font-medium">{category.name}</span>
                    </div>
                    <Badge 
                      className={cn(
                        "text-xs px-1.5 py-0 border",
                        getDifficultyColor(category.difficulty)
                      )}
                    >
                      {category.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-2 pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Estimated time:</span>
                  <span className="font-medium">{pageSynopsis.estimatedTime}</span>
                </div>
                
                {onStartTutorial && (
                  <Button 
                    onClick={onStartTutorial}
                    className="w-full h-8 text-xs"
                    size="sm"
                  >
                    <Lightbulb size={14} className="mr-1" />
                    Start Interactive Tutorial
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      )}
    </>
  );
};

// Hook for managing floating contextual help
export const useFloatingContextualHelp = (pageKey: string, delayMs: number = 10000) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has already seen the help for this page
    const hasSeenHelp = localStorage.getItem(`contextual-help-${pageKey}`);
    if (hasSeenHelp) {
      setHasShown(true);
    }

    // Don't auto-show - let user control visibility
    // Removed auto-show timer to keep help hidden until user clicks trigger
  }, [pageKey, hasShown]);

  const hideHelp = () => {
    setIsVisible(false);
    // Mark as seen so it doesn't show again automatically
    localStorage.setItem(`contextual-help-${pageKey}`, 'true');
  };

  const showHelp = () => {
    setIsVisible(true);
    setHasShown(true);
  };

  const toggleHelp = () => {
    if (isVisible) {
      hideHelp();
    } else {
      showHelp();
    }
  };

  return { isVisible, hideHelp, showHelp, toggleHelp, hasShown };
};
