import { scanGithub } from '../lib/scanners/github';
import { scanHackerNews } from '../lib/scanners/hackernews';
import { scanBetaList } from '../lib/scanners/betalist';
import { addProducts } from '../lib/db';
import { generateSitemap } from '../lib/seo/sitemap';
import { pingSearchEngines } from '../lib/seo/ping';
import { submitToIndexNow } from '../lib/seo/indexnow';
import { getSiteConfig } from '../lib/config';

async function main() {
  console.log('=== AISitesApp: сканирование источников ===');
  console.log(new Date().toISOString());

  const [githubProducts, hnProducts, betalistProducts] = await Promise.all([
    scanGithub(),
    scanHackerNews(),
    scanBetaList()
  ]);

  const allScanned = [...githubProducts, ...hnProducts, ...betalistProducts];
  console.log(`[scan] Найдено кандидатов: github=${githubProducts.length}, hn=${hnProducts.length}, betalist=${betalistProducts.length}`);

  const added = addProducts(allScanned);
  console.log(`[scan] Добавлено новых продуктов (после дедупа по URL): ${added.length}`);

  if (added.length === 0) {
    console.log('[scan] Новых продуктов нет — обновляем sitemap на всякий случай и выходим.');
    generateSitemap();
    return;
  }

  generateSitemap();

  const { siteUrl } = getSiteConfig();
  const newUrls = added.map((p) => `${siteUrl.replace(/\/+$/, '')}/products/${p.slug}`);

  await submitToIndexNow(newUrls);
  await pingSearchEngines();

  console.log('=== Готово ===');
}

main().catch((err) => {
  console.error('[scan-products] Критическая ошибка:', err);
  process.exit(1);
});
