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
- [ ] 11. Банк задач (~100)
- [ ] 12. Полировка и деплой

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
