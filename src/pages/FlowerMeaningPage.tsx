import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import type { FlowerResult } from '../App';

// Common flower names for autocomplete
const FLOWER_NAMES = [
  'Amaryllis', 'Anemone', 'Azalea', 'Baby\'s Breath', 'Begonia', 'Black-eyed Susan',
  'Bleeding Heart', 'Bluebell', 'Buttercup', 'Camellia', 'Carnation', 'Cherry Blossom',
  'Chrysanthemum', 'Crocus', 'Dahlia', 'Daisy', 'Dandelion', 'Daffodil', 'Forget-me-not',
  'Foxglove', 'Freesia', 'Gardenia', 'Geranium', 'Gerbera', 'Gloriosa', 'Gladiolus',
  'Hibiscus', 'Hollyhock', 'Hyacinth', 'Hydrangea', 'Iris', 'Impatiens', 'Jasmine',
  'Lavender', 'Lilac', 'Lily', 'Lily of the Valley', 'Lotus', 'Magnolia', 'Marigold',
  'Morning Glory', 'Narcissus', 'Orchid', 'Pansy', 'Passion Flower', 'Peony',
  'Petunia', 'Poppy', 'Primrose', 'Protea', 'Ranunculus', 'Rhododendron', 'Rose',
  'Sakura', 'Snapdragon', 'Snowdrop', 'Sunflower', 'Sweet Pea', 'Tulip', 'Violet',
  'Water Lily', 'Wisteria', 'Zinnia', 'Bird of Paradise', 'Calla Lily', 'Chamomile',
  'Cherry Blossom', 'Cornflower', 'Cosmos', 'Edelweiss', 'Fuchsia', 'Iris',
  'Jasmine', 'Lavender', 'Lilac', 'Magnolia', 'Peony', 'Rose', 'Sunflower', 'Tulip'
]; // Duplicates for robustness in random selection

interface FlowerMeaningPageProps {
  onBack: () => void;
  onShowResult: (result: FlowerResult) => void;
}

function FlowerMeaningPage({ onBack, onShowResult }: FlowerMeaningPageProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (query.length > 0) {
      const filtered = FLOWER_NAMES.filter(name =>
        name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = async (flowerName: string = query) => {
    if (!flowerName.trim()) {
      toast.error('Please enter a flower name');
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/flower-meaning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowerName: flowerName.trim() })
      });

      const result = await response.json();

      if (result.success) {
        onShowResult(result);
      } else {
        toast.error(result.error || 'Could not find that flower. Please check the spelling.');
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSurpriseMe = () => {
    const randomFlower = FLOWER_NAMES[Math.floor(Math.random() * FLOWER_NAMES.length)];
    setQuery(randomFlower);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      handleSearch(randomFlower);
    }, 500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-100 flex items-center justify-center">
            <span className="text-4xl">🌺</span>
          </div>
          <h2 className="font-serif text-2xl text-forest-800 mb-2">Searching flower meanings...</h2>
          <p className="text-forest-600">Gathering botanical wisdom</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center text-forest-600 hover:text-forest-800 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to home</span>
        </button>

        {/* Search Card */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-bloom">
          <CardHeader className="text-center pb-2">
            <h1 className="font-serif text-3xl text-forest-800 mb-2">
              What does your flower mean?
            </h1>
            <p className="text-forest-600">
              Search any flower to discover its symbolism, myths, and cultural significance
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input with Autocomplete */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Type a flower name..."
                  className={`pl-10 pr-4 bg-cream-50 border-sage-200 focus:border-sage-400 focus:ring-sage-400 transition-all ${
                    isAnimating ? 'animate-pulse border-rose-300' : ''
                  }`}
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-sage-200 overflow-hidden animate-fade-in">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-sage-50 transition-colors flex items-center gap-2 text-forest-700"
                    >
                      <Search className="w-4 h-4 text-sage-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleSearch()}
                disabled={!query.trim()}
                className="flex-1 bg-sage-600 hover:bg-sage-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                onClick={handleSurpriseMe}
                className="flex-1 border-sage-300 text-forest-700 hover:bg-sage-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Surprise me
              </Button>
            </div>

            {/* Hint */}
            <p className="text-center text-sm text-forest-400">
              Try &quot;Lotus&quot;, &quot;Rose&quot;, or &quot;Sunflower&quot;
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FlowerMeaningPage;
