import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendUp, Clock, Eye, Target, BookOpen, Code, 
  Users, Sparkle, CaretRight, Brain, Lightbulb 
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface PageAnalytics {
  pageKey: string;
  timeSpent: number;
  sectionsViewed: string[];
  interactionsCount: number;
  scrollDepth: number;
  completionRate: number;
  lastVisit: Date;
  visitCount: number;
}

interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'next-topic' | 'deeper-dive' | 'practice' | 'review';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  icon: React.ReactNode;
  action: () => void;
}

interface SmartPageAnalyticsProps {
  pageKey: string;
  pageTitle: string;
  onRecommendationClick?: (recommendation: PersonalizedRecommendation) => void;
}

export const SmartPageAnalytics: React.FC<SmartPageAnalyticsProps> = ({
  pageKey,
  pageTitle,
  onRecommendationClick
}) => {
  const [analytics, setAnalytics] = useState<PageAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Track page analytics
  useEffect(() => {
    const startTime = Date.now();
    let scrollDepth = 0;
    let interactionsCount = 0;
    const sectionsViewed = new Set<string>();

    // Load existing analytics
    const loadAnalytics = () => {
      const stored = localStorage.getItem(`page-analytics-${pageKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastVisit: new Date(parsed.lastVisit),
          visitCount: parsed.visitCount + 1
        };
      }
      return {
        pageKey,
        timeSpent: 0,
        sectionsViewed: [],
        interactionsCount: 0,
        scrollDepth: 0,
        completionRate: 0,
        lastVisit: new Date(),
        visitCount: 1
      };
    };

    const currentAnalytics = loadAnalytics();
    setAnalytics(currentAnalytics);

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const currentScrollDepth = Math.round((scrollTop / scrollHeight) * 100);
      scrollDepth = Math.max(scrollDepth, currentScrollDepth);
    };

    // Track interactions
    const handleInteraction = (event: Event) => {
      if (event.target instanceof HTMLElement) {
        const section = event.target.closest('[data-section]');
        if (section) {
          sectionsViewed.add(section.getAttribute('data-section') || '');
        }
        interactionsCount++;
      }
    };

    // Track section visibility
    const observeElements = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const section = entry.target.getAttribute('data-section');
              if (section) {
                sectionsViewed.add(section);
              }
            }
          });
        },
        { threshold: 0.5 }
      );

      document.querySelectorAll('[data-section]').forEach(el => {
        observer.observe(el);
      });

      return observer;
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleInteraction);
    const observer = observeElements();

    // Save analytics on unload
    const saveAnalytics = () => {
      const timeSpent = Date.now() - startTime;
      const updatedAnalytics: PageAnalytics = {
        ...currentAnalytics,
        timeSpent: currentAnalytics.timeSpent + timeSpent,
        sectionsViewed: Array.from(sectionsViewed),
        interactionsCount: currentAnalytics.interactionsCount + interactionsCount,
        scrollDepth: Math.max(currentAnalytics.scrollDepth, scrollDepth),
        completionRate: Math.min(100, Math.max(currentAnalytics.completionRate, scrollDepth)),
        lastVisit: new Date()
      };

      localStorage.setItem(`page-analytics-${pageKey}`, JSON.stringify(updatedAnalytics));
      setAnalytics(updatedAnalytics);
    };

    window.addEventListener('beforeunload', saveAnalytics);

    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(saveAnalytics, 30000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleInteraction);
      window.removeEventListener('beforeunload', saveAnalytics);
      observer.disconnect();
      clearInterval(autoSaveInterval);
      saveAnalytics();
    };
  }, [pageKey]);

  // Generate personalized recommendations
  const generateRecommendations = useCallback(() => {
    if (!analytics) return;

    const recs: PersonalizedRecommendation[] = [];

    // Low completion rate - suggest reviewing current content
    if (analytics.completionRate < 50) {
      recs.push({
        id: 'complete-current',
        title: 'Complete Current Section',
        description: 'You\'ve only explored part of this page. Continue to unlock more insights!',
        type: 'review',
        difficulty: 'beginner',
        estimatedTime: '5-10 minutes',
        icon: <Target className="text-blue-600" size={16} />,
        action: () => window.scrollTo({ top: 0, behavior: 'smooth' })
      });
    }

    // High engagement - suggest deeper dive
    if (analytics.interactionsCount > 10 && analytics.timeSpent > 300000) {
      recs.push({
        id: 'deeper-dive',
        title: 'Advanced Topics',
        description: 'You\'re engaged! Ready for more advanced concepts?',
        type: 'deeper-dive',
        difficulty: 'advanced',
        estimatedTime: '15-20 minutes',
        icon: <Brain className="text-purple-600" size={16} />,
        action: () => console.log('Navigate to advanced content')
      });
    }

    // Multiple visits - suggest practice
    if (analytics.visitCount > 2) {
      recs.push({
        id: 'practice',
        title: 'Practice Implementation',
        description: 'You\'ve reviewed this content multiple times. Try implementing it!',
        type: 'practice',
        difficulty: 'intermediate',
        estimatedTime: '20-30 minutes',
        icon: <Code className="text-green-600" size={16} />,
        action: () => console.log('Open practice environment')
      });
    }

    // Suggest related topics based on page
    const relatedTopics = getRelatedTopics(pageKey);
    if (relatedTopics.length > 0) {
      recs.push({
        id: 'related-topic',
        title: `Explore ${relatedTopics[0].title}`,
        description: relatedTopics[0].description,
        type: 'next-topic',
        difficulty: 'intermediate',
        estimatedTime: '10-15 minutes',
        icon: <BookOpen className="text-orange-600" size={16} />,
        action: relatedTopics[0].action
      });
    }

    setRecommendations(recs.slice(0, 3)); // Show top 3 recommendations
  }, [analytics, pageKey]);

  // Get related topics based on current page
  const getRelatedTopics = (currentPageKey: string) => {
    const topics = {
      'core-concepts': [
        { title: 'Agent Patterns', description: 'Learn implementation patterns for AI agents', action: () => console.log('Navigate to patterns') }
      ],
      'agent-patterns': [
        { title: 'Azure Services', description: 'Integrate with Azure AI services', action: () => console.log('Navigate to Azure') }
      ],
      'azure-services': [
        { title: 'Community Hub', description: 'Share your implementations with others', action: () => console.log('Navigate to community') }
      ]
    };
    return topics[currentPageKey as keyof typeof topics] || [];
  };

  useEffect(() => {
    if (analytics) {
      generateRecommendations();
      
      // Show analytics after some engagement
      if (analytics.timeSpent > 60000 || analytics.interactionsCount > 5) {
        setIsVisible(true);
      }
    }
  }, [analytics, generateRecommendations]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getEngagementLevel = (analytics: PageAnalytics) => {
    const score = (analytics.completionRate + (analytics.interactionsCount * 5) + Math.min(analytics.timeSpent / 1000 / 60, 10)) / 3;
    if (score > 70) return { level: 'High', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score > 40) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  if (!analytics || !isVisible) return null;

  const engagement = getEngagementLevel(analytics);

  return (
    <div className="fixed bottom-6 left-6 z-40 w-72">
      <Card className="shadow-lg border-l-4 border-l-primary bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendUp size={16} className="text-primary" />
              Learning Progress
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Page Completion</span>
              <span className="text-xs font-medium">{analytics.completionRate}%</span>
            </div>
            <Progress value={analytics.completionRate} className="h-2" />
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-muted-foreground" />
                <span>{formatTime(analytics.timeSpent)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={12} className="text-muted-foreground" />
                <span>{analytics.visitCount} visits</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Engagement:</span>
              <Badge className={cn("text-xs", engagement.color, engagement.bgColor)}>
                {engagement.level}
              </Badge>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Recommended Next Steps</h4>
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => {
                    rec.action();
                    onRecommendationClick?.(rec);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{rec.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-medium">{rec.title}</span>
                        <CaretRight size={10} className="text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight mb-1">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {rec.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartPageAnalytics;
