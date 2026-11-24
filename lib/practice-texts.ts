import type { MessageKey } from "./i18n";

/** Тексты для PracticeSession; overrides подменяют отдельные ключи (например, для работы над ошибками). */
export function practiceTexts(t: (k: MessageKey) => string, overrides: Partial<Record<string, MessageKey>> = {}) {
  const k = (name: string, key: MessageKey) => t(overrides[name] ?? key);
  return {
    progress: k("progress", "practice.progress"), correct: k("correct", "practice.correct"), wrong: k("wrong", "practice.wrong"),
    explanation: k("explanation", "practice.explanation"), next: k("next", "practice.next"), finish: k("finish", "practice.finish"),
    done: k("done", "practice.done"), score: k("score", "practice.score"), again: k("again", "practice.again"),
    toTopics: k("toTopics", "practice.toTopics"), mistakesHint: k("mistakesHint", "practice.mistakesHint"),
    error: t("common.error"), loading: t("common.loading"),
    diffA: t("diff.A"), diffB: t("diff.B"), diffC: t("diff.C"),
  };
}
