/**
 * Security and sanitization utilities
 * Protects against XSS, injection, and invalid payloads
 */

export function sanitizeText(input: unknown, maxLength: number = 200): string {
  if (typeof input !== 'string') return '';
  // Strip dangerous script and HTML tags safely while preserving clean text punctuation
  const clean = input
    .replace(/<script\b[^<]*>(?:[\s\S]*?)<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();

  return clean.slice(0, maxLength);
}

export function isValidHexColor(color: unknown): boolean {
  if (typeof color !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}
