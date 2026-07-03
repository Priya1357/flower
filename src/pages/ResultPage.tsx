import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import ResultCard from '../components/flower/ResultCard';
import type { FlowerResult } from '../App';

interface ResultPageProps {
  result: FlowerResult;
  onFindAnother: () => void;
}

function ResultPage({ result, onFindAnother }: ResultPageProps) {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back/Reset Button */}
        <div className="flex justify-between mb-8">
          <button
            onClick={onFindAnother}
            className="flex items-center text-forest-600 hover:text-forest-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to home</span>
          </button>
        </div>

        {/* Result Card */}
        <ResultCard
          data={result.data}
          image={result.image}
          type={result.type}
        />

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={onFindAnother}
            className="border-sage-300 text-forest-700 hover:bg-sage-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {result.type === 'quiz' ? 'Take Quiz Again' : 'Search Another Flower'}
          </Button>
        </div>

        {/* Decorative closing message */}
        <p className="text-center text-forest-400 mt-12 text-sm italic">
          Every flower tells a story. Yours is just beginning.
        </p>
      </div>
    </div>
  );
}

export default ResultPage;
