/**
 * Personalization utilities.
 *
 * Reads an optional `?to=RecipientName` query parameter and safely merges
 * it with the default config. All values are sanitized so they can never be
 * rendered as executable HTML, and falls back to the configured default when
 * the parameter is missing, empty, or invalid.
 */

import { PERSONALIZATION } from "../config/personalization";

const MAX_NAME_LENGTH = 60;

/** Strip HTML tags / scripts and dangerous characters from a query value. */
function sanitize(raw: string): string {
  // Decode once (URL-encoded input from the query string).
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  // Remove any markup / angle brackets (guards against <script> etc.).
  const noMarkup = decoded.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");

  // Keep letters, numbers, spaces, and a small allow-list of safe unicode
  // punctuation that might appear in a name (apostrophes, periods, hyphens).
  const cleaned = noMarkup.replace(/[^\p{L}\p{N}\s.'\-•]/gu, "");

  // Collapse whitespace, trim, and cap the length.
  const trimmed = cleaned.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);

  return trimmed;
}

/**
 * Get the recipient name that should be used for this session.
 *
 * Priority:
 *   1. `?person=` query parameter
 *   2. `?to=` query parameter
 *   3. default from personalization.ts
 *
 * The default is used if the parameter is missing, empty, or sanitizes away.
 */
export function getRecipientName(search: string = window.location.search): string {
  const params = new URLSearchParams(search);

  const candidate =
    params.get("person") ?? params.get("to") ?? PERSONALIZATION.recipientName;

  const safe = sanitize(candidate);

  if (!safe) return PERSONALIZATION.recipientName;
  return safe;
}

/**
 * Build a shareable link that pins a recipient, keeping only the query param.
 * No private data is ever placed in the URL — just a name.
 */
export function buildShareLink(
  recipientName: string,
  baseUrl: string = window.location.origin + window.location.pathname,
): string {
  const safe = sanitize(recipientName);
  const url = new URL(baseUrl, window.location.origin);
  if (safe) {
    url.searchParams.set("to", safe);
  } else {
    url.searchParams.delete("to");
  }
  return url.toString();
}
