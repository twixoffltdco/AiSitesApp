import type { ProductCategory } from './types';

const KEYWORD_MAP: Record<ProductCategory, string[]> = {
  'chatbot': ['chatbot', 'chat bot', 'assistant', 'conversational', 'llm chat'],
  'image-video': ['image generation', 'video generation', 'text-to-image', 'text-to-video', 'diffusion', 'photo editor', 'avatar'],
  'writing': ['writing', 'copywriting', 'content generation', 'blog generator', 'text generator'],
  'developer': ['api', 'sdk', 'developer tool', 'code generation', 'coding assistant', 'devtools', 'cli', 'framework', 'library'],
  'design': ['design tool', 'ui design', 'figma', 'prototyping', 'design system'],
  'no-code': ['no-code', 'no code', 'low-code', 'website builder', 'app builder'],
  'productivity': ['productivity', 'task manager', 'notes', 'automation', 'workflow'],
  'ai-tool': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'neural'],
  'other': []
};

export function detectCategory(text: string): ProductCategory {
  const lower = text.toLowerCase();
  const order: ProductCategory[] = [
    'chatbot',
    'image-video',
    'writing',
    'developer',
    'design',
    'no-code',
    'productivity',
    'ai-tool',
    'other'
  ];

  for (const category of order) {
    const keywords = KEYWORD_MAP[category];
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return 'other';
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'ai-tool': 'AI-инструмент',
  'productivity': 'Продуктивность',
  'design': 'Дизайн',
  'developer': 'Для разработчиков',
  'chatbot': 'Чат-боты',
  'image-video': 'Изображения / Видео',
  'writing': 'Тексты и контент',
  'no-code': 'No-code',
  'other': 'Другое'
};
