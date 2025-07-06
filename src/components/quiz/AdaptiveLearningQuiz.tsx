import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, PuzzlePiece, StackSimple, Books, Users, 
  CheckCircle, XCircle, Clock, Trophy, Target, 
  Play, RotateCounterClockwise, ChartLine, Lightbulb,
  User, GraduationCap, Briefcase, Gear
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { 
  QuizQuestion, QuizSession, QuizCategory, UserPersona, QuizFeedback,
  quizCategories, userPersonas, getQuizzesByPersona, getQuizzesByCategory,
  generateAdaptiveQuiz, calculateQuizScore, generateQuizFeedback
} from "@/lib/data/quizzes";

interface AdaptiveLearningQuizProps {
  onQuizComplete?: (session: QuizSession) => void;
}

const AdaptiveLearningQuiz: React.FC<AdaptiveLearningQuizProps> = ({ onQuizComplete }) => {
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<QuizFeedback[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState(false);

  // Save quiz progress to localStorage
  const saveQuizProgress = useCallback((completedSession: QuizSession) => {
    const existingProgress = localStorage.getItem('quiz-progress');
    const progress = existingProgress ? JSON.parse(existingProgress) : {
      completedQuizzes: [],
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      categoriesCompleted: [],
      totalTimeSpent: 0
    };
    
    // Add this quiz to completed quizzes
    const quizResult = {
      id: completedSession.id,
      categoryId: completedSession.categoryId,
      subCategoryId: completedSession.subCategoryId,
      difficulty: completedSession.difficulty,
      score: completedSession.score,
      timeSpent: completedSession.timeSpent,
      completedAt: new Date().toISOString(),
      questionsCount: completedSession.questions.length
    };
    
    progress.completedQuizzes.push(quizResult);
    progress.totalQuizzes = progress.completedQuizzes.length;
    progress.totalTimeSpent += completedSession.timeSpent;
    
    // Update best score
    progress.bestScore = Math.max(progress.bestScore, completedSession.score);
    
    // Calculate average score
    progress.averageScore = Math.round(
      progress.completedQuizzes.reduce((sum: number, quiz: any) => sum + quiz.score, 0) / progress.totalQuizzes
    );
    
    // Track categories completed
    const categoryId = completedSession.categoryId;
    if (!progress.categoriesCompleted.includes(categoryId)) {
      progress.categoriesCompleted.push(categoryId);
    }
    
    // Save back to localStorage
    localStorage.setItem('quiz-progress', JSON.stringify(progress));
    
    // Also save to page analytics for the quiz page
    const pageAnalytics = {
      completionRate: Math.min(100, (progress.completedQuizzes.length / 10) * 100), // Consider 10 quizzes as "complete"
      timeSpent: progress.totalTimeSpent,
      lastVisited: new Date().toISOString(),
      interactions: progress.totalQuizzes,
      achievements: progress.completedQuizzes.filter((q: any) => q.score >= 90).length
    };
    
    localStorage.setItem('page-analytics-quiz', JSON.stringify(pageAnalytics));
  }, []);

  // Timer effect for auto-advancing questions
  useEffect(() => {
    if (!currentSession || currentSession.completed || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit current question when time runs out
          if (currentAnswer) {
            // Call handleAnswerSubmit logic directly
            const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
            const answerValue = parseInt(currentAnswer);
            const updatedAnswers = {
              ...currentSession.answers,
              [currentQuestion.id]: answerValue
            };

            const updatedSession = {
              ...currentSession,
              answers: updatedAnswers
            };

            // Debug logging for timer auto-submit
            console.log('=== TIMER AUTO-SUBMIT DEBUG ===');
            console.log('Timer auto-submit:', {
              questionId: currentQuestion.id,
              selectedAnswer: answerValue,
              correctAnswer: currentQuestion.correctAnswer,
              isCorrect: answerValue === currentQuestion.correctAnswer,
              currentAnswer: currentAnswer,
              questionIndex: currentSession.currentQuestionIndex,
              totalQuestions: currentSession.questions.length,
              allAnswers: updatedAnswers
            });

            setCurrentAnswer('');
            
            // Move to next question or complete quiz
            const nextIndex = currentSession.currentQuestionIndex + 1;
            if (nextIndex >= currentSession.questions.length) {
              const completedSession = {
                ...updatedSession,
                currentQuestionIndex: nextIndex,
                completed: true,
                endTime: new Date(),
                timeSpent: Math.round((new Date().getTime() - currentSession.startTime.getTime()) / 1000)
              };
              
              completedSession.score = calculateQuizScore(completedSession);
              const feedback = generateQuizFeedback(completedSession);
              
              setCurrentSession(completedSession);
              setQuizFeedback(feedback);
              setShowResults(true);
              setTimeRemaining(0);
              
              if (onQuizComplete) {
                onQuizComplete(completedSession);
              }
            } else {
              const nextSession = {
                ...updatedSession,
                currentQuestionIndex: nextIndex
              };
              console.log('=== TIMER MOVING TO NEXT QUESTION ===');
              console.log('Moving to next question:', {
                nextIndex: nextIndex,
                totalQuestions: currentSession.questions.length,
                sessionAnswers: updatedSession.answers
              });
              setCurrentSession(nextSession);
              setTimeRemaining(nextSession.questions[nextIndex].timeEstimate);
            }
          } else {
            // No answer selected, just move to next question
            const nextIndex = currentSession.currentQuestionIndex + 1;
            if (nextIndex >= currentSession.questions.length) {
              const completedSession = {
                ...currentSession,
                currentQuestionIndex: nextIndex,
                completed: true,
                endTime: new Date(),
                timeSpent: Math.round((new Date().getTime() - currentSession.startTime.getTime()) / 1000)
              };
              
              completedSession.score = calculateQuizScore(completedSession);
              const feedback = generateQuizFeedback(completedSession);
              
              setCurrentSession(completedSession);
              setQuizFeedback(feedback);
              setShowResults(true);
              setTimeRemaining(0);
              
              if (onQuizComplete) {
                onQuizComplete(completedSession);
              }
            } else {
              const nextSession = {
                ...currentSession,
                currentQuestionIndex: nextIndex
              };
              setCurrentSession(nextSession);
              setTimeRemaining(nextSession.questions[nextIndex].timeEstimate);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession, timeRemaining, currentAnswer, onQuizComplete, calculateQuizScore, generateQuizFeedback]);

  const startQuiz = useCallback(() => {
    if (!selectedPersona) return;

    let questions: QuizQuestion[] = [];
    
    if (selectedCategory) {
      // Category-specific quiz
      questions = getQuizzesByCategory(selectedCategory.id, selectedDifficulty);
    } else {
      // Persona-adaptive quiz
      questions = generateAdaptiveQuiz(
        selectedPersona.id, 
        selectedPersona.focusAreas, 
        selectedDifficulty, 
        15
      );
    }

    if (questions.length === 0) {
      // If no questions found for the selected difficulty, try to get questions from all difficulty levels
      if (selectedCategory) {
        questions = getQuizzesByCategory(selectedCategory.id);
      } else {
        // For persona-based quiz, try without difficulty filter
        questions = generateAdaptiveQuiz(
          selectedPersona.id, 
          selectedPersona.focusAreas, 
          'beginner', // fallback to beginner
          15
        );
      }
    }

    if (questions.length === 0) {
      console.error('No questions found for selected criteria:', {
        persona: selectedPersona?.id,
        category: selectedCategory?.id,
        difficulty: selectedDifficulty
      });
      return;
    }

    // Shuffle questions
    questions = questions.sort(() => Math.random() - 0.5);

    const session: QuizSession = {
      id: `quiz-${Date.now()}`,
      userId: 'current-user',
      categoryId: selectedCategory?.id || 'adaptive',
      difficulty: selectedDifficulty,
      questions: questions.slice(0, 10), // Limit to 10 questions
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      startTime: new Date(),
      timeSpent: 0,
      completed: false,
      feedback: []
    };

    setCurrentSession(session);
    setCurrentAnswer('');
    setShowResults(false);
    setQuizStarted(true);
    
    // Set timer for first question
    if (session.questions.length > 0) {
      setTimeRemaining(session.questions[0].timeEstimate);
    }
  }, [selectedPersona, selectedCategory, selectedDifficulty]);

  const handleAnswerSubmit = useCallback(() => {
    if (!currentSession || !currentAnswer) return;

    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    const answerValue = parseInt(currentAnswer);
    const updatedAnswers = {
      ...currentSession.answers,
      [currentQuestion.id]: answerValue
    };

    // Update session with the new answer
    const updatedSession = {
      ...currentSession,
      answers: updatedAnswers
    };

    // Debug logging
    console.log('=== ANSWER SUBMIT DEBUG ===');
    console.log('Answer submitted:', {
      questionId: currentQuestion.id,
      selectedAnswer: answerValue,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: answerValue === currentQuestion.correctAnswer,
      currentAnswer: currentAnswer,
      questionIndex: currentSession.currentQuestionIndex,
      totalQuestions: currentSession.questions.length,
      allAnswers: updatedAnswers
    });

    // Check if this is the last question
    const isLastQuestion = currentSession.currentQuestionIndex + 1 >= currentSession.questions.length;
    
    if (isLastQuestion) {
      console.log('=== COMPLETING QUIZ ===');
      // Complete the quiz immediately for the last question
      const completedSession = {
        ...updatedSession,
        currentQuestionIndex: currentSession.currentQuestionIndex + 1,
        completed: true,
        endTime: new Date(),
        timeSpent: Math.round((new Date().getTime() - currentSession.startTime.getTime()) / 1000)
      };
      
      completedSession.score = calculateQuizScore(completedSession);
      const feedback = generateQuizFeedback(completedSession);
      
      setCurrentSession(completedSession);
      setQuizFeedback(feedback);
      setShowResults(true);
      setTimeRemaining(0);
      setCurrentAnswer(''); // Clear answer only after completion
      
      if (onQuizComplete) {
        onQuizComplete(completedSession);
      }
    } else {
      // Move to next question immediately using the updated session
      const nextIndex = currentSession.currentQuestionIndex + 1;
      const nextSession = {
        ...updatedSession,
        currentQuestionIndex: nextIndex
      };
      
      console.log('=== MANUAL SUBMIT MOVING TO NEXT QUESTION ===');
      console.log('Moving to next question:', {
        nextIndex: nextIndex,
        totalQuestions: currentSession.questions.length,
        sessionAnswers: updatedSession.answers
      });
      
      setCurrentSession(nextSession);
      setCurrentAnswer(''); // Clear answer for next question
      setTimeRemaining(nextSession.questions[nextIndex].timeEstimate);
    }
  }, [currentSession, currentAnswer, onQuizComplete]);

  const handleNextQuestion = useCallback(() => {
    if (!currentSession) return;

    const nextIndex = currentSession.currentQuestionIndex + 1;
    
    if (nextIndex >= currentSession.questions.length) {
      // Quiz completed (this should now only be called by timer auto-advance)
      const completedSession = {
        ...currentSession,
        currentQuestionIndex: nextIndex,
        completed: true,
        endTime: new Date(),
        timeSpent: Math.round((new Date().getTime() - currentSession.startTime.getTime()) / 1000)
      };
      
      completedSession.score = calculateQuizScore(completedSession);
      const feedback = generateQuizFeedback(completedSession);
      
      setCurrentSession(completedSession);
      setQuizFeedback(feedback);
      setShowResults(true);
      setTimeRemaining(0);
      
      if (onQuizComplete) {
        onQuizComplete(completedSession);
      }
    } else {
      // Move to next question
      const updatedSession = {
        ...currentSession,
        currentQuestionIndex: nextIndex
      };
      
      setCurrentSession(updatedSession);
      setTimeRemaining(updatedSession.questions[nextIndex].timeEstimate);
    }
  }, [currentSession, onQuizComplete]);

  const resetQuiz = useCallback(() => {
    setCurrentSession(null);
    setCurrentAnswer('');
    setShowResults(false);
    setQuizFeedback([]);
    setTimeRemaining(0);
    setQuizStarted(false);
  }, []);

  const getPersonaIcon = (persona: UserPersona) => {
    switch (persona.id) {
      case 'business-leader': return <Briefcase size={20} />;
      case 'no-code-engineer': return <Gear size={20} />;
      case 'agent-designer': return <PuzzlePiece size={20} />;
      case 'agent-developer': return <Brain size={20} />;
      case 'ai-enthusiast': return <Lightbulb size={20} />;
      case 'ai-engineer': return <Gear size={20} />;
      case 'agent-architect': return <StackSimple size={20} />;
      case 'ai-ops-engineer': return <Target size={20} />;
      default: return <User size={20} />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // If quiz is started and we have a session
  if (quizStarted && currentSession && !showResults) {
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    const progress = ((currentSession.currentQuestionIndex + 1) / currentSession.questions.length) * 100;

    // Check if currentQuestion exists - if not, there's an issue with question loading
    if (!currentQuestion) {
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap size={24} className="text-primary" />
              AI Agent Knowledge Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground mb-4">
                No questions available for the selected {selectedDifficulty} difficulty level.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Try selecting a different difficulty level or category, or check back later as we're continuously adding new questions.
              </p>
              <Button onClick={() => setQuizStarted(false)} variant="outline">
                Back to Quiz Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap size={24} className="text-primary" />
              AI Agent Knowledge Quiz
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge className={cn("text-xs", getDifficultyColor(currentSession.difficulty))}>
                {currentSession.difficulty}
              </Badge>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} />
                <span className={cn(
                  "font-mono",
                  timeRemaining <= 10 ? "text-red-600 font-bold" : "text-muted-foreground"
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentQuestion.subCategory}
                </Badge>
              </div>
            </div>

            <h3 className="text-lg font-semibold leading-relaxed">
              {currentQuestion.question}
            </h3>

            {currentQuestion.codeExample && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <pre className="text-sm text-muted-foreground">
                    <code>{currentQuestion.codeExample}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            <RadioGroup
              value={currentAnswer}
              onValueChange={setCurrentAnswer}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-sm leading-relaxed"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Focus Areas: {currentQuestion.relatedConcepts.slice(0, 3).join(', ')}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetQuiz}>
                <RotateCounterClockwise size={16} className="mr-1" />
                Reset
              </Button>
              <Button 
                onClick={handleAnswerSubmit} 
                disabled={!currentAnswer}
                className="min-w-24"
              >
                {currentSession.currentQuestionIndex + 1 === currentSession.questions.length ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show results
  if (showResults && currentSession) {
    const correctAnswers = quizFeedback.filter(f => f.isCorrect).length;
    const scorePercentage = currentSession.score;
    
    return (
      <Card className="w-full max-w-4xl mx-auto quiz-results-container">
        <CardHeader className="print:border-b print:border-black">
          <CardTitle className="flex items-center gap-2">
            <Trophy size={24} className="text-primary" />
            Quiz Results
          </CardTitle>
          <CardDescription>
            Review your performance and get personalized learning recommendations
          </CardDescription>
          
          {/* Print-only header with comprehensive info */}
          <div className="hidden print:block print:mt-4 print:border-t print:border-black print:pt-4">
            <h1 className="text-2xl font-bold mb-2">AI Agent School - Quiz Results</h1>
            <div className="space-y-2 text-sm">
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>Quiz Type:</strong> {selectedPersona ? `Role-based (${selectedPersona.name})` : selectedCategory ? `Topic-based (${selectedCategory.name})` : 'Adaptive Quiz'}</p>
              <p><strong>Difficulty Level:</strong> {selectedDifficulty}</p>
              <p><strong>Total Questions:</strong> {currentSession.questions.length}</p>
              <p><strong>Time Spent:</strong> {formatTime(currentSession.timeSpent)}</p>
              <p><strong>Score:</strong> {correctAnswers} / {currentSession.questions.length} ({Math.round(scorePercentage)}%)</p>
              <p><strong>Performance:</strong> {
                scorePercentage >= 80 ? 'Excellent' :
                scorePercentage >= 60 ? 'Good' : 'Needs Improvement'
              }</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">{scorePercentage}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </Card>
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-muted-foreground mb-2">{formatTime(currentSession.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </Card>
          </div>

          {/* Performance Level */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <ChartLine size={20} className="text-primary" />
              <h3 className="font-semibold">Performance Level</h3>
            </div>
            <div className="space-y-2">
              {scorePercentage >= 80 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="font-medium">Excellent! You have a strong understanding of these concepts.</span>
                </div>
              )}
              {scorePercentage >= 60 && scorePercentage < 80 && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <Target size={16} />
                  <span className="font-medium">Good progress! Consider reviewing some concepts for deeper understanding.</span>
                </div>
              )}
              {scorePercentage < 60 && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle size={16} />
                  <span className="font-medium">Keep learning! Focus on the recommended areas below.</span>
                </div>
              )}
            </div>
          </Card>

          {/* Detailed Feedback */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Question Review</h3>
            <ScrollArea className="h-64 print:h-auto">
              <div className="space-y-4 print:space-y-6">
                {quizFeedback.map((feedback, index) => {
                  const question = currentSession.questions.find(q => q.id === feedback.questionId);
                  if (!question) return null;

                  return (
                    <div key={feedback.questionId} className="space-y-2 p-3 rounded-lg border print:border-2 print:break-inside-avoid">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2">
                          {feedback.isCorrect ? (
                            <CheckCircle size={16} className="text-green-600 mt-1" />
                          ) : (
                            <XCircle size={16} className="text-red-600 mt-1" />
                          )}
                          <span className="text-sm font-medium print:text-base">Q{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1 print:text-base print:font-bold">{question.question}</p>
                          <div className="print:space-y-2">
                            <div className="print:block">
                              <p className="text-xs font-medium print:text-sm print:font-semibold mb-1">Your Answer:</p>
                              <p className="text-xs text-muted-foreground print:text-sm print:text-black">
                                {question.options[currentSession.answers[question.id] - 1] || 'Not answered'}
                              </p>
                            </div>
                            <div className="print:block">
                              <p className="text-xs font-medium print:text-sm print:font-semibold mb-1">Correct Answer:</p>
                              <p className="text-xs text-muted-foreground print:text-sm print:text-black">
                                {question.options[question.correctAnswer - 1]}
                              </p>
                            </div>
                            <div className="print:block">
                              <p className="text-xs font-medium print:text-sm print:font-semibold mb-1">Explanation:</p>
                              <p className="text-xs text-muted-foreground print:text-sm print:text-black mb-2">{feedback.explanation}</p>
                            </div>
                            {!feedback.isCorrect && feedback.improvementSuggestions.length > 0 && (
                              <div className="space-y-1 print:space-y-2">
                                <p className="text-xs font-medium text-orange-600 print:text-sm print:font-semibold print:text-black">Recommendations:</p>
                                <ul className="text-xs text-muted-foreground list-disc list-inside print:text-sm print:text-black">
                                  {feedback.improvementSuggestions.map((suggestion, i) => (
                                    <li key={i}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>

          {/* Print-only comprehensive results */}
          <div className="hidden print:block print:mt-8">
            <h2 className="text-xl font-bold mb-4">Complete Quiz Results</h2>
            <div className="space-y-6">
              {quizFeedback.map((feedback, index) => {
                const question = currentSession.questions.find(q => q.id === feedback.questionId);
                if (!question) return null;

                return (
                  <div key={feedback.questionId} className="border-2 p-4 rounded-lg break-inside-avoid">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        {feedback.isCorrect ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span className="text-red-600 font-bold">✗</span>
                        )}
                        <span className="text-lg font-bold">Question {index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold mb-3">{question.question}</p>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold mb-1">All Options:</p>
                            <ol className="list-decimal list-inside space-y-1">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex} className={`${
                                  optIndex + 1 === question.correctAnswer ? 'font-bold text-green-600' : ''
                                } ${
                                  optIndex + 1 === currentSession.answers[question.id] ? 'bg-blue-100' : ''
                                }`}>
                                  {option} {optIndex + 1 === question.correctAnswer ? '(Correct)' : ''} {optIndex + 1 === currentSession.answers[question.id] ? '(Your Answer)' : ''}
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div>
                            <p className="font-semibold mb-1">Result:</p>
                            <p className={`${feedback.isCorrect ? 'text-green-600' : 'text-red-600'} font-medium`}>
                              {feedback.isCorrect ? 'Correct' : 'Incorrect'}
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold mb-1">Explanation:</p>
                            <p className="text-black">{feedback.explanation}</p>
                          </div>

                          {!feedback.isCorrect && feedback.improvementSuggestions.length > 0 && (
                            <div>
                              <p className="font-semibold mb-1">Improvement Recommendations:</p>
                              <ul className="list-disc list-inside space-y-1 text-black">
                                {feedback.improvementSuggestions.map((suggestion, i) => (
                                  <li key={i}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-center print:hidden">
            <Button variant="outline" onClick={resetQuiz}>
              <RotateCounterClockwise size={16} className="mr-1" />
              Take Another Quiz
            </Button>
            <Button onClick={() => window.print()}>
              Save Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Setup screen
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap size={24} className="text-primary" />
          AI Agent Knowledge Assessment
        </CardTitle>
        <CardDescription>
          Test your understanding of AI agent concepts with personalized quizzes adapted to your role and experience level
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="persona" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="persona">Choose Your Role</TabsTrigger>
            <TabsTrigger value="category">Select Topic</TabsTrigger>
          </TabsList>

          <TabsContent value="persona" className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Select Your Professional Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userPersonas.map((persona) => (
                  <Card 
                    key={persona.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all",
                      selectedPersona?.id === persona.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedPersona(persona)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        {getPersonaIcon(persona)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{persona.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{persona.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-xs", getDifficultyColor(persona.targetDifficulty))}>
                            {persona.targetDifficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {persona.learningStyle}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {selectedPersona && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Difficulty Level</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
                      <Card
                        key={difficulty}
                        className={cn(
                          "p-4 cursor-pointer text-center transition-all",
                          selectedDifficulty === difficulty
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedDifficulty(difficulty)}
                      >
                        <Badge className={cn("mb-2", getDifficultyColor(difficulty))}>
                          {difficulty}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {difficulty === 'beginner' && 'Fundamental concepts'}
                          {difficulty === 'intermediate' && 'Applied knowledge'}
                          {difficulty === 'advanced' && 'Expert-level topics'}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={startQuiz} size="lg" className="min-w-32">
                    <Play size={16} className="mr-2" />
                    Start Adaptive Quiz
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="category" className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Select Learning Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quizCategories.map((category) => (
                  <Card
                    key={category.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all",
                      selectedCategory?.id === category.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        {category.icon === 'Brain' && <Brain size={20} />}
                        {category.icon === 'PuzzlePiece' && <PuzzlePiece size={20} />}
                        {category.icon === 'StackSimple' && <StackSimple size={20} />}
                        {category.icon === 'Books' && <Books size={20} />}
                        {category.icon === 'Users' && <Users size={20} />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{category.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {category.totalQuestions} questions
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            ~{category.estimatedTime} min
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <div className="space-y-4">
                <Separator />
                
                {/* Show subcategories */}
                <div>
                  <h4 className="font-medium mb-3">Topics Covered:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedCategory.subCategories.map((subCategory) => (
                      <Badge key={subCategory.id} variant="outline" className="text-xs p-2">
                        {subCategory.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Difficulty Level</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
                      <Card
                        key={difficulty}
                        className={cn(
                          "p-4 cursor-pointer text-center transition-all",
                          selectedDifficulty === difficulty
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedDifficulty(difficulty)}
                      >
                        <Badge className={cn("mb-2", getDifficultyColor(difficulty))}>
                          {difficulty}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {difficulty === 'beginner' && 'Fundamental concepts'}
                          {difficulty === 'intermediate' && 'Applied knowledge'}
                          {difficulty === 'advanced' && 'Expert-level topics'}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={startQuiz} size="lg" className="min-w-32">
                    <Play size={16} className="mr-2" />
                    Start Topic Quiz
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdaptiveLearningQuiz;
