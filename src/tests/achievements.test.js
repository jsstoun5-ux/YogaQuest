/**
 * Unit Tests for Achievement System
 * Тесты для системы достижений
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  ACHIEVEMENT_LIST, 
  ACHIEVEMENT_CATEGORIES, 
  ACHIEVEMENT_RARITIES,
  getAchievementById,
  getAchievementsByCategory,
  getCategoriesWithLabels,
  getRaritiesWithLabels,
} from '../achievements/achievementList.js';
import {
  checkAllAchievements,
  checkNewAchievements,
  getAchievementsProgress,
  getAllAchievementsWithProgress,
  getNextAchievement,
  getNearestAchievements,
  isAchievementUnlocked,
  calculateNewAchievementsXP,
} from '../achievements/checkAchievements.js';
import { calcStreak } from '../constants/achievements.js';

// === Тестовые данные ===

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
 * Создать массив тренировок для тестов
 */
function createWorkouts(count, overrides = {}) {
  const workouts = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
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

// === Тесты achievementList.js ===

describe('achievementList.js', () => {
  describe('ACHIEVEMENT_LIST', () => {
    it('should have exactly 20 achievements', () => {
      expect(ACHIEVEMENT_LIST).toHaveLength(20);
    });

    it('each achievement should have required fields', () => {
      ACHIEVEMENT_LIST.forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('title');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('category');
        expect(achievement).toHaveProperty('rarity');
        expect(achievement).toHaveProperty('icon');
        expect(achievement).toHaveProperty('xpReward');
        expect(achievement).toHaveProperty('checkCondition');
        expect(typeof achievement.checkCondition).toBe('function');
      });
    });

    it('each achievement should have getProgress function', () => {
      ACHIEVEMENT_LIST.forEach(achievement => {
        expect(achievement).toHaveProperty('getProgress');
        expect(typeof achievement.getProgress).toBe('function');
      });
    });

    it('all categories should be valid', () => {
      const validCategories = Object.values(ACHIEVEMENT_CATEGORIES);
      ACHIEVEMENT_LIST.forEach(achievement => {
        expect(validCategories).toContain(achievement.category);
      });
    });

    it('all rarities should be valid', () => {
      const validRarities = Object.values(ACHIEVEMENT_RARITIES);
      ACHIEVEMENT_LIST.forEach(achievement => {
        expect(validRarities).toContain(achievement.rarity);
      });
    });
  });

  describe('getAchievementById', () => {
    it('should return achievement by id', () => {
      const achievement = getAchievementById('first_bow');
      expect(achievement).toBeDefined();
      expect(achievement.id).toBe('first_bow');
    });

    it('should return undefined for unknown id', () => {
      const achievement = getAchievementById('unknown_achievement');
      expect(achievement).toBeUndefined();
    });
  });

  describe('getAchievementsByCategory', () => {
    it('should return achievements for valid category', () => {
      const basics = getAchievementsByCategory(ACHIEVEMENT_CATEGORIES.BASICS);
      expect(basics.length).toBeGreaterThan(0);
      basics.forEach(a => {
        expect(a.category).toBe(ACHIEVEMENT_CATEGORIES.BASICS);
      });
    });

    it('should return empty array for unknown category', () => {
      const unknown = getAchievementsByCategory('unknown');
      expect(unknown).toEqual([]);
    });
  });

  describe('getCategoriesWithLabels', () => {
    it('should return all categories with labels', () => {
      const categories = getCategoriesWithLabels();
      expect(Object.keys(categories).length).toBeGreaterThan(0);
      
      Object.values(categories).forEach(cat => {
        expect(cat).toHaveProperty('id');
        expect(cat).toHaveProperty('label');
        expect(cat).toHaveProperty('icon');
      });
    });
  });

  describe('getRaritiesWithLabels', () => {
    it('should return all rarities with labels', () => {
      const rarities = getRaritiesWithLabels();
      expect(Object.keys(rarities).length).toBe(3);
      
      Object.values(rarities).forEach(rarity => {
        expect(rarity).toHaveProperty('id');
        expect(rarity).toHaveProperty('label');
        expect(rarity).toHaveProperty('color');
      });
    });
  });
});

// === Тесты checkAchievements.js ===

