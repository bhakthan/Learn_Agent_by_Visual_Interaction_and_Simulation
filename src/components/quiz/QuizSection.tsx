import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, Trophy, ChartLine, Target, BookOpen, 
  Users, Brain, Clock, Star, TrendUp
} from "@phosphor-icons/react";
import AdaptiveLearningQuiz from './AdaptiveLearningQuiz';
import { QuizSession } from "@/lib/data/quizzes";

interface QuizSectionProps {}

const QuizSection: React.FC<QuizSectionProps> = () => {
  const [completedQuizzes, setCompletedQuizzes] = useState<QuizSession[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleQuizComplete = (session: QuizSession) => {
    setCompletedQuizzes(prev => [...prev, session]);
    
    // Store in localStorage for persistence
    const savedQuizzes = JSON.parse(localStorage.getItem('ai-agent-school-quiz-history') || '[]');
    savedQuizzes.push({
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString()
    });
    localStorage.setItem('ai-agent-school-quiz-history', JSON.stringify(savedQuizzes));
  };

  // Load quiz history on component mount
  React.useEffect(() => {
    const savedQuizzes = JSON.parse(localStorage.getItem('ai-agent-school-quiz-history') || '[]');
    const parsedQuizzes = savedQuizzes.map((quiz: any) => ({
      ...quiz,
      startTime: new Date(quiz.startTime),
      endTime: quiz.endTime ? new Date(quiz.endTime) : undefined
    }));
    setCompletedQuizzes(parsedQuizzes);
  }, []);

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', icon: <Trophy size={16} /> };
    if (score >= 60) return { level: 'Good', color: 'text-yellow-600', icon: <Target size={16} /> };
    return { level: 'Needs Improvement', color: 'text-red-600', icon: <TrendUp size={16} /> };
  };

  const calculateOverallStats = () => {
    if (completedQuizzes.length === 0) return null;
    
    const totalScore = completedQuizzes.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = Math.round(totalScore / completedQuizzes.length);
    const totalTime = completedQuizzes.reduce((sum, quiz) => sum + quiz.timeSpent, 0);
    const averageTime = Math.round(totalTime / completedQuizzes.length);
    
    const difficultyStats = {
      beginner: completedQuizzes.filter(q => q.difficulty === 'beginner').length,
      intermediate: completedQuizzes.filter(q => q.difficulty === 'intermediate').length,
      advanced: completedQuizzes.filter(q => q.difficulty === 'advanced').length
    };

    return {
      totalQuizzes: completedQuizzes.length,
      averageScore,
      averageTime,
      difficultyStats
    };
  };

  const stats = calculateOverallStats();

  if (showQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Assessment</h1>
            <p className="text-muted-foreground">Test your AI agent expertise</p>
          </div>
          <Button variant="outline" onClick={() => setShowQuiz(false)}>
            ← Back to Overview
          </Button>
        </div>
        
        <AdaptiveLearningQuiz onQuizComplete={handleQuizComplete} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap size={32} className="text-primary" />
            Knowledge Assessment
          </h1>
          <p className="text-muted-foreground mt-2">
            Test your understanding of AI agent concepts with adaptive quizzes tailored to your role and experience level
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Your Progress</TabsTrigger>
          <TabsTrigger value="leaderboard">Learning Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Start Section */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={24} className="text-primary" />
                Start Your Assessment
              </CardTitle>
              <CardDescription>
                Choose from adaptive quizzes based on your professional role or focus on specific topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users size={20} className="text-primary" />
                    <h3 className="font-semibold">Role-Based Assessment</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a personalized quiz adapted to your professional role and experience level
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-muted-foreground">Popular roles:</div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Business Leader</Badge>
                      <Badge variant="outline" className="text-xs">Agent Developer</Badge>
                      <Badge variant="outline" className="text-xs">AI Engineer</Badge>
                    </div>
                  </div>
                  <Button onClick={() => setShowQuiz(true)} className="w-full">
                    Start Adaptive Quiz
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain size={20} className="text-primary" />
                    <h3 className="font-semibold">Topic-Focused Assessment</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Focus on specific areas like Core Concepts, Agent Patterns, or Azure Services
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-muted-foreground">Available topics:</div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">Core Concepts</Badge>
                      <Badge variant="outline" className="text-xs">Agent Patterns</Badge>
                      <Badge variant="outline" className="text-xs">Azure Services</Badge>
                    </div>
                  </div>
                  <Button onClick={() => setShowQuiz(true)} variant="outline" className="w-full">
                    Choose Topic
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Target size={24} className="text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Adaptive Difficulty</h3>
              <p className="text-sm text-muted-foreground">
                Questions adapt to your role and experience level for optimal learning
              </p>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Clock size={24} className="text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Timed Challenges</h3>
              <p className="text-sm text-muted-foreground">
                Realistic time constraints to simulate real-world decision making
              </p>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ChartLine size={24} className="text-primary" />
                </div>
              </div>
              <h3 className="font-semibold mb-2">Detailed Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive explanations and personalized learning recommendations
              </p>
            </Card>
          </div>

          {/* Learning Levels */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Levels</CardTitle>
              <CardDescription>
                Our quizzes are designed for three distinct skill levels and professional contexts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">Beginner</Badge>
                    <span className="text-sm font-medium">Foundation Level</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2"><strong>Target Audience:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Business Leaders</li>
                      <li>No-Code/Low-Code Engineers</li>
                      <li>New to AI Agents</li>
                    </ul>
                    <p className="mt-2 text-xs">Focus on concepts, business value, and basic understanding.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Intermediate</Badge>
                    <span className="text-sm font-medium">Applied Level</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2"><strong>Target Audience:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Agent Designers</li>
                      <li>Agent Developers</li>
                      <li>AI Enthusiasts</li>
                    </ul>
                    <p className="mt-2 text-xs">Focus on implementation, patterns, and practical application.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800 border-red-200">Advanced</Badge>
                    <span className="text-sm font-medium">Expert Level</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2"><strong>Target Audience:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>AI Engineers</li>
                      <li>Agent Architects</li>
                      <li>AI Ops Engineers</li>
                    </ul>
                    <p className="mt-2 text-xs">Focus on architecture, optimization, and system design.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {stats ? (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">{stats.totalQuizzes}</div>
                  <div className="text-sm text-muted-foreground">Quizzes Completed</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">{stats.averageScore}%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">{Math.floor(stats.averageTime / 60)}m</div>
                  <div className="text-sm text-muted-foreground">Average Time</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {getPerformanceLevel(stats.averageScore).level}
                  </div>
                  <div className="text-sm text-muted-foreground">Performance Level</div>
                </Card>
              </div>

              {/* Recent Quizzes */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assessments</CardTitle>
                  <CardDescription>Your latest quiz attempts and scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedQuizzes.slice(-5).reverse().map((quiz, index) => {
                      const performance = getPerformanceLevel(quiz.score);
                      return (
                        <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {performance.icon}
                              <span className={`font-medium ${performance.color}`}>
                                {quiz.score}%
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {quiz.categoryId === 'adaptive' ? 'Adaptive Quiz' : quiz.categoryId}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {quiz.difficulty} • {Math.floor(quiz.timeSpent / 60)}m {quiz.timeSpent % 60}s
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {quiz.startTime.toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Difficulty Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Progress by Difficulty</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {stats.difficultyStats.beginner}
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">
                        Beginner
                      </Badge>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">
                        {stats.difficultyStats.intermediate}
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 mb-2">
                        Intermediate
                      </Badge>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        {stats.difficultyStats.advanced}
                      </div>
                      <Badge className="bg-red-100 text-red-800 border-red-200 mb-2">
                        Advanced
                      </Badge>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <GraduationCap size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
              <p className="text-muted-foreground mb-4">
                Take your first quiz to start tracking your learning progress
              </p>
              <Button onClick={() => setShowQuiz(true)}>
                Start Your First Quiz
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={24} className="text-primary" />
                Learning Insights
              </CardTitle>
              <CardDescription>
                Understand your learning patterns and get recommendations for continued growth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Recommended Focus Areas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Agent Communication Protocols</div>
                        <div className="text-sm text-muted-foreground">Based on your recent performance</div>
                      </div>
                      <Badge variant="outline">Intermediate</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Azure AI Services Integration</div>
                        <div className="text-sm text-muted-foreground">Popular among similar roles</div>
                      </div>
                      <Badge variant="outline">Beginner</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Advanced Agent Patterns</div>
                        <div className="text-sm text-muted-foreground">Next level challenge</div>
                      </div>
                      <Badge variant="outline">Advanced</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Learning Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Most challenging topic</span>
                      <Badge variant="outline">Self-Reflection Patterns</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Strongest area</span>
                      <Badge variant="outline">Core Concepts</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average completion time</span>
                      <span className="text-sm font-medium">{stats ? `${Math.floor(stats.averageTime / 60)}m ${stats.averageTime % 60}s` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Preferred difficulty</span>
                      <Badge variant="outline">
                        {stats ? Object.entries(stats.difficultyStats).reduce((a, b) => stats.difficultyStats[a[0] as keyof typeof stats.difficultyStats] > stats.difficultyStats[b[0] as keyof typeof stats.difficultyStats] ? a : b)[0] : 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Ready for the Next Challenge?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Continue your learning journey with targeted assessments
                  </p>
                  <Button onClick={() => setShowQuiz(true)}>
                    Take Another Quiz
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizSection;
