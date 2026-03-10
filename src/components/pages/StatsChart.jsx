/**
 * StatsChart — графики и статистика
 */
import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOODS } from '../../constants/index.js';
import { getWeekStats, getMoodTrendData } from '../../utils/dateUtils.js';

/**
 * StatsChart — компонент графиков
 * @param {object} props - Свойства компонента
 * @param {Array} props.workouts - Массив тренировок
 * @param {object} props.stats - Статистика тренировок
 */
const StatsChart = memo(function StatsChart({ workouts, stats }) {
  // Данные для графика недели
  const weekData = useMemo(() => getWeekStats(workouts), [workouts]);

  // Данные для графика настроения
  const moodData = useMemo(() => getMoodTrendData(workouts), [workouts]);

  return (
    <>
      {/* Week activity chart */}
      <div
        className="pwin"
        style={{
          background: "#f5e6ff",
          border: "3px solid #9b72cf",
          boxShadow: "4px 4px 0 #7c4dab",
          marginBottom: 14,
        }}
      >
        <div
          className="pwin-title"
          style={{
            background: "linear-gradient(90deg, #9b72cf, #c084fc)",
            padding: "5px 8px",
            borderBottom: "2px solid #9b72cf",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "7px",
              color: "white",
              textShadow: "1px 1px 0 #5c2d91",
              flex: 1,
            }}
          >
            АКТИВНОСТЬ НЕДЕЛЯ
          </span>
          <div
            className="win-btn"
            style={{
              width: 14,
              height: 14,
              background: "#e8d5ff",
              border: "2px solid #9b72cf",
              fontSize: 7,
              color: "#5c2d91",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            —
          </div>
        </div>

        <div style={{ padding: 12 }}>
          {workouts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px 20px",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                color: "#c9b8ff",
                lineHeight: 2,
              }}
            >
              <div>🌱</div>
              <div>НЕТ ДАННЫХ</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={weekData}>
                <XAxis
                  dataKey="day"
                  tick={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 7,
                    fill: "#c084fc",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "#fff0f5",
                    border: "2px solid #ff8fab",
                    borderRadius: 0,
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 9,
                    color: "#c9607a",
                    boxShadow: "3px 3px 0 #c9607a",
                  }}
                  formatter={(value) => [`${value} мин`, "Практика"]}
                />
                <Line
                  type="stepAfter"
                  dataKey="minutes"
                  stroke="#ff8fab"
                  strokeWidth={2}
                  dot={{
                    fill: "#ff8fab",
                    r: 4,
                    stroke: "#c9607a",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Mood trend chart */}
      {moodData.length > 1 && (
        <div
          className="pwin"
          style={{
            background: "#f5e6ff",
            border: "3px solid #9b72cf",
            boxShadow: "4px 4px 0 #7c4dab",
            marginBottom: 14,
          }}
        >
          <div
            className="pwin-title"
            style={{
              background: "linear-gradient(90deg, #9b72cf, #c084fc)",
              padding: "5px 8px",
              borderBottom: "2px solid #9b72cf",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "7px",
                color: "white",
                textShadow: "1px 1px 0 #5c2d91",
                flex: 1,
              }}
            >
              НАСТРОЕНИЕ ДО/ПОСЛЕ
            </span>
          </div>

          <div style={{ padding: 12 }}>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={moodData}>
                <XAxis dataKey="i" hide />
                <YAxis domain={[1, 5]} hide />
                <Tooltip
                  contentStyle={{
                    background: "#fff0f5",
                    border: "2px solid #c9b8ff",
                    borderRadius: 0,
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 8,
                    color: "#9b72cf",
                    boxShadow: "2px 2px 0 #9b72cf",
                  }}
                  formatter={(v, name) => {
                    const mood = MOODS[v - 1];
                    return [`${mood?.pixel ?? ""} ${mood?.label ?? ""}`, name === "before" ? "ДО" : "ПОСЛЕ"];
                  }}
                />
                <Line
                  type="stepAfter"
                  dataKey="before"
                  stroke="#c9b8ff"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                />
                <Line
                  type="stepAfter"
                  dataKey="after"
                  stroke="#ff8fab"
                  strokeWidth={2}
                  dot={{
                    fill: "#ff8fab",
                    r: 3,
                    stroke: "#c9607a",
                    strokeWidth: 1,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 4 }}>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#c9b8ff" }}>
                -- ДО
              </span>
              <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#ff8fab" }}>
                — ПОСЛЕ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <StatBlock value={stats.avgDuration} label="СРЕДНЕЕ МИН" />
        <StatBlock value={stats.maxDuration} label="РЕКОРД МИН" />
        <StatBlock value={stats.totalHours} label="ВСЕГО ЧАСОВ" />
      </div>
    </>
  );
});

/**
 * StatBlock — блок статистики
 */
const StatBlock = memo(function StatBlock({ value, label }) {
  return (
    <div
      style={{
        background: "#fff0f5",
        border: "2px solid #ffb3c6",
        boxShadow: "2px 2px 0 #c9607a",
        padding: "10px 6px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 18,
          color: "#c9607a",
          lineHeight: 1,
          textShadow: "2px 2px 0 #ffb3c6",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 6,
          color: "#9b72cf",
          marginTop: 5,
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>
    </div>
  );
});

export { StatsChart };