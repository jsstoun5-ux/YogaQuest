/**
 * Calendar — календарь тренировок
 */
import { memo, useMemo, useState } from 'react';
import { PixelBtn } from '../ui/PixelBtn.jsx';
import { MONTH_NAMES, WEEKDAY_NAMES_SHORT } from '../../constants/index.js';
import { getCalendarDays, getMonthStr, parseMonthStr, getLocalDateStr } from '../../utils/dateUtils.js';

/**
 * Calendar — календарь тренировок
 * @param {object} props - Свойства компонента
 * @param {Array} props.workouts - Массив тренировок
 * @param {Function} props.onHaptic - Callback для вибрации
 */
const Calendar = memo(function Calendar({ workouts, onHaptic }) {
  const [activeMonth, setActiveMonth] = useState(() => getMonthStr());

  // Даты с тренировками
  const workoutDates = useMemo(() => {
    return new Set(workouts.map(w => w.date));
  }, [workouts]);

  // Разбор текущего месяца
  const { year, month } = parseMonthStr(activeMonth);

  // Дни календаря
  const calDays = useMemo(() => {
    return getCalendarDays(year, month);
  }, [year, month]);

  // Сегодняшняя дата
  const todayStr = getLocalDateStr();

  // Количество тренировок в месяце
  const monthWorkouts = useMemo(() => {
    return workouts.filter(w => w.date.startsWith(activeMonth)).length;
  }, [workouts, activeMonth]);

  /**
   * Переход к предыдущему месяцу
   */
  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setActiveMonth(getMonthStr(d));
    onHaptic?.('light');
  };

  /**
   * Переход к следующему месяцу
   */
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setActiveMonth(getMonthStr(d));
    onHaptic?.('light');
  };

  return (
    <div
      className="pwin"
      style={{
        background: "#f5e6ff",
        border: "3px solid #9b72cf",
        boxShadow: "4px 4px 0 #7c4dab",
        marginBottom: 14,
      }}
    >
      {/* Header */}
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
          КАЛЕНДАРЬ.EXE
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: 12 }}>
        {/* Month navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <PixelBtn variant="ghost" style={{ padding: "5px 10px", fontSize: "10px" }} onClick={prevMonth}>
            {"<"}
          </PixelBtn>
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "8px",
              color: "#5c2d91",
            }}
          >
            {MONTH_NAMES[month - 1].toUpperCase()} {year}
          </span>
          <PixelBtn variant="ghost" style={{ padding: "5px 10px", fontSize: "10px" }} onClick={nextMonth}>
            {">"}
          </PixelBtn>
        </div>

        {/* Weekday headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
            marginBottom: 4,
          }}
        >
          {WEEKDAY_NAMES_SHORT.map((d) => (
            <div
              key={d}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 6,
                color: "#9b72cf",
                textAlign: "center",
                padding: "4px 0",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
          }}
        >
          {calDays.map((day, i) => {
            if (day === null) {
              return <div key={i} style={{ aspectRatio: 1 }} />;
            }

            const ds = `${activeMonth}-${String(day).padStart(2, "0")}`;
            const hasWorkout = workoutDates.has(ds);
            const isToday = ds === todayStr;

            return (
              <div
                key={i}
                style={{
                  aspectRatio: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 6,
                  color: hasWorkout ? "white" : isToday ? "#b8860b" : "#c9b8ff",
                  border: `1px solid ${hasWorkout ? "#c9607a" : isToday ? "#ffd166" : "transparent"}`,
                  background: hasWorkout ? "#ff8fab" : "transparent",
                  boxShadow: hasWorkout ? "1px 1px 0 #c9607a" : "none",
                }}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Month stats */}
        <div
          style={{
            marginTop: 8,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "6px",
            color: "#9b72cf",
            textAlign: "center",
          }}
        >
          {monthWorkouts} ТРЕНИРОВОК
        </div>
      </div>
    </div>
  );
});

export { Calendar };