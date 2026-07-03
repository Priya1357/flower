/**
 * Find My Flower Route
 * POST /api/find-flower
 */
import express from 'express';
import { findFlowerName, getFlowerProfile } from '../services/claudeService.js';
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

// Validate quiz answers
function validateAnswers(answers) {
  if (!answers || typeof answers !== 'object') {
    return { valid: false, error: 'Please provide your quiz answers' };
  }

  const required = ['q1', 'q2', 'q3', 'q4', 'q5'];
  for (const key of required) {
    const val = sanitize(answers[key]);
    if (!val) {
      return { valid: false, error: `Please answer question ${key.replace('q', '')}` };
    }
  }

  return {
    valid: true,
    sanitized: {
      q1: sanitize(answers.q1),
      q2: sanitize(answers.q2),
      q3: sanitize(answers.q3),
      q4: sanitize(answers.q4),
      q5: sanitize(answers.q5),
      q6: sanitize(answers.q6 || '')
    }
  };
}

router.post('/', async (req, res) => {
  console.log('🌸 [findFlower] Route hit — answers:', req.body.answers);

  try {
    // Validate and sanitize answers
    const validation = validateAnswers(req.body.answers);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    const answers = validation.sanitized;

    // Step 1: Get flower name from AI
    let flowerResult;
    try {
      console.log('🤖 [findFlower] Step 1 — calling AI for flower name...');
      flowerResult = await findFlowerName(answers);
      console.log('✅ [findFlower] Step 1 complete — flower:', flowerResult.flowerName);
    } catch (error) {
      console.error('❌ [findFlower] Step 1 error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Small delay to avoid OpenRouter rate limit between two consecutive calls
    await new Promise(resolve => setTimeout(resolve, 3000));

    const flowerName = flowerResult.flowerName;

    // Step 2: Fetch Wikipedia content for the matched flower
    console.log('🌿 [findFlower] Fetching Wikipedia for:', flowerName);
    const wikiResult = await fetchWikipediaContent(flowerName);
    console.log('📖 [findFlower] Wikipedia done — content length:', wikiResult.content.length);

    // Step 3: Get full flower profile from AI
    let profile;
    try {
      console.log('🤖 [findFlower] Step 2 — calling AI for full profile...');
      profile = await getFlowerProfile(answers, flowerName, wikiResult.content);
      console.log('✅ [findFlower] Step 2 complete — fields:', Object.keys(profile));
    } catch (error) {
      console.error('❌ [findFlower] Step 2 error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Step 4: Fetch image
    console.log('🖼️ [findFlower] Fetching image...');
    const image = await fetchImage(
      profile.imageQuery || `${flowerName} flower`,
      flowerName,
      wikiResult.imageUrl
    );

    console.log('🎉 [findFlower] Success — sending response');

    res.json({
      success: true,
      type: 'quiz',
      data: profile,
      image
    });

  } catch (error) {
    console.error('💥 [findFlower] Unexpected error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;