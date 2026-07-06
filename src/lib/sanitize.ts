/**
 * Sanitizes user input to prevent prompt injection and XSS attacks.
 * Strips HTML tags, script content, and control characters.
 *
 * @param {string} input - The raw user input string.
 * @returns {string} The sanitized string safe for prompt injection and storage.
 */
export function sanitize(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}
