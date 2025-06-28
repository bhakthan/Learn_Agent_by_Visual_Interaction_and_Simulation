import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, Stack, Lightning, Database, LineSegments, ShieldCheck, Article } from '@phosphor-icons/react';
import { AzureAIService, azureAIServices, AzureServicePatternMapping, azureServicePatternMappings } from '@/lib/data/azureAiServices';

interface AzureIntegrationGuideProps {
  patternId: string;
  patternName: string;
}

const AzureIntegrationGuide: React.FC<AzureIntegrationGuideProps> = ({ patternId, patternName }) => {
  const [currentCategory, setCurrentCategory] = useState<string>('all');

  // Get relevant Azure services for this pattern
  const patternServices = azureServicePatternMappings
    .filter(mapping => mapping.patternId === patternId)
    .map(mapping => {
      const service = azureAIServices.find(s => s.id === mapping.serviceId);
      return {
        ...mapping,
        service
      };
    })
    .filter(item => item.service !== undefined);

  // Extract service categories for filtering
  const serviceCategories = Array.from(new Set(patternServices.map(item => getServiceCategory(item.service?.id || ''))));

  // Filter services by selected category
  const filteredServices = currentCategory === 'all' 
    ? patternServices 
    : patternServices.filter(item => getServiceCategory(item.service?.id || '') === currentCategory);

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Cloud size={20} className="text-primary" />
            <span>Azure AI Integration for {patternName}</span>
          </div>
          <Badge variant="outline" className="bg-primary/5 border-primary/20">
            {patternServices.length} Services
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {patternServices.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-muted-foreground text-sm mb-3">
                The following Azure AI services work well with the {patternName} pattern.
                Each service provides specific capabilities that enhance different aspects of this agent pattern.
              </p>
              
              {serviceCategories.length > 1 && (
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant={currentCategory === 'all' ? "default" : "outline"} 
                      size="sm" 
                      className="text-xs" 
                      onClick={() => setCurrentCategory('all')}
                    >
                      All Services
                    </Button>
                    {serviceCategories.map(category => (
                      <Button 
                        key={category} 
                        variant={currentCategory === category ? "default" : "outline"} 
                        size="sm" 
                        className="text-xs" 
                        onClick={() => setCurrentCategory(category)}
                      >
                        {getCategoryDisplay(category)}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredServices.map((item, idx) => (
                <ServiceCard 
                  key={`${item.service?.id}-${idx}`}
                  service={item.service!}
                  integration={item.integration}
                  bestPractices={item.bestPractices}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center p-6 border border-dashed rounded-lg">
            <Cloud size={32} className="mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No Azure Service Integrations</h3>
            <p className="text-muted-foreground mt-2">
              No specific Azure AI service integrations are defined for this pattern yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ServiceCardProps {
  service: AzureAIService;
  integration: string;
  bestPractices: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, integration, bestPractices }) => {
  const [activeTab, setActiveTab] = useState<'integration' | 'practices'>('integration');

  return (
    <Card className="border shadow-sm h-full overflow-hidden flex flex-col">
      <CardHeader className="bg-muted/30 py-3 px-4">
        <CardTitle className="text-base flex items-center gap-2">
          {getServiceIcon(service.id)}
          <span>{service.name}</span>
        </CardTitle>
      </CardHeader>
      <div className="bg-card border-t border-b px-4 py-1">
        <Tabs defaultValue="integration" value={activeTab} onValueChange={(v) => setActiveTab(v as 'integration' | 'practices')} className="w-full">
          <TabsList className="grid grid-cols-2 h-8">
            <TabsTrigger value="integration" className="text-xs">Integration</TabsTrigger>
            <TabsTrigger value="practices" className="text-xs">Best Practices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integration" className="p-0 border-none m-0">
            <div className="space-y-3">
              <p className="text-sm">{integration}</p>
              <div className="flex flex-wrap gap-2">
                {service.capabilities.slice(0, 3).map((capability, i) => (
                  <Badge key={i} variant="outline" className="bg-background text-xs">
                    {capability}
                  </Badge>
                ))}
                {service.capabilities.length > 3 && (
                  <Badge variant="outline" className="bg-muted/20 text-xs">
                    +{service.capabilities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="practices" className="p-0 border-none m-0">
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {bestPractices.map((practice, i) => (
                <li key={i} className="text-foreground/90">{practice}</li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-4 flex-1">
        </div>
        <div className="p-3 border-t mt-auto bg-card flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            onClick={() => window.open(service.documentation, '_blank')}
          >
            Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get service icon based on service ID
function getServiceIcon(serviceId: string) {
  switch (serviceId) {
    case 'azure-openai':
      return <Cloud size={18} className="text-primary" />;
    case 'azure-cognitive-search':
      return <Database size={18} className="text-secondary" />;
    case 'azure-content-safety':
      return <ShieldCheck size={18} className="text-destructive" />;
    case 'azure-ai-inference':
      return <Lightning size={18} className="text-accent" />;
    case 'azure-ai-foundry':
      return <Stack size={18} className="text-primary" />;
    case 'azure-ai-evaluation':
      return <LineSegments size={18} className="text-secondary" />;
    case 'azure-language-service':
      return <Article size={18} className="text-accent" />;
    default:
      return <Cloud size={18} className="text-primary" />;
  }
}

// Helper function to categorize services
function getServiceCategory(serviceId: string): string {
  if (serviceId === 'azure-openai') return 'foundation';
  if (serviceId === 'azure-cognitive-search' || serviceId === 'azure-language-service' || serviceId === 'azure-document-intelligence') return 'knowledge';
  if (serviceId === 'azure-content-safety') return 'safety';
  if (serviceId === 'azure-ai-evaluation') return 'evaluation';
  if (serviceId === 'azure-ai-inference') return 'inference';
  if (serviceId === 'azure-ai-foundry' || serviceId === 'azure-ai-agent-service') return 'platform';
  return 'other';
}

// Helper function to get display names for categories
function getCategoryDisplay(category: string): string {
  switch (category) {
    case 'foundation': return 'Foundation Models';
    case 'knowledge': return 'Knowledge Services';
    case 'safety': return 'Safety & Security';
    case 'evaluation': return 'Evaluation Tools';
    case 'inference': return 'Inference Services';
    case 'platform': return 'AI Platforms';
    default: return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

export default AzureIntegrationGuide;