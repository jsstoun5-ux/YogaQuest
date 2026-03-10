/**
 * Integration Tests for YogaQuest
 * Интеграционные тесты для сценариев использования
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ACHIEVEMENT_LIST,
  ACHIEVEMENT_CATEGORIES,
} from '../achievements/achievementList.js';
import {
  checkAllAchievements,
  checkNewAchievements,
  getAchievementsProgress,
  getAllAchievementsWithProgress,
  createAchievementCheckResult,
} from '../achievements/checkAchievements.js';
import { calcStreak } from '../constants/achievements.js';

// === Хелперы для тестов ===

/**
 * Создать тестовую тренировку
 */
function createWorkout(overrides = {}) {
  return {
    id: Date.now() + Math.random(),
    date: new Date().toISOString().split('T')[0],
    type: 'power',
    duration: 30,
    moodBefore: 3,
    moodAfter: 4,
    ...overrides,
  };
}

/**
 * Создать массив тренировок с последовательными датами
 */
function createConsecutiveWorkouts(days, overrides = {}) {
  const workouts = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    workouts.push(createWorkout({
      id: i + 1,
      date: date.toISOString().split('T')[0],
      ...overrides,
    }));
  }
  
  return workouts;
}

// === Интеграционные тесты ===

describe('Integration: First Practice Flow', () => {
  it('should unlock first_bow achievement on first practice', () => {
    // Начинаем с пустым списком
    const workouts = [];
    const previouslyUnlocked = new Set();
    
    // Проверяем, что достижений нет
    let result = checkNewAchievements({ workouts }, previouslyUnlocked);
    expect(result.length).toBe(0);
    
    // Добавляем первую практику
    const newWorkout = createWorkout();
    const updatedWorkouts = [newWorkout];
    
    // Проверяем новые достижения
    result = checkNewAchievements({ workouts: updatedWorkouts }, previouslyUnlocked);
    
    // Должно разблокироваться первое достижение
    expect(result.length).toBeGreaterThan(0);
    expect(result.find(a => a.id === 'first_bow')).toBeDefined();
  });

  it('should show progress in achievements screen after first practice', () => {
    const workouts = [createWorkout()];
    
    const achievementsWithProgress = getAllAchievementsWithProgress({ workouts });
    const progress = getAchievementsProgress({ workouts });
    
    // Проверяем, что прогресс отображается корректно
    expect(progress.unlockedCount).toBeGreaterThan(0);
    expect(progress.progressPercent).toBeGreaterThan(0);
    
    // Проверяем, что first_bow разблокирован
    const firstBow = achievementsWithProgress.find(a => a.id === 'first_bow');
    expect(firstBow.isUnlocked).toBe(true);
  });
});

describe('Integration: Streak Achievement Flow', () => {
  it('should unlock streak achievements progressively', () => {
    // День 1-3: Тихий огонь
    let workouts = createConsecutiveWorkouts(3);
    let result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'quiet_flame')).toBeDefined();
    expect(result.find(a => a.id === 'seven_dawns')).toBeUndefined();
    
    // День 1-7: Семь рассветов
    workouts = createConsecutiveWorkouts(7);
    result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'quiet_flame')).toBeDefined();
    expect(result.find(a => a.id === 'seven_dawns')).toBeDefined();
    expect(result.find(a => a.id === 'lunar_cycle')).toBeUndefined();
    
    // День 1-14: Лунный круг
    workouts = createConsecutiveWorkouts(14);
    result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'lunar_cycle')).toBeDefined();
    expect(result.find(a => a.id === 'roots_of_steadiness')).toBeUndefined();
    
    // День 1-30: Корни устойчивости
    workouts = createConsecutiveWorkouts(30);
    result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'roots_of_steadiness')).toBeDefined();
  });

  it('should calculate streak correctly', () => {
    const workouts = createConsecutiveWorkouts(7);
    const streak = calcStreak(workouts);
    
    expect(streak).toBe(7);
  });

  it('should break streak when day is missed', () => {
    const workouts = createConsecutiveWorkouts(5);
    
    // Добавляем пропуск - тренировка 3 дня назад
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 7);
    workouts.push(createWorkout({
      date: threeDaysAgo.toISOString().split('T')[0]
    }));
    
    const streak = calcStreak(workouts);
    
    // Серия должна быть 5 (текущая непрерывная)
    expect(streak).toBe(5);
  });
});

