/**
 * Achievement Checker for YogaQuest
 * Проверка и разблокировка достижений
 */

import { 
  ACHIEVEMENT_LIST, 
  getAchievementById,
  ACHIEVEMENT_XP_REWARDS 
} from './achievementList.js';

/**
 * Проверить все достижения и вернуть разблокированные
 * @param {object} userData - Данные пользователя { workouts, streak, ... }
 * @returns {Array} Массив разблокированных достижений
 */
export function checkAllAchievements(userData) {
  return ACHIEVEMENT_LIST.filter(achievement => {
    return achievement.checkCondition(userData);
  });
}

/**
 * Проверить новые достижения (которые были разблокированы с прошлого раза)
 * @param {object} userData - Данные пользователя
 * @param {Set|Array} previouslyUnlocked - ID ранее разблокированных достижений
 * @returns {Array} Массив новых достижений
 */
export function checkNewAchievements(userData, previouslyUnlocked) {
  const unlockedSet = previouslyUnlocked instanceof Set 
    ? previouslyUnlocked 
    : new Set(previouslyUnlocked);
  
  return ACHIEVEMENT_LIST.filter(achievement => {
    return achievement.checkCondition(userData) && !unlockedSet.has(achievement.id);
  });
}

/**
 * Проверить достижения определённой категории
 * @param {object} userData - Данные пользователя
 * @param {string} category - Категория достижений
 * @returns {Array} Массив разблокированных достижений категории
 */
export function checkCategoryAchievements(userData, category) {
  return ACHIEVEMENT_LIST.filter(achievement => {
    return achievement.category === category && achievement.checkCondition(userData);
  });
}

/**
 * Получить прогресс по достижениям
 * @param {object} userData - Данные пользователя
 * @returns {object} Объект с прогрессом
 */
export function getAchievementsProgress(userData) {
  const unlocked = checkAllAchievements(userData);
  const total = ACHIEVEMENT_LIST.length;
  const visible = ACHIEVEMENT_LIST.filter(a => !a.secret);
  
  // Группируем по категориям
  const byCategory = {};
  ACHIEVEMENT_LIST.forEach(achievement => {
    if (!byCategory[achievement.category]) {
      byCategory[achievement.category] = {
        total: 0,
        unlocked: 0,
        achievements: [],
      };
    }
    byCategory[achievement.category].total++;
    byCategory[achievement.category].achievements.push(achievement);
    if (unlocked.find(a => a.id === achievement.id)) {
      byCategory[achievement.category].unlocked++;
    }
  });

  // Считаем общий XP за достижения
  const totalXPFromAchievements = unlocked.reduce((sum, a) => sum + a.xpReward, 0);

  return {
    unlocked,
    unlockedCount: unlocked.length,
    total,
    visibleTotal: visible.length,
    progressPercent: Math.round((unlocked.length / total) * 100),
    byCategory,
    totalXPFromAchievements,
    remaining: total - unlocked.length,
  };
}

/**
 * Получить прогресс по конкретному достижению
 * @param {string} achievementId - ID достижения
 * @param {object} userData - Данные пользователя
 * @returns {object|null} Объект с прогрессом или null
 */
export function getAchievementProgress(achievementId, userData) {
  const achievement = getAchievementById(achievementId);
  if (!achievement || !achievement.getProgress) return null;
  
  return achievement.getUserData ? achievement.getUserData(userData) : achievement.getProgress(userData);
}

/**
 * Получить все достижения с прогрессом
 * @param {object} userData - Данные пользователя
 * @returns {Array} Массив достижений с прогрессом
 */
export function getAllAchievementsWithProgress(userData) {
  return ACHIEVEMENT_LIST.map(achievement => {
    const isUnlocked = achievement.checkCondition(userData);
    const progress = achievement.getProgress ? achievement.getProgress(userData) : null;
    
    return {
      ...achievement,
      isUnlocked,
      progress,
      unlockedAt: isUnlocked ? new Date().toISOString() : null,
    };
  });
}

/**
 * Получить ближайшее неразблокированное достижение
 * @param {object} userData - Данные пользователя
 * @returns {object|null} Ближайшее достижение или null
 */
