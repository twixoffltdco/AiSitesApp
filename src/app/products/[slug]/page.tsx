import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllProducts, getProductBySlug } from '@/lib/db';
import { CATEGORY_LABELS } from '@/lib/category';
import { getSiteConfig } from '@/lib/config';

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
  if (!product) return {};

  const config = getSiteConfig();
  return {
    title: `${product.title} — ${config.siteName}`,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: [product.image]
    }
  };
}

export default function ProductPage({ params }: PageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="overflow-hidden rounded-xl2 border border-surface-border bg-surface-card shadow-card">
        <div className="relative aspect-[16/9] w-full bg-surface-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
        </div>
        <div className="p-6 sm:p-8">
          <span className="inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-light">
            {CATEGORY_LABELS[product.category]}
          </span>
          <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{product.title}</h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-300 sm:text-base">
            {product.fullDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-surface-border px-3 py-1 text-xs text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={product.url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow hover:bg-accent-dark transition-colors"
            >
              Перейти на сайт →
            </a>
            <span className="text-xs text-gray-500">
              Источник: {sourceLabel(product.source)} · добавлено {new Date(product.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    github: 'GitHub Trending',
    hackernews: 'Hacker News',
    betalist: 'BetaList',
    manual: 'Добавлено вручную'
  };
  return map[source] ?? source;
}
