/**
 * LevelCard — карточка уровня пользователя
 */
import { memo } from 'react';
import { HeartBar } from '../ui/PixelHearts.jsx';
import { getLevelProgress } from '../../constants/levels.js';

/**
 * LevelCard — карточка уровня
 * @param {object} props - Свойства компонента
 * @param {number} props.workoutCount - Количество тренировок
 */
const LevelCard = memo(function LevelCard({ workoutCount }) {
  const { currentLevel, nextLevel, remaining, isMaxLevel } = getLevelProgress(workoutCount);

  return (
    <div
      className="pwin pwin-yellow"
      style={{
        background: "#fff9c4",
        border: "3px solid #b8860b",
        boxShadow: "4px 4px 0 #b8860b",
        marginBottom: 14,
      }}
    >
      {/* Header */}
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
          УРОВЕНЬ.EXE
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
          —
        </div>
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

      {/* Body */}
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>{currentLevel.icon}</span>
          <div>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "9px",
                color: "#7a5900",
                textShadow: "1px 1px 0 #ffe599",
              }}
            >
              {currentLevel.label}
            </div>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "6px",
                color: "#b8860b",
                marginTop: 4,
              }}
            >
              {isMaxLevel ? "МАКСИМАЛЬНЫЙ УРОВЕНЬ!" : `ЕЩЁ ${remaining} ДО СЛЕД.`}
            </div>
          </div>
        </div>
        <HeartBar value={workoutCount} max={isMaxLevel ? workoutCount : (nextLevel?.minWorkouts || 60)} />
      </div>
    </div>
  );
});

export { LevelCard };