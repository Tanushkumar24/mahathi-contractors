import { useEffect } from 'react';
import { BUSINESS_EMAIL, BUSINESS_NAME, BUSINESS_PHONE, SITE_URL } from '@/lib/seoData';

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLink(rel, href) {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

export default function SEO({ title, description, canonical, schema }) {
  useEffect(() => {
    document.title = title || BUSINESS_NAME;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setLink('canonical', canonical);

    const id = 'structured-data';
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema || buildDefaultSchema(canonical));
  }, [title, description, canonical, schema]);

  return null;
}

export function buildDefaultSchema(url = SITE_URL) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ConstructionBusiness', 'HomeAndConstructionBusiness'],
    name: BUSINESS_NAME,
    url,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    openingHours: 'Mo-Sa 09:00-20:00',
    areaServed: ['Vijayawada', 'Guntur', 'Mangalagiri', 'Tadepalli', 'Tenali', 'Andhra Pradesh'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Vijayawada',
      addressRegion: 'Andhra Pradesh',
      addressCountry: 'IN',
    },
  };
}
