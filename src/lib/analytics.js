export const GA_MEASUREMENT_ID = 'G-TM9TZCDS6K';

function canTrack() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export function trackEvent(name, params = {}) {
  if (!canTrack() || !name) {
    return;
  }

  window.gtag('event', name, cleanParams(params));
}

export function trackPageView(path = window.location.pathname + window.location.search) {
  if (!canTrack()) {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackClick(area, label, params = {}) {
  trackEvent('ui_click', {
    area,
    label,
    ...params,
  });
}

export function trackOutboundLink(label, url, params = {}) {
  trackEvent('outbound_link_click', {
    label,
    link_url: url,
    ...params,
  });
}
