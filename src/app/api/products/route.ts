import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q')?.toLowerCase().trim();

  let products = getAllProducts();

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

  return NextResponse.json({ products, total: products.length });
}
