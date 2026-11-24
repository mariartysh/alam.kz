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
- [ ] 3. БД Supabase
- [ ] 4. Вход через Telegram
- [ ] 5. Практика по темам
- [ ] 6. Пробный ЕНТ
- [ ] 7. Работа над ошибками
- [ ] 8. Статистика и рейтинг
- [ ] 9. Админка
- [ ] 10. Бот и напоминания
- [ ] 11. Банк задач (~100)
- [ ] 12. Полировка и деплой

> Задачи оригинальные, составлены по спецификации НЦТ. Казахские тексты стоит вычитать носителю языка.

## Формат задачи
Файлы `content/questions/<тема>.json`, схема описана в `lib/question-schema.ts`. Формулы пишутся в `$...$` (KaTeX), к условию можно приложить таблицу (`table`) и рисунок (`figure`, инлайн-SVG). Порядок вариантов приложение перемешивает при показе, поэтому `answer` можно оставлять 0.
