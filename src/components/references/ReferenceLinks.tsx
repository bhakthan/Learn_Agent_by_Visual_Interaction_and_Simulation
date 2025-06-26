import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { references, ReferenceCategory } from '@/lib/data/references';
import { ExternalLink } from '@phosphor-icons/react';

type ReferenceLinksProps = {
  section: 'concepts' | 'patterns' | 'azureServices';
  itemId: string;
}

export function ReferenceLinks({ section, itemId }: ReferenceLinksProps) {
  const [categories, setCategories] = useState<ReferenceCategory[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (section && itemId && references[section][itemId]) {
      const foundCategories = references[section][itemId];
      setCategories(foundCategories);
      
      if (foundCategories.length > 0) {
        setActiveTab(foundCategories[0].id);
      }
    } else {
      setCategories([]);
      setActiveTab("");
    }
  }, [section, itemId]);

  if (categories.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>References</CardTitle>
          <CardDescription>No references available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>References</CardTitle>
        <CardDescription>
          Useful resources and documentation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="flex flex-col space-y-3">
                {category.references.map((ref, index) => (
                  <a 
                    key={index} 
                    href={ref.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start p-3 rounded-md hover:bg-accent/20 transition-colors group"
                  >
                    <div>
                      <ExternalLink size={20} className="mr-2 mt-1 text-primary group-hover:text-primary/80" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{ref.title}</h3>
                      {ref.description && (
                        <p className="text-sm text-muted-foreground">{ref.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground truncate mt-1">{ref.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}