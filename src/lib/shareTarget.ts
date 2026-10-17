const SHARED_URL_PATTERN = /https?:\/\/[^\s<>"'`]+/i;

function normalizeSharedUrl(value: string | null): string | null {
  if (!value) return null;
  const match = value.trim().match(SHARED_URL_PATTERN);
  if (!match) return null;
  return match[0].replace(/[),.;!?\]]+$/, '');
}

export function getSharedUrlFromSearch(search: string): string | null {
  const params = new URLSearchParams(search);
  const directUrl = normalizeSharedUrl(params.get('shared_url') || params.get('url'));
  if (directUrl) return directUrl;

  return normalizeSharedUrl(params.get('text')) || normalizeSharedUrl(params.get('title'));
}
