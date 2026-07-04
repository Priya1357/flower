/**
 * AI Service
 * Handles all AI API calls via OpenRouter
 * Model: mistralai/mistral-7b-instruct (free tier)
 */

import {
  buildFlowerSelectionPrompt,
  buildFlowerProfilePrompt,
  buildFlowerMeaningPrompt
} from '../utils/buildPrompt.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openrouter/auto:free';
// ─────────────────────────────────────────────
// JSON Parser — three-strategy fallback
// Mistral sometimes wraps JSON in prose or markdown
// so we try multiple extraction strategies before giving up
// ─────────────────────────────────────────────
function parseResponse(response) {
  const content = response.choices?.[0]?.message?.content || '';

  if (!content) {
    console.error('[OpenRouter] Empty response content');
    throw new Error('Empty response from AI');
  }

  console.log('[OpenRouter] Raw response preview:', content.substring(0, 200));

  // Strategy 1 — parse as-is (clean JSON, best case)
  try {
    return JSON.parse(content.trim());
  } catch {}

  // Strategy 2 — strip markdown fences then parse
  const stripped = content
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {}

  // Strategy 3 — extract first { ... } block from anywhere in the response
  // handles cases where Mistral adds prose before or after the JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  // All strategies failed
  console.error('[OpenRouter] All JSON parse strategies failed.');
  console.error('[OpenRouter] Full response:', content);
  throw new Error('Invalid JSON response from AI — could not extract valid JSON');
}

// ─────────────────────────────────────────────
// Core API caller
// ─────────────────────────────────────────────
async function callOpenRouter(systemPrompt, userPrompt, maxTokens = 1024) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;  // ← ADD THIS
  console.log('[OpenRouter] Key check:', OPENROUTER_API_KEY ? 'LOADED ✅' : 'MISSING ❌');
  console.log('[OpenRouter] Sending request — model:', MODEL, '| max_tokens:', maxTokens);

  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://find-your-flower.app',
      'X-Title': 'Find Your Flower'
    },
    body: JSON.stringify({
      model: MODEL,
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

    if (response.status === 401) throw new Error('Invalid OpenRouter API key');
    if (response.status === 402) throw new Error('OpenRouter free credits exhausted — add credits or switch model');
    if (response.status === 429) {
      console.log('[OpenRouter] Rate limited — waiting 5 seconds and retrying once...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      // Retry once
      const retryResponse = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://find-your-flower.app',
          'X-Title': 'Find Your Flower'
    },
        body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!retryResponse.ok) {
    throw new Error('Rate limit hit — please wait a moment and try again');
  }
      const retryData = await retryResponse.json();
      console.log('[OpenRouter] Retry succeeded — tokens used:',
retryData.usage?.total_tokens ?? 'unknown'); // ← ADD THIS
      return parseResponse(retryData);
}
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[OpenRouter] Response received — tokens used:', data.usage?.total_tokens ?? 'unknown');

  return parseResponse(data);
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

  const result = await callOpenRouter(prompts.systemPrompt, reinforcedUserPrompt, 256);

  console.log('[claudeService] Step 1 result:', result);

  if (!result.flowerName) {
    throw new Error('AI did not return a flowerName in Step 1');
  }

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

  const result = await callOpenRouter(prompts.systemPrompt, reinforcedUserPrompt, 1024);

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

  const result = await callOpenRouter(prompts.systemPrompt, reinforcedUserPrompt, 1024);

  console.log('[claudeService] Flower Meaning result fields:', Object.keys(result));

  // Ensure personalityTraits is always an array
  if (result.personalityTraits && !Array.isArray(result.personalityTraits)) {
    result.personalityTraits = [result.personalityTraits];
  }
  if (!result.personalityTraits) {
    result.personalityTraits = [];
  }

  return result;
}

export default {
  findFlowerName,
  getFlowerProfile,
  getFlowerMeaning
};