import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface ResultCardProps {
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
  type: 'quiz' | 'meaning';
}

function ResultCard({ data, image, type }: ResultCardProps) {
  const handleShare = async () => {
    const shareText = type === 'quiz'
      ? `I discovered my flower match: ${data.flowerName}! ${data.tagline}\n\nSymbolism: ${data.symbolism.slice(0, 100)}...`
      : `${data.flowerName} (${data.scientificName})\n\nSymbolism: ${data.symbolism.slice(0, 100)}...`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Find Your Flower!',
          text: shareText,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden animate-bloom">
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-sage-100 to-cream-100">
        {image.source !== 'placeholder' && image.url ? (
          <img
            src={image.url}
            alt={data.flowerName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage-200 via-rose-100 to-cream-200">
            <span className="font-serif text-4xl md:text-6xl text-forest-700/80 text-center px-8 leading-tight">
              {image.displayName || data.flowerName}
            </span>
          </div>
        )}
      </div>

      <CardHeader className="text-center pb-2 pt-6">
        <CardTitle className="font-serif text-4xl md:text-5xl text-forest-800 mb-2">
          {data.flowerName}
        </CardTitle>
        <p className="text-forest-500 italic text-lg">
          {data.scientificName}
        </p>
      </CardHeader>

      <CardContent className="space-y-6 px-6">
        {/* Tagline (Quiz only) */}
        {type === 'quiz' && data.tagline && (
          <div className="text-center py-4 bg-sage-50 rounded-xl">
            <p className="font-serif text-xl text-forest-700 italic">
              &ldquo;{data.tagline}&rdquo;
            </p>
          </div>
        )}

        {/* Personality Traits (Meaning only) */}
        {type === 'meaning' && data.personalityTraits && (
          <div className="flex flex-wrap justify-center gap-2">
            {data.personalityTraits.map((trait, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Why It Matches You (Quiz only) */}
        {type === 'quiz' && data.whyItMatchesYou && (
          <div className="space-y-2">
            <h3 className="font-serif text-xl text-forest-800">Why it matches you</h3>
            <p className="text-forest-700 leading-relaxed">{data.whyItMatchesYou}</p>
          </div>
        )}

        {/* Symbolism */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl text-forest-800">Symbolism</h3>
          <p className="text-forest-700 leading-relaxed">{data.symbolism}</p>
        </div>

        {/* Myths & Legends */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl text-forest-800">Myths & Legends</h3>
          <p className="text-forest-700 leading-relaxed">{data.myths}</p>
        </div>

        {/* Cultural Facts */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl text-forest-800">Cultural Significance</h3>
          <p className="text-forest-700 leading-relaxed">{data.culturalFacts}</p>
        </div>

        {/* Fun Fact - Highlighted */}
        <div className="bg-gradient-to-r from-sage-100 to-cream-100 rounded-xl p-5 border-l-4 border-sage-500">
          <h3 className="font-serif text-lg text-forest-800 mb-2">Fun Fact</h3>
          <p className="text-forest-700 leading-relaxed">{data.funFact}</p>
        </div>

        {/* Share Button */}
        <div className="pt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={handleShare}
            className="border-sage-300 text-forest-700 hover:bg-sage-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share this flower
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResultCard;
