import katex from "katex";
import { QUESTION_FILES } from "@/content/questions";
import { QuestionSchema, type LocalizedQuestion } from "@/lib/question-schema";
import { splitMath } from "@/lib/richtext";

/** Проверяет банк задач, возвращает список ошибок (пустой — всё в порядке). */
export function validateContent(files: Record<string, unknown> = QUESTION_FILES): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const [file, data] of Object.entries(files)) {
    if (!Array.isArray(data)) { errors.push(`${file}: ожидается массив`); continue; }
    data.forEach((raw, i) => {
      const where = `${file}[${i}]`;
      const parsed = QuestionSchema.safeParse(raw);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) errors.push(`${where} ${issue.path.join(".")}: ${issue.message}`);
        return;
      }
      const q = parsed.data;
      const at = `${where} ${q.id}`;
      if (ids.has(q.id)) errors.push(`${at}: повтор id`);
      ids.add(q.id);
      if (q.topic !== file) errors.push(`${at}: тема ${q.topic} лежит в файле ${file}`);
      if (!q.id.startsWith(`${q.topic}-`)) errors.push(`${at}: id должен начинаться с ${q.topic}-`);
      const unsafe = (svg?: string) => !!svg && /<script|<foreignObject|\son\w+\s*=|javascript:|href\s*=\s*["']?(?!#)/i.test(svg);
      if ([q.figure, q.ru.figure, q.kz.figure].some(unsafe)) errors.push(`${at}: недопустимое в SVG`);
      if (!!q.ru.figure !== !!q.kz.figure) errors.push(`${at}: языковой рисунок есть только на одном языке`);

      for (const lang of ["ru", "kz"] as const) {
        const l: LocalizedQuestion = q[lang];
        if (new Set(l.options).size !== l.options.length) errors.push(`${at} ${lang}: варианты повторяются`);
        if (l.table) {
          const width = l.table.head.length;
          l.table.rows.forEach((r, ri) => { if (r.length !== width) errors.push(`${at} ${lang}: строка таблицы ${ri} длиной ${r.length}, нужно ${width}`); });
        }
        const texts = [l.stem, l.explanation, ...l.options, ...(l.table ? [...l.table.head, ...l.table.rows.flat()] : [])];
        for (const text of texts) {
          if ((text.match(/\$/g)?.length ?? 0) % 2) errors.push(`${at} ${lang}: непарный $ в «${text.slice(0, 40)}»`);
          for (const seg of splitMath(text)) {
            if (seg.kind !== "math") continue;
            try { katex.renderToString(seg.value, { throwOnError: true }); }
            catch (e) { errors.push(`${at} ${lang}: KaTeX «${seg.value}»: ${(e as Error).message}`); }
          }
        }
      }
      const ruT = q.ru.table, kzT = q.kz.table;
      if (!!ruT !== !!kzT) errors.push(`${at}: таблица есть только на одном языке`);
      if (ruT && kzT && JSON.stringify(ruT.rows) !== JSON.stringify(kzT.rows) && ruT.rows.flat().every((c) => /^[\d\s.,%−-]+$/.test(c)))
        errors.push(`${at}: числовые строки таблиц RU/KZ различаются`);
    });
  }
  return errors;
}
