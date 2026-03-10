import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTelegram } from "./useTelegram.js";

const STORAGE_KEY = "yogaquest_v1";
const ONBOARD_KEY = "yogaquest_onboard";

const ONBOARD_STEPS = [
  { icon: "🌸", title: "YOGAQUEST.EXE", sub: "загрузка...", text: "Твой личный дневник практики. Отслеживай тренировки, настроение и рост." },
  { icon: "📊", title: "ПРОГРЕСС.EXE", sub: "анализ данных", text: "Каждая практика откладывается на графике. Наблюдай, как меняется настроение." },
  { icon: "🏆", title: "АЧИВКИ.EXE", sub: "разблокировка", text: "За регулярность и разнообразие практик — получай значки и повышай уровень!" },
  { icon: "✨", title: "ГОТОВО!", sub: "запуск...", text: "Нажми ➕ внизу экрана, чтобы записать первую тренировку." },
];

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
  const today = new Date();
  const diff = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()) - new Date(y, m-1, d)) / 86400000);
  if (diff === 0) return "сегодня";
  if (diff === 1) return "вчера";
  if (diff === 2) return "позавчера";
  return `${d} ${months[m-1]}`;
}

const PRACTICE_TYPES = [
  { id: "power",    label: "СИЛОВАЯ",          icon: "💪", color: "#ff8fab", desc: "укрепляем тело" },
  { id: "soft",     label: "МЯГКАЯ",           icon: "🌸", color: "#c9b8ff", desc: "нежная практика" },
  { id: "restore",  label: "ВОССТАНОВИТ.",     icon: "✨", color: "#a8edea", desc: "для восстановления" },
  { id: "meditate", label: "МЕДИТАТИВНАЯ",     icon: "🧘", color: "#ffd6a5", desc: "для ума и духа" },
  { id: "integrate", label: "ИНТЕГРАЦИОННАЯ", icon: "🌀", color: "#b5ead7", desc: "всё вместе" },
  { id: "stretch",  label: "РАСТЯЖКА",         icon: "🤸", color: "#ffb7c5", desc: "гибкость" },
  { id: "other",    label: "ДРУГОЕ",           icon: "⭐", color: "#e8d5ff", desc: "своя практика" },
];

const MOODS = [
  { id: 1, pixel: "😔", label: "ПЛОХО" },
  { id: 2, pixel: "😕", label: "ТАК СЕБ" },
  { id: 3, pixel: "😊", label: "ХОРОШО" },
  { id: 4, pixel: "😄", label: "ОТЛИЧНО" },
  { id: 5, pixel: "🌟", label: "КАЙФ!!" },
];

const DURATION_PRESETS = [15, 30, 45, 60, 90];

const ACHIEVEMENTS = [
  { id: "first",   icon: "🌱", label: "ПЕРВЫЙ ШАГ",   desc: "1 тренировка",     check: ws => ws.length >= 1 },
  { id: "week",    icon: "🌙", label: "НЕДЕЛЬКА",      desc: "7 тренировок",     check: ws => ws.length >= 7 },
  { id: "month",   icon: "🌟", label: "МЕСЯЦ СИЛЫ",   desc: "30 тренировок",    check: ws => ws.length >= 30 },
  { id: "streak7", icon: "🔥", label: "7 ДНЕЙ ОГОНЬ", desc: "7 дней подряд",    check: ws => calcStreak(ws) >= 7 },
  { id: "hour",    icon: "⏰", label: "ЧАС НА КОВРИК",desc: "60+ минут",        check: ws => ws.some(w => w.duration >= 60) },
  { id: "allTypes",icon: "💎", label: "МАСТЕР",        desc: "все 6 типов",      check: ws => new Set(ws.map(w => w.type)).size >= 6 },
  { id: "mood5",   icon: "💖", label: "НА КАЙФЕ",     desc: "настрой 5 после",  check: ws => ws.some(w => w.moodAfter === 5) },
  { id: "total60", icon: "👑", label: "КОРОЛЕВА",      desc: "60 тренировок",    check: ws => ws.length >= 60 },
];

function calcStreak(workouts) {
  if (!workouts.length) return 0;
  const dates = [...new Set(workouts.map(w => w.date))].sort().reverse();
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i-1]) - new Date(dates[i])) / 86400000;
    if (diff === 1) streak++; else break;
  }
  const lastDate = new Date(dates[0]); lastDate.setHours(0,0,0,0);
  const today = new Date(); today.setHours(0,0,0,0);
  if ((today - lastDate) / 86400000 > 1) return 0;
  return streak;
}

function getLevel(count) {
  if (count >= 60) return { label: "БОГИНЯ ЙОГИ", icon: "👑", hearts: 5 };
  if (count >= 30) return { label: "ПРОДВИНУТАЯ", icon: "💎", hearts: 4 };
  if (count >= 10) return { label: "ПРАКТИКУЮЩАЯ",icon: "🌸", hearts: 3 };
  if (count >= 1)  return { label: "НАЧИНАЮЩАЯ",  icon: "🌱", hearts: 2 };
  return { label: "НОВИЧОК", icon: "✨", hearts: 1 };
}

// Pixel heart SVG as CSS background
const HEART_FULL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Crect x='1' y='3' width='3' height='1' fill='%23ff8fab'/%3E%3Crect x='6' y='3' width='3' height='1' fill='%23ff8fab'/%3E%3Crect x='0' y='4' width='4' height='3' fill='%23ff8fab'/%3E%3Crect x='6' y='4' width='4' height='3' fill='%23ff8fab'/%3E%3Crect x='1' y='7' width='8' height='1' fill='%23ff8fab'/%3E%3Crect x='2' y='8' width='6' height='1' fill='%23ff8fab'/%3E%3Crect x='3' y='9' width='4' height='1' fill='%23ff8fab'/%3E%3Crect x='4' y='2' width='2' height='1' fill='%23ff8fab'/%3E%3Crect x='1' y='3' width='2' height='1' fill='%23ffb3c6'/%3E%3C/svg%3E")`;

const HEART_EMPTY = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Crect x='1' y='3' width='3' height='1' fill='%23e8d5ff'/%3E%3Crect x='6' y='3' width='3' height='1' fill='%23e8d5ff'/%3E%3Crect x='0' y='4' width='4' height='3' fill='%23e8d5ff'/%3E%3Crect x='6' y='4' width='4' height='3' fill='%23e8d5ff'/%3E%3Crect x='1' y='7' width='8' height='1' fill='%23e8d5ff'/%3E%3Crect x='2' y='8' width='6' height='1' fill='%23e8d5ff'/%3E%3Crect x='3' y='9' width='4' height='1' fill='%23e8d5ff'/%3E%3Crect x='4' y='2' width='2' height='1' fill='%23e8d5ff'/%3E%3C/svg%3E")`;

function PixelHearts({ filled, total = 5 }) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 18, height: 18,
          backgroundImage: i < filled ? HEART_FULL : HEART_EMPTY,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }} />
      ))}
    </div>
  );
}


