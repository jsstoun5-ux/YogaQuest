/**
 * Типы йога-практик
 */
export const PRACTICE_TYPES = [
  { id: "power",    label: "СИЛОВАЯ",          icon: "💪", color: "#ff8fab", desc: "укрепляем тело" },
  { id: "soft",     label: "МЯГКАЯ",           icon: "🌸", color: "#c9b8ff", desc: "нежная практика" },
  { id: "restore",  label: "ВОССТАНОВИТ.",     icon: "✨", color: "#a8edea", desc: "для восстановления" },
  { id: "meditate", label: "МЕДИТАТИВНАЯ",     icon: "🧘", color: "#ffd6a5", desc: "для ума и духа" },
  { id: "integrate", label: "ИНТЕГРАЦИОННАЯ", icon: "🌀", color: "#b5ead7", desc: "всё вместе" },
  { id: "stretch",  label: "РАСТЯЖКА",         icon: "🤸", color: "#ffb7c5", desc: "гибкость" },
  { id: "other",    label: "ДРУГОЕ",           icon: "⭐", color: "#e8d5ff", desc: "своя практика" },
];

/**
 * Получить тип практики по ID
 * @param {string} id - ID типа практики
 * @returns {object|undefined} Объект типа практики
 */
export function getPracticeTypeById(id) {
  return PRACTICE_TYPES.find(t => t.id === id);
}

/**
 * Получить иконку типа практики
 * @param {string} id - ID типа практики
 * @returns {string} Иконка или пустая строка
 */
export function getPracticeIcon(id) {
  const type = getPracticeTypeById(id);
  return type?.icon ?? "";
}

/**
 * Получить название типа практики
 * @param {string} id - ID типа практики
 * @returns {string} Название или пустая строка
 */
export function getPracticeLabel(id) {
  const type = getPracticeTypeById(id);
  return type?.label ?? "";
}
