import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ArrowRight, ArrowLeft, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { TutorialStep } from "@/lib/hooks/useTutorial";

interface TutorialOverlayProps {
  isActive: boolean;
  currentStep: TutorialStep;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onComplete: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isActive,
  currentStep,
  currentStepIndex,
  totalSteps,
  progress,
  onNext,
  onPrev,
  onClose,
  onComplete,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Find target element and calculate position for tooltip
  useEffect(() => {
    if (!isActive || !currentStep) return;
    
    // Find the target element
    const element = document.querySelector(currentStep.target);
    setTargetElement(element);
    
    if (!element) return;
    
    // Calculate position
    updatePosition(element, currentStep.placement || 'bottom');
    
    // Setup mutation observer to recalculate position if DOM changes
    const observer = new MutationObserver(() => {
      updatePosition(element, currentStep.placement || 'bottom');
    });
    
    observer.observe(document.body, { 
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
    
    // Add window resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, currentStep]);
  
  // Update position on resize
  const handleResize = () => {
    if (targetElement) {
      updatePosition(targetElement, currentStep.placement || 'bottom');
    }
  };
  
  // Calculate position for tooltip
  const updatePosition = (element: Element, placement: string) => {
    const rect = element.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current?.offsetHeight || 200;
    const tooltipWidth = tooltipRef.current?.offsetWidth || 300;
    
    let top = 0;
    let left = 0;
    
    // Add some padding around the target
    const PADDING = 10;
    
    switch (placement) {
      case 'top':
        top = rect.top - tooltipHeight - PADDING;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + PADDING;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - PADDING;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + PADDING;
        break;
      case 'center':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      default:
        top = rect.bottom + PADDING;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    }
    
    // Ensure tooltip stays within viewport
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    if (top < 0) top = PADDING;
    if (left < 0) left = PADDING;
    if (top + tooltipHeight > viewportHeight) top = viewportHeight - tooltipHeight - PADDING;
    if (left + tooltipWidth > viewportWidth) left = viewportWidth - tooltipWidth - PADDING;
    
    setPosition({ 
      top: top + window.scrollY, 
      left, 
      width: rect.width + PADDING * 2, 
      height: rect.height + PADDING * 2 
    });
  };
  
  if (!isActive || !currentStep) {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 transition-opacity"
      ref={overlayRef}
    >
      {/* Target highlight */}
      {targetElement && (
        <div 
          className="absolute border-2 border-primary animate-pulse rounded-sm pointer-events-none"
          style={{
            top: position.top - window.scrollY - 10,
            left: position.left - 10,
            width: position.width,
            height: position.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
        />
      )}
      
      {/* Tutorial tooltip */}
      <Card 
        ref={tooltipRef}
        className={cn(
          "absolute shadow-lg w-[320px] sm:w-[380px] z-50 transition-all duration-300 transform",
          targetElement ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ 
          top: position.top, 
          left: position.left 
        }}
      >
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <h3 className="text-lg font-medium">{currentStep.title}</h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-sm text-muted-foreground">
            {currentStep.content}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 p-4 pt-0">
          <Progress value={progress} className="h-1" />
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              Step {currentStepIndex + 1} of {totalSteps}
            </div>
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <Button variant="outline" size="sm" onClick={onPrev}>
                  <ArrowLeft size={14} className="mr-1" />
                  Back
                </Button>
              )}
              {currentStepIndex < totalSteps - 1 ? (
                <Button size="sm" onClick={onNext}>
                  Next
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={onComplete}>
                  <CheckCircle size={14} className="mr-1" />
                  Finish
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};