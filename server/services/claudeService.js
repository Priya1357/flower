/**
 * AI Service
 * Handles all AI API calls via OpenRouter with Gemini fallback
 * Primary: openrouter/auto:free
 * Fallback: Google Gemini 2.5 Flash (free tier)
 */

import {
  buildFlowerSelectionPrompt,
  buildFlowerProfilePrompt,
  buildFlowerMeaningPrompt
} from '../utils/buildPrompt.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const OPENROUTER_MODEL = 'openrouter/auto:free';

// ─────────────────────────────────────────────
// JSON Parser — three-strategy fallback
// Works for both OpenRouter and Gemini responses
// ─────────────────────────────────────────────
function extractJSON(text) {
  if (!text) throw new Error('Empty response from AI');

  console.log('[AI] Raw response preview:', text.substring(0, 200));

  // Strategy 1 — parse as-is
  try { return JSON.parse(text.trim()); } catch {}

  // Strategy 2 — strip markdown fences
  const stripped = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();
  try { return JSON.parse(stripped); } catch {}

  // Strategy 3 — extract first { ... } block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {}
  }

  console.error('[AI] All JSON parse strategies failed. Full response:', text);
  throw new Error('Invalid JSON response from AI');
}

// ─────────────────────────────────────────────
// OpenRouter caller (primary)
// ─────────────────────────────────────────────
async function callOpenRouter(systemPrompt, userPrompt, maxTokens = 1024) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  console.log('[OpenRouter] Key check:', OPENROUTER_API_KEY ? 'LOADED ✅' : 'MISSING ❌');
  console.log('[OpenRouter] Sending request — model:', OPENROUTER_MODEL);

  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set');

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://find-your-flower.app',
      'X-Title': 'Find Your Flower'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OpenRouter] API error:', response.status, errorText);

    if (response.status === 401) throw new Error('AUTH_ERROR: Invalid OpenRouter API key');
    if (response.status === 402) throw new Error('CREDITS_ERROR: OpenRouter credits exhausted');
    if (response.status === 429) throw new Error('RATE_LIMIT: OpenRouter rate limit hit');
    throw new Error(`OPENROUTER_ERROR: ${response.status}`);
  }

  const data = await response.json();
  console.log('[OpenRouter] Response received — tokens used:', data.usage?.total_tokens ?? 'unknown');

  const content = data.choices?.[0]?.message?.content || '';
  return extractJSON(content);
}

// ─────────────────────────────────────────────
// Gemini caller (fallback)
// ─────────────────────────────────────────────
async function callGemini(systemPrompt, userPrompt, maxTokens = 2048) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  console.log('[Gemini] Key check:', GEMINI_API_KEY ? 'LOADED ✅' : 'MISSING ❌');
  console.log('[Gemini] Sending request — model: gemini-2.5-flash');

  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: maxTokens * 2  // Gemini needs more room than OpenRouter
        }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Gemini] API error:', response.status, errorText);

    if (response.status === 429) throw new Error('RATE_LIMIT: Gemini rate limit hit');
    throw new Error(`GEMINI_ERROR: ${response.status}`);
  }

  const data = await response.json();
  console.log('[Gemini] Response received');

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return extractJSON(content);
}

// ─────────────────────────────────────────────
// Smart caller — tries OpenRouter first,
// silently falls back to Gemini on rate limit
// ─────────────────────────────────────────────
async function callAI(systemPrompt, userPrompt, maxTokens = 1024) {
  try {
    return await callOpenRouter(systemPrompt, userPrompt, maxTokens);
  } catch (error) {
    // Only fall back to Gemini on rate limit errors
    // Auth errors and credit errors should surface immediately
    if (error.message.startsWith('RATE_LIMIT') || error.message.startsWith('OPENROUTER_ERROR')) {
      console.log('[AI] OpenRouter failed — switching to Gemini fallback 🔄');
      try {
        return await callGemini(systemPrompt, userPrompt, maxTokens);
      } catch (geminiError) {
        console.error('[Gemini] Fallback also failed:', geminiError.message);
        // Both services failed — throw a user-friendly error
        throw new Error('Our AI services are temporarily busy. Please wait a moment and try again.');
      }
    }
    // For auth/credits errors, throw immediately with clear message
    throw error;
  }
}

// ─────────────────────────────────────────────
// Find My Flower — Step 1
// Returns only { flowerName: "..." }
// ─────────────────────────────────────────────
export async function findFlowerName(answers) {
  console.log('[claudeService] Step 1 — selecting flower');

  const prompts = buildFlowerSelectionPrompt(answers);

  const reinforcedUserPrompt = `${prompts.userPrompt}

IMPORTANT: Your response must be a single valid JSON object and nothing else.
Start with { and end with }. No other text before or after.
Example: { "flowerName": "Lotus" }`;

  const result = await callAI(prompts.systemPrompt, reinforcedUserPrompt, 256);

  console.log('[claudeService] Step 1 result:', result);

  if (!result.flowerName) throw new Error('AI did not return a flowerName in Step 1');

  return result;
}

// ─────────────────────────────────────────────
// Find My Flower — Step 2
// Returns the full personalized flower profile
// ─────────────────────────────────────────────
export async function getFlowerProfile(answers, flowerName, wikipediaContent) {
  console.log('[claudeService] Step 2 — building profile for:', flowerName);

  const prompts = buildFlowerProfilePrompt(answers, flowerName, wikipediaContent);

  const reinforcedUserPrompt = `${prompts.userPrompt}

IMPORTANT: Your response must be a single valid JSON object and nothing else.
Start with { and end with }. No explanation, no markdown, no text outside the JSON.`;

  const result = await callAI(prompts.systemPrompt, reinforcedUserPrompt, 1024);

  console.log('[claudeService] Step 2 result fields:', Object.keys(result));

  const requiredFields = ['flowerName', 'scientificName', 'tagline', 'whyItMatchesYou', 'symbolism', 'myths', 'culturalFacts', 'funFact', 'imageQuery'];
  const missingFields = requiredFields.filter(f => !result[f]);
  if (missingFields.length > 0) {
    console.warn('[claudeService] Step 2 missing fields:', missingFields);
  }

  return result;
}

// ─────────────────────────────────────────────
// Flower Meaning — single call
// Returns the full flower meaning profile
// ─────────────────────────────────────────────
export async function getFlowerMeaning(flowerName, wikipediaContent) {
  console.log('[claudeService] Flower Meaning — looking up:', flowerName);

  const prompts = buildFlowerMeaningPrompt(flowerName, wikipediaContent);

  const reinforcedUserPrompt = `${prompts.userPrompt}

IMPORTANT: Your response must be a single valid JSON object and nothing else.
Start with { and end with }. No explanation, no markdown, no text outside the JSON.
The personalityTraits field must be a JSON array of strings like: ["trait1", "trait2", "trait3"]`;

  const result = await callAI(prompts.systemPrompt, reinforcedUserPrompt, 1024);

  console.log('[claudeService] Flower Meaning result fields:', Object.keys(result));

  if (result.personalityTraits && !Array.isArray(result.personalityTraits)) {
    result.personalityTraits = [result.personalityTraits];
  }
  if (!result.personalityTraits) result.personalityTraits = [];

  return result;
}

export default { findFlowerName, getFlowerProfile, getFlowerMeaning };