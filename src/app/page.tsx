import { Suspense } from 'react';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';
import { getAllProducts } from '@/lib/db';
import type { ProductCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { category?: string; q?: string };
}

export default function HomePage({ searchParams }: PageProps) {
  const allProducts = getAllProducts();
  const category = searchParams.category as ProductCategory | 'all' | undefined;
  const q = searchParams.q?.toLowerCase().trim();

  let products = allProducts;
  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }
  if (q) {
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Каталог сайтов, созданных с помощью <span className="text-accent">ИИ</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400 sm:text-base">
          Новые AI-инструменты и проекты «с душой» появляются здесь автоматически — каждые 30 минут.
        </p>
      </section>

      <div className="mb-8">
        <Suspense fallback={null}>
          <Filters />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-surface-border py-16 text-center text-gray-500">
          {allProducts.length === 0
            ? 'Каталог пока пуст. Первое автоматическое сканирование добавит продукты в течение 30 минут после первого запуска workflow.'
            : 'Ничего не найдено по заданным фильтрам.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
