/**
 * Garden Objects for YogaQuest
 * Объекты сада и их связь с действиями пользователя
 */

/**
 * Типы объектов сада
 */
export const GARDEN_OBJECT_TYPES = {
  STONE: 'stone',
  FLOWER: 'flower',
  TREE: 'tree',
  LANTERN: 'lantern',
  WATER: 'water',
  LOTUS: 'lotus',
  GRASS: 'grass',
  FIREFLY: 'firefly',
  CANDLE: 'candle',
  BRIDGE: 'bridge',
  MOSS: 'moss',
  SPRINKLER: 'sprinkler',
};

/**
 * Связь типов практики с объектами сада
 */
export const PRACTICE_TYPE_OBJECTS = {
  meditate: {
    primary: ['meditation_stones', 'sand_circle', 'small_bowl'],
    secondary: ['calm_flowers'],
    description: 'Камни и песок для медитации',
    colors: ['#a8a8a8', '#d4c4a8', '#8b7355'],
  },
  restore: {
    primary: ['soft_flowers', 'moss', 'moon_flowers'],
    secondary: ['calm_pool'],
    description: 'Мягкие цветы и мох для восстановления',
    colors: ['#9CD67A', '#7FC97F', '#C9B8FF'],
  },
  soft: {
    primary: ['gentle_grass', 'soft_leaves', 'swaying_stems'],
    secondary: ['butterflies'],
    description: 'Трава и плавные листья',
    colors: ['#9CD67A', '#7FC97F', '#a8d8a8'],
  },
  stretch: {
    primary: ['vine_plants', 'long_stems', 'flexible_branches'],
    secondary: ['reaching_flowers'],
    description: 'Вьющиеся растения и длинные стебли',
    colors: ['#7FC97F', '#5a8a4a', '#9CD67A'],
  },
  power: {
    primary: ['strong_tree', 'deep_roots', 'large_leaves'],
    secondary: ['grounding_stones'],
    description: 'Дерево и крепкие корни',
    colors: ['#5a8a4a', '#4a7a3a', '#8a7355'],
  },
  integrate: {
    primary: ['lanterns', 'small_bridge', 'ornaments'],
    secondary: ['harmony_flowers'],
    description: 'Фонари и декоративные элементы',
    colors: ['#F7D774', '#ffd700', '#C9B8FF'],
  },
  other: {
    primary: ['neutral_flower', 'star_flower'],
    secondary: ['mystery_elements'],
    description: 'Нейтральные цветы и звёзды',
    colors: ['#FF9EC7', '#e8d5ff', '#ffd700'],
  },
};

/**
 * Объекты по сериям (streak)
 */
export const STREAK_OBJECTS = {
  3: {
    type: 'candle',
    id: 'streak_candle_1',
    name: 'Маленькая свеча',
    description: 'Огонь регулярности',
    icon: '🕯️',
    color: '#F7D774',
  },
  7: {
    type: 'lantern',
    id: 'streak_lantern_1',
    name: 'Фонарь',
    description: 'Свет недельного пути',
    icon: '🏮',
    color: '#F7D774',
  },
  14: {
    type: 'string_lights',
    id: 'streak_lights_1',
    name: 'Гирлянда огоньков',
    description: 'Две недели света',
    icon: '✨',
    color: '#ffd700',
  },
  30: {
    type: 'central_lantern',
    id: 'streak_central_1',
    name: 'Центральный фонарь',
    description: 'Месяц устойчивости',
    icon: '🏮',
    color: '#ffd700',
    size: 'large',
  },
  90: {
    type: 'eternal_flame',
    id: 'streak_eternal_1',
    name: 'Вечный огонь',
    description: 'Три месяца преданности',
    icon: '🔥',
    color: '#ff6b35',
    size: 'large',
  },
};

/**
 * Объекты по настроению
 */
export const MOOD_OBJECTS = {
  mood_improvement: {
    type: 'firefly',
    id: 'mood_firefly',
    name: 'Светлячок',
    description: 'Свет улучшения настроения',
    icon: '✨',
    color: '#F7D74',
    threshold: 5, // 5 улучшений настроения
  },
  honest_tracking: {
    type: 'mirror_stone',
    id: 'mood_mirror',
    name: 'Зеркальный камень',
    description: 'Символ самонаблюдения',
    icon: '🪞',
    color: '#c0c0c0',
    threshold: 10, // 10 заполненных настроений
  },
  warm_heart: {
    type: 'glowing_heart',
    id: 'mood_heart',
    name: 'Сияющее сердце',
    description: 'Тёплое сердце практики',
    icon: '💖',
    color: '#FF9EC7',
    threshold: 10, // 10 практик с настроением 5
  },
};

