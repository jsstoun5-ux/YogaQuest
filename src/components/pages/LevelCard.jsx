/**
 * LevelCard Component for YogaQuest
 * Карточка уровня с XP прогрессом
 */
import { useMemo } from 'react';
import { getLevelProgress, getLevelByXP } from '../../game/levelSystem.js';
import './LevelCard.css';

/**
 * Карточка уровня
 */
export default function LevelCard({ totalXP = 0, workouts = [] }) {
  // Вычисляем прогресс уровня
  const levelData = useMemo(() => {
    // Если передан totalXP, используем его
    if (totalXP > 0) {
      return getLevelProgress(totalXP);
    }
    // Иначе вычисляем из количества тренировок (старый способ для совместимости)
    const workoutCount = workouts.length;
    // Примерная конвертация: 1 практика = ~15 XP в среднем
    const estimatedXP = workoutCount * 15;
    return getLevelProgress(estimatedXP);
  }, [totalXP, workouts]);
  
  const { currentLevel, nextLevel, progressPercent, xpToNextLevel, isMaxLevel } = levelData;
  
  return (
    <div className="level-card">
      {/* Иконка и название уровня */}
      <div className="level-card-header">
        <span className="level-card-icon">{currentLevel.icon}</span>
        <div className="level-card-info">
          <div className="level-card-number">Уровень {currentLevel.level}</div>
          <div className="level-card-title">{currentLevel.title}</div>
        </div>
      </div>
      
      {/* Подпись уровня */}
      <div className="level-card-subtitle">{currentLevel.subtitle}</div>
      
      {/* Прогресс бар */}
      {!isMaxLevel && (
        <div className="level-card-progress">
          <div className="level-card-progress-bar">
            <div 
              className="level-card-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="level-card-progress-text">
            {xpToNextLevel} XP до {nextLevel?.title}
          </div>
        </div>
      )}
      
      {/* Максимальный уровень */}
      {isMaxLevel && (
        <div className="level-card-max">
          ✨ Максимальный уровень ✨
        </div>
      )}
    </div>
  );
}

/**
 * Компактная версия карточки уровня
 */
export function LevelCardCompact({ totalXP = 0 }) {
  const levelData = useMemo(() => {
    return getLevelProgress(totalXP);
  }, [totalXP]);
  
  const { currentLevel, progressPercent, isMaxLevel } = levelData;
  
  return (
    <div className="level-card-compact">
      <span className="level-card-compact-icon">{currentLevel.icon}</span>
      <div className="level-card-compact-info">
        <div className="level-card-compact-level">{currentLevel.level}</div>
        <div className="level-card-compact-title">{currentLevel.title}</div>
      </div>
      {!isMaxLevel && (
        <div className="level-card-compact-bar">
          <div 
            className="level-card-compact-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}