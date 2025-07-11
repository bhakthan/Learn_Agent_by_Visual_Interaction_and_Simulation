import React, { FC, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Link } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from '@/components/ui/badge'
import { Example } from '@/lib/data/examples'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CodeBlock from '@/components/ui/CodeBlock'

interface CodeExampleProps {
  example: Example
}

const CodeExample: FC<CodeExampleProps> = ({ example }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(example.code)
    
    // Show "Copied!" tooltip for 2 seconds
    setShowTooltip(true)
    setTimeout(() => {
      setShowTooltip(false)
    }, 2000)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{example.title}</span>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showTooltip ? "Copied!" : "Copy code"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => window.open(`https://platform.openai.com/playground?mode=complete&code=${encodeURIComponent(example.code)}`, '_blank')}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open in Playground</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
        <CardDescription>{example.description}</CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={example.difficulty === 'beginner' ? 'outline' : example.difficulty === 'intermediate' ? 'secondary' : 'default'}>
            {example.difficulty}
          </Badge>
          <div className="flex gap-1">
            {example.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="bg-muted">{tag}</Badge>
            ))}
            {example.tags.length > 3 && <Badge variant="outline" className="bg-muted">+{example.tags.length - 3}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="code" className="space-y-4">
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="explanation">Explanation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code">
            <div className="relative">
              <CodeBlock language="typescript">
                {example.code}
              </CodeBlock>
            </div>
          </TabsContent>
          
          <TabsContent value="explanation">
            <div className="rounded-md bg-card p-4 border text-sm">
              <p>{example.explanation}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default React.memo(CodeExample, (prevProps, nextProps) => {
  // Deep compare example object for equality
  return prevProps.example.id === nextProps.example.id && 
         prevProps.example.title === nextProps.example.title &&
         prevProps.example.code === nextProps.example.code;
});