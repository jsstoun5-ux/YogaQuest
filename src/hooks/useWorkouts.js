/**
 * Хук для управления тренировками
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { calcStreak } from '../constants/achievements.js';
import { getLevel } from '../constants/levels.js';
import { getLocalDateStr } from '../utils/dateUtils.js';
import { Storage, loadWorkouts, saveWorkouts } from '../utils/storage.js';

/**
 * Создать новую тренировку
 * @param {object} form - Данные формы
 * @returns {object} Объект тренировки
 */
function createWorkout(form) {
  return {
    id: Date.now(),
    date: form.date,
    type: form.type,
    duration: form.duration,
    moodBefore: form.moodBefore,
    moodAfter: form.moodAfter,
    note: form.note || "",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Хук для управления тренировками
 * @param {object} tg - Telegram WebApp объект
 * @returns {object} Объект с данными и методами
 */
export function useWorkouts(tg) {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Ref для хранения экземпляра хранилища
  const storageRef = useRef(null);
  
  // Ref для отслеживания разблокированных достижений
  const prevAchievementsRef = useRef(new Set());

  // Инициализация хранилища
  useEffect(() => {
    const storage = new Storage(tg);
    storageRef.current = storage;
    
    async function loadData() {
      try {
        const data = await loadWorkouts(storage);
        setWorkouts(data);
        
        // Инициализируем Set уже разблокированных достижений
        const unlockedIds = data
          .filter(w => w.id)
          .map(() => null); // Заглушка, реальные достижения проверяются отдельно
        
      } catch (e) {
        console.warn('Failed to load workouts:', e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [tg]);

  // Сохранение при изменении тренировок
  useEffect(() => {
    if (isLoading || !storageRef.current) return;
    
    saveWorkouts(storageRef.current, workouts).catch(e => {
      console.warn('Failed to save workouts:', e);
    });
  }, [workouts, isLoading]);

  /**
   * Добавить тренировку
   */
  const addWorkout = useCallback((form) => {
    const workout = createWorkout(form);
    setWorkouts(prev => [workout, ...prev]);
    return workout;
  }, []);

  /**
   * Удалить тренировку
   */
  const deleteWorkout = useCallback((id) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  }, []);

  /**
   * Обновить тренировку
   */
  const updateWorkout = useCallback((id, updates) => {
    setWorkouts(prev => prev.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  /**
   * Очистить все тренировки
   */
  const clearWorkouts = useCallback(() => {
    setWorkouts([]);
  }, []);

  // Вычисляемые значения
  const stats = useMemo(() => {
    const total = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
    const streak = calcStreak(workouts);
    const level = getLevel(total);
    const todayStr = getLocalDateStr();
    const todayWorkouts = workouts.filter(w => w.date === todayStr);
    const todayMinutes = todayWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const avgDuration = total > 0 ? Math.round(totalMinutes / total) : 0;
    const maxDuration = total > 0 ? Math.max(...workouts.map(w => w.duration)) : 0;

    return {
      total,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60),
      streak,
      level,
      todayWorkouts,
      todayMinutes,
      todayCount: todayWorkouts.length,
      avgDuration,
      maxDuration,
    };
  }, [workouts]);

  /**
   * Получить тренировки за период
   */
  const getWorkoutsByDateRange = useCallback((startDate, endDate) => {
    return workouts.filter(w => w.date >= startDate && w.date <= endDate);
  }, [workouts]);

  /**
   * Получить тренировки по типу
   */
  const getWorkoutsByType = useCallback((type) => {
    return workouts.filter(w => w.type === type);
  }, [workouts]);

  /**
   * Получить тренировки за месяц
   */
  const getWorkoutsByMonth = useCallback((monthStr) => {
    return workouts.filter(w => w.date.startsWith(monthStr));
  }, [workouts]);

  return {
    workouts,
    isLoading,
    error,
    stats,
    addWorkout,
    deleteWorkout,
    updateWorkout,
    clearWorkouts,
    getWorkoutsByDateRange,
    getWorkoutsByType,
    getWorkoutsByMonth,
    prevAchievementsRef,
  };
}