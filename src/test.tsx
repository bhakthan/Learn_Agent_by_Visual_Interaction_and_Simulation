import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Test() {
  return (
    <div>
      <TabsContent value="test">
        This will cause an error because TabsContent must be used within Tabs
      </TabsContent>
    </div>
  )
}