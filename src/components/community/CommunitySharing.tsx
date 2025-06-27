import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "@phosphor-icons/react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CommunitySharing = () => {
  const [patternName, setPatternName] = useState("");
  const [description, setDescription] = useState("");
  const [implementation, setImplementation] = useState("");

  const handleShare = () => {
    // In a real implementation, this would save to a database
    toast.success("Pattern shared successfully! Thank you for your contribution.", {
      description: "The community will benefit from your knowledge."
    });
    
    // Reset form
    setPatternName("");
    setDescription("");
    setImplementation("");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Community Sharing</h1>
      <p className="text-muted-foreground mb-8">
        Learn from and contribute to the Azure AI agent community. Share your implementations, 
        best practices, and unique agent patterns.
      </p>
      
      <Tabs defaultValue="contribute" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="contribute">Contribute</TabsTrigger>
          <TabsTrigger value="browse">Browse Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contribute">
          <div className="grid gap-6">
            <Alert className="bg-muted">
              <Info size={20} className="h-5 w-5" />
              <AlertTitle>Sharing Guidelines</AlertTitle>
              <AlertDescription>
                Share your agent pattern implementations, experiences, and best practices to help others.
                Please provide clear descriptions and implementation details.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Share Your Agent Pattern</CardTitle>
                <CardDescription>
                  Contribute your implementation of an agent pattern to help others learn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pattern-name">Pattern Name</Label>
                    <Input 
                      id="pattern-name"
                      placeholder="E.g., Improved ReAct with Memory" 
                      value={patternName}
                      onChange={(e) => setPatternName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Describe your agent pattern, its purpose, and when to use it..."
                      className="min-h-32"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="implementation">Implementation Details</Label>
                    <Textarea 
                      id="implementation"
                      placeholder="Share code snippets, implementation steps, or technical details..."
                      className="min-h-64 font-mono"
                      value={implementation}
                      onChange={(e) => setImplementation(e.target.value)}
                    />
                  </div>
                  
                  <Button type="button" onClick={handleShare}>Share with Community</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="browse">
          <div className="grid gap-6">
            <Alert className="bg-muted">
              <Info size={20} className="h-5 w-5" />
              <AlertTitle>Community Contributions</AlertTitle>
              <AlertDescription>
                Browse agent pattern implementations shared by the community. 
                These are user-contributed and not officially verified.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Memory-Enhanced ReAct Pattern</CardTitle>
                  <CardDescription>Shared by user123 on June 15, 2023</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    An implementation of the ReAct pattern with added memory capabilities to maintain
                    context across multiple agent interactions.
                  </p>
                  <Button variant="outline">View Details</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Hybrid Plan-and-Execute with Azure Services</CardTitle>
                  <CardDescription>Shared by azure_expert on June 10, 2023</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    A pattern that combines planning and execution phases, integrated with 
                    Azure AI Services for enhanced performance.
                  </p>
                  <Button variant="outline">View Details</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunitySharing;