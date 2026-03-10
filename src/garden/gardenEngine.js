/**
 * Garden Engine for YogaQuest
 * Главный движок сада практики
 */

import { 
  getGardenStage, 
  getGardenProgress, 
  checkGardenStageUp,
  getStageTimeOfDay,
  getStageCSSVariables,
} from './gardenStages.js';

import {
  PRACTICE_TYPE_OBJECTS,
  STREAK_OBJECTS,
  MOOD_OBJECTS,
  ACHIEVEMENT_OBJECTS,
  createInitialGardenObjects,
  calculateObjectLevel,
  getObjectForStreak,
  getObjectForAchievement,
} from './gardenObjects.js';

/**
 * Класс для управления садом практики
 */
export class GardenEngine {
  constructor() {
    this.stage = 0;
    this.objects = createInitialGardenObjects();
    this.practiceCount = 0;
    this.streak = 0;
    this.moodStats = {
      improvementCount: 0,
      trackedCount: 0,
      happyCount: 0,
    };
    this.unlockedAchievements = [];
  }

  /**
   * Инициализация движка с данными пользователя
   * @param {object} userData - Данные пользователя
   */
  initialize(userData) {
    this.practiceCount = userData.practiceCount || 0;
    this.streak = userData.streak || 0;
    this.moodStats = userData.moodStats || {
      improvementCount: 0,
      trackedCount: 0,
      happyCount: 0,
    };
    this.unlockedAchievements = userData.unlockedAchievements || [];
    this.objects = userData.gardenObjects || createInitialGardenObjects();
    
    // Вычисляем стадию
    this.stage = getGardenStage(this.practiceCount);
  }

  /**
   * Обработать добавление новой практики
   * @param {object} workout - Новая практика
   * @returns {object} Результат обработки
   */
  processNewWorkout(workout) {
    const result = {
      newObjects: [],
      objectUpgrades: [],
      stageUp: null,
    };

    const previousCount = this.practiceCount;
    this.practiceCount++;

    // Проверяем повышение стадии
    result.stageUp = checkGardenStageUp(previousCount, this.practiceCount);
    if (result.stageUp) {
      this.stage = result.stageUp.newStage;
    }

    // Обновляем объекты по типу практики
    const practiceObjects = PRACTICE_TYPE_OBJECTS[workout.type];
    if (practiceObjects) {
      practiceObjects.primary.forEach(objectId => {
        if (this.objects[objectId]) {
          const previousLevel = this.objects[objectId].level;
          this.objects[objectId].count++;
          this.objects[objectId].level = calculateObjectLevel(this.objects[objectId].count);
          
          if (this.objects[objectId].level > previousLevel) {
            result.objectUpgrades.push({
              objectId,
              previousLevel,
              newLevel: this.objects[objectId].level,
            });
          } else if (previousLevel === 0) {
            result.newObjects.push(objectId);
          }
        }
      });
    }

    // Обновляем статистику настроения
    if (workout.moodBefore != null && workout.moodAfter != null) {
      this.moodStats.trackedCount++;
      if (workout.moodAfter > workout.moodBefore) {
        this.moodStats.improvementCount++;
      }
      if (workout.moodAfter === 5) {
        this.moodStats.happyCount++;
      }
    }

    // Проверяем объекты по настроению
    this.checkMoodObjects(result);

    return result;
  }

