import React from 'react';
import { EnlightenCard } from '@/components/ui/enlighten-card';
import { Button } from '@/components/ui/button';

interface ConceptCardWithEnlightenProps {
  title: string;
  description?: string;
  customPrompt?: string;
  children: React.ReactNode;
  onLearnMore?: () => void;
  buttonText?: string;
  showDetailsButton?: boolean;
  className?: string;
  footerContent?: React.ReactNode;
}

const ConceptCardWithEnlighten: React.FC<ConceptCardWithEnlightenProps> = ({
  title,
  description,
  customPrompt,
  children,
  onLearnMore,
  buttonText = 'Learn More',
  showDetailsButton = true,
  className,
  footerContent,
}) => {
  return (
    <EnlightenCard 
      title={title}
      description={description}
      enlightenPrompt={customPrompt}
      className={className}
      renderFooter={
        showDetailsButton || footerContent
          ? () => (
              <div className="flex justify-between w-full items-center">
                {showDetailsButton && (
                  <Button 
                    variant="outline" 
                    onClick={onLearnMore}
                  >
                    {buttonText}
                  </Button>
                )}
                {footerContent}
              </div>
            )
          : undefined
      }
    >
      {children}
    </EnlightenCard>
  );
};

export default ConceptCardWithEnlighten;