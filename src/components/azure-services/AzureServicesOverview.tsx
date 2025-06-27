import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { azureAIServices } from '@/lib/data/azureAiServices';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Cloud, Database, ShieldCheck, Lightning, Calculator, 
  Robot, Translate, Search, FileText, MagnifyingGlass,
  BookmarkSimple
} from "@phosphor-icons/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ReferenceLinks } from '../references/ReferenceLinks';
import ReferenceSection from '../references/ReferenceSection';

const AzureServicesOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string | null>(null);
  
  // Filter services based on search term
  const filteredServices = azureAIServices.filter(service => {
    const matchesSearch = searchTerm === '' || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesFilter = !filter || 
      service.capabilities.some(cap => cap.toLowerCase().includes(filter.toLowerCase()));
      
    return matchesSearch && matchesFilter;
  });
  
  // Function to get service icon based on service ID
  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'azure-openai':
        return <Cloud size={24} />;
      case 'azure-ai-search':
        return <Search size={24} />;
      case 'azure-content-safety':
      case 'azure-ai-content-safety':
        return <ShieldCheck size={24} />;
      case 'azure-ai-inference':
        return <Lightning size={24} />;
      case 'azure-ai-evaluation':
        return <Calculator size={24} />;
      case 'azure-ai-agent-service':
        return <Robot size={24} />;
      case 'azure-language-service':
        return <Translate size={24} />;
      case 'azure-document-intelligence':
        return <FileText size={24} />;
      case 'azure-ai-foundry':
      case 'azure-ai-studio':
        return <Cloud size={24} />;
      default:
        return <Cloud size={24} />;
    }
  };
  
  const filterOptions = [
    { label: 'All Services', value: null },
    { label: 'NLP & Text', value: 'text' },
    { label: 'Search & Retrieval', value: 'search' },
    { label: 'Safety & Security', value: 'safety' },
    { label: 'Evaluation', value: 'evaluation' },
    { label: 'Document Processing', value: 'document' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full md:w-auto">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search Azure AI services..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-80"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map(option => (
            <Button
              key={option.value || 'all'}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
              className="text-xs"
            >
              {option.label}
            </Button>
          ))}
          
          <div className="border-l pl-2 ml-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="text-xs mr-1"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="text-xs"
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    {getServiceIcon(service.id)}
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Capabilities:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {service.capabilities.slice(0, 3).map((capability, idx) => (
                        <li key={idx} className="text-foreground/80">{capability}</li>
                      ))}
                      {service.capabilities.length > 3 && (
                        <li className="text-foreground/60">
                          +{service.capabilities.length - 3} more capabilities
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {service.useCases.slice(0, 2).map((useCase, idx) => (
                      <Badge key={idx} variant="outline" className="bg-secondary/10">
                        {useCase}
                      </Badge>
                    ))}
                    {service.useCases.length > 2 && (
                      <Badge variant="outline" className="bg-muted">
                        +{service.useCases.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 text-primary"
                  onClick={() => window.open(service.documentation, '_blank')}
                >
                  <BookmarkSimple size={16} />
                  Resources
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(service.documentation, '_blank')}
                >
                  Documentation
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Accordion type="multiple" className="w-full">
            {filteredServices.map((service) => (
              <AccordionItem key={service.id} value={service.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      {getServiceIcon(service.id)}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.description.substring(0, 100)}...</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12 pr-4 pb-4 space-y-4">
                    <Tabs defaultValue="capabilities">
                      <TabsList className="mb-4">
                        <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
                        <TabsTrigger value="useCases">Use Cases</TabsTrigger>
                        <TabsTrigger value="bestPractices">Best Practices</TabsTrigger>
                        <TabsTrigger value="references">References</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="capabilities" className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Key Capabilities:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {service.capabilities.map((capability, idx) => (
                              <li key={idx} className="text-foreground/80">{capability}</li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="useCases" className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Common Use Cases:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {service.useCases.map((useCase, idx) => (
                              <li key={idx} className="text-foreground/80">{useCase}</li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="bestPractices" className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Best Practices:</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {service.bestPractices.map((practice, idx) => (
                              <li key={idx} className="text-foreground/80">{practice}</li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>

                      <TabsContent value="references" className="space-y-4">
                        <ReferenceLinks section="azureServices" itemId={service.id} />
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(service.documentation, '_blank')}
                      >
                        Documentation
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}
      
      {filteredServices.length === 0 && (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <Cloud size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No services found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filters to find Azure AI services.
          </p>
        </div>
      )}
    </div>
  );
};

export default AzureServicesOverview;