import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  GithubLogo, 
  PlusCircle, 
  ArrowRight
} from '@phosphor-icons/react';
import CommunityPatternCard from './CommunityPatternCard';

const CommunitySharing: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Patterns</h1>
          <p className="text-muted-foreground mt-2">
            Share and discover agent patterns created by the community
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button>
            <PlusCircle size={18} className="mr-1" /> Submit Pattern
          </Button>
          <Button variant="outline">
            <GithubLogo size={18} className="mr-1" /> Connect GitHub
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Featured community pattern 1 */}
        <CommunityPatternCard
          title="Multi-Agent Debate System"
          author="azure_ai_researcher"
          description="A pattern for critical thinking using multiple specialized agents that debate different perspectives on a topic."
          tags={["Multi-agent", "Debate", "Critical Thinking"]}
          stars={42}
          lastUpdated="3 days ago"
        />
        
        {/* Featured community pattern 2 */}
        <CommunityPatternCard
          title="Hierarchical Planning Agent"
          author="planning_specialist"
          description="Decompose complex tasks with hierarchical planning using multi-level agents for improved task management."
          tags={["Hierarchical", "Planning", "Task Management"]}
          stars={38}
          lastUpdated="1 week ago"
        />
        
        {/* Featured community pattern 3 */}
        <CommunityPatternCard
          title="Sequential Chain with Verification"
          author="chain_of_thought"
          description="Enhanced sequential chain that includes verification steps after each reasoning stage."
          tags={["Sequential", "Verification", "Reasoning"]}
          stars={27}
          lastUpdated="2 weeks ago"
        />
        
        {/* Featured community pattern 4 */}
        <CommunityPatternCard
          title="Recursive Task Solver"
          author="recursive_specialist"
          description="Pattern for solving problems that benefit from recursive decomposition and solution aggregation."
          tags={["Recursive", "Problem Solving", "Aggregation"]}
          stars={19}
          lastUpdated="3 weeks ago"
        />
        
        {/* Featured community pattern 5 */}
        <CommunityPatternCard
          title="Multi-Modal Context Manager"
          author="visual_ai_dev"
          description="Agent pattern for maintaining context across text, image, and other modalities in conversational AI."
          tags={["Multi-Modal", "Context Management", "Vision"]}
          stars={23}
          lastUpdated="2 weeks ago"
        />
        
        {/* Featured community pattern 6 */}
        <CommunityPatternCard
          title="Progressive Knowledge Distillation"
          author="knowledge_engineer"
          description="Extract, refine, and synthesize knowledge progressively through multiple LLM passes."
          tags={["Knowledge", "Distillation", "Learning"]}
          stars={31}
          lastUpdated="5 days ago"
        />
      </div>
      
      <div className="flex flex-col items-center justify-center space-y-4 p-6 border rounded-lg bg-card">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
          <Users size={32} />
        </div>
        <h3 className="text-xl font-semibold">Join the Azure AI Agent Community</h3>
        <p className="text-center text-muted-foreground max-w-lg">
          Connect with other developers building intelligent agents with Azure AI services. 
          Share your patterns, get feedback, and collaborate on new ideas.
        </p>
        <Button variant="default">
          Explore Community <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default CommunitySharing;