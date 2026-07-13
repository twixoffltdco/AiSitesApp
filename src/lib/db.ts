import fs from 'fs';
import path from 'path';
import type { Product } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'products.json');

function ensureDbFile(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '[]', 'utf-8');
  }
}

export function getAllProducts(): Product[] {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data as Product[];
  } catch {
    return [];
  }
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export function saveAllProducts(products: Product[]): void {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2), 'utf-8');
}

/**
 * Добавляет новые продукты, отбрасывая дубликаты по URL.
 * Возвращает список реально добавленных (новых) продуктов.
 */
export function addProducts(newProducts: Product[]): Product[] {
  const existing = getAllProducts();
  const existingUrls = new Set(existing.map((p) => normalizeUrl(p.url)));
  const existingSlugs = new Set(existing.map((p) => p.slug));

  const toAdd: Product[] = [];
  for (const p of newProducts) {
    const normUrl = normalizeUrl(p.url);
    if (existingUrls.has(normUrl)) continue;

    // Гарантируем уникальность slug
    let slug = p.slug;
    let i = 2;
    while (existingSlugs.has(slug)) {
      slug = `${p.slug}-${i}`;
      i++;
    }
    p.slug = slug;

    existingUrls.add(normUrl);
    existingSlugs.add(slug);
    toAdd.push(p);
  }

  if (toAdd.length > 0) {
    saveAllProducts([...toAdd, ...existing]);
  }

  return toAdd;
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/+$/, '').toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