export function getNextAchievement(userData) {
  const allWithProgress = getAllAchievementsWithProgress(userData);
  const locked = allWithProgress.filter(a => !a.isUnlocked && !a.secret);
  
  if (locked.length === 0) return null;
  
  // Сортируем по прогрессу (ближе к цели - выше)
  locked.sort((a, b) => {
    const progA = a.progress ? a.progress.current / a.progress.target : 0;
    const progB = b.progress ? b.progress.current / b.progress.target : 0;
    return progB - progA;
  });
  
  return locked[0];
}

/**
 * Получить ближайшие неразблокированные достижения
 * @param {object} userData - Данные пользователя
 * @param {number} limit - Максимальное количество
 * @returns {Array} Массив ближайших достижений
 */
export function getNearestAchievements(userData, limit = 3) {
  const allWithProgress = getAllAchievementsWithProgress(userData);
  const locked = allWithProgress.filter(a => !a.isUnlocked && !a.secret);
  
  if (locked.length === 0) return [];
  
  // Сортируем по прогрессу (ближе к цели - выше)
  locked.sort((a, b) => {
    const progA = a.progress ? a.progress.current / a.progress.target : 0;
    const progB = b.progress ? b.progress.current / b.progress.target : 0;
    return progB - progA;
  });
  
  return locked.slice(0, limit);
}

/**
 * Проверить конкретное достижение
 * @param {string} achievementId - ID достижения
 * @param {object} userData - Данные пользователя
 * @returns {boolean} True если достижение разблокировано
 */
export function isAchievementUnlocked(achievementId, userData) {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return false;
  return achievement.checkCondition(userData);
}

/**
 * Получить данные достижения с состоянием
 * @param {string} achievementId - ID достижения
 * @param {object} userData - Данные пользователя
 * @returns {object} Данные достижения с состоянием
 */
export function getAchievementWithState(achievementId, userData) {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return null;
  
  const isUnlocked = achievement.checkCondition(userData);
  const progress = achievement.getProgress ? achievement.getProgress(userData) : null;
  
  return {
    ...achievement,
    isUnlocked,
    progress,
    unlockedAt: isUnlocked ? new Date().toISOString() : null,
  };
}

/**
 * Получить все достижения с состояниями
 * @param {object} userData - Данные пользователя
 * @returns {Array} Массив достижений с состояниями
 */
export function getAllAchievementsWithStates(userData) {
  return ACHIEVEMENT_LIST.map(achievement => {
    const isUnlocked = achievement.checkCondition(userData);
    const progress = achievement.getProgress ? achievement.getProgress(userData) : null;
    return {
      ...achievement,
      isUnlocked,
      progress,
      unlockedAt: isUnlocked ? new Date().toISOString() : null,
    };
  });
}

/**
 * Рассчитать XP за новые достижения
 * @param {Array} newAchievements - Массив новых достижений
 * @returns {number} Общий XP
 */
export function calculateNewAchievementsXP(newAchievements) {
  return newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
}

/**
 * Создать объект результата проверки достижений
 * @param {object} userData - Данные пользователя
 * @param {Set|Array} previouslyUnlocked - ID ранее разблокированных достижений
 * @returns {object} Результат проверки
 */
export function createAchievementCheckResult(userData, previouslyUnlocked = []) {
  const newAchievements = checkNewAchievements(userData, previouslyUnlocked);
  const allUnlocked = checkAllAchievements(userData);
  const progress = getAchievementsProgress(userData);
  const nextAchievement = getNextAchievement(userData);
  const nearestAchievements = getNearestAchievements(userData);
  
  return {
    newAchievements,
    newAchievementsCount: newAchievements.length,
    newXP: calculateNewAchievementsXP(newAchievements),
    allUnlocked,
    totalUnlocked: allUnlocked.length,
    progress,
    nextAchievement,
    nearestAchievements,
  };
}

export default {
  checkAllAchievements,
  checkNewAchievements,
  checkCategoryAchievements,
  getAchievementsProgress,
  getAchievementProgress,
  getAllAchievementsWithProgress,
  getNextAchievement,
  getNearestAchievements,
  isAchievementUnlocked,
  getAchievementWithState,
  getAllAchievementsWithStates,
  calculateNewAchievementsXP,
  createAchievementCheckResult,
};