describe('Integration: Duration Achievement Flow', () => {
  it('should unlock duration achievements based on practice length', () => {
    // Практика 60 минут
    let workouts = [createWorkout({ duration: 60 })];
    let result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'full_hour')).toBeDefined();
    expect(result.find(a => a.id === 'long_breath')).toBeUndefined();
    
    // Практика 90 минут
    workouts = [createWorkout({ duration: 90 })];
    result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'full_hour')).toBeDefined();
    expect(result.find(a => a.id === 'long_breath')).toBeDefined();
  });

  it('should unlock total time achievements', () => {
    // 10 часов = 600 минут
    let workouts = Array(10).fill(null).map((_, i) => createWorkout({ 
      id: i + 1, 
      duration: 60 
    }));
    
    let result = checkAllAchievements({ workouts });
    expect(result.find(a => a.id === 'gathered_presence')).toBeDefined();
    expect(result.find(a => a.id === 'space_within')).toBeUndefined();
    
    // 25 часов = 1500 минут
    workouts = Array(25).fill(null).map((_, i) => createWorkout({ 
      id: i + 1, 
      duration: 60 
    }));
    
    result = checkAllAchievements({ workouts });
    expect(result.find(a => a.id === 'space_within')).toBeDefined();
  });
});

describe('Integration: Diversity Achievement Flow', () => {
  it('should unlock diversity achievements when trying different types', () => {
    const types = ['power', 'soft', 'restore', 'meditate', 'stretch'];
    const workouts = types.map((type, i) => createWorkout({ 
      id: i + 1, 
      type,
      date: new Date().toISOString().split('T')[0]
    }));
    
    const result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'five_paths')).toBeDefined();
    expect(result.find(a => a.id === 'wholeness')).toBeUndefined();
  });

  it('should unlock wholeness when all types are tried', () => {
    const types = ['power', 'soft', 'restore', 'meditate', 'integrate', 'stretch'];
    const workouts = types.map((type, i) => createWorkout({ 
      id: i + 1, 
      type,
      date: new Date().toISOString().split('T')[0]
    }));
    
    const result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'five_paths')).toBeDefined();
    expect(result.find(a => a.id === 'wholeness')).toBeDefined();
  });

  it('should unlock heart_of_calm for meditative practices', () => {
    const workouts = [];
    for (let i = 0; i < 5; i++) {
      workouts.push(createWorkout({ 
        id: i + 1, 
        type: i % 2 === 0 ? 'meditate' : 'restore',
        date: new Date().toISOString().split('T')[0]
      }));
    }
    
    const result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'heart_of_calm')).toBeDefined();
  });

  it('should unlock strength_and_softness for balanced practice', () => {
    const workouts = [];
    
    // 3 силовые
    for (let i = 0; i < 3; i++) {
      workouts.push(createWorkout({ id: i + 1, type: 'power' }));
    }
    // 3 мягкие
    for (let i = 0; i < 3; i++) {
      workouts.push(createWorkout({ id: i + 4, type: 'soft' }));
    }
    
    const result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'strength_and_softness')).toBeDefined();
  });
});

describe('Integration: Mood Achievement Flow', () => {
  it('should unlock mood improvement achievement', () => {
    const workouts = [];
    for (let i = 0; i < 5; i++) {
      workouts.push(createWorkout({ 
        id: i + 1, 
        moodBefore: 2, 
        moodAfter: 4 
      }));
    }
    
    const result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'lighter_than_before')).toBeDefined();
  });

  it('should unlock honest_presence for tracking mood', () => {
    const workouts = [];
    for (let i = 0; i < 10; i++) {
      workouts.push(createWorkout({ 
        id: i + 1, 
        moodBefore: 3, 
        moodAfter: 3 
      }));
    }
    
    const result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'honest_presence')).toBeDefined();
  });

  it('should unlock warm_heart for happy endings', () => {
    const workouts = [];
    for (let i = 0; i < 10; i++) {
      workouts.push(createWorkout({ 
        id: i + 1, 
        moodAfter: 5 
      }));
    }
    
    const result = checkAllAchievements({ workouts });
    
    expect(result.find(a => a.id === 'warm_heart')).toBeDefined();
  });
});

