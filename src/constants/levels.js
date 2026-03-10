/**
 * Уровни пользователя
 * Определяются по количеству тренировок
 */

/**
 * Пороги для уровней
 */
export const LEVEL_THRESHOLDS = {
  GODDESS: 60,    // Богиня йоги
  ADVANCED: 30,   // Продвинутая
  PRACTICING: 10, // Практикующая
  BEGINNER: 1,    // Начинающая
  NEWBIE: 0,      // Новичок
};

/**
 * Конфигурация уровней
 */
export const LEVELS = {
  GODDESS: {
    id: "goddess",
    label: "БОГИНЯ ЙОГИ",
    icon: "👑",
    hearts: 5,
    minWorkouts: LEVEL_THRESHOLDS.GODDESS,
  },
  ADVANCED: {
    id: "advanced",
    label: "ПРОДВИНУТАЯ",
    icon: "💎",
    hearts: 4,
    minWorkouts: LEVEL_THRESHOLDS.ADVANCED,
  },
  PRACTICING: {
    id: "practicing",
    label: "ПРАКТИКУЮЩАЯ",
    icon: "🌸",
    hearts: 3,
    minWorkouts: LEVEL_THRESHOLDS.PRACTICING,
  },
  BEGINNER: {
    id: "beginner",
    label: "НАЧИНАЮЩАЯ",
    icon: "🌱",
    hearts: 2,
    minWorkouts: LEVEL_THRESHOLDS.BEGINNER,
  },
  NEWBIE: {
    id: "newbie",
    label: "НОВИЧОК",
    icon: "✨",
    hearts: 1,
    minWorkouts: LEVEL_THRESHOLDS.NEWBIE,
  },
};

/**
 * Получить уровень по количеству тренировок
 * @param {number} count - Количество тренировок
 * @returns {object} Объект уровня {id, label, icon, hearts}
 */
export function getLevel(count) {
  if (count >= LEVEL_THRESHOLDS.GODDESS) {
    return LEVELS.GODDESS;
  }
  if (count >= LEVEL_THRESHOLDS.ADVANCED) {
    return LEVELS.ADVANCED;
  }
  if (count >= LEVEL_THRESHOLDS.PRACTICING) {
    return LEVELS.PRACTICING;
  }
  if (count >= LEVEL_THRESHOLDS.BEGINNER) {
    return LEVELS.BEGINNER;
  }
  return LEVELS.NEWBIE;
}

/**
 * Получить прогресс до следующего уровня
 * @param {number} count - Количество тренировок
 * @returns {object} {currentLevel, nextLevel, progress, remaining}
 */
export function getLevelProgress(count) {
  const currentLevel = getLevel(count);
  
  // Определяем следующий уровень
  let nextLevel = null;
  let nextThreshold = null;
  
  if (count < LEVEL_THRESHOLDS.BEGINNER) {
    nextLevel = LEVELS.BEGINNER;
    nextThreshold = LEVEL_THRESHOLDS.BEGINNER;
  } else if (count < LEVEL_THRESHOLDS.PRACTICING) {
    nextLevel = LEVELS.PRACTICING;
    nextThreshold = LEVEL_THRESHOLDS.PRACTICING;
  } else if (count < LEVEL_THRESHOLDS.ADVANCED) {
    nextLevel = LEVELS.ADVANCED;
    nextThreshold = LEVEL_THRESHOLDS.ADVANCED;
  } else if (count < LEVEL_THRESHOLDS.GODDESS) {
    nextLevel = LEVELS.GODDESS;
    nextThreshold = LEVEL_THRESHOLDS.GODDESS;
  }
  
  // Текущий порог
  let currentThreshold = 0;
  if (count >= LEVEL_THRESHOLDS.GODDESS) {
    currentThreshold = LEVEL_THRESHOLDS.GODDESS;
  } else if (count >= LEVEL_THRESHOLDS.ADVANCED) {
    currentThreshold = LEVEL_THRESHOLDS.ADVANCED;
  } else if (count >= LEVEL_THRESHOLDS.PRACTICING) {
    currentThreshold = LEVEL_THRESHOLDS.PRACTICING;
  } else if (count >= LEVEL_THRESHOLDS.BEGINNER) {
    currentThreshold = LEVEL_THRESHOLDS.BEGINNER;
  }
  
  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progress: 100,
      remaining: 0,
      isMaxLevel: true,
    };
  }
  
  const rangeStart = currentThreshold;
  const rangeEnd = nextThreshold;
  const progress = Math.round(((count - rangeStart) / (rangeEnd - rangeStart)) * 100);
  
  return {
    currentLevel,
    nextLevel,
    progress: Math.min(100, Math.max(0, progress)),
    remaining: nextThreshold - count,
    isMaxLevel: false,
  };
}