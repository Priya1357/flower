/**
 * Prompt Construction Utilities
 * Builds prompts for both Find My Flower and Flower Meaning features
 */

const POSSIBLE_ANSWERS_REFERENCE = `
[POSSIBLE ANSWERS REFERENCE]

Q1 — "How would your closest friend describe you in one word?"
  Chip options: Sleepyhead, Comfy, Adventurous, Dreamer, Loyal, Witty, Fierce, Gentle, Chaotic, Reliable
  Also accepts free text or a combination. Multi-select: yes.

Q2 — "What environment makes you feel most at peace?"
  Chip options: Forest, Ocean, Mountains, City at night, A cozy room, Open fields, Rainy weather, Desert
  Also accepts free text or a combination. Multi-select: yes.

Q3 — "What value matters most to you?"
  Chip options: Loyalty, Freedom, Creativity, Resilience, Love, Wisdom, Honesty, Adventure
  Also accepts free text or a combination. Multi-select: no.

Q4 — "How do you handle difficult emotions?"
  Chip options: I reflect quietly, I talk to someone, I create something, I go outside, I distract myself, I sit with it
  Also accepts free text or a combination. Multi-select: no.

Q5 — "What word describes your energy?"
  Chip options: Warm, Mysterious, Bright, Calm, Wild, Grounded, Playful, Intense
  Also accepts free text or a combination. Multi-select: yes.

Q6 — "Is there anything specific about yourself you'd like your flower to reflect?"
  No chips — free text only, completely optional. Label as [PERSONAL CONTEXT].
  If empty: ignore entirely. If provided: use it to deepen and personalize the match.
`;

/**
 * Build the prompt for Step 1 of Find My Flower (flower selection only)
 */
export function buildFlowerSelectionPrompt(answers) {
  return {
    systemPrompt: `You are a thoughtful floral matchmaker. Your task is to analyze a person's quiz answers and select the single most fitting flower that reflects their personality. Consider the emotional depth, values, energy, and preferences expressed in their answers.

${POSSIBLE_ANSWERS_REFERENCE}

Think step by step about which flower's symbolism, growing conditions, and cultural associations best align with this person's responses.

You must respond with ONLY a valid JSON object. No markdown, no explanation, no text before or after:
{ "flowerName": "Flower Name Here" }`,

    userPrompt: `Here are the quiz answers:
Q1 (friend's description): ${answers.q1 || 'not provided'}
Q2 (peaceful environment): ${answers.q2 || 'not provided'}
Q3 (most important value): ${answers.q3 || 'not provided'}
Q4 (handling difficult emotions): ${answers.q4 || 'not provided'}
Q5 (energy description): ${answers.q5 || 'not provided'}
${answers.q6 ? `Q6 (personal context): ${answers.q6}` : 'Q6: No personal context provided'}

Analyze these answers and select the flower that best matches this person's personality. Return only the JSON object.`
  };
}

/**
 * Build the prompt for Step 2 of Find My Flower (full profile with Wikipedia context)
 */
export function buildFlowerProfilePrompt(answers, flowerName, wikipediaContent) {
  const wikiSection = wikipediaContent
    ? `\n${wikipediaContent}\n`
    : '\nNo reference material available. Use your knowledge of flowers.\n';

  return {
    systemPrompt: `You are a warm, insightful floral guide. Your task is to create a personalized flower profile that connects a person's quiz answers to their matched flower's symbolism and meaning.

${wikiSection}

Use the reference material above as your source of truth for facts about this flower. If information is missing, you may supplement with your own knowledge, but prioritize the reference material.

You must respond with ONLY a valid JSON object. No markdown, no explanation, no surrounding text. Use this exact structure:
{
  "flowerName": "string",
  "scientificName": "string",
  "tagline": "a short poetic phrase that captures why this flower matches the user",
  "whyItMatchesYou": "2-3 sentences connecting the user's specific answers to this flower's traits",
  "symbolism": "what this flower symbolizes across cultures, grounded in the reference material",
  "myths": "one or two myths or legends involving this flower",
  "culturalFacts": "interesting cultural or historical context",
  "funFact": "one surprising or delightful fact",
  "imageQuery": "a specific 3-5 word search string to find a beautiful photo of this flower in bloom"
}`,

    userPrompt: `The matched flower is: ${flowerName}

Here are the user's quiz answers:
Q1 (friend's description): ${answers.q1 || 'not provided'}
Q2 (peaceful environment): ${answers.q2 || 'not provided'}
Q3 (most important value): ${answers.q3 || 'not provided'}
Q4 (handling difficult emotions): ${answers.q4 || 'not provided'}
Q5 (energy description): ${answers.q5 || 'not provided'}
${answers.q6 ? `Q6 (personal context): ${answers.q6}` : 'Q6: No personal context provided'}

Create a personalized profile for this ${flowerName} that explains why it matches this person. Return only the JSON object.`
  };
}

/**
 * Build the prompt for Flower Meaning (single call with Wikipedia context)
 */
export function buildFlowerMeaningPrompt(flowerName, wikipediaContent) {
  const wikiSection = wikipediaContent
    ? `\n${wikipediaContent}\n`
    : '\nNo reference material available. Use your knowledge of flowers.\n';

  return {
    systemPrompt: `You are a knowledgeable floral encyclopedia. Your task is to provide comprehensive information about a flower's symbolism, personality traits, and cultural significance.

${wikiSection}

Use the reference material above as your source of truth for facts about this flower. If information is missing, you may supplement with your own knowledge, but prioritize the reference material.

You must respond with ONLY a valid JSON object. No markdown, no explanation, no surrounding text. Use this exact structure:
{
  "flowerName": "string",
  "scientificName": "string",
  "personalityTraits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "symbolism": "what this flower symbolizes across cultures, grounded in the reference material",
  "myths": "myths or legends involving this flower",
  "culturalFacts": "cultural and historical context",
  "funFact": "one surprising or delightful fact",
  "imageQuery": "a specific 3-5 word search string to find a beautiful photo of this flower in bloom"
}`,

    userPrompt: `Tell me everything about the ${flowerName}. Create a comprehensive profile of its meaning, symbolism, and cultural significance. Return only the JSON object.`
  };
}

export default {
  buildFlowerSelectionPrompt,
  buildFlowerProfilePrompt,
  buildFlowerMeaningPrompt
};