/**
 * Объекты по достижениям
 */
export const ACHIEVEMENT_OBJECTS = {
  first_bow: {
    type: 'ribbon',
    id: 'achieve_ribbon',
    name: 'Лента у входа',
    description: 'Первый поклон',
    icon: '🎀',
    color: '#FF9EC7',
  },
  seven_dawns: {
    type: 'sun_talisman',
    id: 'achieve_sun',
    name: 'Солнечный талисман',
    description: 'Семь рассветов',
    icon: '☀️',
    color: '#ffd700',
  },
  lunar_cycle: {
    type: 'moon_crescent',
    id: 'achieve_moon',
    name: 'Полумесяц',
    description: 'Лунный круг',
    icon: '🌙',
    color: '#C9B8FF',
  },
  space_within: {
    type: 'big_lotus',
    id: 'achieve_lotus',
    name: 'Большой лотос',
    description: 'Пространство внутри',
    icon: '🪷',
    color: '#FF9EC7',
    size: 'large',
  },
  first_lotus: {
    type: 'pond_lotus',
    id: 'garden_lotus',
    name: 'Лотос в пруду',
    description: 'Первый лотос',
    icon: '🪷',
    color: '#FF9EC7',
    placement: 'water',
  },
};

/**
 * Уровни развития объектов
 */
export const OBJECT_LEVELS = {
  SEED: 0,      // Только появляется
  SPROUT: 1,    // Росток
  GROWING: 2,   // Растёт
  MATURE: 3,    // Зрелое
  FLOWERING: 4, // Цветущее
  RADIANT: 5,   // Сияющее
};

/**
 * Получить объекты для типа практики
 * @param {string} practiceType - Тип практики
 * @returns {object} Объекты сада для типа практики
 */
export function getObjectsForPracticeType(practiceType) {
  return PRACTICE_TYPE_OBJECTS[practiceType] || PRACTICE_TYPE_OBJECTS.other;
}

/**
 * Получить объект для серии
 * @param {number} streak - Текущая серия
 * @returns {object|null} Объект для серии или null
 */
export function getObjectForStreak(streak) {
  // Возвращаем объект только при точном совпадении с milestone
  return STREAK_OBJECTS[streak] || null;
}

/**
 * Получить объекты для настроения
 * @param {object} moodStats - Статистика настроения
 * @returns {Array} Массив объектов
 */
export function getObjectsForMood(moodStats) {
  const objects = [];
  
  if (moodStats.improvementCount >= MOOD_OBJECTS.mood_improvement.threshold) {
    objects.push(MOOD_OBJECTS.mood_improvement);
  }
  
  if (moodStats.trackedCount >= MOOD_OBJECTS.honest_tracking.threshold) {
    objects.push(MOOD_OBJECTS.honest_tracking);
  }
  
  if (moodStats.happyCount >= MOOD_OBJECTS.warm_heart.threshold) {
    objects.push(MOOD_OBJECTS.warm_heart);
  }
  
  return objects;
}

/**
 * Получить объект для достижения
 * @param {string} achievementId - ID достижения
 * @returns {object|null} Объект сада или null
 */
export function getObjectForAchievement(achievementId) {
  return ACHIEVEMENT_OBJECTS[achievementId] || null;
}

/**
 * Рассчитать уровень объекта по количеству использований
 * @param {number} count - Количество раз
 * @returns {number} Уровень объекта (0-5)
 */
export function calculateObjectLevel(count) {
  if (count >= 10) return OBJECT_LEVELS.RADIANT;
  if (count >= 7) return OBJECT_LEVELS.FLOWERING;
  if (count >= 5) return OBJECT_LEVELS.MATURE;
  if (count >= 3) return OBJECT_LEVELS.GROWING;
  if (count >= 2) return OBJECT_LEVELS.SPROUT;
  return OBJECT_LEVELS.SEED;
}

/**
 * Получить описание уровня объекта
 * @param {number} level - Уровень объекта
 * @returns {object} Описание уровня
 */
