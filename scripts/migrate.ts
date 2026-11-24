/** Применяет SQL-миграции из supabase/migrations по порядку (учёт в таблице _migrations). */
import postgres from "postgres";
import { readdirSync, readFileSync } from "fs";
import path from "path";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Задайте DATABASE_URL (.env.local)");
  const sql = postgres(url, { prepare: false, onnotice: () => {} });
  await sql`create table if not exists _migrations (name text primary key, applied_at timestamptz default now())`;
  await sql`alter table _migrations enable row level security`;
  const dir = path.join(process.cwd(), "supabase/migrations");
  const done = new Set((await sql`select name from _migrations`).map((r) => r.name as string));
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(file)) continue;
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(path.join(dir, file), "utf8"));
      await tx`insert into _migrations (name) values (${file})`;
    });
    console.log("applied", file);
  }
  await sql.end();
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
