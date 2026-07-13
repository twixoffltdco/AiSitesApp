import { getSiteConfig } from '../config';

/**
 * Отправляет "пинги" поисковикам об обновлении sitemap.
 * Не требует ключей/токенов — просто GET-запрос.
 * Google деприкейтил этот механизм (2023), но эндпоинт формально ещё отвечает
 * для части ботов, поэтому оставляем как best-effort и полагаемся в первую
 * очередь на IndexNow + сам факт наличия sitemap.xml.
 */
export async function pingSearchEngines(): Promise<void> {
  const { siteUrl } = getSiteConfig();
  const sitemapUrl = `${siteUrl.replace(/\/+$/, '')}/sitemap.xml`;

  const pings = [
    {
      name: 'Google',
      url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    },
    {
      name: 'Яндекс',
      url: `https://blogs.yandex.ru/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    },
    {
      name: 'Bing (sitemap ping)',
      url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    }
  ];

  for (const ping of pings) {
    try {
      const res = await fetch(ping.url, { method: 'GET' });
      console.log(`[ping] ${ping.name}: HTTP ${res.status}`);
    } catch (err) {
      console.warn(`[ping] ${ping.name} не удалось отправить:`, err);
    }
  }
}
