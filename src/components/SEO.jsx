import { useEffect } from 'react';

const siteName = 'Uicoding.ai';
const siteUrl = 'https://uicoding.ai';
const defaultDescription =
  '代码零基础人群的交流社区，一起学习 AI 编程工具使用技巧、界面设计和上线经验。';
const defaultImage = '/site-icon.png';

function ensureMeta(selector, createElement) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = createElement();
    document.head.appendChild(element);
  }

  return element;
}

function setMeta(name, content) {
  const element = ensureMeta(`meta[name="${name}"]`, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', name);
    return meta;
  });

  element.setAttribute('content', content);
}

function setProperty(property, content) {
  const element = ensureMeta(`meta[property="${property}"]`, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', property);
    return meta;
  });

  element.setAttribute('content', content);
}

function setCanonical(url) {
  const element = ensureMeta('link[rel="canonical"]', () => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    return link;
  });

  element.setAttribute('href', url);
}

function toAbsoluteUrl(value) {
  if (!value) {
    return `${siteUrl}${defaultImage}`;
  }

  if (value.startsWith('http')) {
    return value;
  }

  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

export function getCanonicalUrl(pathname = '/') {
  const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return `${siteUrl}${cleanPath}`;
}

export default function SEO({
  canonicalPath = '/',
  description = defaultDescription,
  image = defaultImage,
  noindex = false,
  structuredData,
  title = siteName,
  type = 'website',
}) {
  useEffect(() => {
    const fullTitle = title === siteName ? title : `${title} | ${siteName}`;
    const canonicalUrl = getCanonicalUrl(canonicalPath);
    const imageUrl = toAbsoluteUrl(image);

    document.documentElement.lang = 'zh-CN';
    document.title = fullTitle;
    setMeta('description', description);
    setMeta('robots', noindex ? 'noindex,follow' : 'index,follow');
    setCanonical(canonicalUrl);

    setProperty('og:site_name', siteName);
    setProperty('og:type', type);
    setProperty('og:title', fullTitle);
    setProperty('og:description', description);
    setProperty('og:url', canonicalUrl);
    setProperty('og:image', imageUrl);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);

    const scriptId = 'uicoding-structured-data';
    let script = document.getElementById(scriptId);

    if (!structuredData) {
      script?.remove();
      return;
    }

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(structuredData);
  }, [canonicalPath, description, image, noindex, structuredData, title, type]);

  return null;
}

export const seoDefaults = {
  defaultDescription,
  siteName,
  siteUrl,
};
