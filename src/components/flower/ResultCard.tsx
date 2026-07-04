import { useState } from 'react';
import { Share2, Copy, Download, X } from 'lucide-react';
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  // ─────────────────────────────────────────────
  // Rich formatted share text
  // ─────────────────────────────────────────────
  const getShareText = () => {
    if (type === 'quiz') {
      return [
        `🌸 My flower is the ${data.flowerName}`,
        `${data.scientificName}`,
        ``,
        data.tagline ? `✨ "${data.tagline}"` : '',
        ``,
        data.whyItMatchesYou ? `💫 Why it matches me:\n${data.whyItMatchesYou}` : '',
        ``,
        `🌿 Symbolism:\n${data.symbolism.slice(0, 180)}...`,
        ``,
        `🔍 Discover your flower at Find Your Flower!`,
      ].filter(line => line !== undefined).join('\n').trim();
    } else {
      return [
        `🌸 ${data.flowerName}`,
        `${data.scientificName}`,
        ``,
        data.personalityTraits?.length
          ? `✨ Personality traits: ${data.personalityTraits.join(', ')}`
          : '',
        ``,
        `🌿 Symbolism:\n${data.symbolism.slice(0, 180)}...`,
        ``,
        `📖 Fun Fact:\n${data.funFact}`,
        ``,
        `🔍 Discover your flower at Find Your Flower!`,
      ].filter(line => line !== undefined).join('\n').trim();
    }
  };

  // ─────────────────────────────────────────────
  // Copy text to clipboard
  // ─────────────────────────────────────────────
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      toast.success('Copied to clipboard! 🌸');
      setShowShareModal(false);
    } catch {
      toast.error('Could not copy text. Please try again.');
    }
  };

  // ─────────────────────────────────────────────
  // Generate and download share image card
  // Uses the already-fetched Unsplash/Wikipedia image
  // No extra API calls or tokens needed
  // ─────────────────────────────────────────────
  const handleSaveImage = async () => {
    setGeneratingImage(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Square card — great for Instagram and WhatsApp
      canvas.width = 1080;
      canvas.height = 1080;

      // ── Step 1: Draw background ──
      if (image.url && image.source !== 'placeholder') {
        // Load the existing Unsplash/Wikipedia image with CORS headers
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // Fill canvas with image (cover fit)
            const scale = Math.max(
              canvas.width / img.width,
              canvas.height / img.height
            );
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            resolve();
          };
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = image.url!;
        });
      } else {
        // Placeholder background — soft botanical gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#d4e4d4');
        gradient.addColorStop(0.5, '#f5ede8');
        gradient.addColorStop(1, '#e8ddd0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // ── Step 2: Dark gradient overlay (bottom 60%) ──
      const overlay = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height);
      overlay.addColorStop(0, 'rgba(0, 0, 0, 0)');
      overlay.addColorStop(0.4, 'rgba(0, 0, 0, 0.55)');
      overlay.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ── Step 3: Top left branding pill ──
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(40, 40, 280, 56, 28);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '500 26px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🌸 Find Your Flower!', 68, 75);

      // ── Step 4: Flower name (large serif) ──
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 88px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 16;

      // Word wrap flower name if long
      const name = data.flowerName;
      if (ctx.measureText(name).width > 960) {
        const words = name.split(' ');
        const mid = Math.ceil(words.length / 2);
        ctx.fillText(words.slice(0, mid).join(' '), 540, 760);
        ctx.fillText(words.slice(mid).join(' '), 540, 860);
      } else {
        ctx.fillText(name, 540, 800);
      }

      // ── Step 5: Scientific name (italic) ──
      ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = 'italic 38px Georgia, serif';
      ctx.fillText(data.scientificName, 540, 860);

      // ── Step 6: Tagline or traits ──
      ctx.shadowBlur = 6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '32px Georgia, serif';

      if (type === 'quiz' && data.tagline) {
        const tagline = `"${data.tagline}"`;
        // Wrap tagline if too long
        const maxWidth = 900;
        if (ctx.measureText(tagline).width > maxWidth) {
          const words = tagline.split(' ');
          let line = '';
          let y = 930;
          for (const word of words) {
            const testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > maxWidth && line !== '') {
              ctx.fillText(line.trim(), 540, y);
              line = word + ' ';
              y += 44;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line.trim(), 540, y);
        } else {
          ctx.fillText(tagline, 540, 940);
        }
      } else if (type === 'meaning' && data.personalityTraits?.length) {
        ctx.fillText(data.personalityTraits.slice(0, 4).join('  ·  '), 540, 940);
      }

      // ── Step 7: Bottom URL strip ──
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, 1020, 1080, 60);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Every flower tells a story. Find yours.', 540, 1054);

      // ── Step 8: Download as PNG ──
      const link = document.createElement('a');
      link.download = `${data.flowerName.toLowerCase().replace(/\s+/g, '-')}-flower-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Image saved! 🌸');
      setShowShareModal(false);
    } catch (err) {
      console.error('Share image error:', err);
      // Fallback: if image fails due to CORS, generate a text-only card
      toast.error('Could not load flower image for the card. Try copying the text instead.');
    } finally {
      setGeneratingImage(false);
    }
  };

  // ─────────────────────────────────────────────
  // Native share (mobile) or show modal (desktop)
  // ─────────────────────────────────────────────
  const handleShareClick = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden animate-bloom">
        {/* Image Section */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-br from-sage-100 to-cream-100">
          {image.source !== 'placeholder' && image.url ? (
            <img
              src={image.url}
              alt={data.flowerName}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
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

          {/* Fun Fact */}
          <div className="bg-gradient-to-r from-sage-100 to-cream-100 rounded-xl p-5 border-l-4 border-sage-500">
            <h3 className="font-serif text-lg text-forest-800 mb-2">Fun Fact</h3>
            <p className="text-forest-700 leading-relaxed">{data.funFact}</p>
          </div>

          {/* Share Button */}
          <div className="pt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={handleShareClick}
              className="border-sage-300 text-forest-700 hover:bg-sage-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share this flower
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-forest-800">Share your flower</h3>
                <p className="text-forest-500 text-sm mt-0.5">Choose how you'd like to share</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-forest-400 hover:text-forest-700 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview text */}
            <div className="bg-sage-50 rounded-xl p-4 text-sm text-forest-700 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto border border-sage-100">
              {getShareText()}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {/* Copy text */}
              <button
                onClick={handleCopyText}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-sage-200 hover:bg-sage-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                  <Copy className="w-5 h-5 text-forest-700" />
                </div>
                <div>
                  <p className="font-medium text-forest-800">Copy text</p>
                  <p className="text-forest-500 text-sm">Paste anywhere — WhatsApp, notes, social</p>
                </div>
              </button>

              {/* Save image card */}
              <button
                onClick={handleSaveImage}
                disabled={generatingImage}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-sage-200 hover:bg-sage-50 transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <p className="font-medium text-forest-800">
                    {generatingImage ? 'Creating your card...' : 'Save image card'}
                  </p>
                  <p className="text-forest-500 text-sm">Download a beautiful shareable card</p>
                </div>
              </button>
            </div>

            <p className="text-center text-forest-400 text-xs">
              Uses the flower photo — no new AI requests
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ResultCard;