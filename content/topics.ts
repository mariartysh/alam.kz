/**
 * Таксономия тем по спецификации НЦТ «Математическая грамотность» (ЕНТ, с 2026 г.).
 * Пробный ЕНТ берёт по одной задаче из каждой темы, поэтому тем ровно 10.
 */
export const SECTIONS = {
  quantity: { ru: "Количество", kz: "Сан шамасы" },
  change: { ru: "Изменение и зависимости", kz: "Өзгеріс және тәуелділік" },
  space: { ru: "Пространство и форма", kz: "Кеңістік және пішін" },
  data: { ru: "Неопределённость и данные", kz: "Белгісіздік және деректер" },
  logic: { ru: "Логика", kz: "Логика" },
} as const;

export type SectionId = keyof typeof SECTIONS;

export const TOPICS = [
  { id: "percent", section: "quantity", icon: "💸",
    ru: "Проценты: скидки, налоги, вклады", kz: "Пайыздар: жеңілдік, салық, салым" },
  { id: "ratio", section: "quantity", icon: "⚖️",
    ru: "Пропорции, масштаб, единицы измерения", kz: "Пропорция, масштаб, өлшем бірліктері" },
  { id: "arith", section: "quantity", icon: "🧾",
    ru: "Арифметика в жизни: тарифы и выгодный выбор", kz: "Өмірдегі арифметика: тарифтер және тиімді таңдау" },
  { id: "graphs", section: "change", icon: "📈",
    ru: "Графики и зависимости", kz: "Графиктер және тәуелділіктер" },
  { id: "motion", section: "change", icon: "🚗",
    ru: "Движение и работа", kz: "Қозғалыс және жұмыс" },
  { id: "area", section: "space", icon: "📐",
    ru: "Площадь и периметр", kz: "Аудан және периметр" },
  { id: "volume", section: "space", icon: "📦",
    ru: "Объём и поверхность", kz: "Көлем және бет ауданы" },
  { id: "stats", section: "data", icon: "📊",
    ru: "Статистика: среднее, медиана, диаграммы", kz: "Статистика: орташа мән, медиана, диаграммалар" },
  { id: "prob", section: "data", icon: "🎲",
    ru: "Вероятность и комбинаторика", kz: "Ықтималдық және комбинаторика" },
  { id: "logic", section: "logic", icon: "🧩",
    ru: "Логические задачи", kz: "Логикалық есептер" },
] as const satisfies readonly { id: string; section: SectionId; icon: string; ru: string; kz: string }[];

export type TopicId = (typeof TOPICS)[number]["id"];
export const TOPIC_IDS = TOPICS.map((t) => t.id) as [TopicId, ...TopicId[]];

export function getTopic(id: string) {
  return TOPICS.find((t) => t.id === id);
}
