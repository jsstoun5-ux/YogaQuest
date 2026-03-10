/**
 * Unit Tests for YogaQuest Progression System
 * Тесты для XP, уровней, достижений и сада
 */

import { describe, it, expect, beforeEach } from 'vitest';

// XP System Tests
import {
  calculateDurationBonus,
  calculateMoodBonus,
  calculateStreakBonus,
  isNewPracticeType,
  getTodayPracticeCount,
  calculateWorkoutXP,
  XP_CONFIG,
} from '../game/xpSystem.js';

describe('XP System', () => {
  describe('calculateDurationBonus', () => {
    it('should return 0 for duration less than 15 minutes', () => {
      expect(calculateDurationBonus(10)).toBe(0);
      expect(calculateDurationBonus(14)).toBe(0);
    });

    it('should return 0 for 15-29 minutes', () => {
      expect(calculateDurationBonus(15)).toBe(0);
      expect(calculateDurationBonus(20)).toBe(0);
      expect(calculateDurationBonus(29)).toBe(0);
    });

    it('should return 5 for 30-44 minutes', () => {
      expect(calculateDurationBonus(30)).toBe(5);
      expect(calculateDurationBonus(40)).toBe(5);
      expect(calculateDurationBonus(44)).toBe(5);
    });

    it('should return 8 for 45-59 minutes', () => {
      expect(calculateDurationBonus(45)).toBe(8);
      expect(calculateDurationBonus(50)).toBe(8);
      expect(calculateDurationBonus(59)).toBe(8);
    });

    it('should return 12 for 60-89 minutes', () => {
      expect(calculateDurationBonus(60)).toBe(12);
      expect(calculateDurationBonus(75)).toBe(12);
      expect(calculateDurationBonus(89)).toBe(12);
    });

    it('should return 18 for 90+ minutes', () => {
      expect(calculateDurationBonus(90)).toBe(18);
      expect(calculateDurationBonus(120)).toBe(18);
      expect(calculateDurationBonus(180)).toBe(18);
    });
  });

  describe('calculateMoodBonus', () => {
    it('should return 0 if moodBefore or moodAfter is null', () => {
      expect(calculateMoodBonus(null, 3)).toBe(0);
      expect(calculateMoodBonus(3, null)).toBe(0);
      expect(calculateMoodBonus(null, null)).toBe(0);
    });

    it('should return 0 if mood did not change', () => {
      expect(calculateMoodBonus(3, 3)).toBe(0);
      expect(calculateMoodBonus(5, 5)).toBe(0);
    });

    it('should return 0 if mood got worse', () => {
      expect(calculateMoodBonus(5, 4)).toBe(0);
      expect(calculateMoodBonus(4, 2)).toBe(0);
    });

    it('should return 3 for improvement of 1', () => {
      expect(calculateMoodBonus(3, 4)).toBe(3);
      expect(calculateMoodBonus(2, 3)).toBe(3);
    });

    it('should return 6 for improvement of 2 or more', () => {
      expect(calculateMoodBonus(2, 4)).toBe(6);
      expect(calculateMoodBonus(1, 5)).toBe(6);
      expect(calculateMoodBonus(1, 3)).toBe(6);
    });
  });

  describe('calculateStreakBonus', () => {
    it('should return 0 for streak less than 3', () => {
      expect(calculateStreakBonus(0)).toBe(0);
      expect(calculateStreakBonus(1)).toBe(0);
      expect(calculateStreakBonus(2)).toBe(0);
    });

    it('should return 10 for streak of exactly 3', () => {
      expect(calculateStreakBonus(3)).toBe(10);
    });

    it('should return 20 for streak of exactly 7', () => {
      expect(calculateStreakBonus(7)).toBe(20);
    });

    it('should return 35 for streak of exactly 14', () => {
      expect(calculateStreakBonus(14)).toBe(35);
    });

    it('should return 60 for streak of exactly 30', () => {
      expect(calculateStreakBonus(30)).toBe(60);
    });

    it('should return 120 for streak of exactly 90', () => {
      expect(calculateStreakBonus(90)).toBe(120);
    });

    it('should return 0 for non-milestone streaks', () => {
      expect(calculateStreakBonus(4)).toBe(0);
      expect(calculateStreakBonus(8)).toBe(0);
      expect(calculateStreakBonus(15)).toBe(0);
    });
  });

  describe('isNewPracticeType', () => {
    it('should return true for new type', () => {
      const workouts = [
        { type: 'power' },
        { type: 'soft' },
      ];
      expect(isNewPracticeType('meditate', workouts)).toBe(true);
    });

    it('should return false for existing type', () => {
      const workouts = [
        { type: 'power' },
        { type: 'soft' },
      ];
      expect(isNewPracticeType('power', workouts)).toBe(false);
      expect(isNewPracticeType('soft', workouts)).toBe(false);
    });

    it('should return true for empty workouts', () => {
      expect(isNewPracticeType('power', [])).toBe(true);
    });
  });

  describe('getTodayPracticeCount', () => {
    it('should return 0 for no practices today', () => {
      const workouts = [
        { date: '2024-01-01' },
        { date: '2024-01-02' },
      ];
      expect(getTodayPracticeCount(workouts, '2024-01-03')).toBe(0);
    });

    it('should return correct count for today', () => {
      const workouts = [
        { date: '2024-01-03' },
        { date: '2024-01-03' },
        { date: '2024-01-02' },
      ];
      expect(getTodayPracticeCount(workouts, '2024-01-03')).toBe(2);
    });
  });

  describe('calculateWorkoutXP', () => {
    it('should calculate base XP for basic practice', () => {
      const workout = { duration: 20, type: 'power', moodBefore: null, moodAfter: null };
      const result = calculateWorkoutXP(workout, [], '2024-01-01', 0);
      
      expect(result.baseXP).toBe(XP_CONFIG.BASE_PRACTICE_XP);
      expect(result.totalXP).toBe(XP_CONFIG.BASE_PRACTICE_XP);
    });

    it('should include duration bonus', () => {
      const workout = { duration: 60, type: 'power', moodBefore: null, moodAfter: null };
      const result = calculateWorkoutXP(workout, [], '2024-01-01', 0);
      
      expect(result.durationBonus).toBe(12);
      expect(result.totalXP).toBe(XP_CONFIG.BASE_PRACTICE_XP + 12);
    });

    it('should include mood bonus', () => {
      const workout = { duration: 20, type: 'power', moodBefore: 2, moodAfter: 4 };
      const result = calculateWorkoutXP(workout, [], '2024-01-01', 0);
      
      expect(result.moodBonus).toBe(6);
    });

    it('should include new type bonus', () => {
      const workout = { duration: 20, type: 'meditate', moodBefore: null, moodAfter: null };
      const existingWorkouts = [{ type: 'power' }];
      const result = calculateWorkoutXP(workout, existingWorkouts, '2024-01-01', 0);
      
      expect(result.newTypeBonus).toBe(XP_CONFIG.NEW_TYPE_BONUS);
    });

    it('should apply reduced XP for daily limit exceeded', () => {
      const workout = { duration: 60, type: 'power', moodBefore: 2, moodAfter: 4 };
      const existingWorkouts = [
        { date: '2024-01-01', type: 'soft' },
        { date: '2024-01-01', type: 'restore' },
        { date: '2024-01-01', type: 'meditate' },
      ];
      const result = calculateWorkoutXP(workout, existingWorkouts, '2024-01-01', 0);
      
      expect(result.isReduced).toBe(true);
      expect(result.totalXP).toBe(XP_CONFIG.REDUCED_XP);
    });
  });
});

