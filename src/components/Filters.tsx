'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CATEGORY_LABELS } from '@/lib/category';
import type { ProductCategory } from '@/lib/types';

const CATEGORIES: (ProductCategory | 'all')[] = [
  'all',
  'ai-tool',
  'chatbot',
  'image-video',
  'writing',
  'developer',
  'design',
  'no-code',
  'productivity',
  'other'
];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const activeCategory = searchParams.get('category') ?? 'all';

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParams({ q: query });
          }}
          placeholder="Поиск по названию, описанию, тегам…"
          className="w-full rounded-full border border-surface-border bg-surface-card px-5 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-accent focus:outline-none"
        />
        <button
          onClick={() => updateParams({ q: query })}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-dark transition-colors"
        >
          Найти
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => updateParams({ category: cat })}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'border-accent bg-accent/20 text-accent-light'
                : 'border-surface-border text-gray-400 hover:border-accent/60 hover:text-gray-200'
            } ${isPending ? 'opacity-60' : ''}`}
          >
            {cat === 'all' ? 'Все' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
