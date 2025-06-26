import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import ConceptsExplorer from './components/concepts/ConceptsExplorer'
import PatternExplorer from './components/patterns/PatternExplorer'
import { Separator } from "@/components/ui/separator"
import { agentPatterns } from './lib/data/patterns'
import CodePlaybook from './components/code-playbook/CodePlaybook'
import { ReactFlowProvider } from 'reactflow'
import AzureServicesOverview from './components/azure-services/AzureServicesOverview'
import CommunityHub from './components/community/CommunityHub'
import { Cloud, Users } from '@phosphor-icons/react'
import { ThemeProvider } from './components/theme/ThemeProvider'
import { ThemeToggle } from './components/theme/ThemeToggle'

function App() {
  const [activeView, setActiveView] = useState<'concepts' | 'patterns' | 'playbook' | 'services' | 'community'>('concepts')
  const [selectedPatternId, setSelectedPatternId] = useState(agentPatterns[0].id)
  
  const selectedPattern = agentPatterns.find(p => p.id === selectedPatternId) || agentPatterns[0]
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Azure AI Agents Visualization</h1>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Explore</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a className="flex flex-col h-full w-full select-none space-y-2 rounded-md bg-accent/20 p-6 no-underline outline-none focus:shadow-md">
                          <div className="text-lg font-medium text-accent-foreground">
                            Azure AI Agents
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Explore agent concepts, patterns, and implementation playbooks with interactive visualizations.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="#concepts" title="Core Concepts">
                      Foundational Azure AI agent concepts and technologies
                    </ListItem>
                    <ListItem href="#patterns" title="Agent Patterns">
                      Common architectural patterns for agent implementation
                    </ListItem>
                    <ListItem href="#playbooks" title="Code Playbooks">
                      Step-by-step implementation guides with code examples
                    </ListItem>
                    <ListItem href="#services" title="Azure AI Services">
                      Core Azure AI services for agent development
                    </ListItem>
                    <ListItem href="#community" title="Community Hub">
                      Share and discover community agent implementations
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem href="https://learn.microsoft.com/azure/ai-services/" title="Azure AI Documentation">
                      Official Microsoft Azure AI Services documentation
                    </ListItem>
                    <ListItem href="https://github.com/Azure/azure-sdk-for-js" title="Azure SDK for JavaScript">
                      GitHub repository for the Azure SDK
                    </ListItem>
                    <ListItem href="https://learn.microsoft.com/azure/ai-services/openai/" title="Azure OpenAI Service">
                      Documentation for Azure OpenAI Service
                    </ListItem>
                    <ListItem href="https://learn.microsoft.com/azure/ai-studio/" title="Azure AI Studio">
                      Create, evaluate and deploy AI solutions
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <ReactFlowProvider>
          <Tabs defaultValue="concepts" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="concepts" onClick={() => setActiveView('concepts')}>Core Concepts</TabsTrigger>
              <TabsTrigger value="patterns" onClick={() => setActiveView('patterns')}>Agent Patterns</TabsTrigger>
              <TabsTrigger value="playbook" onClick={() => setActiveView('playbook')}>Code Playbooks</TabsTrigger>
              <TabsTrigger value="services" onClick={() => setActiveView('services')}>Azure AI Services</TabsTrigger>
              <TabsTrigger value="community" onClick={() => setActiveView('community')}>Community Hub</TabsTrigger>
            </TabsList>
            
            <TabsContent value="concepts" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Core Concepts</h2>
                <p className="text-muted-foreground">Explore the fundamental concepts of Azure AI agents and how they work.</p>
              </div>
              <Separator />
              <ConceptsExplorer />
            </TabsContent>
            
            <TabsContent value="patterns" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Agent Patterns</h2>
                <p className="text-muted-foreground">Interactive visualizations of common agent patterns and their use cases.</p>
              </div>
              <Separator />
              <PatternExplorer />
            </TabsContent>
            
            <TabsContent value="playbook" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Code Playbooks</h2>
                <p className="text-muted-foreground">Step-by-step implementation guides with code examples for each pattern.</p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {agentPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPatternId === pattern.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPatternId(pattern.id)}
                  >
                    <h3 className="font-medium">{pattern.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {pattern.description}
                    </p>
                  </div>
                ))}
              </div>
              <CodePlaybook patternData={selectedPattern} />
            </TabsContent>
            
            <TabsContent value="services" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Azure AI Services</h2>
                <p className="text-muted-foreground">
                  Core Azure services for building intelligent agents with integration best practices.
                </p>
              </div>
              <Separator />
              <div className="flex items-center p-4 mb-6 rounded-lg bg-primary/5 border border-primary/30">
                <Cloud size={24} className="text-primary mr-3" />
                <div>
                  <h3 className="font-medium">Azure AI Services for Agent Patterns</h3>
                  <p className="text-sm text-muted-foreground">
                    The following Azure services provide essential capabilities for implementing agent patterns.
                    For pattern-specific integrations, check the Best Practices tab in Code Playbooks.
                  </p>
                </div>
              </div>
              <AzureServicesOverview />
            </TabsContent>
            
            <TabsContent value="community" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Community Hub</h2>
                <p className="text-muted-foreground">
                  Share and discover custom Azure AI agent patterns contributed by the community.
                </p>
              </div>
              <Separator />
              <div className="flex items-center p-4 mb-6 rounded-lg bg-accent/10 border border-accent/20">
                <Users size={24} className="text-accent mr-3" />
                <div>
                  <h3 className="font-medium">Collaborative Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn from others' implementations, share your own innovative agent patterns, and collaborate 
                    to build a stronger Azure AI agent community.
                  </p>
                </div>
              </div>
              <CommunityHub />
            </TabsContent>
          </Tabs>
        </ReactFlowProvider>
      </main>
      
      <footer className="border-t border-border py-6 bg-muted">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Azure AI Agents Visualization Platform</p>
        </div>
      </footer>
    </div>
    </ThemeProvider>
  )
}

function ListItem({ className, title, children, ...props }: React.ComponentPropsWithoutRef<"a"> & { title: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}

export default App