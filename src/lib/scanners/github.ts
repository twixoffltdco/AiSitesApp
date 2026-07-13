import type { Product } from '../types';
import { detectCategory } from '../category';
import { slugify } from '../slugify';

interface GithubRepo {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  topics?: string[];
  owner: { login: string };
  homepage: string | null;
  stargazers_count: number;
}

/**
 * Использует публичный GitHub Search API (без токена, лимит 10 запросов/мин на IP).
 * Ищет репозитории, созданные за последние 3 дня, с AI-тематикой.
 */
export async function scanGithub(): Promise<Product[]> {
  const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const query = encodeURIComponent(`topic:ai created:>${since}`);
  const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=15`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'AISitesApp-Scanner'
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      console.warn(`[github scanner] HTTP ${res.status}`);
      return [];
    }

    const data = (await res.json()) as { items: GithubRepo[] };
    const items = data.items || [];

    return items.map((repo) => {
      const title = repo.full_name.split('/')[1] || repo.full_name;
      const description = repo.description || 'AI-проект с GitHub без описания.';
      const category = detectCategory(`${title} ${description} ${(repo.topics || []).join(' ')}`);

      const product: Product = {
        slug: slugify(`${title}-github`),
        title,
        shortDescription: truncate(description, 140),
        fullDescription: `${description}\n\nАвтор: ${repo.owner.login}. Найдено в GitHub Trending (AI-тематика).${
          repo.stargazers_count ? ` ⭐ ${repo.stargazers_count} звёзд.` : ''
        }`,
        url: repo.homepage && repo.homepage.trim() !== '' ? repo.homepage : repo.html_url,
        category,
        tags: [...(repo.topics || []).slice(0, 6), 'github', 'open-source'],
        image: '/images/placeholder-github.svg',
        source: 'github',
        sourceId: String(repo.id),
        createdAt: new Date().toISOString()
      };
      return product;
    });
  } catch (err) {
    console.warn('[github scanner] failed:', err);
    return [];
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}
