export function getLinkSource(value: string): 'Instagram' | 'YouTube' | null {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'Instagram';
    if (['youtube.com', 'youtu.be'].some(domain => host === domain || host.endsWith(`.${domain}`))) return 'YouTube';
  } catch { /* Invalid URLs are handled by the capture form. */ }
  return null;
}

export const isSupportedSource = (value: string): boolean => value === 'Instagram' || value === 'YouTube';
