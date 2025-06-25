import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { conceptContents } from '@/lib/data/conceptContent';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListBullets, Code, Cpu, Toolbox, Globe, LightbulbFilament } from "@phosphor-icons/react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ConceptDetailsProps {
  conceptId: string;
}

const ConceptDetails: React.FC<ConceptDetailsProps> = ({ conceptId }) => {
  const content = conceptContents.find(c => c.id === conceptId);
  
  if (!content) return null;
  
  return (
    <Card className="mb-6 mt-6 border-primary/20">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2">
          <LightbulbFilament size={24} className="text-primary" />
          {content.name} - In-Depth Understanding
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="prose max-w-none mb-6">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{content.description}</p>
        </div>
        
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="features" className="flex items-center gap-2">
              <ListBullets size={16} /> Key Features
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Globe size={16} /> Applications
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Cpu size={16} /> Technical Details
            </TabsTrigger>
            <TabsTrigger value="implementation" className="flex items-center gap-2">
              <Toolbox size={16} /> Implementation
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <TabsContent value="features">
              <h3 className="font-medium mb-4 text-primary">Key Features</h3>
              <ul className="space-y-3">
                {content.keyFeatures.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="applications">
              <h3 className="font-medium mb-4 text-primary">Application Areas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {content.applicationAreas.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="technical">
              <h3 className="font-medium mb-4 text-primary">Technical Details</h3>
              <div className="whitespace-pre-line">{content.technicalDetails}</div>
            </TabsContent>
            
            <TabsContent value="implementation">
              <h3 className="font-medium mb-4 text-primary">Implementation Considerations</h3>
              <ul className="space-y-3">
                {content.implementationConsiderations.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Code size={20} className="text-primary" />
            <span>Code Examples</span>
          </h3>
          
          <Accordion type="single" collapsible className="w-full">
            {content.examples.map((example, index) => (
              <AccordionItem key={index} value={`example-${index}`}>
                <AccordionTrigger className="text-primary">
                  {example.title}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-3 text-sm text-muted-foreground">{example.description}</p>
                  {example.codeSnippet && (
                    <SyntaxHighlighter 
                      language="typescript" 
                      style={nightOwl}
                      customStyle={{
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        padding: '1rem',
                        marginBottom: '1rem'
                      }}
                    >
                      {example.codeSnippet.trim()}
                    </SyntaxHighlighter>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConceptDetails;