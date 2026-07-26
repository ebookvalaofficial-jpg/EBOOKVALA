/**
 * Pure TypeScript HTML & URL Sanitization Utility for EbookVala
 */

/**
 * Sanitizes user-generated text/HTML by escaping dangerous tags and attributes.
 * Prevents XSS attacks such as <script>, onload=, javascript: URLs, etc.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips HTML tags completely, returning safe plain text.
 */
export function stripHtmlTags(input: string | null | undefined): string {
  if (!input) return '';
  return input.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Validates whether a URL uses safe protocols (http, https, or relative paths).
 * Rejects javascript:, data:, vbscript: and malformed URLs.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return true; // Optional URLs are allowed if empty
  const trimmed = url.trim().toLowerCase();

  // Allow relative URLs starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  // Reject dangerous pseudo-protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL string: returns default fallback if invalid or dangerous.
 */
export function sanitizeUrl(url: string | null | undefined, fallback: string = ''): string {
  if (!url) return fallback;
  return isSafeUrl(url) ? url.trim() : fallback;
}
