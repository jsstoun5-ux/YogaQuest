/**
 * Workout Stats Utilities for YogaQuest
 * Чистые функции для расчёта статистики тренировок
 */

import { calcStreak } from '../constants/achievements.js';

/**
 * Рассчитать общее количество тренировок
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Общее количество
 */
export function calculateTotalPractices(workouts) {
  if (!workouts || !Array.isArray(workouts)) return 0;
  return workouts.length;
}

/**
 * Рассчитать общее количество минут
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Общее количество минут
 */
export function calculateTotalMinutes(workouts) {
  if (!workouts || !Array.isArray(workouts)) return 0;
  return workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
}

/**
 * Рассчитать общее количество часов
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Общее количество часов (округлённое)
 */
export function calculateTotalHours(workouts) {
  return Math.floor(calculateTotalMinutes(workouts) / 60);
}

/**
 * Рассчитать текущую серию дней
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Количество дней подряд
 */
export function calculateStreak(workouts) {
  return calcStreak(workouts);
}

/**
 * Получить уникальные типы практик
 * @param {Array} workouts - Массив тренировок
 * @returns {Set} Set уникальных типов
 */
export function getDistinctPracticeTypes(workouts) {
  if (!workouts || !Array.isArray(workouts)) return new Set();
  return new Set(workouts.map(w => w.type).filter(Boolean));
}

/**
 * Рассчитать количество уникальных типов практик
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Количество уникальных типов
 */
export function calculateDistinctTypes(workouts) {
  return getDistinctPracticeTypes(workouts).size;
}

/**
 * Проверить, все ли основные типы практик использованы
 * @param {Array} workouts - Массив тренировок
 * @returns {boolean} True если все типы использованы
 */
export function hasAllPracticeTypes(workouts) {
  const mainTypes = ['power', 'soft', 'restore', 'meditate', 'integrate', 'stretch'];
  const usedTypes = getDistinctPracticeTypes(workouts);
  return mainTypes.every(t => usedTypes.has(t));
}

/**
 * Рассчитать количество практик по типу
 * @param {Array} workouts - Массив тренировок
 * @param {string} type - Тип практики
 * @returns {number} Количество практик
 */
export function countByType(workouts, type) {
  if (!workouts || !Array.isArray(workouts)) return 0;
  return workouts.filter(w => w.type === type).length;
}

/**
 * Рассчитать количество практик по нескольким типам
 * @param {Array} workouts - Массив тренировок
 * @param {Array} types - Массив типов
 * @returns {number} Количество практик
 */
export function countByTypes(workouts, types) {
  if (!workouts || !Array.isArray(workouts)) return 0;
  return workouts.filter(w => types.includes(w.type)).length;
}

/**
 * Рассчитать количество улучшений настроения
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Количество улучшений
 */
export function calculateMoodImprovements(workouts) {
  if (!workouts || !Array.isArray(workouts)) return 0;
  return workouts.filter(w => 
    w.moodBefore != null && w.moodAfter != null && w.moodAfter > w.moodBefore
  ).length;
}

/**
 * Рассчитать количество заполненных настроений
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Количество заполненных
 */
export function calculateMoodTrackingCount(workouts) {
  if (!workouts || !Array.isArray(workouts)) return 0;
  return workouts.filter(w => 
    w.moodBefore != null && w.moodAfter != null
  ).length;
}

/**
 * Рассчитать количество практик с настроением 5
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Количество практик
 */
export function calculateHappyEndings(workouts) {
  if (!workouts || !Array.isArray(workouts)) return 0;
  return workouts.filter(w => w.moodAfter === 5).length;
}

/**
 * Получить максимальную длительность практики
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Максимальная длительность в минутах
 */
export function getMaxDuration(workouts) {
  if (!workouts || !Array.isArray(workouts) || workouts.length === 0) return 0;
  return Math.max(...workouts.map(w => w.duration || 0));
}

/**
 * Получить среднюю длительность практики
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Средняя длительность в минутах
 */
export function getAvgDuration(workouts) {
  if (!workouts || !Array.isArray(workouts) || workouts.length === 0) return 0;
  const total = calculateTotalMinutes(workouts);
  return Math.round(total / workouts.length);
}

/**
 * Получить тренировки за сегодня
 * @param {Array} workouts - Массив тренировок
 * @param {string} todayStr - Строка даты сегодня (YYYY-MM-DD)
 * @returns {Array} Тренировки за сегодня
 */
export function getTodayWorkouts(workouts, todayStr) {
  if (!workouts || !Array.isArray(workouts)) return [];
  return workouts.filter(w => w.date === todayStr);
}

/**
 * Получить статистику за сегодня
 * @param {Array} workouts - Массив тренировок
 * @param {string} todayStr - Строка даты сегодня (YYYY-MM-DD)
 * @returns {object} Статистика за сегодня
 */
export function getTodayStats(workouts, todayStr) {
  const todayWorkouts = getTodayWorkouts(workouts, todayStr);
  return {
    count: todayWorkouts.length,
    minutes: todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    workouts: todayWorkouts,
  };
}

/**
 * Получить полную статистику тренировок
 * @param {Array} workouts - Массив тренировок
 * @param {string} todayStr - Строка даты сегодня (YYYY-MM-DD)
 * @returns {object} Полная статистика
 */
export function getFullStats(workouts, todayStr) {
  return {
    totalPractices: calculateTotalPractices(workouts),
    totalMinutes: calculateTotalMinutes(workouts),
    totalHours: calculateTotalHours(workouts),
    streak: calculateStreak(workouts),
    distinctTypes: calculateDistinctTypes(workouts),
    moodImprovements: calculateMoodImprovements(workouts),
    moodTrackingCount: calculateMoodTrackingCount(workouts),
    happyEndings: calculateHappyEndings(workouts),
    maxDuration: getMaxDuration(workouts),
    avgDuration: getAvgDuration(workouts),
    today: getTodayStats(workouts, todayStr),
  };
}

export default {
  calculateTotalPractices,
  calculateTotalMinutes,
  calculateTotalHours,
  calculateStreak,
  getDistinctPracticeTypes,
  calculateDistinctTypes,
  hasAllPracticeTypes,
  countByType,
  countByTypes,
  calculateMoodImprovements,
  calculateMoodTrackingCount,
  calculateHappyEndings,
  getMaxDuration,
  getAvgDuration,
  getTodayWorkouts,
  getTodayStats,
  getFullStats,
};
