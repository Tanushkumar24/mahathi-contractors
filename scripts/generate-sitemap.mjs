import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, buildServiceLocationPath, seoLocations, seoServices } from '../src/lib/seoData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');

const staticPaths = ['/', '/about', '/services', '/projects', '/reviews', '/contact', '/book'];
const dynamicPaths = seoServices.flatMap((service) =>
  seoLocations.map((location) => buildServiceLocationPath(service.slug, location.slug))
);

const urls = [...staticPaths, ...dynamicPaths];
const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${path === '/' ? '1.0' : path.startsWith('/services/') ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap);
writeFileSync(resolve(publicDir, 'robots.txt'), robots);

console.log(`Generated ${urls.length} sitemap URLs.`);