// Level System Tests
import {
  getLevelByXP,
  getLevelProgress,
  checkLevelUp,
  LEVEL_TABLE,
} from '../game/levelSystem.js';

describe('Level System', () => {
  describe('getLevelByXP', () => {
    it('should return level 1 for 0 XP', () => {
      const level = getLevelByXP(0);
      expect(level.level).toBe(1);
      expect(level.title).toBe('Семя внимания');
    });

    it('should return level 2 for 40 XP', () => {
      const level = getLevelByXP(40);
      expect(level.level).toBe(2);
      expect(level.title).toBe('Первый вдох');
    });

    it('should return level 10 for 1250 XP', () => {
      const level = getLevelByXP(1250);
      expect(level.level).toBe(10);
      expect(level.title).toBe('Тихая наставница');
    });

    it('should return level 20 for 10000+ XP', () => {
      const level = getLevelByXP(10000);
      expect(level.level).toBe(20);
      expect(level.title).toBe('Путь без конца');
    });

    it('should return correct level for boundary values', () => {
      expect(getLevelByXP(39).level).toBe(1);
      expect(getLevelByXP(40).level).toBe(2);
      expect(getLevelByXP(89).level).toBe(2);
      expect(getLevelByXP(90).level).toBe(3);
    });
  });

  describe('getLevelProgress', () => {
    it('should return correct progress for level 1', () => {
      const progress = getLevelProgress(20);
      expect(progress.currentLevel.level).toBe(1);
      expect(progress.nextLevel.level).toBe(2);
      expect(progress.progressPercent).toBeGreaterThan(0);
      expect(progress.progressPercent).toBeLessThan(100);
    });

    it('should return 100% progress for max level', () => {
      const progress = getLevelProgress(15000);
      expect(progress.isMaxLevel).toBe(true);
      expect(progress.progressPercent).toBe(100);
    });

    it('should calculate XP to next level correctly', () => {
      const progress = getLevelProgress(50);
      expect(progress.xpToNextLevel).toBe(40); // 90 - 50 = 40
    });
  });

  describe('checkLevelUp', () => {
    it('should return null if no level up', () => {
      const result = checkLevelUp(20, 30);
      expect(result).toBeNull();
    });

    it('should return level up info when level increases', () => {
      const result = checkLevelUp(30, 50);
      expect(result).not.toBeNull();
      expect(result.previousLevel.level).toBe(1);
      expect(result.newLevel.level).toBe(2);
    });

    it('should handle multiple level ups', () => {
      const result = checkLevelUp(30, 200);
      expect(result).not.toBeNull();
      expect(result.levelsGained).toBeGreaterThan(1);
    });
  });
});

