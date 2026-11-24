/**
 * Загружает темы и задачи из content/ в Supabase.
 *   npm run seed            — добавить новые задачи, существующие не трогать (правки из админки сохраняются)
 *   npm run seed -- --force — перезаписать задачи из JSON
 */
import { createClient } from "@supabase/supabase-js";
import { TOPICS } from "@/content/topics";
import { loadQuestions } from "@/content/questions";
import { validateContent } from "@/lib/validate-content";

async function main() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Задайте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY (.env.local)");
  const errors = validateContent();
  if (errors.length) throw new Error(`Банк задач невалиден:\n${errors.join("\n")}`);

  const force = process.argv.includes("--force");
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const topics = TOPICS.map((t) => ({ id: t.id, num: t.num, section: t.section, title_ru: t.ru, title_kz: t.kz }));
  const { error: te } = await sb.from("topics").upsert(topics);
  if (te) throw te;

  const rows = loadQuestions().map((q) => ({
    id: q.id, topic_id: q.topic, difficulty: q.difficulty, answer: q.answer,
    figure: q.figure ?? null, content: { ru: q.ru, kz: q.kz }, source: "bank",
    updated_at: new Date().toISOString(),
  }));
  const { error: qe } = await sb.from("questions").upsert(rows, { onConflict: "id", ignoreDuplicates: !force });
  if (qe) throw qe;
  console.log(`Темы: ${topics.length}, задачи: ${rows.length}${force ? " (перезаписаны)" : ""}`);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