  /**
   * Проверить и добавить объекты по настроению
   * @param {object} result - Объект результата для заполнения
   */
  checkMoodObjects(result) {
    // Светлячки за улучшение настроения
    if (this.moodStats.improvementCount >= MOOD_OBJECTS.mood_improvement.threshold) {
      if (!this.objects.fireflies || this.objects.fireflies.count === 0) {
        this.objects.fireflies = { count: 1, level: 1 };
        result.newObjects.push('fireflies');
      } else {
        const fireflyCount = Math.min(10, Math.floor(this.moodStats.improvementCount / 5));
        if (fireflyCount > this.objects.fireflies.count) {
          this.objects.fireflies.count = fireflyCount;
          result.objectUpgrades.push({
            objectId: 'fireflies',
            previousCount: this.objects.fireflies.count - 1,
            newCount: fireflyCount,
          });
        }
      }
    }

    // Зеркальный камень за отслеживание настроения
    if (this.moodStats.trackedCount >= MOOD_OBJECTS.honest_tracking.threshold) {
      if (!this.objects.mirror_stone || this.objects.mirror_stone.count === 0) {
        this.objects.mirror_stone = { count: 1, level: 1 };
        result.newObjects.push('mirror_stone');
      }
    }

    // Сияющее сердце за хорошее настроение
    if (this.moodStats.happyCount >= MOOD_OBJECTS.warm_heart.threshold) {
      if (!this.objects.glowing_heart || this.objects.glowing_heart.count === 0) {
        this.objects.glowing_heart = { count: 1, level: 1 };
        result.newObjects.push('glowing_heart');
      }
    }
  }

  /**
   * Обработать достижение серии
   * @param {number} streak - Текущая серия
   * @returns {object|null} Новый объект или null
   */
  processStreak(streak) {
    this.streak = streak;
    const streakObject = getObjectForStreak(streak);
    
    if (streakObject) {
      const objectId = streakObject.id;
      if (!this.objects[objectId] || this.objects[objectId].count === 0) {
        this.objects[objectId] = { 
          count: 1, 
          level: 1,
          type: streakObject.type,
          name: streakObject.name,
        };
        return streakObject;
      }
    }
    
    return null;
  }

  /**
   * Обработать разблокировку достижения
   * @param {string} achievementId - ID достижения
   * @returns {object|null} Новый объект или null
   */
  processAchievement(achievementId) {
    if (this.unlockedAchievements.includes(achievementId)) {
      return null;
    }
    
    this.unlockedAchievements.push(achievementId);
    const achievementObject = getObjectForAchievement(achievementId);
    
    if (achievementObject) {
      const objectId = achievementObject.id;
      if (!this.objects[objectId] || this.objects[objectId].count === 0) {
        this.objects[objectId] = { 
          count: 1, 
          level: 1,
          type: achievementObject.type,
          name: achievementObject.name,
          placement: achievementObject.placement,
        };
        return achievementObject;
      }
    }
    
    return null;
  }

  /**
   * Получить текущую стадию сада
   * @returns {object} Объект стадии
   */
  getCurrentStage() {
    return getGardenStage(this.practiceCount);
  }

  /**
   * Получить прогресс сада
   * @returns {object} Объект прогресса
   */
  getProgress() {
    return getGardenProgress(this.practiceCount);
  }

  /**
   * Получить все активные объекты сада
   * @returns {Array} Массив активных объектов
   */
  getActiveObjects() {
    return Object.entries(this.objects)
      .filter(([_, data]) => data.count > 0)
      .map(([id, data]) => ({
        id,
        ...data,
      }));
  }

  /**
   * Получить данные для рендеринга сцены
   * @returns {object} Данные для рендеринга
   */
  getSceneData() {
    const stage = this.getCurrentStage();
    const progress = this.getProgress();
    const timeOfDay = getStageTimeOfDay(stage);
    const cssVariables = getStageCSSVariables(stage);
    const activeObjects = this.getActiveObjects();
    
    return {
      stage,
      progress,
      timeOfDay,
      cssVariables,
      activeObjects,
      practiceCount: this.practiceCount,
      streak: this.streak,
    };
  }

  /**
   * Получить данные для сохранения
   * @returns {object} Данные для сохранения
   */
  getSaveData() {
    return {
      stage: this.stage.stage,
      objects: this.objects,
      moodStats: this.moodStats,
    };
  }
}

/**
 * Создать экземпляр движка сада
 * @param {object} userData - Данные пользователя
 * @returns {GardenEngine} Экземпляр движка
 */
export function createGardenEngine(userData = {}) {
  const engine = new GardenEngine();
  engine.initialize(userData);
  return engine;
}

