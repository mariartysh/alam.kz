/**
 * Загружает темы и задачи из content/ в базу.
 *   npm run seed            — добавить новые задачи (правки из админки не трогаются)
 *   npm run seed -- --force — перезаписать задачи из JSON
 */
import postgres from "postgres";
import { validateContent } from "@/lib/validate-content";
import { seed } from "@/lib/seed-core";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Задайте DATABASE_URL (.env.local)");
  const errors = validateContent();
  if (errors.length) throw new Error(`Банк задач невалиден:\n${errors.join("\n")}`);
  const sql = postgres(url, { prepare: false, onnotice: () => {} });
  const force = process.argv.includes("--force");
  const r = await seed(sql, force);
  console.log(`Темы: ${r.topics}, задачи в банке: ${r.questions}, записано: ${r.written}${force ? " (force)" : ""}`);
  await sql.end();
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
