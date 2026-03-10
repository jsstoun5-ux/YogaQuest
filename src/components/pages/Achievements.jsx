/**
 * Achievements — компонент достижений
 */
import { memo, useMemo } from 'react';
import { HeartBar } from '../ui/PixelHearts.jsx';
import { PixelBtn } from '../ui/PixelBtn.jsx';
import { ACHIEVEMENTS } from '../../constants/index.js';

/**
 * Achievements — отображение достижений
 * @param {object} props - Свойства компонента
 * @param {Array} props.workouts - Массив тренировок
 * @param {object} props.level - Текущий уровень
 * @param {Function} props.onExport - Callback для экспорта данных
 */
const Achievements = memo(function Achievements({ workouts, level, onExport }) {
  // Разблокированные достижения
  const unlockedAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(a => a.check(workouts));
  }, [workouts]);

  const progress = unlockedAchievements.length;
  const total = ACHIEVEMENTS.length;

  return (
    <>
      {/* Player level card */}
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
            УРОВЕНЬ ИГРОКА
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
          <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>{level.icon}</span>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 10,
              color: "#7a5900",
              textShadow: "1px 1px 0 #ffe599",
              marginBottom: 8,
            }}
          >
            {level.label}
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#b8860b",
              marginBottom: 10,
            }}
          >
            {progress}/{total} АЧИВОК
          </div>
          <HeartBar value={progress} max={total} />
        </div>
      </div>

      {/* Achievements grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {ACHIEVEMENTS.map((a) => {
          const done = a.check(workouts);
          return (
            <div
              key={a.id}
              style={{
                border: `3px solid ${done ? "#ff8fab" : "#e8d5ff"}`,
                background: done ? "#fff0f5" : "#f5e6ff",
                boxShadow: done ? "3px 3px 0 #c9607a" : "2px 2px 0 #c9b8ff",
                padding: "12px 8px",
                textAlign: "center",
                opacity: done ? 1 : 0.4,
                filter: done ? "none" : "grayscale(0.8)",
                animation: done ? "glow 2s ease-in-out infinite" : "none",
              }}
            >
              <span style={{ fontSize: 28, display: "block", marginBottom: 5 }}>{a.icon}</span>
              <div
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 6,
                  color: "#5c2d91",
                  lineHeight: 1.5,
                }}
              >
                {a.label}
              </div>
              <div
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 5,
                  color: "#c084fc",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                {a.desc}
              </div>
              {done && (
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
        })}
      </div>

      {/* Export button */}
      <PixelBtn
        variant="ghost"
        style={{ width: "100%", padding: "12px", fontSize: "7px" }}
        onClick={onExport}
      >
        💾 ЭКСПОРТ ДАННЫХ
      </PixelBtn>
    </>
  );
});

export { Achievements };