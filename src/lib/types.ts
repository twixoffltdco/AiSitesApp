export type ProductCategory =
  | 'ai-tool'
  | 'productivity'
  | 'design'
  | 'developer'
  | 'chatbot'
  | 'image-video'
  | 'writing'
  | 'no-code'
  | 'other';

export interface Product {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  url: string;
  category: ProductCategory;
  tags: string[];
  image: string;
  source: 'github' | 'hackernews' | 'betalist' | 'manual';
  sourceId: string;
  createdAt: string;
}

export interface SiteConfig {
  siteUrl: string;
  siteName: string;
  siteDescription: string;
  indexNowKey: string;
}
