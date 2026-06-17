export function formatDisplayUrl(url = '') {
  if (!url) {
    return '';
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
}
