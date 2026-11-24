# alam — тренажёр «Математическая грамотность» для ЕНТ

Веб-приложение (alam.kz) и Telegram Mini App для подготовки к предмету «Математическая грамотность» ЕНТ (Казахстан). Интерфейс и задачи на русском и казахском.

## Стек
Next.js 15 (App Router), TypeScript, Tailwind 4, Supabase (Postgres), Telegram WebApp + Login Widget, grammY, Vercel.

## Запуск
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Скрипты
- `npm run dev` — dev-сервер
- `npm run build` — production-сборка
- `npm run lint`, `npm run typecheck`, `npm test`
- `npm run validate-content` — проверка банка задач

## Статус этапов
- [x] 1. Каркас: тема Telegram, i18n RU/KZ, главная
- [x] 2. Контент-модель и валидатор (`npm run validate-content`)
- [x] 3. БД Supabase (`supabase/migrations`, `npm run seed`)
- [x] 4. Вход через Telegram (Mini App initData + Login Widget, JWT-сессия)
- [x] 5. Практика по темам
- [x] 6. Пробный ЕНТ (вариант по спецификации, таймер, разбор)
- [x] 7. Работа над ошибками (Лейтнер, 1/3/7/14/30 дней)
- [x] 8. Статистика, стрик, рейтинг недели
- [x] 9. Админка (/admin, доступ по ADMIN_TG_IDS, импорт/экспорт JSON)
- [x] 10. Бот (/start, /lang, /reminders) и ежедневные напоминания
- [x] 11. Банк задач: 100 задач (по 10 на тему, A/B/C = 5/3/2), RU + KZ
- [x] 12. Полировка и инструкция по деплою

> Задачи оригинальные, составлены по спецификации НЦТ. Казахские тексты стоит вычитать носителю языка.

## Формат задачи
Файлы `content/questions/<тема>.json`, схема описана в `lib/question-schema.ts`. Формулы пишутся в `$...$` (KaTeX), к условию можно приложить таблицу (`table`) и рисунок (`figure`, инлайн-SVG). Порядок вариантов приложение перемешивает при показе, поэтому `answer` можно оставлять 0.

## База данных (Supabase)
1. Создайте проект на supabase.com.
2. В `.env.local` укажите `DATABASE_URL`: Connect → Transaction pooler, порт 6543.
3. `npm run migrate` применит SQL из `supabase/migrations` (или выполните его вручную в SQL Editor).
4. `npm run seed` загрузит темы и задачи. `npm run seed -- --force` перезапишет задачи из JSON поверх правок из админки.

Приложение подключается к Postgres напрямую и только с сервера. RLS включён на всех таблицах, поэтому публичные ключи Supabase (anon) доступа к данным не дают.

## Вход
- В Mini App вход автоматический: `initData` проверяется по HMAC с `BOT_TOKEN`.
- В браузере используется Telegram Login Widget. Для него нужна команда `/setdomain` в @BotFather с доменом `alam.kz`.
- Сессия хранится в JWT в httpOnly-cookie (`SESSION_SECRET`, не короче 32 символов).
- Для локальной разработки: `ALLOW_DEV_LOGIN=1` включает кнопку «Войти как тестовый пользователь». В production она выключена всегда.

### Локальная база для разработки
Подойдёт любой Postgres 14+:
```bash
DATABASE_URL=postgres://postgres@127.0.0.1:5432/postgres npm run migrate && npm run seed
```

## Админка
`/admin` открыта только пользователям из `ADMIN_TG_IDS`. Там можно:
- создать или отредактировать задачу (RU/KZ, таблица, SVG) с живым предпросмотром;
- снять задачу с публикации;
- импортировать и экспортировать JSON.

Валидация в админке та же, что у `npm run validate-content`. Правки из админки хранятся в БД. Чтобы перенести их в репозиторий, выгрузите JSON и разложите по `content/questions/`.

## Telegram-бот
1. Создайте бота в @BotFather. Затем:
   - `/setdomain` → `alam.kz` (нужно для Login Widget);
   - `/newapp` → Mini App с адресом `https://alam.kz`, если нужна прямая ссылка `t.me/<бот>/<app>`.
2. В env задайте `BOT_TOKEN`, `WEBHOOK_SECRET`, `NEXT_PUBLIC_BOT_USERNAME`.
3. После деплоя выполните `npm run setup-bot`. Скрипт выставит webhook `/api/bot`, команды на RU/KZ и кнопку меню.

