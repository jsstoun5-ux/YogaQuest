/**
 * Achievement List for YogaQuest
 * 20 достижений с категориями и редкостями
 */

import { calcStreak } from '../constants/achievements.js';

/**
 * Категории достижений
 */
export const ACHIEVEMENT_CATEGORIES = {
  FIRST_STEPS: 'first_steps',
  REGULARITY: 'regularity',
  DEPTH: 'depth',
  DIVERSITY: 'diversity',
  MOOD: 'mood',
  GARDEN: 'garden',
  SPECIAL: 'special',
};

/**
 * Редкости достижений
 */
export const ACHIEVEMENT_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  LEGENDARY: 'legendary',
};

/**
 * XP награды по редкости
 */
export const ACHIEVEMENT_XP_REWARDS = {
  common: 20,
  rare: 35,
  legendary: 50,
};

/**
 * Список всех 20 достижений
 */
export const ACHIEVEMENT_LIST = [
  // === КАТЕГОРИЯ "ПЕРВЫЕ ШАГИ" ===
  {
    id: 'first_bow',
    title: 'Первый поклон',
    titleEn: 'First Bow',
    description: 'Отметить первую практику.',
    category: ACHIEVEMENT_CATEGORIES.FIRST_STEPS,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '🙏',
    xpReward: ACHIEVEMENT_XP_REWARDS.common,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return workouts.length >= 1;
    },
  },
  {
    id: 'three_returns',
    title: 'Три возвращения',
    titleEn: 'Three Returns',
    description: 'Отметить 3 практики.',
    category: ACHIEVEMENT_CATEGORIES.FIRST_STEPS,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '🌿',
    xpReward: ACHIEVEMENT_XP_REWARDS.common,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return workouts.length >= 3;
    },
  },
  {
    id: 'thread_of_rhythm',
    title: 'Нить ритма',
    titleEn: 'Thread of Rhythm',
    description: 'Отметить 10 практик.',
    category: ACHIEVEMENT_CATEGORIES.FIRST_STEPS,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '📿',
    xpReward: ACHIEVEMENT_XP_REWARDS.common,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return workouts.length >= 10;
    },
  },
  {
    id: 'foundation_of_path',
    title: 'Основание пути',
    titleEn: 'Foundation of the Path',
    description: 'Отметить 25 практик.',
    category: ACHIEVEMENT_CATEGORIES.FIRST_STEPS,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🪨',
    xpReward: ACHIEVEMENT_XP_REWARDS.rare,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return workouts.length >= 25;
    },
  },

  // === КАТЕГОРИЯ "РЕГУЛЯРНОСТЬ" ===
  {
    id: 'quiet_flame',
    title: 'Тихий огонь',
    titleEn: 'Quiet Flame',
    description: 'Практиковать 3 дня подряд.',
    category: ACHIEVEMENT_CATEGORIES.REGULARITY,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '🕯️',
    xpReward: ACHIEVEMENT_XP_REWARDS.common,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return calcStreak(workouts) >= 3;
    },
  },
  {
    id: 'seven_dawns',
    title: 'Семь рассветов',
    titleEn: 'Seven Dawns',
    description: 'Практиковать 7 дней подряд.',
    category: ACHIEVEMENT_CATEGORIES.REGULARITY,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🌅',
    xpReward: ACHIEVEMENT_XP_REWARDS.rare,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return calcStreak(workouts) >= 7;
    },
  },
  {
    id: 'lunar_cycle',
    title: 'Лунный круг',
    titleEn: 'Lunar Cycle',
    description: 'Практиковать 14 дней подряд.',
    category: ACHIEVEMENT_CATEGORIES.REGULARITY,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🌙',
    xpReward: ACHIEVEMENT_XP_REWARDS.rare,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return calcStreak(workouts) >= 14;
    },
  },
  {
    id: 'roots_of_steadiness',
    title: 'Корни устойчивости',
    titleEn: 'Roots of Steadiness',
    description: 'Практиковать 30 дней подряд.',
    category: ACHIEVEMENT_CATEGORIES.REGULARITY,
    rarity: ACHIEVEMENT_RARITIES.LEGENDARY,
    icon: '🌳',
    xpReward: ACHIEVEMENT_XP_REWARDS.legendary,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return calcStreak(workouts) >= 30;
    },
  },

  // === КАТЕГОРИЯ "ГЛУБИНА" ===
  {
    id: 'full_hour',
    title: 'Полный час',
    titleEn: 'Full Hour',
    description: 'Выполнить практику 60+ минут.',
    category: ACHIEVEMENT_CATEGORIES.DEPTH,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '⏳',
    xpReward: ACHIEVEMENT_XP_REWARDS.common,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return workouts.some(w => w.duration >= 60);
    },
  },
  {
    id: 'long_breath',
    title: 'Долгое дыхание',
    titleEn: 'Long Breath',
    description: 'Выполнить практику 90+ минут.',
    category: ACHIEVEMENT_CATEGORIES.DEPTH,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🌊',
    xpReward: ACHIEVEMENT_XP_REWARDS.rare,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      return workouts.some(w => w.duration >= 90);
    },
  },
  {
    id: 'gathered_presence',
    title: 'Собранное присутствие',
    titleEn: 'Gathered Presence',
    description: 'Набрать суммарно 10 часов практики.',
    category: ACHIEVEMENT_CATEGORIES.DEPTH,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '📿',
    xpReward: ACHIEVEMENT_XP_REWARDS.rare,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      return totalMinutes >= 600; // 10 часов = 600 минут
    },
  },
  {
    id: 'space_within',
    title: 'Пространство внутри',
    titleEn: 'Space Within',
    description: 'Набрать суммарно 25 часов практики.',
    category: ACHIEVEMENT_CATEGORIES.DEPTH,
    rarity: ACHIEVEMENT_RARITIES.LEGENDARY,
    icon: '🪷',
    xpReward: ACHIEVEMENT_XP_REWARDS.legendary,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      return totalMinutes >= 1500; // 25 часов = 1500 минут
    },
  },

  // === КАТЕГОРИЯ "РАЗНООБРАЗИЕ" ===
  {
    id: 'five_paths',
    title: 'Пять троп',
    titleEn: 'Five Paths',
    description: 'Попробовать 5 разных типов практики.',
    category: ACHIEVEMENT_CATEGORIES.DIVERSITY,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '🛤️',
    xpReward: ACHIEVEMENT_XP_REWARDS.common,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      const types = new Set(workouts.map(w => w.type).filter(Boolean));
      return types.size >= 5;
    },
  },
  {
    id: 'wholeness',
    title: 'Целостность',
    titleEn: 'Wholeness',
    description: 'Попробовать все доступные типы практики.',
    category: ACHIEVEMENT_CATEGORIES.DIVERSITY,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '🔮',
    xpReward: ACHIEVEMENT_XP_REWARDS.rare,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      const types = new Set(workouts.map(w => w.type).filter(Boolean));
      const mainTypes = ['power', 'soft', 'restore', 'meditate', 'integrate', 'stretch'];
      return mainTypes.every(t => types.has(t));
    },
  },
  {
    id: 'heart_of_calm',
    title: 'Сердце покоя',
    titleEn: 'Heart of Calm',
    description: 'Отметить 5 медитативных или восстановительных практик.',
    category: ACHIEVEMENT_CATEGORIES.DIVERSITY,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '💧',
    xpReward: ACHIEVEMENT_XP_REWARDS.common,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      const calmTypes = ['meditate', 'restore'];
      const calmCount = workouts.filter(w => calmTypes.includes(w.type)).length;
      return calmCount >= 5;
    },
  },
  {
    id: 'strength_and_softness',
    title: 'Сила и мягкость',
    titleEn: 'Strength and Softness',
    description: 'Отметить минимум 3 силовые и 3 мягкие практики.',
    category: ACHIEVEMENT_CATEGORIES.DIVERSITY,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '☯️',
    xpReward: ACHIEVEMENT_XP_REWARDS.rare,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      const powerCount = workouts.filter(w => w.type === 'power').length;
      const softTypes = ['soft', 'restore', 'stretch'];
      const softCount = workouts.filter(w => softTypes.includes(w.type)).length;
      return powerCount >= 3 && softCount >= 3;
    },
  },

  // === КАТЕГОРИЯ "НАСТРОЕНИЕ" ===
  {
    id: 'lighter_than_before',
    title: 'Светлее, чем было',
    titleEn: 'Lighter Than Before',
    description: 'Хотя бы 5 раз отметить улучшение настроения после практики.',
    category: ACHIEVEMENT_CATEGORIES.MOOD,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '⭐',
    xpReward: ACHIEVEMENT_XP_REWARDS.common,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      const improvedCount = workouts.filter(w => 
        w.moodBefore != null && w.moodAfter != null && w.moodAfter > w.moodBefore
      ).length;
      return improvedCount >= 5;
    },
  },
  {
    id: 'honest_presence',
    title: 'Честное присутствие',
    titleEn: 'Honest Presence',
    description: '10 раз заполнить настроение до и после практики.',
    category: ACHIEVEMENT_CATEGORIES.MOOD,
    rarity: ACHIEVEMENT_RARITIES.COMMON,
    icon: '🪞',
    xpReward: ACHIEVEMENT_XP_REWARDS.common,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      const filledCount = workouts.filter(w => 
        w.moodBefore != null && w.moodAfter != null
      ).length;
      return filledCount >= 10;
    },
  },
  {
    id: 'warm_heart',
    title: 'Тёплое сердце',
    titleEn: 'Warm Heart',
    description: '10 практик завершить с настроением 5.',
    category: ACHIEVEMENT_CATEGORIES.MOOD,
    rarity: ACHIEVEMENT_RARITIES.RARE,
    icon: '💖',
    xpReward: ACHIEVEMENT_XP_REWARDS.rare,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      const happyCount = workouts.filter(w => w.moodAfter === 5).length;
      return happyCount >= 10;
    },
  },

  // === КАТЕГОРИЯ "САД" ===
  {
    id: 'first_lotus',
    title: 'Первый лотос',
    titleEn: 'First Lotus',
    description: 'Довести сад до стадии, где появляется первый цветок лотоса.',
    category: ACHIEVEMENT_CATEGORIES.GARDEN,
    rarity: ACHIEVEMENT_RARITIES.LEGENDARY,
    icon: '🪷',
    xpReward: ACHIEVEMENT_XP_REWARDS.legendary,
    secret: false,
    checkCondition: (userData) => {
      const workouts = userData.workouts || [];
      // Лотос появляется на стадии 7 (60-89 практик)
      return workouts.length >= 60;
    },
  },
];

