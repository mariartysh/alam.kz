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
- [ ] 9. Админка
- [ ] 10. Бот и напоминания
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