describe('Integration: Full Achievement Check Result', () => {
  it('should create complete achievement check result', () => {
    const workouts = createConsecutiveWorkouts(10);
    const previouslyUnlocked = new Set(['first_bow']);
    
    const result = createAchievementCheckResult({ workouts }, previouslyUnlocked);
    
    expect(result).toHaveProperty('newAchievements');
    expect(result).toHaveProperty('newAchievementsCount');
    expect(result).toHaveProperty('newXP');
    expect(result).toHaveProperty('allUnlocked');
    expect(result).toHaveProperty('totalUnlocked');
    expect(result).toHaveProperty('progress');
    expect(result).toHaveProperty('nextAchievement');
    expect(result).toHaveProperty('nearestAchievements');
    
    // first_bow не должен быть в новых, т.к. уже был разблокирован
    expect(result.newAchievements.find(a => a.id === 'first_bow')).toBeUndefined();
  });

  it('should calculate XP correctly for new achievements', () => {
    const workouts = [createWorkout()];
    const previouslyUnlocked = new Set();
    
    const result = createAchievementCheckResult({ workouts }, previouslyUnlocked);
    
    expect(result.newXP).toBeGreaterThan(0);
    expect(result.newXP).toBe(result.newAchievements.reduce((sum, a) => sum + a.xpReward, 0));
  });
});

describe('Integration: Achievement Progress Display', () => {
  it('should show correct progress for locked achievements', () => {
    const workouts = createConsecutiveWorkouts(3);
    
    const achievementsWithProgress = getAllAchievementsWithProgress({ workouts });
    
    // Проверяем прогресс для seven_dawns (7 дней подряд)
    const sevenDawns = achievementsWithProgress.find(a => a.id === 'seven_dawns');
    expect(sevenDawns.isUnlocked).toBe(false);
    expect(sevenDawns.progress).toBeDefined();
    expect(sevenDawns.progress.current).toBe(3);
    expect(sevenDawns.progress.target).toBe(7);
  });

  it('should show 100% progress for unlocked achievements', () => {
    const workouts = createConsecutiveWorkouts(7);
    
    const achievementsWithProgress = getAllAchievementsWithProgress({ workouts });
    
    const sevenDawns = achievementsWithProgress.find(a => a.id === 'seven_dawns');
    expect(sevenDawns.isUnlocked).toBe(true);
    expect(sevenDawns.progress.current).toBeGreaterThanOrEqual(sevenDawns.progress.target);
  });
});

describe('Integration: Category Grouping', () => {
  it('should group achievements by category correctly', () => {
    const progress = getAchievementsProgress({ workouts: [] });
    
    // Проверяем наличие всех категорий
    const categories = Object.values(ACHIEVEMENT_CATEGORIES);
    categories.forEach(category => {
      expect(progress.byCategory[category]).toBeDefined();
      expect(progress.byCategory[category].total).toBeGreaterThan(0);
    });
  });

  it('should count unlocked achievements per category', () => {
    const workouts = createConsecutiveWorkouts(10);
    
    const progress = getAchievementsProgress({ workouts });
    
    // Проверяем, что разблокированные достижения учитываются
    Object.values(progress.byCategory).forEach(cat => {
      expect(cat.unlocked).toBeLessThanOrEqual(cat.total);
    });
  });
});

describe('Integration: Nearest Achievements', () => {
  it('should return achievements sorted by progress', () => {
    const workouts = createConsecutiveWorkouts(5);
    
    const allWithProgress = getAllAchievementsWithProgress({ workouts });
    const locked = allWithProgress.filter(a => !a.isUnlocked);
    
    // Проверяем, что достижения отсортированы по прогрессу
    if (locked.length > 1) {
      for (let i = 0; i < locked.length - 1; i++) {
        const currentProgress = locked[i].progress ? 
          locked[i].progress.current / locked[i].progress.target : 0;
        const nextProgress = locked[i + 1].progress ?
          locked[i + 1].progress.current / locked[i + 1].progress.target : 0;
        
        expect(currentProgress).toBeGreaterThanOrEqual(nextProgress);
      }
    }
  });
});
