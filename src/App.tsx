import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import FlowerMeaningPage from './pages/FlowerMeaningPage';
import ResultPage from './pages/ResultPage';

export type AppView = 'landing' | 'quiz' | 'meaning' | 'result';

export interface FlowerResult {
  type: 'quiz' | 'meaning';
  data: {
    flowerName: string;
    scientificName: string;
    tagline?: string;
    personalityTraits?: string[];
    whyItMatchesYou?: string;
    symbolism: string;
    myths: string;
    culturalFacts: string;
    funFact: string;
  };
  image: {
    source: 'unsplash' | 'wikipedia' | 'placeholder';
    url: string | null;
    displayName?: string;
  };
}

function App() {
  const [view, setView] = useState<AppView>('landing');
  const [result, setResult] = useState<FlowerResult | null>(null);

  const handleNavigate = (newView: AppView) => {
    setView(newView);
  };

  const handleShowResult = (flowerResult: FlowerResult) => {
    setResult(flowerResult);
    setView('result');
  };

  const handleReset = () => {
    setResult(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen botanical-bg">
      {view === 'landing' && (
        <LandingPage onNavigate={handleNavigate} />
      )}
      {view === 'quiz' && (
        <QuizPage
          onBack={() => handleNavigate('landing')}
          onShowResult={handleShowResult}
        />
      )}
      {view === 'meaning' && (
        <FlowerMeaningPage
          onBack={() => handleNavigate('landing')}
          onShowResult={handleShowResult}
        />
      )}
      {view === 'result' && result && (
        <ResultPage
          result={result}
          onFindAnother={handleReset}
        />
      )}
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