function PixelBtn({ children, onClick, style = {}, variant = "primary", disabled = false }) {
  const base = {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    padding: "10px 14px",
    letterSpacing: 1,
    transition: "transform 0.1s",
    imageRendering: "pixelated",
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: {
      background: "linear-gradient(180deg, #ffb3c6 0%, #ff8fab 100%)",
      color: "#7c1d36",
      boxShadow: "3px 3px 0 #c9607a, inset 1px 1px 0 #ffd6e0",
      border: "2px solid #c9607a",
    },
    purple: {
      background: "linear-gradient(180deg, #d8b8ff 0%, #b98ef0 100%)",
      color: "#3d1060",
      boxShadow: "3px 3px 0 #7c4dab, inset 1px 1px 0 #ede0ff",
      border: "2px solid #7c4dab",
    },
    ghost: {
      background: "#f5e6ff",
      color: "#9b72cf",
      boxShadow: "2px 2px 0 #9b72cf",
      border: "2px solid #9b72cf",
    },
    danger: {
      background: "linear-gradient(180deg, #ffb3c6 0%, #ff6b8a 100%)",
      color: "#7c1d36",
      boxShadow: "3px 3px 0 #c9607a",
      border: "2px solid #c9607a",
    },
  };
  return (
    <button onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = "1px 1px 0 " + (variant === "primary" || variant === "danger" ? "#c9607a" : "#7c4dab"); }}
      onMouseUp={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = variants[variant].boxShadow; }}>
      {children}
    </button>
  );
}

// Pixel progress bar (hearts)
function HeartBar({ value, max, width = "100%" }) {
  const total = 10;
  const filled = max > 0 ? Math.round((value / max) * total) : 0;
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", width }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 14, height: 14,
          backgroundImage: i < filled ? HEART_FULL : HEART_EMPTY,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }} />
      ))}
    </div>
  );
}


