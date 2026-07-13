# AISitesApp

Каталог-агрегатор сайтов, созданных с помощью ИИ, и проектов «с душой». Каталог **пополняется автоматически каждые 30 минут** через GitHub Actions и сам себя **индексирует в Google, Яндексе и Bing** — без Google Cloud Console, без Indexing API и **без единого GitHub Secret**.

## Стек

- **Фронтенд:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Данные:** JSON-файл `data/products.json` (без внешней БД — просто коммитится в репозиторий)
- **Автоматизация:** GitHub Actions по расписанию (`*/30 * * * *`)
- **Индексация:** sitemap.xml + пинги Google/Яндекс + IndexNow (Bing и Яндекс)

## Почему без секретов

- **IndexNow-ключ** по протоколу и так должен быть публично доступен по адресу `https://ваш-сайт/{ключ}.txt` — прятать его в Secrets бессмысленно. Ключ генерируется один раз скриптом `npm run indexnow:init` и коммитится в репозиторий как обычный файл (`public/{ключ}.txt` + `config/site.config.json`).
- **URL сайта** — тоже не секрет, это просто конфиг. Лежит в `config/site.config.json`.
- **Скриншоты** — вместо платного/ключевого API используются локальные SVG-заглушки по источнику (`public/images/placeholder-*.svg`). Хочешь реальные скриншоты — легко добавить сервис вроде `https://api.microlink.io/` (у него есть бесплатный тир без ключа с рейт-лимитом) в `src/lib/scanners/*`.
- **Источники данных** — все три сканера используют полностью публичные, не требующие авторизации API:
  - GitHub Search API (`api.github.com/search/repositories`, топик `ai`, без токена)
  - Hacker News / Show HN через публичный Algolia API (`hn.algolia.com`)
  - BetaList через RSS-фид (best-effort: если фид недоступен, сканер просто возвращает пустой список и не ломает весь процесс)

## Структура проекта

```
AISitesApp/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # главная — сетка карточек, фильтр, поиск
│   │   ├── products/[slug]/page.tsx    # страница продукта
│   │   └── api/
│   │       ├── products/route.ts       # GET со списком продуктов (?category=&q=)
│   │       └── scan/route.ts           # ручной запуск скана (только локально)
│   ├── lib/
│   │   ├── db.ts                       # чтение/запись data/products.json, дедуп
│   │   ├── category.ts                 # автоопределение категории по ключевым словам
│   │   ├── config.ts                   # публичный конфиг сайта
│   │   ├── scanners/                   # github.ts, hackernews.ts, betalist.ts
│   │   └── seo/
│   │       ├── sitemap.ts              # генерация public/sitemap.xml
│   │       ├── ping.ts                 # пинги Google/Яндекс/Bing
│   │       └── indexnow.ts             # отправка в IndexNow API
│   └── scripts/
│       ├── scan-products.ts            # главный скрипт для GitHub Actions
│       ├── generate-sitemap.ts
│       └── init-indexnow.ts            # одноразовая генерация IndexNow-ключа
├── data/products.json                  # хранилище продуктов
├── config/site.config.json             # siteUrl, indexNowKey и т.д. (не секрет)
├── public/                             # sitemap.xml, robots.txt, изображения
└── .github/workflows/auto-post-products.yml
```

## Локальный запуск

```bash
npm install
npm run dev
```

Открой http://localhost:3000

Чтобы вручную прогнать сканирование локально:

```bash
npm run indexnow:init   # один раз — сгенерирует ключ
npm run scan            # скан источников + обновление БД + sitemap + пинги
```

## Деплой на Vercel

