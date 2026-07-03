import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { FlowerResult } from '../App';

interface Question {
  id: string;
  question: string;
  chips: string[];
  multiSelect: boolean;
  helperText: string;
  placeholder?: string;
  optional?: boolean;
}

// Quiz questions configuration
const QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: "How would your closest friend describe you in one word?",
    chips: ['Sleepyhead', 'Comfy', 'Adventurous', 'Dreamer', 'Loyal', 'Witty', 'Fierce', 'Gentle', 'Chaotic', 'Reliable'],
    multiSelect: true,
    helperText: "pick as many as you like"
  },
  {
    id: 'q2',
    question: "What environment makes you feel most at peace?",
    chips: ['Forest', 'Ocean', 'Mountains', 'City at night', 'A cozy room', 'Open fields', 'Rainy weather', 'Desert'],
    multiSelect: true,
    helperText: "pick as many as you like"
  },
  {
    id: 'q3',
    question: "What value matters most to you?",
    chips: ['Loyalty', 'Freedom', 'Creativity', 'Resilience', 'Love', 'Wisdom', 'Honesty', 'Adventure'],
    multiSelect: false,
    helperText: "pick one"
  },
  {
    id: 'q4',
    question: "How do you handle difficult emotions?",
    chips: ['I reflect quietly', 'I talk to someone', 'I create something', 'I go outside', 'I distract myself', 'I sit with it'],
    multiSelect: false,
    helperText: "pick one"
  },
  {
    id: 'q5',
    question: "What word describes your energy?",
    chips: ['Warm', 'Mysterious', 'Bright', 'Calm', 'Wild', 'Grounded', 'Playful', 'Intense'],
    multiSelect: true,
    helperText: "pick as many as you like"
  },
  {
    id: 'q6',
    question: "Is there anything specific about yourself you'd like your flower to reflect?",
    chips: [],
    multiSelect: false,
    helperText: "",
    placeholder: "A memory, a feeling, a season of your life, or simply a word that is just you...",
    optional: true
  }
];

const TOAST_MESSAGES = [
  "Great start!",
  "You're doing beautifully",
  "Halfway there \uD83C\uDF3C",
  "Almost there",
  "One last thing...",
  "Finding your flower..."
];

interface QuizPageProps {
  onBack: () => void;
  onShowResult: (result: FlowerResult) => void;
}

function QuizPage({ onBack, onShowResult }: QuizPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedChips, setSelectedChips] = useState<Record<string, Set<string>>>({});
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  // Initialize selected chips for current question
  useEffect(() => {
    const existingAnswer = answers[question.id];
    if (existingAnswer && question.chips.length > 0) {
      const matchedChips = existingAnswer.split(', ').filter((c) => question.chips.includes(c));
      const chips = new Set<string>(matchedChips);
      setSelectedChips(prev => ({ ...prev, [question.id]: chips }));
      setTextInput(existingAnswer);
    } else if (existingAnswer) {
      setTextInput(existingAnswer);
    } else {
      setSelectedChips(prev => ({ ...prev, [question.id]: new Set<string>() }));
      setTextInput('');
    }
  }, [currentQuestion, question.id, question.chips, answers]);

  const handleChipClick = useCallback((chip: string) => {
    const currentChips = selectedChips[question.id] || new Set();
    const newChips = new Set(currentChips);

    if (question.multiSelect) {
      if (newChips.has(chip)) {
        newChips.delete(chip);
      } else {
        newChips.add(chip);
      }
    } else {
      newChips.clear();
      newChips.add(chip);
    }

    setSelectedChips(prev => ({ ...prev, [question.id]: newChips }));
    setTextInput(Array.from(newChips).join(', '));
  }, [question.id, question.multiSelect, selectedChips]);

  const canProceed = question.optional || textInput.trim().length > 0;

  const handleNext = async () => {
    // Save answer
    const newAnswers = { ...answers, [question.id]: textInput.trim() };
    setAnswers(newAnswers);

    // Show toast after delay
    setTimeout(() => {
      toast.success(TOAST_MESSAGES[currentQuestion], {
        duration: 2000,
        style: {
          background: '#6b8062',
          color: 'white',
          fontSize: '12px',
        }
      });
    }, 2500);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit quiz
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/find-flower`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers })
        });

        const result = await response.json();

        if (result.success) {
          onShowResult(result);
        } else {
          toast.error(result.error || 'Could not find your flower. Please try again.');
          setIsLoading(false);
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      // Save current answer before going back
      setAnswers(prev => ({ ...prev, [question.id]: textInput.trim() }));
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  const handleSkip = () => {
    setTextInput('');
    handleNext();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-200 flex items-center justify-center">
            <span className="text-4xl">🌸</span>
          </div>
          <h2 className="font-serif text-2xl text-forest-800 mb-2">Finding your flower...</h2>
          <p className="text-forest-600">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-forest-600 hover:text-forest-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>{currentQuestion === 0 ? 'Back to home' : 'Previous question'}</span>
        </button>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-forest-600 mb-3">
            <span>Question {currentQuestion + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="flex items-center gap-1">
            {QUESTIONS.map((_, idx) => (
              <div key={idx} className="flex-1 flex items-center">
                <div
                  className={`w-full h-2 rounded-full transition-all duration-300 ${
                    idx < currentQuestion
                      ? 'bg-sage-500'
                      : idx === currentQuestion
                      ? 'bg-sage-300'
                      : 'bg-sage-100'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-2">
            {QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  idx <= currentQuestion ? 'bg-sage-400' : 'bg-sage-200 border border-dashed border-sage-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-bloom">
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-2xl md:text-3xl text-forest-800 leading-tight">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Input */}
            {question.chips.length > 0 ? (
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your answer..."
                className="bg-cream-50 border-sage-200 focus:border-sage-400 focus:ring-sage-400"
              />
            ) : (
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={question.placeholder}
                className="min-h-[120px] bg-cream-50 border-sage-200 focus:border-sage-400 focus:ring-sage-400 resize-none"
              />
            )}

            {/* Chips */}
            {question.chips.length > 0 && (
              <div>
                <p className="text-sm text-forest-500 mb-3">
                  Or pick one{question.multiSelect ? ` ${question.helperText}` : ''}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {question.chips.map((chip) => {
                    const isSelected = selectedChips[question.id]?.has(chip);
                    return (
                      <button
                        key={chip}
                        onClick={() => handleChipClick(chip)}
                        aria-pressed={isSelected}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-sage-600 text-white shadow-md'
                            : 'bg-cream-100 text-forest-700 hover:bg-cream-200 border border-sage-200'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4">
              <div>
                {question.optional && (
                  <Button
                    variant="link"
                    onClick={handleSkip}
                    className="text-forest-500 hover:text-forest-700"
                  >
                    Skip this question
                  </Button>
                )}
              </div>
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-sage-600 hover:bg-sage-700 text-white px-6"
              >
                {currentQuestion === QUESTIONS.length - 1 ? 'Find My Flower' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default QuizPage;
