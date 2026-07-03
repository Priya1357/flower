/**
 * Image Service
 * Three-tier fallback: Unsplash -> Wikimedia -> Placeholder
 */

/**
 * Tier 1: Try Unsplash API
 */
async function tryUnsplash(imageQuery, unsplashKey) {
  if (!unsplashKey) {
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(imageQuery);
    const url = `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=1`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${unsplashKey}`
      }
    });

    if (!response.ok) {
      console.log(`Unsplash failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return {
        source: 'unsplash',
        url: data.results[0].urls.regular
      };
    }

    return null;
  } catch (error) {
    console.log('Unsplash error:', error.message);
    return null;
  }
}

/**
 * Tier 2: Use Wikimedia Commons image URL (already fetched by Wikipedia service)
 */
function tryWikimedia(wikiImageUrl) {
  if (!wikiImageUrl) {
    return null;
  }

  return {
    source: 'wikipedia',
    url: wikiImageUrl
  };
}

/**
 * Tier 3: Placeholder (typographic treatment)
 */
function getPlaceholder(flowerName) {
  return {
    source: 'placeholder',
    url: null,
    displayName: flowerName
  };
}

/**
 * Main image fetching function with fallback chain
 */
export async function fetchImage(imageQuery, flowerName, wikiImageUrl = null) {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  // Tier 1: Try Unsplash
  const unsplashResult = await tryUnsplash(imageQuery, unsplashKey);
  if (unsplashResult) {
    return unsplashResult;
  }

  // Tier 2: Try Wikimedia
  const wikimediaResult = tryWikimedia(wikiImageUrl);
  if (wikimediaResult) {
    return wikimediaResult;
  }

  // Tier 3: Placeholder
  return getPlaceholder(flowerName);
}

export default { fetchImage };