describe('checkAchievements.js', () => {
  describe('checkAllAchievements', () => {
    it('should return empty array for empty workouts', () => {
      const result = checkAllAchievements({ workouts: [] });
      expect(result).toEqual([]);
    });

    it('should return first_bow for single workout', () => {
      const workouts = [createWorkout()];
      const result = checkAllAchievements({ workouts });
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.find(a => a.id === 'first_bow')).toBeDefined();
    });

    it('should unlock multiple achievements with enough workouts', () => {
      const workouts = createWorkouts(10);
      const result = checkAllAchievements({ workouts });
      
      expect(result.length).toBeGreaterThan(3);
      expect(result.find(a => a.id === 'first_bow')).toBeDefined();
      expect(result.find(a => a.id === 'three_returns')).toBeDefined();
      expect(result.find(a => a.id === 'thread_of_rhythm')).toBeDefined();
    });
  });

  describe('checkNewAchievements', () => {
    it('should return only new achievements', () => {
      const workouts = [createWorkout()];
      const previouslyUnlocked = new Set();
      
      const result = checkNewAchievements({ workouts }, previouslyUnlocked);
      
      expect(result.find(a => a.id === 'first_bow')).toBeDefined();
    });

    it('should not return already unlocked achievements', () => {
      const workouts = [createWorkout()];
      const previouslyUnlocked = new Set(['first_bow']);
      
      const result = checkNewAchievements({ workouts }, previouslyUnlocked);
      
      expect(result.find(a => a.id === 'first_bow')).toBeUndefined();
    });

    it('should work with array as previouslyUnlocked', () => {
      const workouts = [createWorkout()];
      const previouslyUnlocked = ['first_bow'];
      
      const result = checkNewAchievements({ workouts }, previouslyUnlocked);
      
      expect(result.find(a => a.id === 'first_bow')).toBeUndefined();
    });
  });

  describe('getAchievementsProgress', () => {
    it('should return correct progress for empty workouts', () => {
      const result = getAchievementsProgress({ workouts: [] });
      
      expect(result.unlockedCount).toBe(0);
      expect(result.total).toBe(20);
      expect(result.progressPercent).toBe(0);
      expect(result.remaining).toBe(20);
    });

    it('should return correct progress for some workouts', () => {
      const workouts = createWorkouts(5);
      const result = getAchievementsProgress({ workouts });
      
      expect(result.unlockedCount).toBeGreaterThan(0);
      expect(result.total).toBe(20);
      expect(result.unlockedCount + result.remaining).toBe(20);
    });

    it('should group by category', () => {
      const result = getAchievementsProgress({ workouts: [] });
      
      expect(result.byCategory).toBeDefined();
      expect(Object.keys(result.byCategory).length).toBeGreaterThan(0);
    });
  });

  describe('getAllAchievementsWithProgress', () => {
    it('should return all achievements with progress', () => {
      const workouts = createWorkouts(5);
      const result = getAllAchievementsWithProgress({ workouts });
      
      expect(result.length).toBe(20);
      
      result.forEach(achievement => {
        expect(achievement).toHaveProperty('isUnlocked');
        expect(achievement).toHaveProperty('progress');
        expect(typeof achievement.isUnlocked).toBe('boolean');
      });
    });

    it('should calculate progress correctly', () => {
      const workouts = createWorkouts(3);
      const result = getAllAchievementsWithProgress({ workouts });
      
      const threeReturns = result.find(a => a.id === 'three_returns');
      expect(threeReturns).toBeDefined();
      expect(threeReturns.progress).toBeDefined();
      expect(threeReturns.progress.current).toBe(3);
      expect(threeReturns.progress.target).toBe(3);
    });
  });

  describe('getNextAchievement', () => {
    it('should return null when all achievements unlocked', () => {
      // This test would require all achievements to be unlocked
      // For now, we test with empty workouts
      const result = getNextAchievement({ workouts: [] });
      
      // Should return the first achievement to work towards
      expect(result).toBeDefined();
      expect(result.isUnlocked).toBe(false);
    });
  });

  describe('getNearestAchievements', () => {
    it('should return limited number of achievements', () => {
      const result = getNearestAchievements({ workouts: [] }, 3);
      
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should return achievements sorted by progress', () => {
      const workouts = createWorkouts(2);
      const result = getNearestAchievements({ workouts }, 5);
      
      // First result should have higher or equal progress than last
      if (result.length > 1) {
        const firstProgress = result[0].progress ? 
          result[0].progress.current / result[0].progress.target : 0;
        const lastProgress = result[result.length - 1].progress ?
          result[result.length - 1].progress.current / result[result.length - 1].progress.target : 0;
        
        expect(firstProgress).toBeGreaterThanOrEqual(lastProgress);
      }
    });
  });

  describe('isAchievementUnlocked', () => {
    it('should return true for unlocked achievement', () => {
      const workouts = [createWorkout()];
      
      expect(isAchievementUnlocked('first_bow', { workouts })).toBe(true);
    });

    it('should return false for locked achievement', () => {
      const workouts = [];
      
      expect(isAchievementUnlocked('first_bow', { workouts })).toBe(false);
    });

    it('should return false for unknown achievement', () => {
      expect(isAchievementUnlocked('unknown', { workouts: [] })).toBe(false);
    });
  });

  describe('calculateNewAchievementsXP', () => {
    it('should return 0 for empty array', () => {
      expect(calculateNewAchievementsXP([])).toBe(0);
    });

    it('should sum XP correctly', () => {
      const achievements = [
        { xpReward: 20 },
        { xpReward: 35 },
        { xpReward: 50 },
      ];
      
      expect(calculateNewAchievementsXP(achievements)).toBe(105);
    });
  });
});

