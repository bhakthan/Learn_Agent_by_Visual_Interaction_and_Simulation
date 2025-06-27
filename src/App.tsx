import { useState, useEffect } from 'react'
import { Outlet, Route, Routes, Link, useLocation, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/theme/ThemeProvider'
import { ThemeToggle } from './components/theme/ThemeToggle'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { Code, Books, PuzzlePiece, Plugs, StackSimple, Brain, Robot, Article, Users, GithubLogo } from '@phosphor-icons/react'
import PatternExplorer from './components/patterns/PatternExplorer'
import { ScrollArea } from '@/components/ui/scroll-area'
import ConceptsExplorer from './components/concepts/ConceptsExplorer'
import AzureServicesOverview from './components/azure-services/AzureServicesOverview'
import CommunitySharing from './components/community/CommunitySharing'
import ReferencesSection from './components/references/ReferencesSection'

function App() {
  const [mounted, setMounted] = useState(false)
  
  // Fix hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="azure-ai-agent-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border sticky top-0 z-10 bg-background">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={28} weight="duotone" className="text-primary" />
              <h1 className="text-2xl font-bold">Azure AI Agent Visualization</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-xs text-muted-foreground hidden md:inline-block">Theme</span>
              </div>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent">Resources</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                        <ListItem href="https://agentcommunicationprotocol.dev/" title="Agent Communication Protocol">
                          Open protocol for agent interoperability
                        </ListItem>
                        <ListItem href="https://modelcontextprotocol.io/" title="Model Context Protocol">
                          Protocol for efficient AI model interaction
                        </ListItem>
                        <ListItem href="https://cookbook.openai.com/" title="OpenAI Cookbook">
                          Code examples and guides for OpenAI APIs
                        </ListItem>
                        <ListItem href="https://learn.microsoft.com/azure/ai-services/" title="Azure AI Services">
                          Documentation for Azure AI Services
                        </ListItem>
                        <ListItem href="https://learn.microsoft.com/azure/machine-learning/" title="Azure AI Platform">
                          Microsoft's comprehensive AI platform
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <a
                      href="https://github.com/bhakthan/azure-ai-agent-visua"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <GithubLogo className="mr-1" size={16} /> GitHub Repo
                    </a>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="container mx-auto px-4 pb-1">
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex space-x-1">
                <TabLink to="/" icon={<Brain size={16} weight="duotone" />} label="Core Concepts" />
                <TabLink to="/patterns" icon={<PuzzlePiece size={16} weight="duotone" />} label="Agent Patterns" />
                <TabLink to="/azure-services" icon={<StackSimple size={16} weight="duotone" />} label="Azure Services" />
                <TabLink to="/references" icon={<Books size={16} weight="duotone" />} label="References" />
                <TabLink to="/community" icon={<Users size={16} weight="duotone" />} label="Community" />
              </div>
            </ScrollArea>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<ConceptsExplorer />} />
            <Route path="/patterns" element={<PatternExplorer />} />
            <Route path="/azure-services" element={<AzureServicesOverview />} />
            <Route path="/references" element={<ReferencesSection />} />
            <Route path="/community" element={<CommunitySharing />} />
            {/* Fallback route to redirect to home page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Outlet />
        </main>
        
        <footer className="border-t border-border py-6 bg-muted transition-colors duration-300">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>Azure AI Agent Visualization - Interactive learning resource for AI agent patterns and concepts</p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

function TabLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      size="sm"
      className="h-9"
    >
      <Link to={to} className="flex items-center gap-1">
        {icon}
        <span>{label}</span>
      </Link>
    </Button>
  );
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