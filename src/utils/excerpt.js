/**
 * Plain-text excerpt for cards (avoids broken multi-line ellipsis in flex layouts).
 */
export const excerptPlainText = (text, maxLen = 168) => {
  const raw = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) {
    return '';
  }
  if (raw.length <= maxLen) {
    return raw;
  }
  const slice = raw.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  const head =
    lastSpace > Math.floor(maxLen * 0.45) ? slice.slice(0, lastSpace) : slice;
  const trimmed = head.trimEnd();
  const endsWithPunct = /[.!?…]$/.test(trimmed);
  return endsWithPunct ? trimmed : `${trimmed}\u2026`;
};
