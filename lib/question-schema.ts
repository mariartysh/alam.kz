import { z } from "zod";
import { TOPIC_IDS } from "@/content/topics";
import { EXAM } from "@/content/exam-config";

/** Таблица к условию: заголовок и строки (ячейки — строки, могут содержать $формулы$). */
const Table = z.object({
  head: z.array(z.string().min(1)).min(1),
  rows: z.array(z.array(z.string())).min(1),
});

const Localized = z.object({
  stem: z.string().min(10),
  options: z.array(z.string().min(1)).length(EXAM.optionsCount),
  explanation: z.string().min(10),
  table: Table.optional(),
});

export const QuestionSchema = z.object({
  id: z.string().regex(/^[a-z]+-\d{3}$/, "id вида topic-001"),
  topic: z.enum(TOPIC_IDS),
  difficulty: z.enum(["A", "B", "C"]),
  answer: z.number().int().min(0).max(EXAM.optionsCount - 1),
  /** Необязательный рисунок: инлайн-SVG без скриптов. Подписи — цифры/латиница, чтобы подходил обоим языкам. */
  figure: z.string().startsWith("<svg").optional(),
  ru: Localized,
  kz: Localized,
});

export type Question = z.infer<typeof QuestionSchema>;
export type LocalizedQuestion = z.infer<typeof Localized>;
export const QuestionFileSchema = z.array(QuestionSchema);
