import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check } from "@phosphor-icons/react"
import { Steps } from './Steps'
import { PatternData } from '@/lib/data/patterns'
import PatternDemo from '../interactive-demos/PatternDemo'

interface CodePlaybookProps {
  patternData: PatternData
}

const CodePlaybook = ({ patternData }: CodePlaybookProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{patternData.name} Implementation</CardTitle>
          <CardDescription>
            Step-by-step guide to implementing the {patternData.name} pattern
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="steps" className="w-full">
            <TabsList>
              <TabsTrigger value="steps">Implementation Steps</TabsTrigger>
              <TabsTrigger value="code">Complete Code</TabsTrigger>
              <TabsTrigger value="interactive">Interactive Example</TabsTrigger>
            </TabsList>
            
            <TabsContent value="steps" className="py-4">
              <Steps 
                steps={patternData.implementation} 
                currentStep={currentStep} 
                setCurrentStep={setCurrentStep} 
              />
            </TabsContent>
            
            <TabsContent value="code" className="py-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] text-sm font-mono whitespace-pre-wrap">
                  {patternData.codeExample}
                </pre>
                <div className="absolute top-4 right-4">
                  <button 
                    className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(patternData.codeExample)
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <Alert className="mt-6">
                <AlertDescription>
                  This code demonstrates a basic implementation of the pattern. You may need to adapt it to your specific use case.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="interactive" className="py-4">
              <PatternDemo patternData={patternData} />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Use the Azure AI SDK for JavaScript for implementation
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Check className="mr-1" size={16} /> Pattern validated with Azure OpenAI
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default CodePlaybook