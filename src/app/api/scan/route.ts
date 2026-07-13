import { NextResponse } from 'next/server';
import { scanGithub } from '@/lib/scanners/github';
import { scanHackerNews } from '@/lib/scanners/hackernews';
import { scanBetaList } from '@/lib/scanners/betalist';
import { addProducts } from '@/lib/db';
import { generateSitemap } from '@/lib/seo/sitemap';

/**
 * ВАЖНО: файловая система на Vercel/Netlify serverless — read-only
 * (кроме /tmp, который не сохраняется между вызовами). Поэтому этот роут
 * полезен только для локальной разработки (npm run dev) — на проде
 * запись данных должна происходить через GitHub Actions, который коммитит
 * изменения в репозиторий, откуда Vercel их и деплоит.
 */
export async function POST() {
  if (process.env.VERCEL || process.env.NETLIFY) {
    return NextResponse.json(
      {
        error:
          'На serverless-хостинге запись файлов недоступна. Автопополнение выполняется через GitHub Actions (.github/workflows/auto-post-products.yml), которое коммитит новые продукты в репозиторий.'
      },
      { status: 400 }
    );
  }

  const [githubProducts, hnProducts, betalistProducts] = await Promise.all([
    scanGithub(),
    scanHackerNews(),
    scanBetaList()
  ]);

  const added = addProducts([...githubProducts, ...hnProducts, ...betalistProducts]);

  if (added.length > 0) {
    generateSitemap();
  }

  return NextResponse.json({ added: added.length, products: added });
}
