/**
 * Achievements — компонент достижений
 * Полноценный экран прогресса с 20 достижениями
 */
import { memo, useMemo } from 'react';
import { HeartBar } from '../ui/PixelHearts.jsx';
import { PixelBtn } from '../ui/PixelBtn.jsx';
import { 
  ACHIEVEMENT_LIST, 
  getCategoriesWithLabels, 
  getRaritiesWithLabels,
  ACHIEVEMENT_CATEGORIES 
} from '../../achievements/achievementList.js';
import { 
  getAllAchievementsWithProgress,
  getAchievementsProgress 
} from '../../achievements/checkAchievements.js';

/**
 * Карточка одного достижения
 */
const AchievementCard = memo(function AchievementCard({ achievement, showProgress = true }) {
  const { isUnlocked, progress, icon, title, description, rarity, xpReward } = achievement;
  const rarities = getRaritiesWithLabels();
  const rarityInfo = rarities[rarity] || rarities.common;
  
  // Вычисляем процент прогресса
  const progressPercent = progress 
    ? Math.min(100, Math.round((progress.current / progress.target) * 100))
    : 0;
  
  return (
    <div
      style={{
        border: `3px solid ${isUnlocked ? rarityInfo.color : "#e8d5ff"}`,
        background: isUnlocked ? "#fff0f5" : "#f5e6ff",
        boxShadow: isUnlocked ? `3px 3px 0 ${rarityInfo.color}` : "2px 2px 0 #c9b8ff",
        padding: "10px 8px",
        textAlign: "center",
        opacity: isUnlocked ? 1 : 0.6,
        filter: isUnlocked ? "none" : "grayscale(0.5)",
        transition: "all 0.3s ease",
        position: "relative",
      }}
    >
      {/* Иконка */}
      <span style={{ 
        fontSize: 24, 
        display: "block", 
        marginBottom: 4,
        filter: isUnlocked ? "none" : "grayscale(1)",
      }}>
        {icon}
      </span>
      
      {/* Название */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 6,
          color: "#5c2d91",
          lineHeight: 1.4,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      
      {/* Описание */}
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 5,
          color: "#c084fc",
          lineHeight: 1.4,
          marginBottom: 4,
        }}
      >
        {description}
      </div>
      
      {/* Редкость и XP */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 5,
            color: rarityInfo.color,
            textShadow: isUnlocked ? `1px 1px 0 rgba(0,0,0,0.2)` : "none",
          }}
        >
          {rarityInfo.label}
        </span>
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 5,
            color: "#ffd700",
          }}
        >
          +{xpReward} XP
        </span>
      </div>
      
      {/* Прогресс (только для неразблокированных) */}
      {showProgress && !isUnlocked && progress && (
        <div style={{ marginTop: 6 }}>
          <div
            style={{
              height: 4,
              background: "#e8d5ff",
              borderRadius: 2,
              overflow: "hidden",
              marginBottom: 2,
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "repeating-linear-gradient(90deg, #c9b8ff 0, #c9b8ff 2px, #e8d5ff 2px, #e8d5ff 4px)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 5,
              color: "#9b72cf",
            }}
          >
            {progress.current} / {progress.target} {progress.unit}
          </div>
        </div>
      )}
      
      {/* Статус разблокировки */}
      {isUnlocked && (
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 5,
            color: "#ff8fab",
            marginTop: 4,
          }}
        >
          ♥ ПОЛУЧЕНО!
        </div>
      )}
    </div>
  );
});

/**
 * Секция достижений по категории
 */
const AchievementCategory = memo(function AchievementCategory({ 
  category, 
  achievements, 
  categoryInfo 
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      {/* Заголовок категории */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
          padding: "6px 8px",
          background: "#f5e6ff",
          border: "2px solid #c9b8ff",
          boxShadow: "2px 2px 0 #9b72cf",
        }}
      >
        <span style={{ fontSize: 14 }}>{categoryInfo.icon}</span>
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7,
            color: "#5c2d91",
          }}
        >
          {categoryInfo.label}
        </span>
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
            color: "#9b72cf",
            marginLeft: "auto",
          }}
        >
          {achievements.filter(a => a.isUnlocked).length}/{achievements.length}
        </span>
      </div>
      
      {/* Сетка достижений */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {achievements.map((achievement) => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement} 
          />
        ))}
      </div>
    </div>
  );
});

/**
 * Achievements — отображение достижений
 * @param {object} props - Свойства компонента
 * @param {Array} props.workouts - Массив тренировок
 * @param {object} props.level - Текущий уровень
 * @param {Function} props.onExport - Callback для экспорта данных
 * @param {object} props.progression - Объект прогресса
 */
