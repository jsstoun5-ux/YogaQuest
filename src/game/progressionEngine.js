/**
 * Progression Engine for YogaQuest
 * Главный движок прогресса, объединяющий XP, уровни, достижения и сад
 */

import { calculateWorkoutXP, checkReturnBonus, XP_CONFIG } from './xpSystem.js';
import { getLevelByXP, getLevelProgress, checkLevelUp } from './levelSystem.js';

/**
 * Класс для управления прогрессом пользователя
 */
export class ProgressionEngine {
  constructor() {
    this.totalXP = 0;
    this.workouts = [];
    this.achievements = [];
    this.streak = 0;
    this.lastPracticeDate = null;
    this.lastReturnBonusDate = null;
  }

  /**
   * Инициализация движка с данными пользователя
   * @param {object} userData - Данные пользователя
   */
  initialize(userData) {
    this.totalXP = userData.totalXP || 0;
    this.workouts = userData.workouts || [];
    this.achievements = userData.achievements || [];
    this.streak = userData.streak || 0;
    this.lastPracticeDate = userData.lastPracticeDate || null;
    this.lastReturnBonusDate = userData.lastReturnBonusDate || null;
  }

  /**
   * Обработать добавление новой практики
   * @param {object} workout - Новая практика
   * @param {string} todayStr - Строка даты сегодня
   * @returns {object} Результат обработки
   */
  processNewWorkout(workout, todayStr) {
    const result = {
      xpGained: 0,
      xpBreakdown: null,
      levelUp: null,
      returnBonus: null,
      newAchievements: [],
      gardenGrowth: null,
    };

    // Рассчитываем XP за практику
    const xpResult = calculateWorkoutXP(
      workout,
      this.workouts,
      todayStr,
      this.streak
    );
    result.xpBreakdown = xpResult;

    // Проверяем бонус за возвращение
    const returnCheck = checkReturnBonus(
      this.workouts,
      todayStr,
      this.lastReturnBonusDate
    );
    
    if (returnCheck.eligible) {
      result.returnBonus = {
        xp: XP_CONFIG.RETURN_BONUS,
        daysAway: returnCheck.daysSinceLastPractice,
      };
    }

    // Считаем общий XP
    let totalGained = xpResult.totalXP;
    if (result.returnBonus) {
      totalGained += result.returnBonus.xp;
    }
    result.xpGained = totalGained;

    // Проверяем повышение уровня
    const previousXP = this.totalXP;
    const newXP = this.totalXP + totalGained;
    result.levelUp = checkLevelUp(previousXP, newXP);

    // Обновляем состояние
    this.totalXP = newXP;
    this.workouts = [workout, ...this.workouts];
    this.lastPracticeDate = workout.date;

    if (result.returnBonus) {
      this.lastReturnBonusDate = todayStr;
    }

    return result;
  }

  /**
   * Добавить XP за достижение
   * @param {object} achievement - Достижение
   * @returns {object} Результат с информацией о повышении уровня
   */
  addAchievementXP(achievement) {
    const previousXP = this.totalXP;
    this.totalXP += achievement.xpReward;
    
    const levelUp = checkLevelUp(previousXP, this.totalXP);
    
    this.achievements.push({
      id: achievement.id,
      unlockedAt: new Date().toISOString(),
    });

    return {
      xpGained: achievement.xpReward,
      levelUp,
    };
  }

  /**
   * Получить текущий уровень
   * @returns {object} Объект уровня
   */
  getCurrentLevel() {
    return getLevelByXP(this.totalXP);
  }

  /**
   * Получить прогресс уровня
   * @returns {object} Объект прогресса
   */
  getLevelProgress() {
    return getLevelProgress(this.totalXP);
  }

  /**
   * Получить сводку прогресса
   * @returns {object} Сводка
   */
  getProgressSummary() {
    const levelProgress = this.getLevelProgress();
    
    return {
      totalXP: this.totalXP,
      level: levelProgress.currentLevel,
      levelProgress,
      totalWorkouts: this.workouts.length,
      streak: this.streak,
      achievementsCount: this.achievements.length,
    };
  }
}

/**
 * Создать экземпляр движка прогресса
 * @param {object} userData - Данные пользователя
 * @returns {ProgressionEngine} Экземпляр движка
 */
export function createProgressionEngine(userData = {}) {
  const engine = new ProgressionEngine();
  engine.initialize(userData);
  return engine;
}

