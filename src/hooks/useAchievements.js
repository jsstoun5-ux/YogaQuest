/**
 * Хук для управления достижениями
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { ACHIEVEMENTS, getUnlockedAchievements } from '../constants/achievements.js';
import { Storage } from '../utils/storage.js';

const SEEN_ACHIEVEMENTS_KEY = 'yogaquest_seen_achievements';
const ACHIEVEMENT_DISPLAY_TIME = 10000; // 10 секунд

/**
 * Хук для отслеживания достижений
 * @param {Array} workouts - Массив тренировок
 * @param {Function} onUnlock - Callback при разблокировке нового достижения
 * @param {object} tg - Telegram WebApp объект
 * @returns {object} Объект с достижениями и методами
 */
export function useAchievements(workouts, onUnlock, tg) {
  // Ранее просмотренные достижения (загружаются из хранилища)
  const prevUnlockedRef = useRef(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Состояние для нового достижения (для показа уведомления)
  const [newAchievement, setNewAchievement] = useState(null);
  
  // Ref для таймера
  const timerRef = useRef(null);

  // Хранилище
  const storage = useRef(new Storage(tg));

  // Загрузить просмотренные достижения при старте
  useEffect(() => {
    async function loadSeenAchievements() {
      try {
        const storageInstance = storage.current;
        const seenData = await storageInstance.getJSON(SEEN_ACHIEVEMENTS_KEY);
        if (Array.isArray(seenData)) {
          prevUnlockedRef.current = new Set(seenData);
        }
      } catch (e) {
        console.warn('Failed to load seen achievements:', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadSeenAchievements();
  }, []);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Вычислить разблокированные достижения
  const unlockedAchievements = getUnlockedAchievements(workouts);
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

  // Проверить новые достижения при изменении тренировок
  useEffect(() => {
    if (!isLoaded || !workouts || workouts.length === 0) return;

    // Найти новые достижения (разблокированы, но ещё не были показаны)
    const newUnlocked = ACHIEVEMENTS.filter(
      a => a.check(workouts) && !prevUnlockedRef.current.has(a.id)
    );

    // Если есть новые достижения
    if (newUnlocked.length > 0) {
      // Очищаем предыдущий таймер если есть
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Обновляем ref
      newUnlocked.forEach(a => prevUnlockedRef.current.add(a.id));
      
      // Сохраняем в хранилище
      const seenArray = Array.from(prevUnlockedRef.current);
      storage.current.setJSON(SEEN_ACHIEVEMENTS_KEY, seenArray).catch(console.warn);
      
      // Показываем первое новое достижение
      const achievement = newUnlocked[0];
      setNewAchievement(achievement);
      
      // Вызываем callback
      if (onUnlock) {
        onUnlock(achievement);
      }

      // Скрываем уведомление через 10 секунд
      timerRef.current = setTimeout(() => {
        setNewAchievement(null);
        timerRef.current = null;
      }, ACHIEVEMENT_DISPLAY_TIME);
    }
  }, [workouts, onUnlock, isLoaded]);

  /**
   * Сбросить уведомление о новом достижении
   */
  const clearNewAchievement = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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