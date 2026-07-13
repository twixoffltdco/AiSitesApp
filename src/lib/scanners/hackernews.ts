import type { Product } from '../types';
import { detectCategory } from '../category';
import { slugify } from '../slugify';

interface HnHit {
  objectID: string;
  title: string;
  url: string | null;
  story_text: string | null;
  created_at: string;
  points: number;
}

/**
 * Использует публичный Algolia HN Search API (без ключа).
 * Ищет свежие посты "Show HN" с AI-тематикой.
 */
export async function scanHackerNews(): Promise<Product[]> {
  const url =
    'https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&query=AI&hitsPerPage=15';

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) {
      console.warn(`[hackernews scanner] HTTP ${res.status}`);
      return [];
    }

    const data = (await res.json()) as { hits: HnHit[] };
    const hits = (data.hits || []).filter((h) => h.url);

    return hits.map((hit) => {
      const title = hit.title.replace(/^Show HN:\s*/i, '').trim();
      const description = hit.story_text
        ? stripHtml(hit.story_text)
        : `Проект «${title}», опубликован сообществом Hacker News.`;
      const category = detectCategory(`${title} ${description}`);

      const product: Product = {
        slug: slugify(`${title}-hn`),
        title,
        shortDescription: truncate(description, 140),
        fullDescription: `${description}\n\nНайдено в разделе Show HN на Hacker News.${
          hit.points ? ` 👍 ${hit.points} баллов.` : ''
        }`,
        url: hit.url as string,
        category,
        tags: ['hacker-news', 'show-hn'],
        image: '/images/placeholder-hn.svg',
        source: 'hackernews',
        sourceId: hit.objectID,
        createdAt: new Date().toISOString()
      };
      return product;
    });
  } catch (err) {
    console.warn('[hackernews scanner] failed:', err);
    return [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}