// Возвращает дату в локальном часовом поясе (YYYY-MM-DD), а не UTC
function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function YogaQuest() {
  const { isTelegram, user, haptic, storage } = useTelegram();

  const [workouts, setWorkouts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [screen, setScreen] = useState("home");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [form, setForm] = useState({ date: getLocalDateStr(), type: "", duration: 30, moodBefore: 3, moodAfter: 3, note: "" });
  const [saved, setSaved] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [exportMsg, setExportMsg] = useState(false);
  const prevUnlocked = useRef(new Set());
  const [activeMonth, setActiveMonth] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });
  const [progressTab, setProgressTab] = useState("chart");
  const [listFilter, setListFilter] = useState("all");

  // Загружаем данные при старте: CloudStorage (TG) или localStorage (браузер)
  useEffect(() => {
    async function loadData() {
      try {
        let raw = null;
        if (isTelegram) {
          raw = await storage.get(STORAGE_KEY);
        } else {
          raw = localStorage.getItem(STORAGE_KEY);
        }
        if (raw) setWorkouts(JSON.parse(raw));

        // Проверяем онбординг
        let seen = null;
        if (isTelegram) {
          seen = await storage.get(ONBOARD_KEY);
        } else {
          seen = localStorage.getItem(ONBOARD_KEY);
        }
        if (!seen) setShowOnboarding(true);
      } catch (e) {
        console.warn('Load error:', e);
      } finally {
        setDataLoaded(true);
      }
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Сохраняем тренировки при каждом изменении
  useEffect(() => {
    if (!dataLoaded) return; // не перезаписываем до загрузки
    const json = JSON.stringify(workouts);
    if (isTelegram) {
      storage.set(STORAGE_KEY, json).catch(console.warn);
    } else {
      try { localStorage.setItem(STORAGE_KEY, json); } catch {}
    }
    // Проверяем новые достижения
    ACHIEVEMENTS.forEach(a => {
      if (a.check(workouts) && !prevUnlocked.current.has(a.id)) {
        prevUnlocked.current.add(a.id);
        haptic.success();
        setNewAchievement(a);
        setTimeout(() => setNewAchievement(null), 3500);
      }
    });
  // isTelegram, storage, haptic omitted: stable references from useTelegram
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workouts, dataLoaded]);

  const addWorkout = useCallback(() => {
    if (!form.type) { haptic.error(); return; }
    haptic.success();
    setWorkouts(prev => [{ ...form, id: Date.now() }, ...prev]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setScreen("home"); }, 1500);
    setForm({ date: getLocalDateStr(), type: "", duration: 30, moodBefore: 3, moodAfter: 3, note: "" });
  // haptic omitted from deps: functions reference stable tg object
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const deleteWorkout = useCallback((id) => {
    haptic.medium();
    setWorkouts(prev => prev.filter(x => x.id !== id));
    setDeleteConfirm(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportData = useCallback(() => {
    const data = JSON.stringify(workouts, null, 2);
    const fallback = () => {
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(new Blob([data], { type: "application/json" })),
        download: "yogaquest.json",
      });
      a.click();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(data)
        .then(() => { setExportMsg(true); setTimeout(() => setExportMsg(false), 2500); })
        .catch(fallback);
    } else {
      fallback();
    }
  }, [workouts]);

  const streak = calcStreak(workouts);
  const level = getLevel(workouts.length);
  const totalMinutes = workouts.reduce((s, w) => s + w.duration, 0);
  const todayStr = getLocalDateStr();
  const todayWorkouts = workouts.filter(w => w.date === todayStr);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    const ds = getLocalDateStr(d);
    const dws = workouts.filter(w => w.date === ds);
    return { day: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"][d.getDay()], minutes: dws.reduce((s,w)=>s+w.duration,0), count: dws.length };
  });

  const moodTrend = workouts.slice(0,14).reverse().map((w,i) => ({ i:i+1, before:w.moodBefore, after:w.moodAfter }));
  const [year, month] = activeMonth.split("-").map(Number);
  const firstDay = new Date(year, month-1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const calDays = Array.from({length: firstDay===0?6:firstDay-1}, ()=>null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));
  const workoutDates = new Set(workouts.map(w=>w.date));
  const unlockedAchievements = ACHIEVEMENTS.filter(a=>a.check(workouts));
  const filteredWorkouts = listFilter==="all" ? workouts : workouts.filter(w=>w.type===listFilter);
  const monthNames = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

  const css = `
    *{box-sizing:border-box;margin:0;padding:0;}

    body {
      background: #fce4f0;
      /* pixel cursor — desktop only, ignored on mobile/TMA */
    }

    @keyframes blink {0%,100%{opacity:1}50%{opacity:0}}
    @keyframes slideDown {from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn {0%{opacity:0;transform:scale(0.7)}60%{transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
    @keyframes pixelFloat {0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    @keyframes scanline {0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
    @keyframes marquee {0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
    @keyframes shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
    @keyframes glow {0%,100%{box-shadow:3px 3px 0 #c9607a}50%{box-shadow:3px 3px 0 #c9607a, 0 0 12px #ffb3c666}}

    .app {
      min-height: 100vh;
      background: 
        repeating-linear-gradient(0deg, transparent, transparent 31px, #f0c8e044 32px),
        repeating-linear-gradient(90deg, transparent, transparent 31px, #f0c8e044 32px),
        linear-gradient(135deg, #fce4f0 0%, #ede0ff 50%, #fce4f0 100%);
      font-family: 'Nunito', sans-serif;
      position: relative;
      padding-bottom: 80px;
    }

    .scanline {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(180deg, transparent, #ff8fab22, transparent);
      animation: scanline 8s linear infinite;
      pointer-events: none;
      z-index: 999;
    }

    .container {
      max-width: 420px;
      margin: 0 auto;
      padding: 0 12px;
    }

    /* Header */
    .app-header {
      background: linear-gradient(180deg, #c9b8ff 0%, #a98aee 100%);
      border-bottom: 3px solid #7c4dab;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 3px 0 #5c2d91;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .app-title {
      font-family: 'Press Start 2P', monospace;
      font-size: 10px;
      color: white;
      text-shadow: 2px 2px 0 #5c2d91;
      letter-spacing: 1px;
    }

    .app-sub {
      font-family: 'Press Start 2P', monospace;
      font-size: 6px;
      color: #ede0ff;
      margin-top: 3px;
      animation: blink 2s infinite;
    }

    .header-hearts {
      display: flex;
      gap: 3px;
    }

    /* Ticker */
    .ticker {
      background: #ff8fab;
      border-bottom: 2px solid #c9607a;
      padding: 4px 0;
      overflow: hidden;
      font-family: 'Press Start 2P', monospace;
      font-size: 7px;
      color: white;
      text-shadow: 1px 1px 0 #c9607a;
      white-space: nowrap;
    }

    .ticker-inner {
      display: inline-block;
      animation: marquee 20s linear infinite;
    }

    /* Main content */
    .main {
      padding: 14px 12px 0;
    }

    /* Pixel window override */
    .pwin {
      background: #f5e6ff;
      border: 3px solid #9b72cf;
      box-shadow: 4px 4px 0 #7c4dab;
      margin-bottom: 14px;
      image-rendering: pixelated;
    }

    .pwin-title {
      background: linear-gradient(90deg, #9b72cf, #c084fc);
      padding: 5px 8px;
      border-bottom: 2px solid #9b72cf;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .pwin-title-text {
      font-family: 'Press Start 2P', monospace;
      font-size: 7px;
      color: white;
      text-shadow: 1px 1px 0 #5c2d91;
      flex: 1;
    }

    .win-btn {
      width: 14px; height: 14px;
      background: #e8d5ff;
      border: 2px solid #9b72cf;
      font-size: 7px;
      color: #5c2d91;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Press Start 2P', monospace;
      flex-shrink: 0;
      box-shadow: 1px 1px 0 #fff inset;
    }

    .pwin-pink .pwin-title { background: linear-gradient(90deg, #ff8fab, #ffb3c6); border-bottom-color: #c9607a; }
    .pwin-pink { border-color: #c9607a; box-shadow: 4px 4px 0 #c9607a; }
    .pwin-pink .pwin-title-text { text-shadow: 1px 1px 0 #7c1d36; }

    .pwin-yellow .pwin-title { background: linear-gradient(90deg, #ffd166, #ffe599); border-bottom-color: #b8860b; }
    .pwin-yellow { border-color: #b8860b; box-shadow: 4px 4px 0 #b8860b; }
    .pwin-yellow .pwin-title-text { text-shadow: 1px 1px 0 #7a5900; color: #3d2800; }

    .pwin-body { padding: 12px; }

    /* Stat blocks */
    .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 14px;
    }

    .stat-block {
      background: #fff0f5;
      border: 2px solid #ffb3c6;
      box-shadow: 2px 2px 0 #c9607a;
      padding: 10px 6px;
      text-align: center;
    }

    .stat-num {
      font-family: 'Press Start 2P', monospace;
      font-size: 18px;
      color: #c9607a;
      line-height: 1;
      text-shadow: 2px 2px 0 #ffb3c6;
    }

    .stat-label {
      font-family: 'Press Start 2P', monospace;
      font-size: 6px;
      color: #9b72cf;
      margin-top: 5px;
      line-height: 1.4;
    }

    /* Streak big */
    .streak-box {
      background: linear-gradient(135deg, #fff0f5, #ede0ff);
      border: 3px solid #ff8fab;
      box-shadow: 4px 4px 0 #c9607a;
      padding: 16px;
      text-align: center;
      margin-bottom: 14px;
      animation: glow 2s ease-in-out infinite;
    }

    .streak-num {
      font-family: 'Press Start 2P', monospace;
      font-size: 40px;
      color: #ff8fab;
      text-shadow: 3px 3px 0 #c9607a, 6px 6px 0 #ffb3c633;
      line-height: 1;
      animation: pixelFloat 2s ease-in-out infinite;
    }

    .streak-label-big {
      font-family: 'Press Start 2P', monospace;
      font-size: 8px;
      color: #9b72cf;
      margin-top: 6px;
      text-shadow: 1px 1px 0 #c9b8ff;
    }

    /* Type grid */
    .type-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }

    .type-btn {
      background: #fff0f5;
      border: 2px solid #ffb3c6;
      box-shadow: 2px 2px 0 #c9607a;
      padding: 9px 8px;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s;
      font-family: 'Press Start 2P', monospace;
    }

    .type-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #c9607a; }
    .type-btn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 #c9607a; }

    .type-btn.selected {
      border-color: #9b72cf;
      background: #ede0ff;
      box-shadow: 3px 3px 0 #7c4dab;
      animation: glow 1.5s ease-in-out infinite;
    }

    .type-btn-icon { font-size: 18px; display: block; margin-bottom: 4px; }
    .type-btn-label {
      font-family: 'Press Start 2P', monospace;
      font-size: 6px;
      color: #7c1d36;
      display: block;
    }
    .type-btn.selected .type-btn-label { color: #5c2d91; }
    .type-btn-desc {
      font-family: 'Nunito', sans-serif;
      font-size: 9px;
      color: #c084fc;
      margin-top: 2px;
      display: block;
    }

    /* Mood */
    .mood-row { display: flex; gap: 5px; }
    .mood-btn {
      flex: 1;
      border: 2px solid #e8d5ff;
      background: #fff0f5;
      padding: 8px 2px;
      text-align: center;
      cursor: pointer;
      transition: all 0.1s;
      box-shadow: 2px 2px 0 #c9b8ff;
    }
    .mood-btn:hover { transform: translate(-1px,-1px); }
    .mood-btn.selected {
      border-color: #ff8fab;
      background: #ffe0eb;
      box-shadow: 2px 2px 0 #c9607a;
      transform: scale(1.08);
    }
    .mood-emoji { font-size: 18px; display: block; }
    .mood-label {
      font-family: 'Press Start 2P', monospace;
      font-size: 5px;
      color: #9b72cf;
      margin-top: 3px;
      display: block;
      line-height: 1.4;
    }

    /* Duration */
    .dur-display {
      font-family: 'Press Start 2P', monospace;
      font-size: 24px;
      color: #ff8fab;
      text-align: center;
      text-shadow: 2px 2px 0 #c9607a;
      padding: 8px;
      background: #fff0f5;
      border: 2px solid #ffb3c6;
      box-shadow: 2px 2px 0 #c9607a;
      margin-bottom: 8px;
    }

    .preset-row { display: flex; gap: 5px; margin-bottom: 8px; }
    .preset-btn {
      flex: 1;
      padding: 6px 3px;
      border: 2px solid #c9b8ff;
      background: #ede0ff;
      font-family: 'Press Start 2P', monospace;
      font-size: 6px;
      color: #5c2d91;
      cursor: pointer;
      box-shadow: 2px 2px 0 #9b72cf;
      transition: all 0.1s;
    }
    .preset-btn:hover { transform: translate(-1px,-1px); }
    .preset-btn.active {
      background: #9b72cf;
      color: white;
      border-color: #7c4dab;
    }

    input[type=range] {
      width: 100%;
      -webkit-appearance: none;
      height: 8px;
      background: repeating-linear-gradient(90deg, #ff8fab 0px, #ff8fab 4px, #c9607a 4px, #c9607a 8px);
      border: 2px solid #c9607a;
      image-rendering: pixelated;
      cursor: pointer;
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px; height: 20px;
      background: #fff0f5;
      border: 3px solid #c9607a;
      box-shadow: 2px 2px 0 #c9607a;
      cursor: pointer;
      image-rendering: pixelated;
    }

    input[type=date], textarea {
      width: 100%;
      background: #fff0f5;
      border: 2px solid #c9b8ff;
      box-shadow: 2px 2px 0 #9b72cf;
      padding: 8px 10px;
      font-family: 'Press Start 2P', monospace;
      font-size: 8px;
      color: #5c2d91;
      outline: none;
    }
    input[type=date]:focus, textarea:focus { border-color: #ff8fab; box-shadow: 2px 2px 0 #c9607a; }
    textarea { resize: none; min-height: 70px; font-size: 9px; font-family: 'Nunito', sans-serif; }

    .form-label {
      font-family: 'Press Start 2P', monospace;
      font-size: 7px;
      color: #9b72cf;
      display: block;
      margin-bottom: 7px;
      text-shadow: 1px 1px 0 #e8d5ff;
    }

    .form-group { margin-bottom: 16px; }

    /* Nav */
    .nav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: linear-gradient(180deg, #c9b8ff, #a98aee);
      border-top: 3px solid #7c4dab;
      box-shadow: 0 -3px 0 #5c2d91;
      display: flex;
      z-index: 100;
    }

    .nav-btn {
      flex: 1;
      padding: 10px 4px 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      border-right: 2px solid #9b72cf55;
      transition: background 0.15s;
    }
    .nav-btn:last-child { border-right: none; }
    .nav-btn:hover { background: #9b72cf33; }
    .nav-btn.active { background: linear-gradient(180deg, #7c4dab, #9b72cf); }

    .nav-icon { font-size: 18px; }
    .nav-label {
      font-family: 'Press Start 2P', monospace;
      font-size: 5px;
      color: white;
      text-shadow: 1px 1px 0 #5c2d91;
      line-height: 1;
    }
    .nav-btn.active .nav-label { color: #ffd6e0; }

    /* Save modal */
    .modal-bg {
      position: fixed; inset: 0;
      background: #9b72cf55;
      backdrop-filter: blur(2px);
      z-index: 200;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }

    .save-win {
      background: #fff0f5;
      border: 4px solid #ff8fab;
      box-shadow: 6px 6px 0 #c9607a;
      padding: 30px 24px;
      text-align: center;
      animation: popIn 0.3s ease;
      max-width: 280px;
      width: 100%;
    }

    .save-icon { font-size: 40px; animation: pixelFloat 1s ease-in-out infinite; margin-bottom: 12px; display: block; }

    .save-text {
      font-family: 'Press Start 2P', monospace;
      font-size: 11px;
      color: #c9607a;
      text-shadow: 2px 2px 0 #ffb3c6;
    }

    .save-sub {
      font-family: 'Press Start 2P', monospace;
      font-size: 7px;
      color: #9b72cf;
      margin-top: 8px;
    }

    /* Achievement pop */
    .achieve-pop {
      position: fixed;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 300;
      background: #fff0f5;
      border: 3px solid #ffd166;
      box-shadow: 4px 4px 0 #b8860b;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideDown 0.4s ease;
      min-width: 280px;
      max-width: 360px;
    }

    .achieve-pop-icon { font-size: 28px; animation: shake 0.5s ease-in-out 3; }
    .achieve-pop-title { font-family: 'Press Start 2P', monospace; font-size: 7px; color: #b8860b; }
    .achieve-pop-sub { font-family: 'Press Start 2P', monospace; font-size: 6px; color: #9b72cf; margin-top: 4px; }

    /* Onboarding */
    .onboard-bg {
      position: fixed; inset: 0;
      background: #ede0ffcc;
      backdrop-filter: blur(3px);
      z-index: 400;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    }

    .onboard-win {
      background: #f5e6ff;
      border: 4px solid #9b72cf;
      box-shadow: 6px 6px 0 #5c2d91;
      max-width: 320px;
      width: 100%;
      animation: popIn 0.3s ease;
    }

    .onboard-body {
      padding: 24px 20px 20px;
      text-align: center;
    }

    .onboard-icon {
      font-size: 48px;
      animation: pixelFloat 2s ease-in-out infinite;
      display: block;
      margin-bottom: 14px;
    }

    .onboard-title {
      font-family: 'Press Start 2P', monospace;
      font-size: 10px;
      color: #5c2d91;
      text-shadow: 2px 2px 0 #c9b8ff;
      margin-bottom: 4px;
    }

    .onboard-sub {
      font-family: 'Press Start 2P', monospace;
      font-size: 7px;
      color: #ff8fab;
      animation: blink 1s infinite;
      margin-bottom: 12px;
    }

    .onboard-text {
      font-family: 'Nunito', sans-serif;
      font-size: 13px;
      color: #7c4dab;
      line-height: 1.6;
      margin-bottom: 18px;
    }

    .onboard-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-bottom: 16px;
    }

    .onboard-dot {
      width: 8px; height: 8px;
      background: #e8d5ff;
      border: 2px solid #9b72cf;
      transition: all 0.2s;
    }
    .onboard-dot.active { background: #ff8fab; border-color: #c9607a; width: 20px; }

    /* Delete modal */
    .del-win {
      background: #fff0f5;
      border: 3px solid #ff8fab;
      box-shadow: 4px 4px 0 #c9607a;
      padding: 24px 20px;
      text-align: center;
      max-width: 280px;
      width: 100%;
      animation: popIn 0.2s ease;
    }
    .modal-btns { display: flex; gap: 8px; margin-top: 16px; justify-content: center; }

    /* Calendar */
    .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
    .cal-head { font-family: 'Press Start 2P', monospace; font-size: 6px; color: #9b72cf; text-align: center; padding: 4px 0; }
    .cal-day {
      aspect-ratio: 1;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Press Start 2P', monospace;
      font-size: 6px;
      color: #c9b8ff;
      border: 1px solid transparent;
    }
    .cal-day.has { background: #ff8fab; color: white; border-color: #c9607a; box-shadow: 1px 1px 0 #c9607a; }
    .cal-day.today { border-color: #ffd166; color: #b8860b; }
    .cal-day.empty { opacity: 0; }

    /* Workout list item */
    .w-item {
      display: flex; align-items: center; gap: 8px;
      border-bottom: 2px dashed #ffb3c6;
      padding: 8px 0;
    }
    .w-icon { font-size: 22px; flex-shrink: 0; width: 32px; text-align: center; }
    .w-info { flex: 1; }
    .w-name { font-family: 'Press Start 2P', monospace; font-size: 7px; color: #5c2d91; }
    .w-meta { font-family: 'Press Start 2P', monospace; font-size: 6px; color: #c084fc; margin-top: 4px; }
    .w-note { font-family: 'Nunito', sans-serif; font-size: 10px; color: #9b72cf; margin-top: 3px; font-style: italic; }
    .w-del { background: none; border: 2px solid #ffb3c6; color: #ff8fab; font-size: 9px; padding: 3px 5px; cursor: pointer; font-family: 'Press Start 2P', monospace; }
    .w-del:hover { background: #ff8fab; color: white; }

    /* Achieve card */
    .ach-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .ach-card {
      border: 3px solid #e8d5ff;
      background: #f5e6ff;
      box-shadow: 2px 2px 0 #c9b8ff;
      padding: 12px 8px;
      text-align: center;
    }
    .ach-card.done {
      border-color: #ff8fab;
      background: #fff0f5;
      box-shadow: 3px 3px 0 #c9607a;
      animation: glow 2s ease-in-out infinite;
    }
    .ach-card.locked { opacity: 0.4; filter: grayscale(0.8); }
    .ach-icon { font-size: 28px; display: block; margin-bottom: 5px; }
    .ach-name { font-family: 'Press Start 2P', monospace; font-size: 6px; color: #5c2d91; line-height: 1.5; }
    .ach-desc { font-family: 'Press Start 2P', monospace; font-size: 5px; color: #c084fc; margin-top: 4px; line-height: 1.5; }
    .ach-done { font-family: 'Press Start 2P', monospace; font-size: 5px; color: #ff8fab; margin-top: 4px; }

    /* Tab bar */
    .tab-row { display: flex; gap: 0; margin-bottom: 12px; border: 2px solid #9b72cf; box-shadow: 2px 2px 0 #7c4dab; }
    .tab-btn {
      flex: 1;
      padding: 7px 4px;
      border: none;
      border-right: 2px solid #9b72cf;
      background: #f5e6ff;
      font-family: 'Press Start 2P', monospace;
      font-size: 6px;
      color: #9b72cf;
      cursor: pointer;
    }
    .tab-btn:last-child { border-right: none; }
    .tab-btn.active { background: #9b72cf; color: white; }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 78px;
      left: 50%;
      transform: translateX(-50%);
      background: #fff0f5;
      border: 3px solid #ff8fab;
      box-shadow: 3px 3px 0 #c9607a;
      padding: 8px 16px;
      font-family: 'Press Start 2P', monospace;
      font-size: 7px;
      color: #c9607a;
      z-index: 200;
      white-space: nowrap;
      animation: slideDown 0.3s ease;
    }

    .empty-win {
      text-align: center;
      padding: 30px 20px;
      font-family: 'Press Start 2P', monospace;
      font-size: 7px;
      color: #c9b8ff;
      line-height: 2;
    }

    .level-bar {
      display: flex;
      gap: 2px;
      margin-top: 6px;
      background: #fff0f5;
      border: 2px solid #c9b8ff;
      padding: 4px;
    }

    .section-filter { display: flex; gap: 5px; margin-bottom: 10px; overflow-x: auto; padding-bottom: 3px; }
    .filter-btn {
      flex-shrink: 0;
      padding: 5px 8px;
      border: 2px solid #c9b8ff;
      background: #f5e6ff;
      font-family: 'Press Start 2P', monospace;
      font-size: 6px;
      color: #9b72cf;
      cursor: pointer;
      box-shadow: 1px 1px 0 #9b72cf;
    }
    .filter-btn.active { background: #9b72cf; color: white; border-color: #7c4dab; }
  `;

  const tickerContent = useMemo(() => {
    const base = workouts.length > 0
      ? `✦ STREAK: ${streak} ДНЕЙ ✦ ТРЕНИРОВОК: ${workouts.length} ✦ НА КОВРИКЕ: ${Math.round(totalMinutes/60)} ЧАС ✦ УРОВЕНЬ: ${level.label} ✦ `
      : `✦ ДОБРО ПОЖАЛОВАТЬ В YOGAQUEST ✦ НАЧНИ СВОЮ ПРАКТИКУ ✦ НАЖМИ + ЧТОБЫ ДОБАВИТЬ ТРЕНИРОВКУ ✦ `;
    return base.repeat(3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workouts.length, streak, totalMinutes, level.label]);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="scanline" />

        {/* LOADING SCREEN */}
        {!dataLoaded && (
          <div style={{position:"fixed",inset:0,background:"#fce4f0",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,flexDirection:"column",gap:16}}>
            <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"12px",color:"#9b72cf",textShadow:"2px 2px 0 #c9b8ff",animation:"blink 1s infinite"}}>LOADING...</div>
            <div style={{display:"flex",gap:6}}>
              {[0,1,2].map(i=><div key={i} style={{width:12,height:12,background:i===0?"#ff8fab":i===1?"#c9b8ff":"#ffd166",border:"2px solid #9b72cf",animation:`blink ${1+i*0.3}s infinite`}}/>)}
            </div>
          </div>
        )}

        {/* ONBOARDING */}
        {showOnboarding && (
          <div className="onboard-bg">
            <div className="onboard-win" key={onboardStep}>
              <div className="pwin-title">
                <span className="pwin-title-text">{ONBOARD_STEPS[onboardStep].title}</span>
                <div className="win-btn">✕</div>
              </div>
              <div className="onboard-body">
                <span className="onboard-icon">{ONBOARD_STEPS[onboardStep].icon}</span>
                <div className="onboard-sub">{ONBOARD_STEPS[onboardStep].sub}_</div>
                <div className="onboard-text">{ONBOARD_STEPS[onboardStep].text}</div>
                <div className="onboard-dots">
                  {ONBOARD_STEPS.map((_,i) => <div key={i} className={`onboard-dot${onboardStep===i?" active":""}`}/>)}
                </div>
                <PixelBtn variant="primary" style={{width:"100%"}} onClick={() => {
                  if (onboardStep < ONBOARD_STEPS.length-1) setOnboardStep(s=>s+1);
                  else {
                    setShowOnboarding(false);
                    haptic.success();
                    if (isTelegram) storage.set(ONBOARD_KEY, "1").catch(console.warn);
                    else localStorage.setItem(ONBOARD_KEY, "1");
                  }
                }}>
                  {onboardStep < ONBOARD_STEPS.length-1 ? "ДАЛЬШЕ >>>" : "НАЧАТЬ !!!"}
                </PixelBtn>
              </div>
            </div>
          </div>
        )}

        {/* SAVE */}
        {saved && (
          <div className="modal-bg">
            <div className="save-win">
              <span className="save-icon">💾</span>
              <div className="save-text">СОХРАНЕНО!</div>
              <div className="save-sub">ты молодец ♥</div>
              <div style={{marginTop:14}}><PixelHearts filled={5} total={5}/></div>
            </div>
          </div>
        )}

        {/* ACHIEVEMENT */}
        {newAchievement && (
          <div className="achieve-pop">
            <span className="achieve-pop-icon">{newAchievement.icon}</span>
            <div>
              <div className="achieve-pop-title">!! НОВОЕ ДОСТИЖЕНИЕ !!</div>
              <div className="achieve-pop-sub" style={{marginTop:5}}>{newAchievement.label}</div>
              <div className="achieve-pop-sub">{newAchievement.desc}</div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {deleteConfirm && (
          <div className="modal-bg">
            <div className="del-win">
              <span style={{fontSize:32,display:"block",marginBottom:10}}>🗑️</span>
              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#c9607a",marginBottom:6}}>УДАЛИТЬ ЗАПИСЬ?</div>
              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#9b72cf"}}>это нельзя отменить</div>
              <div className="modal-btns">
                <PixelBtn variant="ghost" onClick={()=>setDeleteConfirm(null)}>НЕТ</PixelBtn>
                <PixelBtn variant="danger" onClick={()=>deleteWorkout(deleteConfirm)}>ДА</PixelBtn>
              </div>
            </div>
          </div>
        )}

        {exportMsg && <div className="toast">✦ ДАННЫЕ СКОПИРОВАНЫ!</div>}

        {/* HEADER */}
        <div className="app-header">
          <div>
            <div className="app-title">🌸 YOGAQUEST</div>
            <div className="app-sub">
              {user ? `▶ ПРИВЕТ, ${user.first_name.toUpperCase()}!` : "▶ LOADING..."}
            </div>
          </div>
          <div className="header-hearts">
            <PixelHearts filled={streak > 0 ? Math.min(5, streak) : 0} total={5}/>
          </div>
        </div>

        {/* TICKER */}
        <div className="ticker">
          <span className="ticker-inner">{tickerContent}</span>
        </div>

        <div className="container">
          <div className="main">

            {/* HOME */}
            {screen === "home" && (
              <>
                {/* Streak */}
                <div className="streak-box">
                  <div className="streak-num">{streak}</div>
                  <div className="streak-label-big">🔥 ДНЕЙ ПОДРЯД 🔥</div>
                  <div style={{marginTop:10,display:"flex",justifyContent:"center"}}>
                    <PixelHearts filled={Math.min(5,streak)} total={5}/>
                  </div>
                </div>

                {/* Stats */}
                <div className="stat-grid">
                  <div className="stat-block">
                    <div className="stat-num">{workouts.length}</div>
                    <div className="stat-label">ТРЕНИ&shy;РОВОК</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-num">{Math.round(totalMinutes/60)}</div>
                    <div className="stat-label">ЧАСОВ НА КОВРИКЕ</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-num">{workouts.length>0?Math.round(totalMinutes/workouts.length):0}</div>
                    <div className="stat-label">МИН. В СРЕДНЕМ</div>
                  </div>
                </div>

                {/* Level */}
                <div className="pwin pwin-yellow">
                  <div className="pwin-title">
                    <span className="pwin-title-text">УРОВЕНЬ.EXE</span>
                    <div className="win-btn" style={{background:"#fff9c4",borderColor:"#b8860b",color:"#7a5900"}}>—</div>
                    <div className="win-btn" style={{background:"#fff9c4",borderColor:"#b8860b",color:"#7a5900"}}>✕</div>
                  </div>
                  <div className="pwin-body">
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <span style={{fontSize:28}}>{level.icon}</span>
                      <div>
                        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"9px",color:"#7a5900",textShadow:"1px 1px 0 #ffe599"}}>{level.label}</div>
                        <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#b8860b",marginTop:4}}>
                          {workouts.length >= 60 ? "МАКСИМАЛЬНЫЙ УРОВЕНЬ!" : `ЕЩЁ ${([10,30,60].find(n=>n>workouts.length)||60)-workouts.length} ДО СЛЕД.`}
                        </div>
                      </div>
                    </div>
                    <HeartBar
                      value={workouts.length<10?workouts.length:workouts.length<30?workouts.length:workouts.length<60?workouts.length:60}
                      max={workouts.length<10?10:workouts.length<30?30:60}
                    />
                  </div>
                </div>

                {/* Today */}
                {todayWorkouts.length > 0 && (
                  <div className="pwin pwin-pink">
                    <div className="pwin-title">
                      <span className="pwin-title-text">СЕГОДНЯ ✓</span>
                      <div className="win-btn" style={{background:"#ffe0eb",borderColor:"#c9607a",color:"#7c1d36"}}>✕</div>
                    </div>
                    <div className="pwin-body">
                      {todayWorkouts.map(w => {
                        const pt = PRACTICE_TYPES.find(t=>t.id===w.type);
                        return (
                          <div key={w.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                            <span style={{fontSize:20}}>{pt?.icon}</span>
                            <div style={{flex:1}}>
                              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"#7c1d36"}}>{pt?.label}</div>
                              <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#c084fc",marginTop:3}}>{w.duration} МИН</div>
                            </div>
                            <span style={{fontSize:18}}>{MOODS.find(m=>m.id===w.moodAfter)?.pixel}</span>
                          </div>
                        );
                      })}
                      <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#ff8fab",marginTop:6,borderTop:"1px dashed #ffb3c6",paddingTop:6}}>
                        ИТОГО: {todayWorkouts.reduce((s,w)=>s+w.duration,0)} МИН ♥
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {workouts.length === 0 && (
                  <div className="pwin">
                    <div className="pwin-title"><span className="pwin-title-text">НАЧАЛО.EXE</span></div>
                    <div className="pwin-body empty-win">
                      <div style={{fontSize:40,marginBottom:10}}>🌿</div>
                      <div>НАЖМИ + ЧТОБЫ</div>
                      <div>НАЧАТЬ ПУТЬ!</div>
                      <div style={{marginTop:10}}><PixelHearts filled={0} total={5}/></div>
                    </div>
                  </div>
                )}

                {/* Week chart */}
                <div className="pwin">
                  <div className="pwin-title"><span className="pwin-title-text">НЕДЕЛЯ.EXE</span><div className="win-btn">—</div></div>
                  <div className="pwin-body">
                    <div style={{display:"flex",gap:3,alignItems:"flex-end",height:56,marginBottom:4}}>
                      {last7.map((d,i)=>(
                        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",height:"100%",justifyContent:"flex-end"}}>
                          <div style={{
                            width:"100%",
                            height: d.minutes>0?`${Math.min(100,(d.minutes/90)*100)}%`:"4px",
                            background: d.count>0
                              ? "repeating-linear-gradient(180deg,#ff8fab 0,#ff8fab 3px,#ffb3c6 3px,#ffb3c6 6px)"
                              : "#e8d5ff",
                            border: d.count>0 ? "1px solid #c9607a" : "1px solid #c9b8ff",
                            imageRendering:"pixelated",
                          }}/>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:3}}>
                      {last7.map((d,i)=>(
                        <div key={i} style={{flex:1,textAlign:"center",fontFamily:"'Press Start 2P',monospace",fontSize:"5px",color:d.count>0?"#c9607a":"#c9b8ff"}}>{d.day}</div>
                      ))}
                    </div>
                  </div>
                </div>

                <PixelBtn variant="primary" style={{width:"100%",padding:"14px",fontSize:"9px"}} onClick={()=>setScreen("add")}>
                  ♥ ЗАПИСАТЬ ТРЕНИРОВКУ ♥
                </PixelBtn>
              </>
            )}

            {/* ADD */}
            {screen === "add" && (
              <div className="pwin pwin-pink">
                <div className="pwin-title">
                  <span className="pwin-title-text">НОВАЯ ПРАКТИКА.EXE</span>
                  <div className="win-btn" style={{background:"#ffe0eb",borderColor:"#c9607a",color:"#7c1d36"}}>✕</div>
                </div>
                <div className="pwin-body">

                  <div className="form-group">
                    <label className="form-label">▶ ДАТА</label>
                    <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
                  </div>

                  <div className="form-group">
                    <label className="form-label">▶ ТИП ПРАКТИКИ</label>
                    <div className="type-grid">
                      {PRACTICE_TYPES.map(t=>(
                        <button key={t.id} className={`type-btn${form.type===t.id?" selected":""}`}
                          onClick={()=>setForm(f=>({...f,type:t.id}))}>
                          <span className="type-btn-icon">{t.icon}</span>
                          <span className="type-btn-label">{t.label}</span>
                          <span className="type-btn-desc">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">▶ ДЛИТЕЛЬНОСТЬ</label>
                    <div className="preset-row">
                      {DURATION_PRESETS.map(p=>(
                        <button key={p} className={`preset-btn${form.duration===p?" active":""}`} onClick={()=>setForm(f=>({...f,duration:p}))}>{p}'</button>
                      ))}
                    </div>
                    <div className="dur-display">{form.duration} МИН</div>
                    <input type="range" min="5" max="120" step="5" value={form.duration} onChange={e=>setForm(f=>({...f,duration:Number(e.target.value)}))}/>
                  </div>

                  <div className="form-group">
                    <label className="form-label">▶ НАСТРОЕНИЕ ДО</label>
                    <div className="mood-row">
                      {MOODS.map(m=>(
                        <button key={m.id} className={`mood-btn${form.moodBefore===m.id?" selected":""}`} onClick={()=>setForm(f=>({...f,moodBefore:m.id}))}>
                          <span className="mood-emoji">{m.pixel}</span>
                          <span className="mood-label">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">▶ НАСТРОЕНИЕ ПОСЛЕ</label>
                    <div className="mood-row">
                      {MOODS.map(m=>(
                        <button key={m.id} className={`mood-btn${form.moodAfter===m.id?" selected":""}`} onClick={()=>setForm(f=>({...f,moodAfter:m.id}))}>
                          <span className="mood-emoji">{m.pixel}</span>
                          <span className="mood-label">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">▶ ЗАМЕТКА</label>
                    <textarea placeholder="как прошла практика? ✨" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
                  </div>

                  <PixelBtn variant="primary" disabled={!form.type} style={{width:"100%",padding:"14px",fontSize:"9px"}} onClick={addWorkout}>
                    💾 СОХРАНИТЬ
                  </PixelBtn>
                  {!form.type && (
                    <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#ff8fab",marginTop:7,textAlign:"center",animation:"blink 1s infinite"}}>
                      ← ВЫБЕРИ ТИП ПРАКТИКИ
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROGRESS */}
            {screen === "progress" && (
              <>
                <div className="tab-row">
                  {[["chart","📊 ГРАФИКИ"],["calendar","📅 КАЛЕН."],["list","📋 ИСТОРИЯ"]].map(([id,label])=>(
                    <button key={id} className={`tab-btn${progressTab===id?" active":""}`} onClick={()=>setProgressTab(id)}>{label}</button>
                  ))}
                </div>

                {progressTab === "chart" && (
                  <>
                    <div className="pwin">
                      <div className="pwin-title"><span className="pwin-title-text">АКТИВНОСТЬ НЕДЕЛЯ</span></div>
                      <div className="pwin-body">
                        {workouts.length===0 ? (
                          <div className="empty-win"><div>🌱</div><div>НЕТ ДАННЫХ</div></div>
                        ) : (
                          <ResponsiveContainer width="100%" height={130}>
                            <LineChart data={last7}>
                              <XAxis dataKey="day" tick={{fontFamily:"'Press Start 2P',monospace",fontSize:7,fill:"#c084fc"}} axisLine={false} tickLine={false}/>
                              <YAxis hide/>
                              <Tooltip contentStyle={{background:"#fff0f5",border:"2px solid #ff8fab",borderRadius:0,fontFamily:"'Press Start 2P',monospace",fontSize:9,color:"#c9607a",boxShadow:"3px 3px 0 #c9607a"}}/>
                              <Line type="stepAfter" dataKey="minutes" stroke="#ff8fab" strokeWidth={2} dot={{fill:"#ff8fab",r:4,stroke:"#c9607a",strokeWidth:2}} activeDot={{r:5}}/>
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {moodTrend.length > 1 && (
                      <div className="pwin">
                        <div className="pwin-title"><span className="pwin-title-text">НАСТРОЕНИЕ ДО/ПОСЛЕ</span></div>
                        <div className="pwin-body">
                          <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={moodTrend}>
                              <XAxis dataKey="i" hide/>
                              <YAxis domain={[1,5]} hide/>
                              <Tooltip contentStyle={{background:"#fff0f5",border:"2px solid #c9b8ff",borderRadius:0,fontFamily:"'Press Start 2P',monospace",fontSize:8,color:"#9b72cf",boxShadow:"2px 2px 0 #9b72cf"}}
                                formatter={(v,n)=>[MOODS[v-1]?.pixel+" "+MOODS[v-1]?.label, n==="before"?"ДО":"ПОСЛЕ"]}/>
                              <Line type="stepAfter" dataKey="before" stroke="#c9b8ff" strokeWidth={2} dot={false} strokeDasharray="4 2"/>
                              <Line type="stepAfter" dataKey="after" stroke="#ff8fab" strokeWidth={2} dot={{fill:"#ff8fab",r:3,stroke:"#c9607a",strokeWidth:1}}/>
                            </LineChart>
                          </ResponsiveContainer>
                          <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:4}}>
                            <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#c9b8ff"}}>-- ДО</span>
                            <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#ff8fab"}}>— ПОСЛЕ</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="stat-grid">
                      {[
                        [workouts.length>0?Math.round(totalMinutes/workouts.length):0,"СРЕДНЕЕ МИН"],
                        [workouts.length > 0 ? Math.max(...workouts.map(w=>w.duration)) : 0,"РЕКОРД МИН"],
                        [Math.round(totalMinutes/60),"ВСЕГО ЧАСОВ"],
                      ].map(([n,l])=>(
                        <div key={l} className="stat-block">
                          <div className="stat-num">{n}</div>
                          <div className="stat-label">{l}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {progressTab === "calendar" && (
                  <div className="pwin">
                    <div className="pwin-title"><span className="pwin-title-text">КАЛЕНДАРЬ.EXE</span></div>
                    <div className="pwin-body">
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                        <PixelBtn variant="ghost" style={{padding:"5px 10px",fontSize:"10px"}} onClick={()=>{const[y,m]=activeMonth.split("-").map(Number);const d=new Date(y,m-2,1);setActiveMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`)}}>{"<"}</PixelBtn>
                        <span style={{fontFamily:"'Press Start 2P',monospace",fontSize:"8px",color:"#5c2d91"}}>{monthNames[month-1].toUpperCase()} {year}</span>
                        <PixelBtn variant="ghost" style={{padding:"5px 10px",fontSize:"10px"}} onClick={()=>{const[y,m]=activeMonth.split("-").map(Number);const d=new Date(y,m,1);setActiveMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`)}}>{">"}</PixelBtn>
                      </div>
                      <div className="cal-grid" style={{marginBottom:4}}>
                        {["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"].map(d=><div key={d} className="cal-head">{d}</div>)}
                      </div>
                      <div className="cal-grid">
                        {calDays.map((day,i)=>{
                          if(day===null) return <div key={i} className="cal-day empty"/>;
                          const ds=`${activeMonth}-${String(day).padStart(2,"0")}`;
                          const hw=workoutDates.has(ds), it=ds===todayStr;
                          return <div key={i} className={`cal-day${hw?" has":""}${it&&!hw?" today":""}`}>{day}</div>;
                        })}
                      </div>
                      <div style={{marginTop:8,fontFamily:"'Press Start 2P',monospace",fontSize:"6px",color:"#9b72cf",textAlign:"center"}}>
                        {workouts.filter(w=>w.date.startsWith(activeMonth)).length} ТРЕНИРОВОК
                      </div>
                    </div>
                  </div>
                )}

                {progressTab === "list" && (
                  <>
                    <div className="section-filter">
                      <button className={`filter-btn${listFilter==="all"?" active":""}`} onClick={()=>setListFilter("all")}>ВСЕ</button>
                      {PRACTICE_TYPES.filter(t=>workouts.some(w=>w.type===t.id)).map(t=>(
                        <button key={t.id} className={`filter-btn${listFilter===t.id?" active":""}`} onClick={()=>setListFilter(t.id)}>{t.icon}</button>
                      ))}
                    </div>
                    <div className="pwin">
                      <div className="pwin-title"><span className="pwin-title-text">ИСТОРИЯ.EXE</span></div>
                      <div className="pwin-body">
                        {filteredWorkouts.length===0 ? (
                          <div className="empty-win"><div>🌸</div><div>НЕТ ЗАПИСЕЙ</div></div>
                        ) : filteredWorkouts.map(w=>{
                          const pt=PRACTICE_TYPES.find(t=>t.id===w.type);
                          const ma=MOODS.find(m=>m.id===w.moodAfter);
                          return (
                            <div key={w.id} className="w-item">
                              <div className="w-icon">{pt?.icon}</div>
                              <div className="w-info">
                                <div className="w-name">{pt?.label}</div>
                                <div className="w-meta">{formatDate(w.date)} · {w.duration} МИН</div>
                                {w.note && <div className="w-note">"{w.note}"</div>}
                              </div>
                              <span style={{fontSize:18,marginRight:4}}>{ma?.pixel}</span>
                              <button className="w-del" onClick={()=>setDeleteConfirm(w.id)}>✕</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ACHIEVEMENTS */}
            {screen === "achieve" && (
              <>
                <div className="pwin pwin-yellow">
                  <div className="pwin-title">
                    <span className="pwin-title-text">УРОВЕНЬ ИГРОКА</span>
                    <div className="win-btn" style={{background:"#fff9c4",borderColor:"#b8860b",color:"#7a5900"}}>✕</div>
                  </div>
                  <div className="pwin-body" style={{textAlign:"center"}}>
                    <span style={{fontSize:36,display:"block",marginBottom:8}}>{level.icon}</span>
                    <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"10px",color:"#7a5900",textShadow:"1px 1px 0 #ffe599",marginBottom:8}}>{level.label}</div>
                    <div style={{fontFamily:"'Press Start 2P',monospace",fontSize:"7px",color:"#b8860b",marginBottom:10}}>
                      {unlockedAchievements.length}/{ACHIEVEMENTS.length} АЧИВОК
                    </div>
                    <HeartBar value={unlockedAchievements.length} max={ACHIEVEMENTS.length}/>
                  </div>
                </div>

                <div className="ach-grid" style={{marginBottom:12}}>
                  {ACHIEVEMENTS.map(a=>{
                    const done=a.check(workouts);
                    return (
                      <div key={a.id} className={`ach-card${done?" done":" locked"}`}>
                        <span className="ach-icon">{a.icon}</span>
                        <div className="ach-name">{a.label}</div>
                        <div className="ach-desc">{a.desc}</div>
                        {done && <div className="ach-done">♥ ПОЛУЧЕНО!</div>}
                      </div>
                    );
                  })}
                </div>

                <PixelBtn variant="ghost" style={{width:"100%",padding:"12px",fontSize:"7px"}} onClick={exportData}>
                  💾 ЭКСПОРТ ДАННЫХ
                </PixelBtn>
              </>
            )}

          </div>
        </div>

        {/* NAV */}
        <nav className="nav">
          {[
            {id:"home",icon:"🏠",label:"ГЛАВНАЯ"},
            {id:"add",icon:"➕",label:"ДОБАВИТЬ"},
            {id:"progress",icon:"📊",label:"ПРОГРЕСС"},
            {id:"achieve",icon:"🏆",label:"УСПЕХИ"},
          ].map(n=>(
            <button key={n.id} className={`nav-btn${screen===n.id?" active":""}`} onClick={()=>{
                haptic.select();
                if (n.id !== "add") setForm(f => ({ ...f, type: "", note: "" }));
                setScreen(n.id);
              }}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
