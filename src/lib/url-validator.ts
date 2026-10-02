export type UrlType = 'youtube' | 'google_drive' | 'external' | 'invalid';

export function detectUrlType(url: string): UrlType {
  if (!url) return 'invalid';

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'invalid';
    }

    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'm.youtube.com'
    ) {
      return 'youtube';
    }

    if (
      hostname === 'drive.google.com' ||
      hostname === 'docs.google.com'
    ) {
      return 'google_drive';
    }

    return 'external';
  } catch {
    return 'invalid';
  }
}

export function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }
    if (
      parsed.hostname === 'youtube.com' ||
      parsed.hostname === 'www.youtube.com'
    ) {
      return parsed.searchParams.get('v');
    }
    return null;
  } catch {
    return null;
  }
}

export function getYoutubeThumbnail(url: string): string | null {
  const id = extractYoutubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export function isValidUrl(url: string): boolean {
  return detectUrlType(url) !== 'invalid';
}

export function sanitizeUrl(url: string): string | null {
  const type = detectUrlType(url);
  if (type === 'invalid') return null;
  return url;
}
