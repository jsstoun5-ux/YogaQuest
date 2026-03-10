/**
 * XP System for YogaQuest
 * Система опыта для количественного отражения вовлечённости пользователя в практику
 */

/**
 * Базовые настройки XP
 */
export const XP_CONFIG = {
  // Базовый XP за любую завершённую практику
  BASE_PRACTICE_XP: 10,
  
  // Бонусы за длительность (в минутах)
  DURATION_BONUSES: [
    { minMinutes: 90, bonus: 18 },
    { minMinutes: 60, bonus: 12 },
    { minMinutes: 45, bonus: 8 },
    { minMinutes: 30, bonus: 5 },
    { minMinutes: 15, bonus: 0 },
  ],
  
  // Бонусы за изменение настроения
  MOOD_BONUSES: {
    IMPROVEMENT_1: 3,   // улучшилось на 1
    IMPROVEMENT_2_PLUS: 6, // улучшилось на 2 и более
    NO_CHANGE: 0,
    WORSE: 0,
  },
  
  // Бонус за первый раз тип практики
  NEW_TYPE_BONUS: 5,
  
  // Бонусы за серии (streak)
  STREAK_BONUSES: [
    { days: 90, bonus: 120 },
    { days: 30, bonus: 60 },
    { days: 14, bonus: 35 },
    { days: 7, bonus: 20 },
    { days: 3, bonus: 10 },
  ],
  
  // Бонусы за достижения по редкости
  ACHIEVEMENT_XP: {
    common: 20,
    rare: 35,
    legendary: 50,
  },
  
  // Антиабьюз: максимум практик в день с полным XP
  DAILY_FULL_XP_LIMIT: 3,
  
  // XP для практик сверх лимита
  REDUCED_XP: 3,
  
  // Бонус за возвращение после паузы
  RETURN_BONUS: 5,
  RETURN_BONUS_COOLDOWN_DAYS: 30,
};

/**
 * Рассчитать бонус XP за длительность практики
 * @param {number} duration - Длительность в минутах
 * @returns {number} Бонус XP
 */
export function calculateDurationBonus(duration) {
  if (duration < 15) return 0;
  
  for (const tier of XP_CONFIG.DURATION_BONUSES) {
    if (duration >= tier.minMinutes) {
      return tier.bonus;
    }
  }
  return 0;
}

/**
 * Рассчитать бонус XP за изменение настроения
 * @param {number} moodBefore - Настроение до (1-5)
 * @param {number} moodAfter - Настроение после (1-5)
 * @returns {number} Бонус XP
 */
export function calculateMoodBonus(moodBefore, moodAfter) {
  // Если не заполнены оба значения, бонуса нет
  if (moodBefore == null || moodAfter == null) {
    return 0;
  }
  
  const diff = moodAfter - moodBefore;
  
  if (diff >= 2) {
    return XP_CONFIG.MOOD_BONUSES.IMPROVEMENT_2_PLUS;
  } else if (diff === 1) {
    return XP_CONFIG.MOOD_BONUSES.IMPROVEMENT_1;
  }
  return 0;
}

/**
 * Рассчитать бонус XP за серию (streak)
 * @param {number} streak - Текущая серия в днях
 * @returns {number} Бонус XP (только при достижении новых milestone)
 */
export function calculateStreakBonus(streak) {
  for (const tier of XP_CONFIG.STREAK_BONUSES) {
    if (streak === tier.days) {
      return tier.bonus;
    }
  }
  return 0;
}

/**
 * Проверить, является ли тип практики новым для пользователя
 * @param {string} type - Тип практики
 * @param {Array} workouts - Массив существующих тренировок
 * @returns {boolean} True если тип новый
 */
export function isNewPracticeType(type, workouts) {
  return !workouts.some(w => w.type === type);
}

/**
 * Получить количество практик за сегодня
 * @param {Array} workouts - Массив тренировок
 * @param {string} todayStr - Строка даты сегодня (YYYY-MM-DD)
 * @returns {number} Количество практик сегодня
 */
export function getTodayPracticeCount(workouts, todayStr) {
  return workouts.filter(w => w.date === todayStr).length;
}

/**
 * Проверить, является ли практика подозрительной (дубликат)
 * @param {object} newWorkout - Новая практика
 * @param {Array} recentWorkouts - Недавние практики (за последние несколько минут)
 * @returns {boolean} True если подозрительная
 */
export function isSuspiciousPractice(newWorkout, recentWorkouts) {
  const suspiciousThreshold = 5 * 60 * 1000; // 5 минут в миллисекундах
  const now = Date.now();
  
  return recentWorkouts.some(w => {
    const createdAt = new Date(w.createdAt).getTime();
    const timeDiff = now - createdAt;
    
    return (
      timeDiff < suspiciousThreshold &&
      w.type === newWorkout.type &&
      w.duration === newWorkout.duration
    );
  });
}

/**
 * Рассчитать XP за одну практику
 * @param {object} workout - Объект тренировки
 * @param {Array} existingWorkouts - Существующие тренировки пользователя
 * @param {string} todayStr - Строка даты сегодня
 * @param {number} currentStreak - Текущая серия
 * @returns {object} Объект с детализацией XP
 */
