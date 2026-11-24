import { validateContent } from "@/lib/validate-content";
import { loadQuestions } from "@/content/questions";
import { TOPICS } from "@/content/topics";

const errors = validateContent();
if (errors.length) {
  console.error(`Ошибок: ${errors.length}`);
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
const qs = loadQuestions();
console.log(`OK: ${qs.length} задач`);
for (const t of TOPICS) {
  const list = qs.filter((q) => q.topic === t.id);
  const mix = (["A", "B", "C"] as const).map((d) => `${d}:${list.filter((q) => q.difficulty === d).length}`).join(" ");
  console.log(`  ${t.id.padEnd(8)} ${String(list.length).padStart(3)}  ${mix}`);
}
