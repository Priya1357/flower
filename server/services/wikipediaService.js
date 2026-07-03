/**
 * Wikipedia Service
 * Fetches verified flower content from Wikipedia REST API
 */

const MAX_WORDS = 1500;

/**
 * Strip HTML tags, wiki markup, and citation brackets
 */
function cleanContent(text) {
  if (!text) return '';

  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\[\d+\]/g, '') // Remove citation brackets [1], [2], etc.
    .replace(/\{\{[^}]*\}\}/g, '') // Remove template markup
    .replace(/==+[^=]+==+/g, '') // Remove section headers
    .replace(/'''?/g, '') // Remove bold/italic wiki markup
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Truncate to maximum words
 */
function truncateToMaxWords(text, maxWords = MAX_WORDS) {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Fetch Wikipedia summary for a flower
 * Returns { content: string, imageUrl: string | null }
 */
export async function fetchWikipediaContent(flowerName) {
  try {
    const encodedName = encodeURIComponent(flowerName);

    // Fetch summary
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedName}`;
    const summaryResponse = await fetch(summaryUrl);

    if (!summaryResponse.ok) {
      console.log(`Wikipedia summary not found for: ${flowerName}`);
      return { content: '', imageUrl: null };
    }

    const summaryData = await summaryResponse.json();

    // Extract image URL if available
    const imageUrl = summaryData.originalimage?.source || null;

    // Try to get full content for more detailed information
    let fullContent = '';

    try {
      // Fetch full page content via parse API for symbolism/mythology sections
      const parseUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedName}&prop=text&format=json&origin=*`;
      const parseResponse = await fetch(parseUrl);

      if (parseResponse.ok) {
        const parseData = await parseResponse.json();
        const rawText = parseData.parse?.text?.['*'] || '';

        // Extract relevant sections (symbolism, mythology, culture, etc.)
        const sectionMatch = rawText.match(/Symbolism.*?(?=<h[23]|$)/is) ||
                            rawText.match(/Mythology.*?(?=<h[23]|$)/is) ||
                            rawText.match(/Culture.*?(?=<h[23]|$)/is);

        if (sectionMatch) {
          fullContent = cleanContent(sectionMatch[0]);
        }
      }
    } catch (parseError) {
      console.log('Wikipedia parse API error, using summary only');
    }

    // Combine summary extract with any full content found
    const summaryExtract = cleanContent(summaryData.extract || '');
    const combinedContent = fullContent
      ? `${summaryExtract}\n\n${fullContent}`
      : summaryExtract;

    const truncatedContent = truncateToMaxWords(combinedContent);

    if (truncatedContent) {
      return {
        content: `[REFERENCE MATERIAL - USE AS SOURCE OF TRUTH FOR FACTS]\n\n${truncatedContent}`,
        imageUrl
      };
    }

    return { content: '', imageUrl: null };

  } catch (error) {
    console.error('Wikipedia fetch error:', error.message);
    return { content: '', imageUrl: null };
  }
}

export default { fetchWikipediaContent };