export function calculateWorkoutXP(workout, existingWorkouts, todayStr, currentStreak) {
  const result = {
    baseXP: 0,
    durationBonus: 0,
    moodBonus: 0,
    newTypeBonus: 0,
    streakBonus: 0,
    totalXP: 0,
    isReduced: false,
    isSuspicious: false,
  };
  
  // Проверяем на подозрительность
  result.isSuspicious = isSuspiciousPractice(workout, existingWorkouts.slice(0, 10));
  
  // Проверяем дневной лимит
  const todayCount = getTodayPracticeCount(existingWorkouts, todayStr);
  result.isReduced = todayCount >= XP_CONFIG.DAILY_FULL_XP_LIMIT;
  
  if (result.isReduced) {
    // Сниженный XP для практик сверх лимита
    result.baseXP = XP_CONFIG.REDUCED_XP;
    result.totalXP = XP_CONFIG.REDUCED_XP;
    return result;
  }
  
  // Базовый XP
  result.baseXP = XP_CONFIG.BASE_PRACTICE_XP;
  
  // Бонус за длительность
  result.durationBonus = calculateDurationBonus(workout.duration);
  
  // Бонус за настроение
  result.moodBonus = calculateMoodBonus(workout.moodBefore, workout.moodAfter);
  
  // Бонус за новый тип практики
  if (isNewPracticeType(workout.type, existingWorkouts)) {
    result.newTypeBonus = XP_CONFIG.NEW_TYPE_BONUS;
  }
  
  // Бонус за серию (только при достижении milestone)
  result.streakBonus = calculateStreakBonus(currentStreak);
  
  // Итого
  result.totalXP = result.baseXP + result.durationBonus + result.moodBonus + 
                   result.newTypeBonus + result.streakBonus;
  
  return result;
}

/**
 * Рассчитать XP за достижение
 * @param {string} rarity - Редкость достижения (common, rare, legendary)
 * @returns {number} XP за достижение
 */
export function calculateAchievementXP(rarity) {
  return XP_CONFIG.ACHIEVEMENT_XP[rarity] || XP_CONFIG.ACHIEVEMENT_XP.common;
}

/**
 * Проверить право на бонус за возвращение
 * @param {Array} workouts - Массив тренировок
 * @param {string} todayStr - Строка даты сегодня
 * @param {string} lastReturnBonusDate - Дата последнего бонуса за возвращение
 * @returns {object} { eligible: boolean, daysSinceLastPractice: number }
 */
export function checkReturnBonus(workouts, todayStr, lastReturnBonusDate) {
  if (!workouts || workouts.length === 0) {
    return { eligible: false, daysSinceLastPractice: Infinity };
  }
  
  // Получаем уникальные даты практик, сортируем по убыванию
  const dates = [...new Set(workouts.map(w => w.date))].sort().reverse();
  const lastPracticeDate = dates[0];
  
  // Проверяем, был ли уже бонус за возвращение в последние 30 дней
  if (lastReturnBonusDate) {
    const daysSinceBonus = Math.floor(
      (new Date(todayStr) - new Date(lastReturnBonusDate)) / 86400000
    );
    if (daysSinceBonus < XP_CONFIG.RETURN_BONUS_COOLDOWN_DAYS) {
      return { eligible: false, daysSinceLastPractice: 0 };
    }
  }
  
  // Считаем дни с последней практики
  const daysSinceLastPractice = Math.floor(
    (new Date(todayStr) - new Date(lastPracticeDate)) / 86400000
  );
  
  // Бонус за возвращение после 7+ дней
  const eligible = daysSinceLastPractice >= 7;
  
  return { eligible, daysSinceLastPractice };
}

/**
 * Форматировать XP для отображения
 * @param {number} xp - Количество XP
 * @returns {string} Отформатированная строка
 */
export function formatXP(xp) {
  return `+${xp} XP`;
}

/**
 * Получить текстовое описание бонусов XP
 * @param {object} xpResult - Результат calculateWorkoutXP
 * @returns {Array<string>} Массив строк с описанием
 */
export function getXPBreakdownTexts(xpResult) {
  const texts = [];
  
  if (xpResult.baseXP > 0) {
    texts.push(`Практика завершена: +${xpResult.baseXP} XP`);
  }
  
  if (xpResult.durationBonus > 0) {
    texts.push(`Глубокая практика: +${xpResult.durationBonus} XP`);
  }
  
  if (xpResult.moodBonus > 0) {
    texts.push(`Настроение стало мягче: +${xpResult.moodBonus} XP`);
  }
  
  if (xpResult.newTypeBonus > 0) {
    texts.push(`Новый тип практики: +${xpResult.newTypeBonus} XP`);
  }
  
  if (xpResult.streakBonus > 0) {
    texts.push(`Серия укрепилась: +${xpResult.streakBonus} XP`);
  }
  
  if (xpResult.isReduced) {
    texts.push(`Практика записана (дневной лимит достигнут)`);
  }
  
  return texts;
}

export default {
  XP_CONFIG,
  calculateDurationBonus,
  calculateMoodBonus,
  calculateStreakBonus,
  isNewPracticeType,
  getTodayPracticeCount,
  isSuspiciousPractice,
  calculateWorkoutXP,
  calculateAchievementXP,
  checkReturnBonus,
  formatXP,
  getXPBreakdownTexts,
};
