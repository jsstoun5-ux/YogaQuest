/**
 * Экспорт всех констант
 */
export { PRACTICE_TYPES, getPracticeTypeById, getPracticeIcon, getPracticeLabel } from './practiceTypes.js';
export { MOODS, getMoodById, getMoodEmoji, getMoodLabel } from './moods.js';
export { ACHIEVEMENTS, calcStreak, getAchievementById, getUnlockedAchievements, getNewAchievements } from './achievements.js';
export { LEVEL_THRESHOLDS, LEVELS, getLevel, getLevelProgress } from './levels.js';

/**
 * Пресеты длительности тренировки (в минутах)
 */
export const DURATION_PRESETS = [15, 30, 45, 60, 90];

/**
 * Шаги онбординга
 */
export const ONBOARD_STEPS = [
  { icon: "🌸", title: "YOGAQUEST.EXE", sub: "загрузка...", text: "Твой личный дневник практики. Отслеживай тренировки, настроение и рост." },
  { icon: "📊", title: "ПРОГРЕСС.EXE", sub: "анализ данных", text: "Каждая практика откладывается на графике. Наблюдай, как меняется настроение." },
  { icon: "🏆", title: "АЧИВКИ.EXE", sub: "разблокировка", text: "За регулярность и разнообразие практик — получай значки и повышай уровень!" },
  { icon: "✨", title: "ГОТОВО!", sub: "запуск...", text: "Нажми ➕ внизу экрана, чтобы записать первую тренировку." },
];

/**
 * Ключи для хранения данных
 */
export const STORAGE_KEYS = {
  WORKOUTS: "yogaquest_workouts",
  ONBOARDING: "yogaquest_onboard",
  USER_PROFILE: "yogaquest_profile",
};

/**
 * Названия месяцев на русском
 */
export const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

/**
 * Сокращённые названия месяцев на русском
 */
export const MONTH_NAMES_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек"
];

/**
 * Названия дней недели на русском (короткие)
 */
export const WEEKDAY_NAMES_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];