// Achievement System Tests
import {
  checkAllAchievements,
  checkNewAchievements,
  getAchievementsProgress,
} from '../achievements/checkAchievements.js';
import { ACHIEVEMENT_LIST } from '../achievements/achievementList.js';

describe('Achievement System', () => {
  describe('checkAllAchievements', () => {
    it('should return empty array for empty workouts', () => {
      const result = checkAllAchievements({ workouts: [] });
      expect(result.length).toBe(0);
    });

    it('should return first_bow for one workout', () => {
      const result = checkAllAchievements({ workouts: [{ id: 1 }] });
      expect(result.some(a => a.id === 'first_bow')).toBe(true);
    });

    it('should return three_returns for 3 workouts', () => {
      const workouts = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = checkAllAchievements({ workouts });
      expect(result.some(a => a.id === 'three_returns')).toBe(true);
    });

    it('should return full_hour for 60+ min practice', () => {
      const workouts = [{ id: 1, duration: 60 }];
      const result = checkAllAchievements({ workouts });
      expect(result.some(a => a.id === 'full_hour')).toBe(true);
    });
  });

  describe('checkNewAchievements', () => {
    it('should return only new achievements', () => {
      const workouts = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const previouslyUnlocked = new Set(['first_bow']);
      const result = checkNewAchievements({ workouts }, previouslyUnlocked);
      
      expect(result.some(a => a.id === 'three_returns')).toBe(true);
      expect(result.some(a => a.id === 'first_bow')).toBe(false);
    });
  });

  describe('getAchievementsProgress', () => {
    it('should return correct progress', () => {
      const progress = getAchievementsProgress({ workouts: [] });
      expect(progress.unlockedCount).toBe(0);
      expect(progress.total).toBe(ACHIEVEMENT_LIST.length);
      expect(progress.progressPercent).toBe(0);
    });

    it('should calculate progress correctly', () => {
      const workouts = [{ id: 1 }];
      const progress = getAchievementsProgress({ workouts });
      expect(progress.unlockedCount).toBeGreaterThan(0);
      expect(progress.progressPercent).toBeGreaterThan(0);
    });
  });
});

// Garden System Tests
import {
  getGardenStage,
  getGardenProgress,
  checkGardenStageUp,
  GARDEN_STAGES,
} from '../garden/gardenStages.js';