1. Залей проект на GitHub (создай новый репозиторий и запушь этот код).
2. На [vercel.com](https://vercel.com) нажми **Add New → Project**, выбери репозиторий — Vercel сам определит Next.js и задеплоит без дополнительных настроек.
3. **Перед первым деплоем** замени `siteUrl` в `config/site.config.json` на реальный домен, который выдаст Vercel (или твой кастомный домен), и запушь коммит. Это важно: sitemap и IndexNow формируют абсолютные URL из этого поля.
4. Всё — секретов, переменных окружения и ручной настройки в Vercel Dashboard не требуется.

## Деплой на Netlify

Аналогично: **Add new site → Import an existing project**, framework определится автоматически как Next.js. Build command: `npm run build`, publish directory настроится автодетектом Netlify Next.js Runtime.

## Как работает автопополнение (GitHub Actions)

Файл `.github/workflows/auto-post-products.yml` каждые 30 минут:

1. Устанавливает зависимости.
2. Проверяет наличие IndexNow-ключа — генерирует, если его ещё нет (первый прогон).
3. Запускает `npm run scan`:
   - параллельно сканирует GitHub, Hacker News, BetaList;
   - отбрасывает дубликаты по нормализованному URL;
   - добавляет новые продукты в `data/products.json` с автоопределённой категорией;
   - перегенерирует `public/sitemap.xml`;
   - отправляет новые URL в IndexNow (Bing + Яндекс принимают этот протокол);
   - пингует Google/Яндекс/Bing о новом sitemap.
4. Если появились изменения — коммитит их и пушит в `main` от имени бота `aisitesapp-bot`.
5. Vercel/Netlify подхватывают пуш через штатный webhook GitHub-интеграции и автоматически передеплоивают сайт — никаких дополнительных действий не требуется.

**Важно:** так как этот workflow сам коммитит в репозиторий, в настройках репозитория GitHub → Settings → Actions → General → Workflow permissions должно быть выставлено **Read and write permissions** (обычно это уже так у личных репозиториев по умолчанию, но проверь один раз).

## Работа на GitVerse (и других форджах)

Помимо `.github/workflows/auto-post-products.yml` в проекте лежит `.gitverse/workflows/auto-post-products.yaml` — версия того же workflow под [GitVerse](https://gitverse.ru) (Ростелеком/Сбер-платформа, замена GitHub в РФ). Пара нюансов:

- GitVerse читает workflow-файлы из `.gitverse/workflows/`, а не из `.github/workflows/` (хотя по факту раннер обработает оба, приоритетную папку можно выбрать в настройках репозитория).
- CI/CD на GitVerse построен на движке, совместимом с Gitea Actions, и **поддерживает те же `uses: actions/checkout@v4` и `actions/setup-node@v4`**, что и GitHub — переносить код почти не пришлось.
- Если пуш из workflow падает с ошибкой доступа — зайди в настройки репозитория на GitVerse → CI/CD и проверь права встроенного токена задачи (должно быть `Contents: write`, как в блоке `permissions:` в самом workflow-файле). Если стандартный токен всё равно не может пушить — можно завести Personal Access Token (Настройки → Управление токенами → чекбокс «Репозитории») и подставить его как секрет, аналогично тому, как это сделано в официальном примере зеркалирования GitVerse → GitHub.

Для других форджей (GitLab, Codeberg, Forgejo и т.п.) логика та же: перенести шаги в их формат CI (`.gitlab-ci.yml` и т.д.), сохранив порядок `npm install → npm run indexnow:init → npm run scan → commit & push`.

## Troubleshooting: типичные ошибки CI и как их лечить

- **`Dependencies lock file is not found` в шаге Setup Node.js.** Значит в репозитории нет `package-lock.json` рядом с `package.json`. В этой сборке лок-файл уже включён — если ты его случайно удалил или он не закоммитился, просто прогони `npm install` локально и закоммить `package-lock.json`.
- **`Permission to <repo> denied` / `403` при `git push` в конце workflow (GitHub).** Идёт в Settings репозитория → Actions → General → Workflow permissions → выбери **Read and write permissions** и сохрани. Без этого встроенный `GITHUB_TOKEN` может быть read-only даже при указанном в yml `permissions: contents: write`.
- **`fatal: could not read Username`** при пуше — обычно значит, что `actions/checkout@v4` не смог настроить креды (редкий случай на форках/некоторых self-hosted раннерах). Проверь, что шаг checkout идёт первым и без кастомного `token:` параметра, который мог бы это сломать.
- **Workflow вообще не запускается по расписанию.** GitHub может задерживать `schedule`-триггеры на минуты (иногда десятки минут) при высокой нагрузке на инфраструктуру — это не баг кода, а особенность платформы. Проверить, что всё настроено правильно, можно вручную через `workflow_dispatch` — во вкладке Actions выбери workflow и нажми Run workflow.
- **Сборка (`npm run build`) падает локально или в CI с ошибкой типов.** Пришли текст ошибки целиком — без него это гадание на кофейной гуще, тут может быть что угодно от несовместимой версии Node (нужен 18.18+) до случайно испорченного файла при копировании.

Если ошибка не из этого списка — скинь точный текст (или скрин) из вкладки Actions/CI, так я исправлю прицельно, а не наугад.

## Как получить и подтвердить IndexNow-ключ вручную (если нужно)

Ключ и так генерируется автоматически первым прогоном Actions. Но если хочешь сделать это руками:

1. Зайди на https://www.indexnow.org/
 (по желанию — регистрация не обязательна, ключ — это просто случайная строка).
2. Локально запусти `npm run indexnow:init` — скрипт сам сгенерирует ключ, запишет его в `config/site.config.json` и создаст файл `public/{ключ}.txt`.
3. Закоммить оба изменённых файла.

## Индексация в Google и Яндексе — что ещё стоит сделать руками (один раз)

Код полностью автоматизирует пинги и IndexNow, но **для гарантированной и быстрой индексации в Google** рекомендуется один раз (не обязательно, но желательно):

- Добавить сайт в [Google Search Console](https://search.google.com/search-console) и указать `sitemap.xml` — дальше Google сам будет периодически его проверять. Это не требует кода/API и делается один раз через веб-интерфейс.
- Добавить сайт в [Яндекс.Вебмастер](https://webmaster.yandex.ru/) — аналогично, разово через интерфейс.

Без этих двух шагов сайт всё равно будет пинговаться и попадать в IndexNow, но с Search Console/Вебмастером индексация обычно быстрее и стабильнее.

## Категории и определение по ключевым словам

Логика в `src/lib/category.ts` — категория определяется по совпадению ключевых слов в названии/описании/тегах. Полный список категорий и меток — там же, легко расширяется.

## Известные ограничения

- **API-роут `/api/scan`** запускает сканирование только локально (`npm run dev`) — на Vercel/Netlify файловая система serverless-функций read-only (кроме эфемерного `/tmp`), поэтому «источник правды» — это `data/products.json` в самом репозитории, а пишет в него только GitHub Actions.
- **BetaList RSS** может со временем измениться/отключиться — сканер устойчив к этому (просто возвращает пустой список, не роняя остальные источники).
- **Google `/ping?sitemap=`** формально деприкейтнут Google в 2023 году — оставлен как best-effort (бесплатно и безвредно), но основную роль в индексации играют IndexNow, сам факт наличия валидного `sitemap.xml` и (по желанию) разовая привязка в Search Console.
