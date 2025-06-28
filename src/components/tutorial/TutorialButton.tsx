import React from 'react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Lightbulb } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TutorialButtonProps extends ButtonProps {
  hasCompleted?: boolean; 
  tooltip?: string;
}

export const TutorialButton: React.FC<TutorialButtonProps> = ({
  onClick,
  hasCompleted,
  tooltip = "Start Tutorial",
  className,
  ...props
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 relative",
            hasCompleted ? "border-muted" : "border-primary",
            className
          )}
          onClick={onClick}
          {...props}
        >
          <Lightbulb 
            size={16} 
            weight={hasCompleted ? "regular" : "fill"} 
            className={cn(
              "transition-colors",
              hasCompleted ? "text-muted-foreground" : "text-primary"
            )}
          />
          {!hasCompleted && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{hasCompleted ? "Restart Tutorial" : tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};