/**
 * Хук для управления достижениями
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { ACHIEVEMENTS, getUnlockedAchievements } from '../constants/achievements.js';

/**
 * Хук для отслеживания достижений
 * @param {Array} workouts - Массив тренировок
 * @param {Function} onUnlock - Callback при разблокировке нового достижения
 * @returns {object} Объект с достижениями и методами
 */
export function useAchievements(workouts, onUnlock) {
  // Ранее разблокированные достижения (для отслеживания новых)
  const prevUnlockedRef = useRef(new Set());
  
  // Состояние для нового достижения (для показа уведомления)
  const [newAchievement, setNewAchievement] = useState(null);

  // Вычислить разблокированные достижения
  const unlockedAchievements = getUnlockedAchievements(workouts);
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

  // Проверить новые достижения при изменении тренировок
  useEffect(() => {
    if (!workouts || workouts.length === 0) return;

    // Найти новые достижения
    const newUnlocked = ACHIEVEMENTS.filter(
      a => a.check(workouts) && !prevUnlockedRef.current.has(a.id)
    );

    // Если есть новые достижения
    if (newUnlocked.length > 0) {
      // Обновляем ref
      newUnlocked.forEach(a => prevUnlockedRef.current.add(a.id));
      
      // Показываем первое новое достижение
      const achievement = newUnlocked[0];
      setNewAchievement(achievement);
      
      // Вызываем callback
      if (onUnlock) {
        onUnlock(achievement);
      }

      // Скрываем уведомление через 3.5 секунды
      const timer = setTimeout(() => {
        setNewAchievement(null);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [workouts, onUnlock]);

  /**
   * Сбросить уведомление о новом достижении
   */
  const clearNewAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);

  /**
   * Проверить, разблокировано ли достижение
   */
  const isUnlocked = useCallback((achievementId) => {
    return unlockedIds.has(achievementId);
  }, [unlockedIds]);

  /**
   * Получить прогресс достижений
   */
  const progress = unlockedAchievements.length;
  const total = ACHIEVEMENTS.length;
  const progressPercent = Math.round((progress / total) * 100);

  return {
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    newAchievement,
    clearNewAchievement,
    isUnlocked,
    progress,
    total,
    progressPercent,
  };
}