import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSiteConfig, saveSiteConfig } from '../lib/config';

/**
 * Запускается один раз (локально или в первом прогоне GitHub Actions).
 * Генерирует IndexNow-ключ, сохраняет его в config/site.config.json
 * и создаёт публичный файл public/{key}.txt — как требует протокол IndexNow.
 * Никаких GitHub Secrets не нужно: ключ IndexNow по своей природе публичный.
 */
function main() {
  const config = getSiteConfig();

  if (config.indexNowKey) {
    console.log(`[init-indexnow] Ключ уже существует: ${config.indexNowKey}`);
    ensureKeyFile(config.indexNowKey);
    return;
  }

  const key = crypto.randomBytes(16).toString('hex'); // 32 hex-символа
  config.indexNowKey = key;
  saveSiteConfig(config);
  ensureKeyFile(key);

  console.log(`[init-indexnow] Сгенерирован новый IndexNow-ключ: ${key}`);
  console.log('[init-indexnow] Файл public/' + key + '.txt создан. Закоммить его вместе с config/site.config.json.');
}

function ensureKeyFile(key: string) {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const keyFilePath = path.join(publicDir, `${key}.txt`);
  if (!fs.existsSync(keyFilePath)) {
    fs.writeFileSync(keyFilePath, key, 'utf-8');
  }
}

main();
