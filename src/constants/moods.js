/**
 * Настроения (Mood)
 * Шкала от 1 (плохо) до 5 (отлично)
 */
export const MOODS = [
  { id: 1, pixel: "😔", label: "ПЛОХО" },
  { id: 2, pixel: "😕", label: "ТАК СЕБЯ" },
  { id: 3, pixel: "😊", label: "ХОРОШО" },
  { id: 4, pixel: "😄", label: "ОТЛИЧНО" },
  { id: 5, pixel: "🌟", label: "КАЙФ!!" },
];

/**
 * Получить настроение по ID
 * @param {number} id - ID настроения (1-5)
 * @returns {object|undefined} Объект настроения
 */
export function getMoodById(id) {
  return MOODS.find(m => m.id === id);
}

/**
 * Получить эмодзи настроения
 * @param {number} id - ID настроения
 * @returns {string} Эмодзи или пустая строка
 */
export function getMoodEmoji(id) {
  const mood = getMoodById(id);
  return mood?.pixel ?? "";
}

/**
 * Получить название настроения
 * @param {number} id - ID настроения
 * @returns {string} Название или пустая строка
 */
export function getMoodLabel(id) {
  const mood = getMoodById(id);
  return mood?.label ?? "";
}