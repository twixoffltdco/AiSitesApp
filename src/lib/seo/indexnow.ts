import { getSiteConfig } from '../config';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Отправляет список URL в IndexNow (поддерживается Bing и Яндексом).
 * Ключ хранится не в GitHub Secrets, а прямо в публичном config/site.config.json
 * и в файле public/{key}.txt — это ровно то, что требует протокол IndexNow:
 * ключ подтверждается публичной доступностью файла на сайте, поэтому
 * скрывать его как "секрет" не нужно и бессмысленно.
 */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  const { siteUrl, indexNowKey } = getSiteConfig();

  if (!indexNowKey) {
    console.warn('[indexnow] Ключ не найден в config/site.config.json — пропускаем отправку.');
    console.warn('[indexnow] Запусти: npm run indexnow:init');
    return;
  }

  if (urls.length === 0) {
    console.log('[indexnow] Нет новых URL для отправки.');
    return;
  }

  const host = new URL(siteUrl).host;
  const keyLocation = `${siteUrl.replace(/\/+$/, '')}/${indexNowKey}.txt`;

  const body = {
    host,
    key: indexNowKey,
    keyLocation,
    urlList: urls
  };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body)
    });
    console.log(`[indexnow] Отправлено ${urls.length} URL, ответ: HTTP ${res.status}`);
  } catch (err) {
    console.warn('[indexnow] Ошибка отправки:', err);
  }
}
