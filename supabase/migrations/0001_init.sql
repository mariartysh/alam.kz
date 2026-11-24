-- alam: начальная схема. Доступ к данным только с сервера (service role), RLS закрывает anon.

create table if not exists users (
  tg_id          bigint primary key,
  first_name     text not null default '',
  last_name      text,
  username       text,
  photo_url      text,
  lang           text not null default 'ru' check (lang in ('ru', 'kz')),
  is_premium     boolean not null default false,
  reminders_on   boolean not null default true,
  reminder_hour  smallint not null default 19 check (reminder_hour between 0 and 23),
  bot_started    boolean not null default false,
  created_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now()
);

create table if not exists topics (
  id        text primary key,
  num       smallint not null unique,
  section   text not null,
  title_ru  text not null,
  title_kz  text not null
);

create table if not exists questions (
  id          text primary key,
  topic_id    text not null references topics(id),
  difficulty  char(1) not null check (difficulty in ('A', 'B', 'C')),
  answer      smallint not null,
  figure      text,
  content     jsonb not null,           -- { ru: {stem, options, explanation, table?}, kz: {...} }
  status      text not null default 'published' check (status in ('draft', 'published')),
  source      text not null default 'bank',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists questions_topic_idx on questions (topic_id) where status = 'published';

create table if not exists attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       bigint not null references users(tg_id) on delete cascade,
  mode          text not null check (mode in ('practice', 'exam', 'mistakes')),
  topic_id      text references topics(id),
  question_ids  text[] not null default '{}',
  started_at    timestamptz not null default now(),
  deadline_at   timestamptz,
  finished_at   timestamptz,
  score         smallint
);
create index if not exists attempts_user_idx on attempts (user_id, started_at desc);

create table if not exists answers (
  attempt_id    uuid not null references attempts(id) on delete cascade,
  question_id   text not null references questions(id) on delete cascade,
  user_id       bigint not null references users(tg_id) on delete cascade,
  chosen        smallint,               -- индекс варианта в исходном порядке (null — пропуск)
  is_correct    boolean not null,
  time_ms       integer,
  answered_at   timestamptz not null default now(),
  primary key (attempt_id, question_id)
);
create index if not exists answers_user_idx on answers (user_id, answered_at desc);

-- Работа над ошибками: система Лейтнера, коробки 1..5.
create table if not exists review_items (
  user_id      bigint not null references users(tg_id) on delete cascade,
  question_id  text not null references questions(id) on delete cascade,
  box          smallint not null default 1 check (box between 1 and 5),
  due_at       timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, question_id)
);
create index if not exists review_due_idx on review_items (user_id, due_at);

-- Активность по дням (Asia/Almaty) — для стрика и напоминаний.
create table if not exists daily_activity (
  user_id  bigint not null references users(tg_id) on delete cascade,
  day      date not null,
  solved   integer not null default 0,
  correct  integer not null default 0,
  primary key (user_id, day)
);

-- Рейтинг недели: правильные ответы с понедельника (Asia/Almaty).
create or replace view leaderboard_weekly as
select u.tg_id, u.first_name, u.username, u.photo_url,
       sum(d.correct)::int as correct, sum(d.solved)::int as solved
from daily_activity d
join users u on u.tg_id = d.user_id
where d.day >= date_trunc('week', (now() at time zone 'Asia/Almaty'))::date
group by u.tg_id
having sum(d.correct) > 0;

-- Атомарное увеличение счётчиков дня.
create or replace function bump_activity(p_user bigint, p_correct boolean)
returns void language sql as $$
  insert into daily_activity (user_id, day, solved, correct)
  values (p_user, (now() at time zone 'Asia/Almaty')::date, 1, case when p_correct then 1 else 0 end)
  on conflict (user_id, day) do update
    set solved = daily_activity.solved + 1,
        correct = daily_activity.correct + excluded.correct;
$$;

alter table users enable row level security;
alter table topics enable row level security;
alter table questions enable row level security;
alter table attempts enable row level security;
alter table answers enable row level security;
alter table review_items enable row level security;
alter table daily_activity enable row level security;