/**
 * Получить достижение по ID
 * @param {string} id - ID достижения
 * @returns {object|undefined} Объект достижения
 */
export function getAchievementById(id) {
  return ACHIEVEMENT_LIST.find(a => a.id === id);
}

/**
 * Получить достижения по категории
 * @param {string} category - Категория
 * @returns {Array} Массив достижений
 */
export function getAchievementsByCategory(category) {
  return ACHIEVEMENT_LIST.filter(a => a.category === category);
}

/**
 * Получить достижения по редкости
 * @param {string} rarity - Редкость
 * @returns {Array} Массив достижений
 */
export function getAchievementsByRarity(rarity) {
  return ACHIEVEMENT_LIST.filter(a => a.rarity === rarity);
}

/**
 * Получить все видимые (не секретные) достижения
 * @returns {Array} Массив достижений
 */
export function getVisibleAchievements() {
  return ACHIEVEMENT_LIST.filter(a => !a.secret);
}

/**
 * Получить категории достижений с названиями
 * @returns {object} Объект с категориями
 */
export function getCategoriesWithLabels() {
  return {
    [ACHIEVEMENT_CATEGORIES.FIRST_STEPS]: {
      id: ACHIEVEMENT_CATEGORIES.FIRST_STEPS,
      label: 'Первые шаги',
      icon: '🌱',
    },
    [ACHIEVEMENT_CATEGORIES.REGULARITY]: {
      id: ACHIEVEMENT_CATEGORIES.REGULARITY,
      label: 'Регулярность',
      icon: '🔥',
    },
    [ACHIEVEMENT_CATEGORIES.DEPTH]: {
      id: ACHIEVEMENT_CATEGORIES.DEPTH,
      label: 'Глубина',
      icon: '🌊',
    },
    [ACHIEVEMENT_CATEGORIES.DIVERSITY]: {
      id: ACHIEVEMENT_CATEGORIES.DIVERSITY,
      label: 'Разнообразие',
      icon: '🌈',
    },
    [ACHIEVEMENT_CATEGORIES.MOOD]: {
      id: ACHIEVEMENT_CATEGORIES.MOOD,
      label: 'Настроение',
      icon: '💫',
    },
    [ACHIEVEMENT_CATEGORIES.GARDEN]: {
      id: ACHIEVEMENT_CATEGORIES.GARDEN,
      label: 'Сад',
      icon: '🌸',
    },
    [ACHIEVEMENT_CATEGORIES.SPECIAL]: {
      id: ACHIEVEMENT_CATEGORIES.SPECIAL,
      label: 'Особые',
      icon: '✨',
    },
  };
}

/**
 * Получить редкости с названиями
 * @returns {object} Объект с редкостями
 */
export function getRaritiesWithLabels() {
  return {
    [ACHIEVEMENT_RARITIES.COMMON]: {
      id: ACHIEVEMENT_RARITIES.COMMON,
      label: 'Обычное',
      color: '#a8a8a8',
    },
    [ACHIEVEMENT_RARITIES.RARE]: {
      id: ACHIEVEMENT_RARITIES.RARE,
      label: 'Редкое',
      color: '#c9b8ff',
    },
    [ACHIEVEMENT_RARITIES.LEGENDARY]: {
      id: ACHIEVEMENT_RARITIES.LEGENDARY,
      label: 'Легендарное',
      color: '#ffd700',
    },
  };
}

export default {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_RARITIES,
  ACHIEVEMENT_XP_REWARDS,
  ACHIEVEMENT_LIST,
  getAchievementById,
  getAchievementsByCategory,
  getAchievementsByRarity,
  getVisibleAchievements,
  getCategoriesWithLabels,
  getRaritiesWithLabels,
};