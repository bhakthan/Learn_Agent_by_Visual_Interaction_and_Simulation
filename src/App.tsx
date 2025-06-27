import { useState } from 'react'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeProvider } from './components/theme/ThemeProvider'
import { ThemeToggle } from './components/theme/ThemeToggle'
import { Code, Lightbulb, Function, Database, Robot, Sliders, Graph, Plugs, ShieldCheck } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { categories } from './lib/data/categories'
import { examples, getExamplesByCategory } from './lib/data/examples'
import { Badge } from '@/components/ui/badge'
import CodeExample from './components/CodeExample'
import { ScrollArea } from '@/components/ui/scroll-area'

function App() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [selectedExample, setSelectedExample] = useState(examples[0]);
  
  const categoryExamples = getExamplesByCategory(activeCategory);
  
  function getCategoryIcon(iconName: string) {
    switch (iconName) {
      case 'Lightbulb': return <Lightbulb weight="duotone" />;
      case 'Function': return <Function weight="duotone" />;
      case 'Database': return <Database weight="duotone" />;
      case 'Sliders': return <Sliders weight="duotone" />;
      case 'Robot': return <Robot weight="duotone" />;
      case 'Graph': return <Graph weight="duotone" />;
      case 'Plugs': return <Plugs weight="duotone" />;
      case 'ShieldCheck': return <ShieldCheck weight="duotone" />;
      default: return <Code weight="duotone" />;
    }
  }
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="openai-cookbook-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border sticky top-0 z-10 bg-background">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code size={28} weight="duotone" className="text-primary" />
              <h1 className="text-2xl font-bold">OpenAI Cookbook</h1>
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
                        <ListItem href="https://platform.openai.com/docs/introduction" title="OpenAI Documentation">
                          Official OpenAI API documentation
                        </ListItem>
                        <ListItem href="https://platform.openai.com/playground" title="OpenAI Playground">
                          Test and iterate on API calls interactively
                        </ListItem>
                        <ListItem href="https://github.com/openai/openai-node" title="OpenAI Node SDK">
                          GitHub repository for the Node.js library
                        </ListItem>
                        <ListItem href="https://github.com/openai/openai-cookbook" title="OpenAI Cookbook">
                          Official cookbook with code examples
                        </ListItem>
                        <ListItem href="https://platform.openai.com/tokenizer" title="Tokenizer">
                          Understanding how text is split into tokens
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <a
                      href="https://github.com/openai/openai-cookbook"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      GitHub Repo
                    </a>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">OpenAI API Examples</h2>
            <p className="text-muted-foreground">Practical code examples and patterns for building with OpenAI's APIs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar with categories */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    className={`w-full justify-start gap-2 ${activeCategory === category.id ? "" : "bg-card hover:bg-card/80"}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span className="flex-shrink-0">
                      {getCategoryIcon(category.icon)}
                    </span>
                    <span className="truncate text-left">{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Main content area */}
            <div className="md:col-span-3 space-y-6">
              {/* Category description */}
              <div className="border rounded-lg p-4 bg-card">
                <h3 className="text-xl font-medium flex items-center gap-2">
                  {getCategoryIcon(categories.find(c => c.id === activeCategory)?.icon || 'Code')}
                  {categories.find(c => c.id === activeCategory)?.name}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {categories.find(c => c.id === activeCategory)?.description}
                </p>
              </div>
              
              {/* Examples list */}
              <ScrollArea className="h-60 rounded-md border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {categoryExamples.length > 0 ? (
                    categoryExamples.map((example) => (
                      <Card 
                        key={example.id} 
                        className={`cursor-pointer transition-colors hover:border-primary/50 ${selectedExample.id === example.id ? 'border-primary' : ''}`}
                        onClick={() => setSelectedExample(example)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{example.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{example.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2 flex justify-between">
                          <Badge variant={example.difficulty === 'beginner' ? 'outline' : example.difficulty === 'intermediate' ? 'secondary' : 'default'}>
                            {example.difficulty}
                          </Badge>
                          <div className="flex gap-1">
                            {example.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="bg-muted">{tag}</Badge>
                            ))}
                            {example.tags.length > 2 && <Badge variant="outline" className="bg-muted">+{example.tags.length - 2}</Badge>}
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center p-8 border rounded-lg border-dashed">
                      <p>No examples available for this category yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Selected example details */}
              <CodeExample example={selectedExample} />
            </div>
          </div>
        </main>
        
        <footer className="border-t border-border py-6 bg-muted transition-colors duration-300">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>OpenAI Cookbook - Interactive code examples for the OpenAI API</p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
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