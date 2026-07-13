import type { Product } from '../types';
import { detectCategory } from '../category';
import { slugify } from '../slugify';

/**
 * BetaList официального публичного API не предоставляет.
 * Пробуем RSS-фид (может измениться/отсутствовать — тогда просто
 * возвращаем пустой список, остальные сканеры продолжают работать).
 */
export async function scanBetaList(): Promise<Product[]> {
  const feedUrl = 'https://betalist.com/feeds/startups.rss';

  try {
    const res = await fetch(feedUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.warn(`[betalist scanner] HTTP ${res.status} — источник недоступен, пропускаем`);
      return [];
    }

    const xml = await res.text();
    const items = parseRssItems(xml).slice(0, 15);

    return items.map((item) => {
      const category = detectCategory(`${item.title} ${item.description}`);
      const product: Product = {
        slug: slugify(`${item.title}-betalist`),
        title: item.title,
        shortDescription: truncate(item.description, 140),
        fullDescription: `${item.description}\n\nНайдено на BetaList — платформе для запуска новых стартапов.`,
        url: item.link,
        category,
        tags: ['betalist', 'startup'],
        image: '/images/placeholder-betalist.svg',
        source: 'betalist',
        sourceId: slugify(item.link),
        createdAt: new Date().toISOString()
      };
      return product;
    });
  } catch (err) {
    console.warn('[betalist scanner] failed, skipping source:', err);
    return [];
  }
}

interface RssItem {
  title: string;
  link: string;
  description: string;
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

  for (const block of itemBlocks) {
    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const description = extractTag(block, 'description');
    if (title && link) {
      items.push({
        title: cleanText(title),
        link: cleanText(link),
        description: cleanText(description || title)
      });
    }
  }
  return items;
}

function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1] : null;
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}
