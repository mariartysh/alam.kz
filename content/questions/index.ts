import { QuestionFileSchema, type Question } from "@/lib/question-schema";
import numeric from "./numeric.json";
import equations from "./equations.json";
import percent from "./percent.json";
import stats from "./stats.json";
import prob from "./prob.json";
import dependence from "./dependence.json";
import sequences from "./sequences.json";
import geometry from "./geometry.json";
import area from "./area.json";
import surface from "./surface.json";

/** Банк задач: по файлу на тему спецификации. */
export const QUESTION_FILES: Record<string, unknown> = {
  numeric, equations, percent, stats, prob, dependence, sequences, geometry, area, surface,
};

export function loadQuestions(): Question[] {
  return Object.values(QUESTION_FILES).flatMap((data) => QuestionFileSchema.parse(data));
}