/**
 * Рассчитать состояние сада на основе данных пользователя
 * @param {Array} workouts - Массив тренировок
 * @param {Array} unlockedAchievements - Разблокированные достижения
 * @returns {object} Состояние сада
 */
export function calculateGardenState(workouts, unlockedAchievements = []) {
  const practiceCount = workouts.length;
  const stage = getGardenStage(practiceCount);
  const progress = getGardenProgress(practiceCount);
  const objects = createInitialGardenObjects();
  const moodStats = {
    improvementCount: 0,
    trackedCount: 0,
    happyCount: 0,
  };

  // Подсчитываем объекты по типам практики
  workouts.forEach(workout => {
    const practiceObjects = PRACTICE_TYPE_OBJECTS[workout.type];
    if (practiceObjects) {
      practiceObjects.primary.forEach(objectId => {
        if (objects[objectId]) {
          objects[objectId].count++;
          objects[objectId].level = calculateObjectLevel(objects[objectId].count);
        }
      });
    }

    // Подсчитываем статистику настроения
    if (workout.moodBefore != null && workout.moodAfter != null) {
      moodStats.trackedCount++;
      if (workout.moodAfter > workout.moodBefore) {
        moodStats.improvementCount++;
      }
      if (workout.moodAfter === 5) {
        moodStats.happyCount++;
      }
    }
  });

  // Добавляем объекты по настроению
  if (moodStats.improvementCount >= MOOD_OBJECTS.mood_improvement.threshold) {
    objects.fireflies = { 
      count: Math.min(10, Math.floor(moodStats.improvementCount / 5)), 
      level: 1 
    };
  }
  
  if (moodStats.trackedCount >= MOOD_OBJECTS.honest_tracking.threshold) {
    objects.mirror_stone = { count: 1, level: 1 };
  }
  
  if (moodStats.happyCount >= MOOD_OBJECTS.warm_heart.threshold) {
    objects.glowing_heart = { count: 1, level: 1 };
  }

  // Добавляем объекты по достижениям
  unlockedAchievements.forEach(achievementId => {
    const achievementObject = getObjectForAchievement(achievementId);
    if (achievementObject) {
      objects[achievementObject.id] = { 
        count: 1, 
        level: 1,
        type: achievementObject.type,
        name: achievementObject.name,
      };
    }
  });

  return {
    stage,
    progress,
    objects,
    moodStats,
    practiceCount,
    activeObjects: Object.entries(objects)
      .filter(([_, data]) => data.count > 0)
      .map(([id, data]) => ({ id, ...data })),
  };
}

/**
 * Получить текстовое описание роста сада
 * @param {object} gardenResult - Результат обработки практики
 * @returns {Array<string>} Массив строк с описанием
 */
export function getGardenGrowthTexts(gardenResult) {
  const texts = [];
  
  if (gardenResult.stageUp) {
    texts.push(`Сад вырос: ${gardenResult.stageUp.newStage.title}`);
  }
  
  if (gardenResult.newObjects.length > 0) {
    texts.push(`В саду появилось новое: ${gardenResult.newObjects.join(', ')}`);
  }
  
  if (gardenResult.objectUpgrades.length > 0) {
    texts.push(`Росток в саду окреп`);
  }
  
  return texts;
}

/**
 * Получить сводку сада для отображения
 * @param {object} gardenState - Состояние сада
 * @returns {object} Сводка
 */
export function getGardenSummary(gardenState) {
  return {
    stageTitle: gardenState.stage.title,
    stageDescription: gardenState.stage.description,
    progressPercent: gardenState.progress.progressPercent,
    totalObjects: gardenState.activeObjects.length,
    practiceCount: gardenState.practiceCount,
    nextStagePractices: gardenState.progress.isMaxStage 
      ? null 
      : gardenState.progress.nextStage?.minPractices - gardenState.practiceCount,
  };
}

export default {
  GardenEngine,
  createGardenEngine,
  calculateGardenState,
  getGardenGrowthTexts,
  getGardenSummary,
};