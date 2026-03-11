/**
 * useProgression Hook for YogaQuest
 * Хук для управления прогрессом пользователя (XP, уровни, достижения)
 * Использует централизованный StorageManager
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { calculateWorkoutXP, checkReturnBonus, XP_CONFIG } from '../game/xpSystem.js';
import { getLevelByXP, getLevelProgress, checkLevelUp } from '../game/levelSystem.js';
import { calculateFullProgress } from '../game/progressionEngine.js';
import { checkNewAchievements, getAchievementsProgress } from '../achievements/checkAchievements.js';
import { ACHIEVEMENT_LIST } from '../achievements/achievementList.js';
import { getLocalDateStr } from '../utils/dateUtils.js';
import { getStorageManager, isStorageInitialized } from '../storage/StorageManager.js';

/**
 * Хук для управления прогрессом
 * @param {Array} workouts - Массив тренировок
 * @param {object} tg - Telegram WebApp объект
 * @returns {object} Состояние и методы прогресса
 */
export function useProgression(workouts, tg) {
  // Состояние профиля
  const [profile, setProfile] = useState({
    totalXP: 0,
    unlockedAchievementIds: [],
    lastReturnBonusDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Ref для хранения экземпляра хранилища
  const storageRef = useRef(null);
  
  // Ref для отслеживания начальной загрузки
  const isInitialMount = useRef(true);
  
  // Инициализация хранилища - использует централизованный singleton
  useEffect(() => {
    console.log('[useProgression] Initializing...');
    
    // Получаем singleton менеджер хранилища
    const storage = getStorageManager(tg);
    storageRef.current = storage;
    
    async function loadProfile() {
      try {
        // Ждем инициализации хранилища
        await storage.initialize();
        
        // Загружаем данные
        console.log('[useProgression] Loading profile from', storage.backend, '...');
        const data = await storage.loadProfile();
        console.log('[useProgression] Loaded profile:', data);
        
        setProfile({
          totalXP: data.totalXP || 0,
          unlockedAchievementIds: data.unlockedAchievementIds || [],
          lastReturnBonusDate: data.lastReturnBonusDate || null,
        });
      } catch (e) {
        console.error('[useProgression] Failed to load profile:', e);
      } finally {
        setIsLoading(false);
        isInitialMount.current = false;
      }
    }
    
    loadProfile();
  }, [tg]);
  
  // Сохранение профиля при изменении (но не при первой загрузке)
  useEffect(() => {
    // Пропускаем первое сохранение после загрузки
    if (isInitialMount.current || isLoading || !storageRef.current) {
      return;
    }
    
    // Проверяем что хранилище инициализировано
    if (!isStorageInitialized()) {
      console.log('[useProgression] Storage not initialized, save will be queued');
    }
    
    async function persistProfile() {
      setIsSaving(true);
      try {
        console.log('[useProgression] Saving profile');
        await storageRef.current.saveProfile(profile);
        console.log('[useProgression] Profile saved successfully');
      } catch (e) {
        console.error('[useProgression] Failed to save profile:', e);
      } finally {
        setIsSaving(false);
      }
    }
    
    persistProfile();
  }, [profile, isLoading]);
  
  // Вычисляемый прогресс
  const progression = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      return {
        totalXP: profile.totalXP,
        level: getLevelByXP(profile.totalXP),
        levelProgress: getLevelProgress(profile.totalXP),
        achievements: getAchievementsProgress({ workouts: [] }),
      };
    }
    
    // Вычисляем полный прогресс
    const fullProgress = calculateFullProgress(workouts, 
      profile.unlockedAchievementIds.map(id => 
        ACHIEVEMENT_LIST.find(a => a.id === id)
      ).filter(Boolean)
    );
    
    // Уровень на основе общего XP
    const level = getLevelByXP(profile.totalXP);
    const levelProgress = getLevelProgress(profile.totalXP);
    
    // Достижения
    const achievements = getAchievementsProgress({ workouts });
    
    return {
      totalXP: profile.totalXP,
      level,
      levelProgress,
      achievements,
      ...fullProgress,
    };
  }, [workouts, profile]);
  
  /**
   * Обработать новую практику
   */
  const processNewWorkout = useCallback((workout) => {
    const todayStr = getLocalDateStr();
    const previousXP = profile.totalXP;
    
    // Вычисляем текущую серию
    const dates = [...new Set(workouts.map(w => w.date))].sort().reverse();
    let streak = 0;
    if (dates.length > 0) {
      const lastDate = new Date(dates[0]);
      const today = new Date(todayStr);
      const dayDiff = Math.floor((today - lastDate) / 86400000);
      
      if (dayDiff <= 1) {
        // Серия продолжается
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const diff = Math.floor((new Date(dates[i - 1]) - new Date(dates[i])) / 86400000);
          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }
        if (dayDiff === 0) {
          // Сегодня уже была практика, серия уже учтена
        } else {
          // Вчера была практика, добавляем сегодняшний день
          streak++;
        }
      }
    }
    
    const xpResult = calculateWorkoutXP(workout, workouts, todayStr, streak);
    
    // Проверяем бонус за возвращение
    const returnCheck = checkReturnBonus(workouts, todayStr, profile.lastReturnBonusDate);
    let returnBonusXP = 0;
    
    if (returnCheck.eligible) {
      returnBonusXP = XP_CONFIG.RETURN_BONUS;
    }
    
    // Общий XP
    const totalGained = xpResult.totalXP + returnBonusXP;
    const newXP = previousXP + totalGained;
    
    // Проверяем повышение уровня
    const levelUp = checkLevelUp(previousXP, newXP);
    
    // Проверяем новые достижения
    const newAchievements = checkNewAchievements(
      { workouts: [...workouts, workout] },
      new Set(profile.unlockedAchievementIds)
    );
    
    // XP за новые достижения
    const achievementXP = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
    const finalXP = newXP + achievementXP;
    
    // Обновляем профиль
    setProfile(prev => ({
      ...prev,
      totalXP: finalXP,
      unlockedAchievementIds: [
        ...prev.unlockedAchievementIds,
        ...newAchievements.map(a => a.id),
      ],
      lastReturnBonusDate: returnCheck.eligible ? todayStr : prev.lastReturnBonusDate,
    }));
    
    return {
      xpGained: totalGained,
      xpBreakdown: xpResult,
      returnBonus: returnCheck.eligible ? { xp: returnBonusXP, daysAway: returnCheck.daysSinceLastPractice } : null,
      levelUp,
      newAchievements,
      finalXP,
    };
  }, [workouts, profile]);
  
  /**
   * Добавить XP вручную
   */
  const addXP = useCallback((amount) => {
    setProfile(prev => ({
      ...prev,
      totalXP: prev.totalXP + amount,
    }));
  }, []);
  
  /**
   * Разблокировать достижение
   */
  const unlockAchievement = useCallback((achievementId) => {
    const achievement = ACHIEVEMENT_LIST.find(a => a.id === achievementId);
    if (!achievement) return null;
    
    if (profile.unlockedAchievementIds.includes(achievementId)) {
      return null; // Уже разблокировано
    }
    
    setProfile(prev => ({
      ...prev,
      totalXP: prev.totalXP + achievement.xpReward,
      unlockedAchievementIds: [...prev.unlockedAchievementIds, achievementId],
    }));
    
    return achievement;
  }, [profile.unlockedAchievementIds]);
  
  /**
   * Сбросить прогресс (для тестирования)
   */
  const resetProgress = useCallback(async () => {
    setProfile({
      totalXP: 0,
      unlockedAchievementIds: [],
      lastReturnBonusDate: null,
    });
    
    if (storageRef.current) {
      await storageRef.current.saveProfile({
        totalXP: 0,
        unlockedAchievementIds: [],
        lastReturnBonusDate: null,
      });
    }
  }, []);
  
  return {
    progression,
    isLoading,
    isSaving,
    processNewWorkout,
    addXP,
    unlockAchievement,
    resetProgress,
    profile,
  };
}

export default useProgression;
