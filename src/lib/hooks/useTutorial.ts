import { useState, useEffect, useCallback } from 'react';

export type TutorialStep = {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  actionRequired?: boolean; // Whether user needs to perform action to proceed
  actionType?: 'click' | 'hover' | 'input' | 'navigation';
};

export type TutorialConfig = {
  id: string;
  name: string;
  steps: TutorialStep[];
};

const STORAGE_KEY = 'azure-ai-agent-tutorial';

export const useTutorial = (tutorialId: string, config: TutorialConfig) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const [hasShownTutorial, setHasShownTutorial] = useState(false);

  // Initialize tutorial state from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const data = JSON.parse(savedData);
      setCompletedTutorials(data.completed || []);
      setHasShownTutorial(data.completed?.includes(tutorialId) || false);
    }
    
    // Check if this is the first visit
    const isFirstVisit = localStorage.getItem(`${STORAGE_KEY}-first-visit`) !== 'false';
    if (isFirstVisit && !hasShownTutorial) {
      // Only auto-show tutorial on first visit
      setIsActive(true);
      localStorage.setItem(`${STORAGE_KEY}-first-visit`, 'false');
    }
  }, [tutorialId]);

  // Save completed tutorials to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completed: completedTutorials,
    }));
  }, [completedTutorials]);

  const currentStep = config.steps[currentStepIndex];

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
  }, []);

  const endTutorial = useCallback((completed = false) => {
    setIsActive(false);
    if (completed && !completedTutorials.includes(tutorialId)) {
      setCompletedTutorials([...completedTutorials, tutorialId]);
    }
  }, [tutorialId, completedTutorials]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < config.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endTutorial(true);
    }
  }, [currentStepIndex, config.steps.length, endTutorial]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < config.steps.length) {
      setCurrentStepIndex(index);
    }
  }, [config.steps.length]);

  const resetTutorial = useCallback(() => {
    // Remove tutorial from completed list
    if (completedTutorials.includes(tutorialId)) {
      setCompletedTutorials(completedTutorials.filter(id => id !== tutorialId));
    }
    setHasShownTutorial(false);
  }, [tutorialId, completedTutorials]);

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: config.steps.length,
    hasCompletedTutorial: completedTutorials.includes(tutorialId),
    progress: Math.round(((currentStepIndex + 1) / config.steps.length) * 100),
    startTutorial,
    endTutorial,
    nextStep,
    prevStep,
    goToStep,
    resetTutorial
  };
};