import { useEffect } from 'react';

function updateMetaTag(selector, attrName, attrValue, content) {
  let element = document.querySelector(`${selector}[${attrName}='${attrValue}']`);
  if (!element) {
    element = document.createElement(selector === 'link' ? 'link' : 'meta');
    if (selector === 'link') {
      element.setAttribute('rel', attrValue);
    } else {
      element.setAttribute(attrName, attrValue);
    }
    document.head.appendChild(element);
  }
  if (content) {
    element.setAttribute('content', content);
  }
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export default function usePageMeta({
  title,
  description,
  keywords,
  url,
  image,
  type = 'website',
}) {
  useEffect(() => {
    if (title) document.title = title;

    if (description) updateMetaTag('meta', 'name', 'description', description);
    if (keywords) updateMetaTag('meta', 'name', 'keywords', keywords);
    updateMetaTag('meta', 'name', 'robots', 'index, follow');

    updateMetaTag('meta', 'property', 'og:type', type);
    if (title) updateMetaTag('meta', 'property', 'og:title', title);
    if (description) updateMetaTag('meta', 'property', 'og:description', description);
    if (url) updateMetaTag('meta', 'property', 'og:url', url);
    if (image) updateMetaTag('meta', 'property', 'og:image', image);

    updateMetaTag('meta', 'name', 'twitter:card', 'summary_large_image');
    if (title) updateMetaTag('meta', 'name', 'twitter:title', title);
    if (description) updateMetaTag('meta', 'name', 'twitter:description', description);
    if (image) updateMetaTag('meta', 'name', 'twitter:image', image);

    if (url) setCanonical(url);
  }, [title, description, keywords, url, image, type]);
}