Команды бота: `/start` (приветствие и кнопка открытия), `/lang`, `/reminders`.

**Напоминания.** Vercel Cron (`vercel.json`) раз в день в 14:00 UTC, то есть в 19:00 по Алматы, вызывает `/api/cron/reminders` с `Authorization: Bearer CRON_SECRET`. Напоминание получают те, кто запустил бота, не выключил напоминания и сегодня ещё не занимался. На тарифе Hobby cron запускается не чаще раза в день. На Pro можно поставить `0 * * * *`: эндпоинт уже учитывает `reminder_hour` пользователя.

Интеграционный тест бота на реальной БД:
```bash
TEST_DATABASE_URL=postgres://... npm test
```

## Быстрый запуск на vercel.app
1. **Supabase.** Откройте Connect → Transaction pooler и скопируйте URI (порт 6543), подставив пароль БД. Спецсимволы в пароле нужно percent-encode: `@` → `%40`, `#` → `%23`, `/` → `%2F`.
2. **Vercel → Environment Variables.** Задайте `DATABASE_URL`, `BOT_TOKEN`, `SESSION_SECRET`, `WEBHOOK_SECRET`, `CRON_SECRET` и `ADMIN_TG_IDS` (например, `@username`). Затем нажмите Deploy.
   Скрипт `vercel-build` сам применит миграции и загрузит задачи (`npm run migrate && npm run seed && next build`).
3. Один раз откройте `https://<проект>.vercel.app/api/setup?key=<CRON_SECRET>`. Эндпоинт выставит webhook, команды и кнопку меню и вернёт JSON с результатом.
4. В @BotFather выполните `/setdomain` → `<проект>.vercel.app`. Это нужно для входа через браузер.
5. Напишите боту `/start` и нажмите кнопку — приложение откроется, вход пройдёт автоматически.

Функции развёрнуты в регионе `bom1` (Mumbai), рядом с базой Supabase (`vercel.json`). Если база в другом регионе, поменяйте значение.

## Деплой на Vercel (alam.kz)
1. **Supabase.** Создайте проект, затем в `.env.local` укажите `DATABASE_URL` (Connect → Transaction pooler, порт 6543) и выполните `npm run migrate && npm run seed`.
2. **Vercel.** Импортируйте репозиторий, фреймворк — Next.js. В Environment Variables задайте:

   | Переменная | Значение |
   |---|---|
   | `DATABASE_URL` | строка pooler из Supabase |
   | `SESSION_SECRET` | случайная строка ≥ 32 символов |
   | `BOT_TOKEN` | токен от @BotFather |
   | `WEBHOOK_SECRET` | случайная строка (A–Z, a–z, 0–9, `_`, `-`) |
   | `CRON_SECRET` | случайная строка |
   | `ADMIN_TG_IDS` | ваш Telegram ID (через запятую, если админов несколько) |
   | `NEXT_PUBLIC_APP_URL` | `https://alam.kz` |
   | `NEXT_PUBLIC_BOT_USERNAME` | username бота без `@` |

3. **Домен.** Vercel → Settings → Domains → `alam.kz`. У регистратора домена пропишите DNS-записи, которые покажет Vercel.
4. **Бот.** В @BotFather выполните `/setdomain` → `alam.kz` и `/newapp` (Mini App с адресом `https://alam.kz`). Затем локально, с теми же переменными, запустите `npm run setup-bot`.
5. **Проверка.** Откройте бота → `/start` → «Жаттығуды бастау / Начать тренировку». Вход должен пройти автоматически.

Случайную строку для секретов можно получить так:
```bash
openssl rand -hex 32
```

## Банк задач
100 оригинальных задач: по 10 на каждую из 10 тем спецификации НЦТ (с 2026 г.), сложность A/B/C в пропорции спецификации (50/30/20%). Реальные задания НЦТ закрыты, поэтому задачи составлены по формату и темам официальной спецификации.
- У каждой задачи условие, 4 варианта, пошаговый разбор на русском и казахском. Неверные варианты построены на типичных ошибках.
- Ответы пересчитаны программно. `npm run validate-content` проверяет схему, наличие обоих языков, формулы, SVG и смешение латиницы с кириллицей.
- Казахские термины единые, они собраны в `content/glossary.md`.
- Диаграммы и графики — инлайн-SVG с подписями на языке задачи. Цвета берутся из токенов темы, поэтому рисунки читаются и в светлой, и в тёмной теме.