const Achievements = memo(function Achievements({ workouts, level, onExport, progression }) {
  // Получаем достижения с прогрессом
  const achievementsWithProgress = useMemo(() => {
    return getAllAchievementsWithProgress({ workouts });
  }, [workouts]);
  
  // Получаем общий прогресс
  const progressInfo = useMemo(() => {
    return getAchievementsProgress({ workouts });
  }, [workouts]);
  
  // Группируем по категориям
  const achievementsByCategory = useMemo(() => {
    const categories = getCategoriesWithLabels();
    const grouped = {};
    
    // Инициализируем все категории
    Object.keys(categories).forEach(cat => {
      grouped[cat] = [];
    });
    
    // Распределяем достижения
    achievementsWithProgress.forEach(achievement => {
      if (grouped[achievement.category]) {
        grouped[achievement.category].push(achievement);
      }
    });
    
    return grouped;
  }, [achievementsWithProgress]);
  
  const categories = getCategoriesWithLabels();
  const progress = progressInfo.unlockedCount;
  const total = progressInfo.total;

  return (
    <>
      {/* Общая статистика достижений */}
      <div
        className="pwin pwin-yellow"
        style={{
          background: "#fff9c4",
          border: "3px solid #b8860b",
          boxShadow: "4px 4px 0 #b8860b",
          marginBottom: 14,
        }}
      >
        <div
          className="pwin-title"
          style={{
            background: "linear-gradient(90deg, #ffd166, #ffe599)",
            padding: "5px 8px",
            borderBottom: "2px solid #b8860b",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "7px",
              color: "#3d2800",
              textShadow: "1px 1px 0 #ffe599",
              flex: 1,
            }}
          >
            🏆 ДОСТИЖЕНИЯ
          </span>
          <div
            className="win-btn"
            style={{
              width: 14,
              height: 14,
              background: "#fff9c4",
              border: "2px solid #b8860b",
              fontSize: 7,
              color: "#7a5900",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            ✕
          </div>
        </div>

        <div style={{ padding: 12, textAlign: "center" }}>
          <div style={{ fontSize: 36, display: "block", marginBottom: 8 }}>🏅</div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 10,
              color: "#7a5900",
              textShadow: "1px 1px 0 #ffe599",
              marginBottom: 8,
            }}
          >
            {progress} / {total}
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#b8860b",
              marginBottom: 10,
            }}
          >
            ОТКРЫТО
          </div>
          <HeartBar value={progress} max={total} />
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 6,
              color: "#b8860b",
              marginTop: 8,
            }}
          >
            {progressInfo.progressPercent}% ЗАВЕРШЕНО
          </div>
        </div>
      </div>

      {/* Ближайшие достижения */}
      {progressInfo.remaining > 0 && (
        <div
          className="pwin"
          style={{
            marginBottom: 14,
            background: "#f5e6ff",
            border: "2px solid #c9b8ff",
            boxShadow: "2px 2px 0 #9b72cf",
          }}
        >
          <div
            className="pwin-title"
            style={{
              background: "#e8d5ff",
              padding: "5px 8px",
              borderBottom: "2px solid #c9b8ff",
            }}
          >
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 6,
                color: "#5c2d91",
              }}
            >
              🎯 БЛИЖАЙШИЕ ЦЕЛИ
            </span>
          </div>
          <div style={{ padding: 8 }}>
            {achievementsWithProgress
              .filter(a => !a.isUnlocked)
              .slice(0, 3)
              .map((achievement) => (
                <div
                  key={achievement.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 0",
                    borderBottom: "1px dashed #e8d5ff",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{achievement.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: 6,
                        color: "#5c2d91",
                      }}
                    >
                      {achievement.title}
                    </div>
                    {achievement.progress && (
                      <div
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: 5,
                          color: "#9b72cf",
                          marginTop: 2,
                        }}
                      >
                        {achievement.progress.current} / {achievement.progress.target} {achievement.progress.unit}
                      </div>
                    )}
                  </div>
                  {achievement.progress && (
                    <div
                      style={{
                        width: 40,
                        height: 6,
                        background: "#e8d5ff",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (achievement.progress.current / achievement.progress.target) * 100)}%`,
                          height: "100%",
                          background: "#c9b8ff",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Достижения по категориям */}
      {Object.entries(achievementsByCategory).map(([category, achievements]) => {
        if (achievements.length === 0) return null;
        const categoryInfo = categories[category];
        
        return (
          <AchievementCategory
            key={category}
            category={category}
            achievements={achievements}
            categoryInfo={categoryInfo}
          />
        );
      })}

      {/* Export button */}
      <PixelBtn
        variant="ghost"
        style={{ width: "100%", padding: "12px", fontSize: "7px", marginTop: 8 }}
        onClick={onExport}
      >
        💾 ЭКСПОРТ ДАННЫХ
      </PixelBtn>
    </>
  );
});

export { Achievements };
