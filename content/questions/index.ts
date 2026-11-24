import { QuestionFileSchema, type Question } from "@/lib/question-schema";
import percent from "./percent.json";
import stats from "./stats.json";
import area from "./area.json";

/** Все JSON-файлы банка задач. Новый файл темы добавляется сюда. */
export const QUESTION_FILES: Record<string, unknown> = { percent, stats, area };

export function loadQuestions(): Question[] {
  return Object.values(QUESTION_FILES).flatMap((data) => QuestionFileSchema.parse(data));
}
