import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Share, ChatCircleText } from '@phosphor-icons/react';

export default function CommunitySharing() {
  const [activeTab, setActiveTab] = useState('discussions');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground">
          Connect with other developers working with Azure AI agents and share your experiences.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <ChatCircleText size={18} />
            <span>Discussions</span>
          </TabsTrigger>
          <TabsTrigger value="shared-patterns" className="flex items-center gap-2">
            <Share size={18} />
            <span>Shared Patterns</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Community Discussions</CardTitle>
              <CardDescription>
                Join the conversation about Azure AI agent patterns and implementation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Recent Topics</h3>
                  <Button size="sm" className="gap-1">
                    <ChatCircleText size={16} />
                    <span>New Topic</span>
                  </Button>
                </div>
                
                {/* Sample discussion topics */}
                {discussionTopics.map((topic, index) => (
                  <DiscussionTopic key={index} {...topic} />
                ))}
                
                <div className="pt-4">
                  <Input placeholder="Search topics..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shared-patterns" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Community Shared Agent Patterns</CardTitle>
              <CardDescription>
                Explore and share custom agent patterns created by the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">Popular Patterns</h3>
                  <Button size="sm" className="gap-1">
                    <Share size={16} />
                    <span>Share Pattern</span>
                  </Button>
                </div>
                
                {/* Sample shared patterns */}
                {sharedPatterns.map((pattern, index) => (
                  <SharedPattern key={index} {...pattern} />
                ))}
                
                <div className="flex gap-2 pt-4">
                  <Input placeholder="Search patterns..." className="flex-1" />
                  <Button variant="outline">Filter</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Discussion topic component
function DiscussionTopic({ 
  title, 
  author, 
  avatar, 
  date, 
  replies, 
  views 
}: {
  title: string;
  author: string;
  avatar?: string;
  date: string;
  replies: number;
  views: number;
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium hover:text-primary cursor-pointer">{title}</h4>
            <div className="text-sm text-muted-foreground">
              <span>{author}</span> · <span>{date}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-x-4">
          <span>{replies} replies</span>
          <span>{views} views</span>
        </div>
      </div>
    </div>
  );
}

// Shared pattern component
function SharedPattern({
  title,
  description,
  author,
  avatar,
  date,
  likes,
  category
}: {
  title: string;
  description: string;
  author: string;
  avatar?: string;
  date: string;
  likes: number;
  category: string;
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} />
          <AvatarFallback>{author[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-medium hover:text-primary cursor-pointer">{title}</h4>
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{category}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{author} · {date}</span>
            <span>{likes} likes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample data
const discussionTopics = [
  {
    title: "Optimizing RAG patterns for Azure AI Search",
    author: "Sarah Chen",
    avatar: "",
    date: "2 days ago",
    replies: 12,
    views: 230
  },
  {
    title: "Integrating Voice Agents with Azure Neural TTS",
    author: "Miguel Rodriguez",
    avatar: "",
    date: "5 days ago",
    replies: 8,
    views: 142
  },
  {
    title: "Security best practices for Agent2Agent communication",
    author: "Alex Johnson",
    avatar: "",
    date: "1 week ago",
    replies: 15,
    views: 278
  },
  {
    title: "Implementing MCP with complex tool usage",
    author: "Lisa Zhang",
    avatar: "",
    date: "2 weeks ago",
    replies: 7,
    views: 189
  }
];

const sharedPatterns = [
  {
    title: "Hybrid Router-ReAct Pattern",
    description: "A custom pattern combining the Router and ReAct patterns for enhanced task planning and execution.",
    author: "David Kim",
    avatar: "",
    date: "3 days ago",
    likes: 24,
    category: "Hybrid"
  },
  {
    title: "Azure AI Search Enhanced RAG",
    description: "Using Azure AI Search with vector embedding and semantic ranking for improved retrieval augmented generation.",
    author: "Emma Wilson",
    avatar: "",
    date: "1 week ago",
    likes: 46,
    category: "RAG"
  },
  {
    title: "Multi-Agent Debate Framework",
    description: "A framework for implementing agent debates with evaluation metrics and structured output.",
    author: "Thomas Lee",
    avatar: "",
    date: "2 weeks ago",
    likes: 31,
    category: "Multi-Agent"
  },
  {
    title: "CodeAct with Integrated Testing",
    description: "Extended CodeAct pattern that automatically generates and runs tests for generated code.",
    author: "Priya Sharma",
    avatar: "",
    date: "3 weeks ago",
    likes: 19,
    category: "Code Generation"
  }
];