/**
 * Рассчитать полный прогресс пользователя на основе данных
 * @param {Array} workouts - Массив тренировок
 * @param {Array} unlockedAchievements - Разблокированные достижения
 * @returns {object} Полный прогресс
 */
export function calculateFullProgress(workouts, unlockedAchievements = []) {
  // Базовый XP из тренировок
  let totalXP = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Группируем тренировки по дням для расчёта дневного лимита
  const workoutsByDate = {};
  workouts.forEach(w => {
    if (!workoutsByDate[w.date]) {
      workoutsByDate[w.date] = [];
    }
    workoutsByDate[w.date].push(w);
  });

  // Сортируем тренировки по дате (от старых к новым)
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Отслеживаем уникальные типы практик
  const seenTypes = new Set();
  
  // Отслеживаем серии
  let currentStreak = 0;
  let lastDate = null;
  const achievedStreakMilestones = new Set();

  sortedWorkouts.forEach((workout, index) => {
    const dayWorkouts = workoutsByDate[workout.date];
    const dayIndex = dayWorkouts.findIndex(w => w.id === workout.id);
    
    // Базовый XP
    let workoutXP = XP_CONFIG.BASE_PRACTICE_XP;
    
    // Проверяем дневной лимит
    if (dayIndex >= XP_CONFIG.DAILY_FULL_XP_LIMIT) {
      workoutXP = XP_CONFIG.REDUCED_XP;
    } else {
      // Бонус за длительность
      if (workout.duration >= 90) workoutXP += 18;
      else if (workout.duration >= 60) workoutXP += 12;
      else if (workout.duration >= 45) workoutXP += 8;
      else if (workout.duration >= 30) workoutXP += 5;
      
      // Бонус за настроение
      if (workout.moodBefore != null && workout.moodAfter != null) {
        const moodDiff = workout.moodAfter - workout.moodBefore;
        if (moodDiff >= 2) workoutXP += 6;
        else if (moodDiff === 1) workoutXP += 3;
      }
      
      // Бонус за новый тип
      if (!seenTypes.has(workout.type)) {
        workoutXP += XP_CONFIG.NEW_TYPE_BONUS;
        seenTypes.add(workout.type);
      }
    }
    
    totalXP += workoutXP;
    
    // Обновляем серию
    const workoutDate = workout.date;
    if (lastDate) {
      const dayDiff = Math.floor(
        (new Date(lastDate) - new Date(workoutDate)) / 86400000
      );
      if (dayDiff === 1) {
        currentStreak++;
      } else if (dayDiff > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    lastDate = workoutDate;
    
    // Бонусы за серии (только при достижении milestone)
    if (currentStreak === 3 && !achievedStreakMilestones.has(3)) {
      totalXP += 10;
      achievedStreakMilestones.add(3);
    }
    if (currentStreak === 7 && !achievedStreakMilestones.has(7)) {
      totalXP += 20;
      achievedStreakMilestones.add(7);
    }
    if (currentStreak === 14 && !achievedStreakMilestones.has(14)) {
      totalXP += 35;
      achievedStreakMilestones.add(14);
    }
    if (currentStreak === 30 && !achievedStreakMilestones.has(30)) {
      totalXP += 60;
      achievedStreakMilestones.add(30);
    }
    if (currentStreak === 90 && !achievedStreakMilestones.has(90)) {
      totalXP += 120;
      achievedStreakMilestones.add(90);
    }
  });

  // Добавляем XP за достижения
  unlockedAchievements.forEach(achievement => {
    totalXP += achievement.xpReward || XP_CONFIG.ACHIEVEMENT_XP[achievement.rarity] || 20;
  });

  return {
    totalXP,
    level: getLevelByXP(totalXP),
    levelProgress: getLevelProgress(totalXP),
    totalWorkouts: workouts.length,
    uniqueTypes: seenTypes.size,
  };
}

/**
 * Получить данные профиля для сохранения
 * @param {ProgressionEngine} engine - Экземпляр движка
 * @returns {object} Данные профиля
 */
export function getProfileData(engine) {
  return {
    totalXP: engine.totalXP,
    achievements: engine.achievements,
    lastPracticeDate: engine.lastPracticeDate,
    lastReturnBonusDate: engine.lastReturnBonusDate,
  };
}

export default {
  ProgressionEngine,
  createProgressionEngine,
  calculateFullProgress,
  getProfileData,
};