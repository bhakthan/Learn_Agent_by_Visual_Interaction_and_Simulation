import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, ArrowLeft, Check } from '@phosphor-icons/react'
import CodeBlock from '@/components/ui/CodeBlock'

interface StepsProps {
  steps: string[]
  currentStep: number
  setCurrentStep: (step: number) => void
}

export const Steps = ({ steps, currentStep, setCurrentStep }: StepsProps) => {
  // Handle empty steps case
  if (!steps || steps.length === 0) {
    return (
      <div className="p-6 border rounded-md text-center">
        <p className="text-muted-foreground">No implementation steps available for this pattern.</p>
      </div>
    );
  }

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-colors ${
              index <= currentStep ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Step {currentStep + 1} of {steps.length}
        </div>
        <div>
          {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Step {currentStep + 1}:</h3>
          <p className="mt-1">{steps[currentStep]}</p>
        </div>

        {currentStep === 0 && (
          <div className="bg-muted p-4 rounded-md text-sm">
            <p><strong>Getting Started:</strong> Ensure you have the Azure AI SDK installed and have access to Azure OpenAI resources.</p>
            <CodeBlock language="bash" showCopyButton={false}>
              npm install @azure/openai
            </CodeBlock>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={goToPrevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          <Button
            onClick={goToNextStep}
            disabled={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 2 ? (
              <>
                Finish <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h4 className="font-medium">Completed Steps:</h4>
        <ul className="space-y-2">
          {steps.slice(0, currentStep).map((step, index) => (
            <li key={index} className="flex items-center text-muted-foreground">
              <Check className="mr-2 text-primary" size={16} />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}