/**
 * RewardModal Component for YogaQuest
 * Модальное окно награды после сохранения практики
 */
import { useEffect, useState } from 'react';
import { getXPBreakdownTexts, formatXP } from '../../game/xpSystem.js';
import { getLevelFullText } from '../../game/levelSystem.js';
import './RewardModal.css';

/**
 * Анимированная строка с XP
 */
function XPLine({ label, value, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div className={`reward-xp-line ${visible ? 'reward-xp-line--visible' : ''}`}>
      <span className="reward-xp-label">{label}</span>
      <span className="reward-xp-value">{formatXP(value)}</span>
    </div>
  );
}

/**
 * Элемент достижения
 */
function AchievementItem({ achievement, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div className={`reward-achievement ${visible ? 'reward-achievement--visible' : ''}`}>
      <span className="reward-achievement-icon">{achievement.icon}</span>
      <div className="reward-achievement-info">
        <div className="reward-achievement-title">{achievement.title}</div>
        <div className="reward-achievement-desc">{achievement.description}</div>
      </div>
    </div>
  );
}

/**
 * Модальное окно награды
 */
export default function RewardModal({
  isOpen,
  onClose,
  xpResult,
  levelUp,
  newAchievements
}) {
  const [phase, setPhase] = useState(0);
  
  // Фазы анимации
  useEffect(() => {
    if (isOpen) {
      setPhase(0);
      
      // Показываем XP
      const xpTimer = setTimeout(() => setPhase(1), 300);
      
      // Показываем уровень (если есть)
      const levelTimer = setTimeout(() => setPhase(2), 800);
      
      // Показываем достижения (если есть)
      const achieveTimer = setTimeout(() => setPhase(3), 1300);
      
      return () => {
        clearTimeout(xpTimer);
        clearTimeout(levelTimer);
        clearTimeout(achieveTimer);
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const totalXP = xpResult?.totalXP || 0;
  const xpBreakdown = xpResult ? getXPBreakdownTexts(xpResult) : [];
  
  return (
    <div className="reward-overlay" onClick={onClose}>
      <div className="reward-modal" onClick={e => e.stopPropagation()}>
        {/* Заголовок */}
        <div className="reward-header">
          <span className="reward-header-icon">✨</span>
          <span className="reward-header-text">Практика завершена</span>
        </div>
        
        {/* XP */}
        {phase >= 1 && (
          <div className="reward-section">
            <div className="reward-total-xp">
              <span className="reward-total-value">{formatXP(totalXP)}</span>
            </div>
            
            {xpBreakdown.length > 0 && (
              <div className="reward-xp-breakdown">
                {xpBreakdown.map((text, i) => (
                  <div key={i} className="reward-xp-text">{text}</div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Повышение уровня */}
        {phase >= 2 && levelUp && (
          <div className="reward-section reward-section--level">
            <div className="reward-level-badge">
              <span className="reward-level-icon">{levelUp.newLevel.icon}</span>
            </div>
            <div className="reward-level-info">
              <div className="reward-level-title">Новый уровень!</div>
              <div className="reward-level-name">{levelUp.newLevel.title}</div>
              <div className="reward-level-subtitle">{levelUp.newLevel.subtitle}</div>
            </div>
          </div>
        )}
        
        {/* Достижения */}
        {phase >= 3 && newAchievements && newAchievements.length > 0 && (
          <div className="reward-section">
            <div className="reward-section-title">🏆 Достижения</div>
            {newAchievements.map((achievement, i) => (
              <AchievementItem 
                key={achievement.id} 
                achievement={achievement} 
                delay={i * 200}
              />
            ))}
          </div>
        )}
        
        {/* Кнопка закрытия */}
        <button className="reward-close" onClick={onClose}>
          Продолжить
        </button>
        
        {/* Подсказка */}
        <div className="reward-hint">
          Нажми в любом месте чтобы закрыть
        </div>
      </div>
    </div>
  );
}

/**
 * Компактный тост для быстрой награды
 */
export function RewardToast({ xp, onClose }) {
  useEffect(() => {
    if (xp) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [xp, onClose]);
  
  if (!xp) return null;
  
  return (
    <div className="reward-toast" onClick={onClose}>
      <span className="reward-toast-xp">{formatXP(xp)}</span>
    </div>
  );
}