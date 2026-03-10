/**
 * useProgression Hook for YogaQuest
 * Хук для управления прогрессом пользователя (XP, уровни, достижения, сад)
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { calculateWorkoutXP, checkReturnBonus, XP_CONFIG } from '../game/xpSystem.js';
import { getLevelByXP, getLevelProgress, checkLevelUp } from '../game/levelSystem.js';
import { calculateFullProgress } from '../game/progressionEngine.js';
import { checkNewAchievements, getAchievementsProgress } from '../achievements/checkAchievements.js';
import { ACHIEVEMENT_LIST } from '../achievements/achievementList.js';
import { calculateGardenState, getGardenGrowthTexts } from '../garden/gardenEngine.js';
import { checkGardenStageUp } from '../garden/gardenStages.js';
import { getLocalDateStr } from '../utils/dateUtils.js';
import { Storage } from '../utils/storage.js';
import { ServerStorage } from '../utils/serverStorage.js';

const PROFILE_KEY = 'yogaquest_profile';

/**
 * Хук для управления прогрессом
 * @param {Array} workouts - Массив тренировок
 * @param {object} tg - Telegram WebApp объект
 * @param {string|number} telegramId - ID пользователя Telegram
 * @returns {object} Состояние и методы прогресса
 */
export function useProgression(workouts, tg, telegramId) {
  // Состояние профиля
  const [profile, setProfile] = useState({
    totalXP: 0,
    unlockedAchievementIds: [],
    lastReturnBonusDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [useServerStorage, setUseServerStorage] = useState(false);
  
  // Ref для хранения экземпляра хранилища
  const storageRef = useRef(null);
  const serverStorageRef = useRef(null);
  
  // Ref для отслеживания начальной загрузки
  const isInitialMount = useRef(true);
  
  // Инициализация хранилища
  useEffect(() => {
    console.log('[useProgression] Initializing with tg:', !!tg, 'hasCloudStorage:', !!(tg && tg.CloudStorage), 'telegramId:', telegramId);
    const storage = new Storage(tg);
    storageRef.current = storage;
    
    // Инициализируем серверное хранилище
    if (telegramId) {
      serverStorageRef.current = new ServerStorage(telegramId);
    }
    
    async function loadProfile() {
      // Сначала пробуем загрузить из CloudStorage
      try {
        console.log('[useProgression] Loading profile from CloudStorage...');
        const data = await storage.getJSON(PROFILE_KEY);
        console.log('[useProgression] Loaded profile from CloudStorage:', data);
        if (data) {
          setProfile({
            totalXP: data.totalXP || 0,
            unlockedAchievementIds: data.unlockedAchievementIds || [],
            lastReturnBonusDate: data.lastReturnBonusDate || null,
          });
        }
      } catch (e) {
        console.error('[useProgression] Failed to load from CloudStorage:', e);
        
        // Если ошибка DATA_TOO_LONG, пробуем загрузить с сервера
        if (e.message?.includes('DATA_TOO_LONG') || e === 'DATA_TOO_LONG') {
          console.log('[useProgression] DATA_TOO_LONG error, trying server storage...');
          setUseServerStorage(true);
          
          if (serverStorageRef.current) {
            try {
              const serverData = await serverStorageRef.current.getProfile();
              console.log('[useProgression] Loaded profile from server:', serverData);
              if (serverData) {
                setProfile({
                  totalXP: serverData.totalXP || 0,
                  unlockedAchievementIds: serverData.unlockedAchievementIds || [],
                  lastReturnBonusDate: serverData.lastReturnBonusDate || null,
                });
              }
            } catch (serverError) {
              console.error('[useProgression] Failed to load from server:', serverError);
            }
          }
        }
      } finally {
        setIsLoading(false);
        isInitialMount.current = false;
      }
    }
    
    loadProfile();
  }, [tg, telegramId]);
  
  // Сохранение профиля при изменении (но не при первой загрузке)
  useEffect(() => {
    // Пропускаем первое сохранение после загрузки
    if (isInitialMount.current || isLoading || !storageRef.current) {
      return;
    }
    
    async function persistProfile() {
      setIsSaving(true);
      try {
        console.log('[useProgression] Saving profile:', profile);
        
        if (useServerStorage && serverStorageRef.current) {
          // Сохраняем на сервер
          console.log('[useProgression] Using server storage');
          const success = await serverStorageRef.current.saveProfile(profile);
          if (!success) {
            throw new Error('Server save failed');
          }
          console.log('[useProgression] Profile saved to server successfully');
        } else {
          // Пробуем сохранить в CloudStorage
          await storageRef.current.setJSON(PROFILE_KEY, profile);
          console.log('[useProgression] Profile saved to CloudStorage successfully');
        }
      } catch (e) {
        console.error('[useProgression] Failed to save profile:', e);
        
        // Если ошибка DATA_TOO_LONG, переключаемся на серверное хранилище
        if (e.message?.includes('DATA_TOO_LONG') || e === 'DATA_TOO_LONG') {
          console.log('[useProgression] DATA_TOO_LONG error, switching to server storage...');
          setUseServerStorage(true);
          
          if (serverStorageRef.current) {
            try {
              const success = await serverStorageRef.current.saveProfile(profile);
              if (success) {
                console.log('[useProgression] Profile saved to server successfully');
              }
            } catch (serverError) {
              console.error('[useProgression] Failed to save to server:', serverError);
            }
          }
        }
      } finally {
        setIsSaving(false);
      }
    }
    
    persistProfile();
  }, [profile, isLoading, useServerStorage]);
  
  // Вычисляемый прогресс
  const progression = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      return {
        totalXP: profile.totalXP,
        level: getLevelByXP(profile.totalXP),
        levelProgress: getLevelProgress(profile.totalXP),
        achievements: getAchievementsProgress({ workouts: [] }),
        garden: calculateGardenState([]),
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
    
    // Сад
    const garden = calculateGardenState(workouts, profile.unlockedAchievementIds);
    
    return {
      totalXP: profile.totalXP,
      level,
      levelProgress,
      achievements,
      garden,
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
    
    // Проверяем рост сада
    const previousPracticeCount = workouts.length;
    const newPracticeCount = previousPracticeCount + 1;
    const gardenStageUp = checkGardenStageUp(previousPracticeCount, newPracticeCount);
    
    const gardenGrowth = getGardenGrowthTexts({
      stageUp: gardenStageUp,
      newObjects: [],
      objectUpgrades: [],
    });
    
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
      gardenGrowth,
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
      await storageRef.current.setJSON(PROFILE_KEY, {
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