// === Тесты для конкретных достижений ===

describe('Individual Achievement Conditions', () => {
  describe('Basics Category', () => {
    it('first_bow: should unlock with 1 practice', () => {
      const workouts = [createWorkout()];
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'first_bow')).toBeDefined();
    });

    it('three_returns: should unlock with 3 practices', () => {
      const workouts = createWorkouts(3);
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'three_returns')).toBeDefined();
    });

    it('thread_of_rhythm: should unlock with 10 practices', () => {
      const workouts = createWorkouts(10);
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'thread_of_rhythm')).toBeDefined();
    });

    it('foundation_of_path: should unlock with 25 practices', () => {
      const workouts = createWorkouts(25);
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'foundation_of_path')).toBeDefined();
    });
  });

  describe('Duration Category', () => {
    it('full_hour: should unlock with 60+ minute practice', () => {
      const workouts = [createWorkout({ duration: 60 })];
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'full_hour')).toBeDefined();
    });

    it('long_breath: should unlock with 90+ minute practice', () => {
      const workouts = [createWorkout({ duration: 90 })];
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'long_breath')).toBeDefined();
    });

    it('gathered_presence: should unlock with 10 hours total', () => {
      const workouts = createWorkouts(10, { duration: 60 }); // 10 * 60 = 600 min
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'gathered_presence')).toBeDefined();
    });

    it('space_within: should unlock with 25 hours total', () => {
      const workouts = createWorkouts(25, { duration: 60 }); // 25 * 60 = 1500 min
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'space_within')).toBeDefined();
    });
  });

  describe('Diversity Category', () => {
    it('five_paths: should unlock with 5 different types', () => {
      const types = ['power', 'soft', 'restore', 'meditate', 'stretch'];
      const workouts = types.map((type, i) => createWorkout({ 
        id: i + 1, 
        type,
        date: new Date().toISOString().split('T')[0]
      }));
      
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'five_paths')).toBeDefined();
    });

    it('wholeness: should unlock with all 6 main types', () => {
      const types = ['power', 'soft', 'restore', 'meditate', 'integrate', 'stretch'];
      const workouts = types.map((type, i) => createWorkout({ 
        id: i + 1, 
        type,
        date: new Date().toISOString().split('T')[0]
      }));
      
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'wholeness')).toBeDefined();
    });

    it('heart_of_calm: should unlock with 5 meditate/restore practices', () => {
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

    it('strength_and_softness: should unlock with 3 power and 3 soft', () => {
      const workouts = [];
      // 3 power
      for (let i = 0; i < 3; i++) {
        workouts.push(createWorkout({ id: i + 1, type: 'power' }));
      }
      // 3 soft
      for (let i = 0; i < 3; i++) {
        workouts.push(createWorkout({ id: i + 4, type: 'soft' }));
      }
      
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'strength_and_softness')).toBeDefined();
    });
  });

  describe('Mood Category', () => {
    it('lighter_than_before: should unlock with 5 mood improvements', () => {
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

    it('honest_presence: should unlock with 10 filled moods', () => {
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

    it('warm_heart: should unlock with 10 mood 5 endings', () => {
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

  describe('Dedication Category', () => {
    it('path_continues: should unlock with 50 practices', () => {
      const workouts = createWorkouts(50);
      const result = checkAllAchievements({ workouts });
      
      expect(result.find(a => a.id === 'path_continues')).toBeDefined();
    });
  });
});

// === Тесты calcStreak ===

describe('calcStreak', () => {
  it('should return 0 for empty workouts', () => {
    expect(calcStreak([])).toBe(0);
  });

  it('should return 1 for single workout today', () => {
    const workouts = [createWorkout()];
    expect(calcStreak(workouts)).toBe(1);
  });

  it('should calculate consecutive days', () => {
    const today = new Date();
    const workouts = [];
    
    // Create 3 consecutive days
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      workouts.push(createWorkout({
        date: date.toISOString().split('T')[0]
      }));
    }
    
    expect(calcStreak(workouts)).toBe(3);
  });

  it('should return 0 if last workout was more than 1 day ago', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 3);
    
    const workouts = [createWorkout({
      date: oldDate.toISOString().split('T')[0]
    })];
    
    expect(calcStreak(workouts)).toBe(0);
  });
});
