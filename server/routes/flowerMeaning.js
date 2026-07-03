/**
 * Flower Meaning Route
 * POST /api/flower-meaning
 */
import express from 'express';
import { getFlowerMeaning } from '../services/claudeService.js';
import { fetchWikipediaContent } from '../services/wikipediaService.js';
import { fetchImage } from '../services/imageService.js';

const router = express.Router();

// Sanitize input
function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

// Validate flower name
function validateFlowerName(flowerName) {
  const sanitized = sanitize(flowerName);
  if (!sanitized) {
    return { valid: false, error: 'Please enter a flower name' };
  }
  if (sanitized.length > 100) {
    return { valid: false, error: 'Flower name is too long' };
  }
  return { valid: true, sanitized };
}

router.post('/', async (req, res) => {
  console.log('🌸 [flowerMeaning] Route hit — flowerName:', req.body.flowerName);

  try {
    // Validate and sanitize input
    const validation = validateFlowerName(req.body.flowerName);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const flowerName = validation.sanitized;
    console.log('🌿 [flowerMeaning] Fetching Wikipedia for:', flowerName);

    // Step 1: Fetch Wikipedia content
    const wikiResult = await fetchWikipediaContent(flowerName);
    console.log('📖 [flowerMeaning] Wikipedia done — content length:', wikiResult.content.length);
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 2: Get flower meaning from AI
    let profile;
    try {
      console.log('🤖 [flowerMeaning] Calling Claude/AI now...');
      profile = await getFlowerMeaning(flowerName, wikiResult.content);
      console.log('✅ [flowerMeaning] AI response received');
    } catch (error) {
      console.error('❌ [flowerMeaning] Meaning generation error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message // real error shown for debugging
      });
    }

    // Step 3: Fetch image
    console.log('🖼️ [flowerMeaning] Fetching image...');
    const image = await fetchImage(
      profile.imageQuery || `${flowerName} flower`,
      flowerName,
      wikiResult.imageUrl
    );

    console.log('🎉 [flowerMeaning] Success — sending response');

    res.json({
      success: true,
      type: 'meaning',
      data: profile,
      image
    });

  } catch (error) {
    console.error('💥 [flowerMeaning] Unexpected error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;