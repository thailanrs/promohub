import { RawPayload } from '../types';

/**
 * Regex to extract HTTP and HTTPS URLs from arbitrary text string.
 */
const URL_REGEX = /https?:\/\/[^\s<>'"]+/gi;

/**
 * Extracts and cleans all valid URLs from raw text string.
 */
export function extractUrlsFromText(text: string): string[] {
  if (!text) return [];

  const matches = text.match(URL_REGEX) || [];
  const uniqueUrls = new Set<string>();

  for (const rawMatch of matches) {
    // Clean trailing punctuation attached to URLs in social messages
    const cleanedUrl = rawMatch.replace(/[\.,\!\?\)\}\]\>]+$/, '');

    try {
      const parsedUrl = new URL(cleanedUrl);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        uniqueUrls.add(parsedUrl.toString());
      }
    } catch {
      // Ignore invalid URL matches
    }
  }

  return Array.from(uniqueUrls);
}

/**
 * Parses raw ingestion payload, extracting URLs and preparing clean text.
 */
export function parseIngestionPayload(payload: RawPayload): { extractedUrls: string[]; cleanText: string } {
  const fullContent = [payload.text, payload.rawUrl].filter(Boolean).join('\n');
  const extractedUrls = extractUrlsFromText(fullContent);

  // Remove URLs from raw text to leave clean copy text for AI processing
  let cleanText = payload.text;
  extractedUrls.forEach((url) => {
    cleanText = cleanText.replace(url, '');
  });

  cleanText = cleanText.replace(/\n\s*\n/g, '\n').trim();

  return {
    extractedUrls,
    cleanText,
  };
}