export function getObjectLevelDescription(level) {
  const descriptions = {
    [OBJECT_LEVELS.SEED]: { label: 'Семя', icon: '🌱', opacity: 0.5 },
    [OBJECT_LEVELS.SPROUT]: { label: 'Росток', icon: '🌿', opacity: 0.7 },
    [OBJECT_LEVELS.GROWING]: { label: 'Растёт', icon: '🌱', opacity: 0.85 },
    [OBJECT_LEVELS.MATURE]: { label: 'Зрелое', icon: '🌳', opacity: 1 },
    [OBJECT_LEVELS.FLOWERING]: { label: 'Цветущее', icon: '🌸', opacity: 1 },
    [OBJECT_LEVELS.RADIANT]: { label: 'Сияющее', icon: '✨', opacity: 1 },
  };
  
  return descriptions[level] || descriptions[OBJECT_LEVELS.SEED];
}

/**
 * Создать начальное состояние объектов сада
 * @returns {object} Начальное состояние
 */
export function createInitialGardenObjects() {
  return {
    // Объекты по типам практики
    meditation_stones: { count: 0, level: 0 },
    sand_circle: { count: 0, level: 0 },
    soft_flowers: { count: 0, level: 0 },
    moss: { count: 0, level: 0 },
    moon_flowers: { count: 0, level: 0 },
    gentle_grass: { count: 0, level: 0 },
    soft_leaves: { count: 0, level: 0 },
    vine_plants: { count: 0, level: 0 },
    long_stems: { count: 0, level: 0 },
    strong_tree: { count: 0, level: 0 },
    deep_roots: { count: 0, level: 0 },
    lanterns: { count: 0, level: 0 },
    small_bridge: { count: 0, level: 0 },
    neutral_flower: { count: 0, level: 0 },
    
    // Объекты по сериям
    streak_candle: { count: 0, level: 0 },
    streak_lantern: { count: 0, level: 0 },
    streak_lights: { count: 0, level: 0 },
    central_lantern: { count: 0, level: 0 },
    
    // Объекты по настроению
    fireflies: { count: 0, level: 0 },
    mirror_stone: { count: 0, level: 0 },
    glowing_heart: { count: 0, level: 0 },
    
    // Объекты по достижениям
    ribbon: { count: 0, level: 0 },
    sun_talisman: { count: 0, level: 0 },
    moon_crescent: { count: 0, level: 0 },
    big_lotus: { count: 0, level: 0 },
    pond_lotus: { count: 0, level: 0 },
    
    // Специальные объекты
    water_pool: { count: 0, level: 0 },
    decorative_stones: { count: 0, level: 0 },
    path: { count: 0, level: 0 },
  };
}

/**
 * Получить позицию объекта на сцене
 * @param {string} objectId - ID объекта
 * @param {number} index - Индекс объекта (для множественных объектов)
 * @returns {object} Позиция {x, y, z}
 */
export function getObjectPosition(objectId, index = 0) {
  // Базовые позиции для разных типов объектов
  const basePositions = {
    meditation_stones: { x: 20, y: 60, z: 1 },
    soft_flowers: { x: 50, y: 70, z: 1 },
    gentle_grass: { x: 30, y: 80, z: 0 },
    vine_plants: { x: 70, y: 50, z: 1 },
    strong_tree: { x: 50, y: 40, z: 2 },
    lanterns: { x: 80, y: 30, z: 1 },
    water_pool: { x: 50, y: 60, z: 0 },
    pond_lotus: { x: 50, y: 55, z: 1 },
    fireflies: { x: 30 + index * 10, y: 20 + index * 5, z: 3 },
    streak_candle: { x: 10, y: 50, z: 1 },
    streak_lantern: { x: 90, y: 50, z: 1 },
    central_lantern: { x: 50, y: 30, z: 2 },
  };
  
  const base = basePositions[objectId] || { x: 50, y: 50, z: 1 };
  
  // Добавляем небольшую случайность для множественных объектов
  return {
    x: base.x + (index % 3) * 5,
    y: base.y + Math.floor(index / 3) * 5,
    z: base.z,
  };
}

export default {
  GARDEN_OBJECT_TYPES,
  PRACTICE_TYPE_OBJECTS,
  STREAK_OBJECTS,
  MOOD_OBJECTS,
  ACHIEVEMENT_OBJECTS,
  OBJECT_LEVELS,
  getObjectsForPracticeType,
  getObjectForStreak,
  getObjectsForMood,
  getObjectForAchievement,
  calculateObjectLevel,
  getObjectLevelDescription,
  createInitialGardenObjects,
  getObjectPosition,
};