import { calculateGardenState } from '../garden/gardenEngine.js';

describe('Garden System', () => {
  describe('getGardenStage', () => {
    it('should return stage 0 for 0 practices', () => {
      const stage = getGardenStage(0);
      expect(stage.stage).toBe(0);
      expect(stage.id).toBe('empty_plot');
    });

    it('should return stage 1 for 1-2 practices', () => {
      expect(getGardenStage(1).stage).toBe(1);
      expect(getGardenStage(2).stage).toBe(1);
    });

    it('should return stage 3 for 7-14 practices', () => {
      expect(getGardenStage(7).stage).toBe(3);
      expect(getGardenStage(10).stage).toBe(3);
      expect(getGardenStage(14).stage).toBe(3);
    });

    it('should return stage 8 for 90+ practices', () => {
      const stage = getGardenStage(90);
      expect(stage.stage).toBe(8);
      expect(stage.id).toBe('garden_of_serenity');
    });
  });

  describe('getGardenProgress', () => {
    it('should calculate progress correctly', () => {
      const progress = getGardenProgress(5);
      expect(progress.currentStage.stage).toBe(2);
      expect(progress.progressPercent).toBeGreaterThanOrEqual(0);
      expect(progress.progressPercent).toBeLessThanOrEqual(100);
    });

    it('should return 100% for max stage', () => {
      const progress = getGardenProgress(100);
      expect(progress.isMaxStage).toBe(true);
      expect(progress.progressPercent).toBe(100);
    });
  });

  describe('checkGardenStageUp', () => {
    it('should return null if no stage up', () => {
      const result = checkGardenStageUp(5, 6);
      expect(result).toBeNull();
    });

    it('should return stage up info when stage increases', () => {
      const result = checkGardenStageUp(2, 3);
      expect(result).not.toBeNull();
      expect(result.previousStage.stage).toBe(1);
      expect(result.newStage.stage).toBe(2);
    });
  });

  describe('calculateGardenState', () => {
    it('should return correct state for empty workouts', () => {
      const state = calculateGardenState([]);
      expect(state.stage.stage).toBe(0);
      expect(state.activeObjects.length).toBe(0);
    });

    it('should calculate objects from practice types', () => {
      const workouts = [
        { type: 'meditate', duration: 30 },
        { type: 'meditate', duration: 30 },
      ];
      const state = calculateGardenState(workouts);
      expect(state.stage.stage).toBe(1);
    });

    it('should include mood-based objects', () => {
      const workouts = [
        { type: 'power', moodBefore: 2, moodAfter: 4 },
        { type: 'power', moodBefore: 2, moodAfter: 4 },
        { type: 'power', moodBefore: 2, moodAfter: 4 },
        { type: 'power', moodBefore: 2, moodAfter: 4 },
        { type: 'power', moodBefore: 2, moodAfter: 4 },
      ];
      const state = calculateGardenState(workouts);
      expect(state.moodStats.improvementCount).toBe(5);
    });
  });
});

// Integration Tests
describe('Integration Tests', () => {
  describe('Full progression flow', () => {
    it('should calculate XP, level, achievements, and garden together', () => {
      const workouts = [
        { id: 1, date: '2024-01-01', type: 'power', duration: 60, moodBefore: 2, moodAfter: 4 },
        { id: 2, date: '2024-01-02', type: 'soft', duration: 45, moodBefore: 3, moodAfter: 4 },
        { id: 3, date: '2024-01-03', type: 'meditate', duration: 30, moodBefore: 2, moodAfter: 3 },
      ];

      // Check achievements
      const achievements = checkAllAchievements({ workouts });
      expect(achievements.length).toBeGreaterThan(0);

      // Check garden
      const gardenState = calculateGardenState(workouts);
      expect(gardenState.stage.stage).toBe(2);
    });

    it('should handle edge cases gracefully', () => {
      // Empty data
      expect(() => calculateGardenState([])).not.toThrow();
      expect(() => checkAllAchievements({ workouts: [] })).not.toThrow();
      
      // Missing fields
      const incompleteWorkouts = [
        { id: 1 },
        { id: 2, type: null },
        { id: 3, duration: null },
      ];
      expect(() => calculateGardenState(incompleteWorkouts)).not.toThrow();
    });
  });
});