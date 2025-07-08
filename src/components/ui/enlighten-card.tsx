import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { EnlightenMeButton } from '@/components/ui/enlighten-me-button';

interface EnlightenCardProps {
  title: string;
  description?: string;
  enlightenPrompt?: string;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  renderFooter?: () => React.ReactNode;
  children: React.ReactNode;
}

export function EnlightenCard({
  title,
  description,
  enlightenPrompt,
  className,
  headerClassName,
  titleClassName,
  contentClassName,
  footerClassName,
  renderFooter,
  children
}: EnlightenCardProps) {
  return (
    <Card className={className}>
      <CardHeader className={`flex flex-row items-center justify-between ${headerClassName || ''}`}>
        <div className="flex-1 mr-2">
          <CardTitle className={titleClassName}>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <EnlightenMeButton 
          topic={title} 
          defaultPrompt={enlightenPrompt || `Explain "${title}" in detail, including key concepts, implementation approaches, and best practices for Azure AI and agent development.`}
        />
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
      {renderFooter && <CardFooter className={footerClassName}>{renderFooter()}</CardFooter>}
    </Card>
  );
}