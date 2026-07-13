import Link from 'next/link';
import type { Product } from '@/lib/types';
import { CATEGORY_LABELS } from '@/lib/category';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-xl2 border border-surface-border bg-surface-card shadow-card"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-accent-light backdrop-blur">
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-white">{product.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-gray-400">{product.shortDescription}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-surface-border px-2 py-0.5 text-[11px] text-gray-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
