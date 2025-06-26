import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { references, ReferenceCategory, ReferenceItem } from '@/lib/data/references';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookmarkSimple, Link, Plus, ExternalLink } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useKV } from '@github/spark/hooks';
import { Badge } from '@/components/ui/badge';

interface ReferenceSectionProps {
  type: 'concept' | 'pattern' | 'azureService';
  itemId: string;
}

const ReferenceSection: React.FC<ReferenceSectionProps> = ({ type, itemId }) => {
  // Get references for this type & id
  let referenceData;
  
  if (type === 'concept') {
    referenceData = references.concepts[itemId];
  } else if (type === 'pattern') {
    referenceData = references.patterns[itemId];
  } else if (type === 'azureService') {
    referenceData = references.azureServices[itemId];
  }
  
  // Store custom user references
  const storageKey = `${type}-${itemId}-references`;
  const [customReferences, setCustomReferences, deleteCustomReferences] = useKV<ReferenceItem[]>(storageKey, []);

  // Form state for adding new reference
  const [newReference, setNewReference] = React.useState<{
    title: string;
    url: string;
    description: string;
  }>({
    title: '',
    url: '',
    description: '',
  });
  const [isAddingReference, setIsAddingReference] = React.useState(false);

  // Add a new reference
  const handleAddReference = () => {
    if (!newReference.title || !newReference.url) return;
    
    setCustomReferences((current) => [
      ...current,
      {
        title: newReference.title,
        url: newReference.url,
        description: newReference.description,
      }
    ]);
    
    // Reset form
    setNewReference({
      title: '',
      url: '',
      description: '',
    });
    setIsAddingReference(false);
  };

  // Remove a reference
  const handleRemoveReference = (index: number) => {
    setCustomReferences((current) => current.filter((_, i) => i !== index));
  };

  if (!referenceData && (!customReferences || customReferences.length === 0)) {
    return (
      <Card className="mb-6 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookmarkSimple size={24} className="text-primary" />
            References
          </CardTitle>
          <CardDescription>No references available for this {type}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsAddingReference(true)} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Reference
          </Button>
          
          {isAddingReference && (
            <div className="mt-4 space-y-4 border rounded-md p-4">
              <h4 className="font-medium">Add New Reference</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newReference.title}
                  onChange={(e) => setNewReference({...newReference, title: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder="Documentation Title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  URL <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={newReference.url}
                  onChange={(e) => setNewReference({...newReference, url: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder="https://example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  value={newReference.description}
                  onChange={(e) => setNewReference({...newReference, description: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder="Brief description of the resource"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddingReference(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddReference}>
                  Add Reference
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const userReferencesCategory: ReferenceCategory | null = customReferences && customReferences.length > 0 
    ? {
        id: 'custom',
        name: 'User Added References',
        references: customReferences
      }
    : null;

  const allCategories = [
    ...(referenceData || []),
    ...(userReferencesCategory ? [userReferencesCategory] : [])
  ];

  return (
    <Card className="mb-6 mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookmarkSimple size={24} className="text-primary" />
          References
        </CardTitle>
        <CardDescription>
          Helpful resources related to this {type}
          {allCategories.length > 0 && (
            <Badge variant="outline" className="ml-2 bg-accent/10">
              {allCategories.reduce((acc, category) => acc + category.references.length, 0)} links
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <Accordion type="multiple" className="w-full">
            {allCategories.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="hover:text-primary">
                  <span className="flex items-center gap-2">
                    {category.name} 
                    <Badge variant="outline" className="ml-2">
                      {category.references.length}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {category.references.map((reference, index) => (
                      <div
                        key={`${reference.title}-${index}`}
                        className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-accent/5 transition-colors"
                      >
                        <ExternalLink size={20} className="text-primary mt-1" />
                        <div className="flex-1">
                          <a
                            href={reference.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline text-primary"
                          >
                            {reference.title}
                          </a>
                          {reference.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {reference.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 truncate">{reference.url}</p>
                        </div>
                        {category.id === 'custom' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveReference(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
        
        <Button 
          onClick={() => setIsAddingReference(true)} 
          variant="outline" 
          className="flex items-center gap-2 mt-4"
        >
          <Plus size={16} />
          Add Reference
        </Button>
        
        {isAddingReference && (
          <div className="mt-4 space-y-4 border rounded-md p-4">
            <h4 className="font-medium">Add New Reference</h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={newReference.title}
                onChange={(e) => setNewReference({...newReference, title: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="Documentation Title"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                URL <span className="text-destructive">*</span>
              </label>
              <input
                type="url"
                value={newReference.url}
                onChange={(e) => setNewReference({...newReference, url: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="https://example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <input
                type="text"
                value={newReference.description}
                onChange={(e) => setNewReference({...newReference, description: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="Brief description of the resource"
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddingReference(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReference}>
                Add Reference
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferenceSection;