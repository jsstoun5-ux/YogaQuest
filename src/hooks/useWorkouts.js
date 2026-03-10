/**
 * Хук для управления тренировками
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { calcStreak } from '../constants/achievements.js';
import { getLevel } from '../constants/levels.js';
import { getLocalDateStr } from '../utils/dateUtils.js';
import { Storage, loadWorkouts, saveWorkouts } from '../utils/storage.js';
import { ServerStorage } from '../utils/serverStorage.js';

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
 * @param {string|number} telegramId - ID пользователя Telegram
 * @returns {object} Объект с данными и методами
 */
export function useWorkouts(tg, telegramId) {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [useServerStorage, setUseServerStorage] = useState(false);
  
  // Ref для хранения экземпляра хранилища
  const storageRef = useRef(null);
  const serverStorageRef = useRef(null);
  
  // Ref для отслеживания разблокированных достижений
  const prevAchievementsRef = useRef(new Set());
  
  // Ref для отслеживания начальной загрузки
  const isInitialMount = useRef(true);

  // Инициализация хранилища
  useEffect(() => {
    console.log('[useWorkouts] Initializing with tg:', !!tg, 'hasCloudStorage:', !!(tg && tg.CloudStorage), 'telegramId:', telegramId);
    const storage = new Storage(tg);
    storageRef.current = storage;
    
    // Инициализируем серверное хранилище
    if (telegramId) {
      serverStorageRef.current = new ServerStorage(telegramId);
    }
    
    async function loadData() {
      // Сначала пробуем загрузить из CloudStorage
      try {
        console.log('[useWorkouts] Loading workouts from CloudStorage...');
        const data = await loadWorkouts(storage);
        console.log('[useWorkouts] Loaded workouts from CloudStorage:', data?.length || 0, 'items');
        setWorkouts(data || []);
      } catch (e) {
        console.error('[useWorkouts] Failed to load from CloudStorage:', e);
        
        // Если ошибка DATA_TOO_LONG, пробуем загрузить с сервера
        if (e.message?.includes('DATA_TOO_LONG') || e === 'DATA_TOO_LONG') {
          console.log('[useWorkouts] DATA_TOO_LONG error, trying server storage...');
          setUseServerStorage(true);
          
          if (serverStorageRef.current) {
            try {
              const serverData = await serverStorageRef.current.getWorkouts();
              console.log('[useWorkouts] Loaded workouts from server:', serverData?.length || 0, 'items');
              setWorkouts(serverData || []);
            } catch (serverError) {
              console.error('[useWorkouts] Failed to load from server:', serverError);
              setError('Failed to load data: ' + serverError.message);
            }
          }
        } else {
          setError(e.message);
        }
      } finally {
        setIsLoading(false);
        isInitialMount.current = false;
      }
    }
    
    loadData();
  }, [tg, telegramId]);

  // Сохранение при изменении тренировок (но не при первой загрузке)
  useEffect(() => {
    // Пропускаем первое сохранение после загрузки
    if (isInitialMount.current || isLoading || !storageRef.current) {
      return;
    }
    
    async function persistWorkouts() {
      setIsSaving(true);
      try {
        console.log('[useWorkouts] Saving workouts:', workouts.length, 'items');
        
        if (useServerStorage && serverStorageRef.current) {
          // Сохраняем на сервер
          console.log('[useWorkouts] Using server storage');
          const success = await serverStorageRef.current.saveWorkouts(workouts);
          if (!success) {
            throw new Error('Server save failed');
          }
          console.log('[useWorkouts] Workouts saved to server successfully');
        } else {
          // Пробуем сохранить в CloudStorage
          await saveWorkouts(storageRef.current, workouts);
          console.log('[useWorkouts] Workouts saved to CloudStorage successfully');
        }
      } catch (e) {
        console.error('[useWorkouts] Failed to save workouts:', e);
        
        // Если ошибка DATA_TOO_LONG, переключаемся на серверное хранилище
        if (e.message?.includes('DATA_TOO_LONG') || e === 'DATA_TOO_LONG') {
          console.log('[useWorkouts] DATA_TOO_LONG error, switching to server storage...');
          setUseServerStorage(true);
          
          if (serverStorageRef.current) {
            try {
              const success = await serverStorageRef.current.saveWorkouts(workouts);
              if (success) {
                console.log('[useWorkouts] Workouts saved to server successfully');
              } else {
                setError('Failed to save data');
              }
            } catch (serverError) {
              console.error('[useWorkouts] Failed to save to server:', serverError);
              setError('Failed to save data: ' + serverError.message);
            }
          }
        } else {
          setError('Failed to save: ' + e.message);
        }
      } finally {
        setIsSaving(false);
      }
    }
    
    persistWorkouts();
  }, [workouts, isLoading, useServerStorage]);

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
    isSaving,
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