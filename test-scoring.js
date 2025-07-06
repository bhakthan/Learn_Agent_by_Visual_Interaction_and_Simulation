// Quick test to verify the scoring logic
console.log('Testing quiz scoring logic...');

// Mock question data (from the actual quiz)
const mockQuestions = [
  {
    id: 'agents-b1',
    question: 'What is an AI agent?',
    options: [
      'A human who works with AI',
      'A software program that can perceive its environment and take actions to achieve goals',
      'A database that stores AI information',
      'A user interface for AI applications'
    ],
    correctAnswer: 1, // 0-based index pointing to option 1
    explanation: 'An AI agent is a software program that can perceive its environment through sensors, process information, and take actions to achieve specific goals autonomously.',
  },
  {
    id: 'agents-b2',
    question: 'Which of these is NOT a key characteristic of AI agents?',
    options: [
      'Autonomy',
      'Reactivity',
      'Proactivity',
      'Inflexibility'
    ],
    correctAnswer: 3, // 0-based index pointing to option 3 (Inflexibility)
    explanation: 'AI agents are characterized by autonomy, reactivity, proactivity, and social ability. Inflexibility is not a desirable characteristic as agents need to adapt to changing environments.',
  }
];

// Mock session with all correct answers
const mockSession = {
  questions: mockQuestions,
  answers: {
    'agents-b1': 1, // User selected option 1 (correct)
    'agents-b2': 3, // User selected option 3 (correct)
  }
};

// Test the scoring logic
const correctAnswers = mockSession.questions.filter(question => {
  const selectedAnswer = mockSession.answers[question.id];
  const selectedAnswerNum = typeof selectedAnswer === 'string' ? parseInt(selectedAnswer) : selectedAnswer;
  // Both selectedAnswerNum and question.correctAnswer are 0-based
  const isCorrect = selectedAnswerNum !== undefined ? selectedAnswerNum === question.correctAnswer : false;
  
  console.log(`Question ${question.id}:`);
  console.log(`  Selected: ${selectedAnswer} (${mockSession.questions.find(q => q.id === question.id).options[selectedAnswer]})`);
  console.log(`  Correct: ${question.correctAnswer} (${question.options[question.correctAnswer]})`);
  console.log(`  Is Correct: ${isCorrect}`);
  console.log('');
  
  return isCorrect;
}).length;

const totalQuestions = mockSession.questions.length;
const score = Math.round((correctAnswers / totalQuestions) * 100);

console.log(`Final Score: ${correctAnswers}/${totalQuestions} = ${score}%`);
