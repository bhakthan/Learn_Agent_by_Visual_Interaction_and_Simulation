import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TutorialOverlay } from './TutorialOverlay';
import { useTutorial, TutorialConfig } from '@/lib/hooks/useTutorial';

// Define tutorial context
interface TutorialContextValue {
  startTutorial: (tutorialId: string) => void;
  endTutorial: () => void;
  registerTutorial: (id: string, config: TutorialConfig) => void;
  isTutorialActive: boolean;
  activeTutorialId: string | null;
  hasCompletedTutorial: (tutorialId: string) => boolean;
}

const TutorialContext = createContext<TutorialContextValue>({
  startTutorial: () => {},
  endTutorial: () => {},
  registerTutorial: () => {},
  isTutorialActive: false,
  activeTutorialId: null,
  hasCompletedTutorial: () => false
});

export const useTutorialContext = () => useContext(TutorialContext);

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [tutorials, setTutorials] = useState<Record<string, TutorialConfig>>({});
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  
  // Load completed tutorials from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('azure-ai-agent-tutorial');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setCompletedTutorials(data.completed || []);
      } catch (e) {
        console.error('Error parsing tutorial data from localStorage', e);
      }
    }
  }, []);
  
  // Get active tutorial config
  const activeTutorial = activeTutorialId ? tutorials[activeTutorialId] : null;
  
  // Initialize tutorial hook if we have an active tutorial
  const tutorial = activeTutorial
    ? useTutorial(activeTutorialId as string, activeTutorial)
    : null;
  
  // Register a tutorial configuration
  const registerTutorial = useCallback((id: string, config: TutorialConfig) => {
    setTutorials(prev => ({
      ...prev,
      [id]: config
    }));
  }, []);
  
  // Start a tutorial
  const startTutorial = useCallback((tutorialId: string) => {
    if (tutorials[tutorialId]) {
      setActiveTutorialId(tutorialId);
    } else {
      console.error(`Tutorial with id "${tutorialId}" not found.`);
    }
  }, [tutorials]);
  
  // End current tutorial
  const endTutorial = useCallback(() => {
    setActiveTutorialId(null);
  }, []);
  
  // Check if a tutorial has been completed
  const hasCompletedTutorial = useCallback((tutorialId: string) => {
    return completedTutorials.includes(tutorialId);
  }, [completedTutorials]);
  
  // Handle tutorial completion
  const handleComplete = useCallback(() => {
    if (activeTutorialId && !completedTutorials.includes(activeTutorialId)) {
      const newCompleted = [...completedTutorials, activeTutorialId];
      setCompletedTutorials(newCompleted);
      
      // Save to localStorage
      localStorage.setItem('azure-ai-agent-tutorial', JSON.stringify({
        completed: newCompleted
      }));
    }
    setActiveTutorialId(null);
  }, [activeTutorialId, completedTutorials]);
  
  return (
    <TutorialContext.Provider
      value={{
        startTutorial,
        endTutorial,
        registerTutorial,
        isTutorialActive: !!activeTutorialId,
        activeTutorialId,
        hasCompletedTutorial
      }}
    >
      {children}
      
      {tutorial && tutorial.isActive && tutorial.currentStep && (
        <TutorialOverlay
          isActive={tutorial.isActive}
          currentStep={tutorial.currentStep}
          currentStepIndex={tutorial.currentStepIndex}
          totalSteps={tutorial.totalSteps}
          progress={tutorial.progress}
          onNext={tutorial.nextStep}
          onPrev={tutorial.prevStep}
          onClose={() => setActiveTutorialId(null)}
          onComplete={handleComplete}
        />
      )}
    </TutorialContext.Provider>
  );
};