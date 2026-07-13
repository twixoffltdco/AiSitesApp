import fs from 'fs';
import path from 'path';
import { getAllProducts } from '../db';
import { getSiteConfig } from '../config';

const SITEMAP_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');

export function generateSitemap(): string {
  const { siteUrl } = getSiteConfig();
  const products = getAllProducts();

  const staticUrls = [
    { loc: siteUrl, changefreq: 'hourly', priority: '1.0' },
    { loc: `${siteUrl}/`, changefreq: 'hourly', priority: '1.0' }
  ];

  const productUrls = products.map((p) => ({
    loc: `${siteUrl}/products/${p.slug}`,
    lastmod: p.createdAt.slice(0, 10),
    changefreq: 'weekly',
    priority: '0.7'
  }));

  const urlEntries = [
    `  <url>\n    <loc>${escapeXml(siteUrl)}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...productUrls.map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>\n`;

  fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
  console.log(`[sitemap] Записано ${productUrls.length} URL продуктов в public/sitemap.xml`);

  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
