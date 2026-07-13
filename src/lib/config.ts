import fs from 'fs';
import path from 'path';
import type { SiteConfig } from './types';

const CONFIG_PATH = path.join(process.cwd(), 'config', 'site.config.json');

export function getSiteConfig(): SiteConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(raw) as SiteConfig;
  } catch {
    // Значения по умолчанию, если файл конфига ещё не создан
    return {
      siteUrl: 'https://aisitesapp.vercel.app',
      siteName: 'AISitesApp',
      siteDescription: 'Каталог сайтов и проектов, созданных с помощью ИИ',
      indexNowKey: ''
    };
  }
}

export function saveSiteConfig(config: SiteConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
