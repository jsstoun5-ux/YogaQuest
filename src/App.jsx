/**
 * YogaQuest — Telegram Mini App
 * Главный компонент приложения с системой прогресса
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTelegram } from './hooks/useTelegram.js';
import { useWorkouts } from './hooks/useWorkouts.js';
import { useAchievements } from './hooks/useAchievements.js';
import { useProgression } from './hooks/useProgression.js';

// Components
import { PixelHearts, PixelBtn, SaveModal, RewardModal } from './components/ui/index.js';
import {
  Onboarding,
  PracticeForm,
  PracticeList,
  StatsChart,
  Achievements,
  LevelCard,
  Navbar,
  Calendar,
} from './components/pages/index.js';

// Constants
import { STORAGE_KEYS, PRACTICE_TYPES, MOODS } from './constants/index.js';

// Utils
import { getLocalDateStr, getWeekStats } from './utils/dateUtils.js';
import { Storage, isOnboardingSeen, markOnboardingSeen } from './utils/storage.js';

// Styles
import './styles/pixel.css';
import './components/ui/RewardModal.css';
import './components/pages/LevelCard.css';

/**
 * Главный компонент приложения
 */
export default function YogaQuest() {
  const { tg, isTelegram, user, telegramId, haptic, storage: tgStorage } = useTelegram();
  
  // Состояния
  const [screen, setScreen] = useState("home");
  const [progressTab, setProgressTab] = useState("chart");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exportMsg, setExportMsg] = useState(false);
  
  // Состояния для награды
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  
  // Хранилище
  const storage = useMemo(() => new Storage(tg), [tg]);
  
  // Тренировки
  const {
    workouts,
    isLoading,
    stats,
    addWorkout,
    deleteWorkout,
    prevAchievementsRef,
  } = useWorkouts(tg);

  // Достижения
  const {
    newAchievement,
    clearNewAchievement,
    unlockedAchievements,
    progress: achievementsProgress,
    total: achievementsTotal,
  } = useAchievements(workouts, (achievement) => {
    haptic.success();
  }, tg);

  // Прогресс (XP, уровни)
  const { progression, processNewWorkout } = useProgression(workouts, tg);

  // Загрузка данных и проверка онбординга
  useEffect(() => {
    async function init() {
      try {
        const seen = await isOnboardingSeen(storage);
        if (!seen) {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.warn('Init error:', e);
      } finally {
        setDataLoaded(true);
      }
    }
    init();
  }, [storage]);

  /**
   * Обработчик завершения онбординга
   */
  const handleOnboardingComplete = useCallback(async () => {
    setShowOnboarding(false);
    haptic.success();
    await markOnboardingSeen(storage);
  }, [haptic, storage]);

  /**
   * Обработчик добавления тренировки
   */
  const handleAddWorkout = useCallback((form) => {
    // Добавляем тренировку
    addWorkout(form);
    
    // Обрабатываем прогресс
    const result = processNewWorkout({
      ...form,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });
    
    // Показываем награду
    if (result) {
      setRewardData(result);
      setShowReward(true);
      haptic.success();
    } else {
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setScreen("home");
      }, 1500);
    }
  }, [addWorkout, processNewWorkout, haptic]);

  /**
   * Закрыть модальное окно награды
   */
  const handleCloseReward = useCallback(() => {
    setShowReward(false);
    setRewardData(null);
    setScreen("home");
  }, []);

  /**
   * Обработчик удаления тренировки
   */
  const handleDeleteWorkout = useCallback((id) => {
    haptic.medium();
    deleteWorkout(id);
  }, [deleteWorkout, haptic]);

  /**
   * Обработчик навигации
   */
  const handleNavigate = useCallback((newScreen) => {
    setScreen(newScreen);
  }, []);

  /**
   * Экспорт данных
   */
  const handleExport = useCallback(() => {
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
        .then(() => {
          setExportMsg(true);
          setTimeout(() => setExportMsg(false), 2500);
        })
        .catch(fallback);
    } else {
      fallback();
    }
  }, [workouts]);

  /**
   * Haptic callback
   */
  const handleHaptic = useCallback((type) => {
    switch (type) {
      case 'success':
        haptic.success();
        break;
      case 'error':
        haptic.error();
        break;
      case 'light':
        haptic.light();
        break;
      case 'medium':
        haptic.medium();
        break;
      case 'select':
        haptic.select();
        break;
    }
  }, [haptic]);

  // Данные для тикера
  const tickerContent = useMemo(() => {
    const level = progression?.level?.title || 'Новичок';
    const base = workouts.length > 0
      ? `✦ STREAK: ${stats.streak} ДНЕЙ ✦ ТРЕНИРОВОК: ${workouts.length} ✦ XP: ${progression?.totalXP || 0} ✦ УРОВЕНЬ: ${level} ✦ `
      : `✦ ДОБРО ПОЖАЛОВАТЬ В YOGAQUEST ✦ НАЧНИ СВОЮ ПРАКТИКУ ✦ НАЖМИ + ЧТОБЫ ДОБАВИТЬ ТРЕНИРОВКУ ✦ `;
    return base.repeat(3);
  }, [workouts.length, stats.streak, progression]);

  // Данные недели
  const weekData = useMemo(() => getWeekStats(workouts), [workouts]);

  // Рендер
  return (
    <>
      <div className="app">
        <div className="scanline" />

        {/* Loading Screen */}
        {!dataLoaded && (
          <div className="loading-screen">
            <div className="loading-text">LOADING...</div>
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
          </div>
        )}

        {/* Onboarding */}
        <Onboarding
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
        />

        {/* Save Modal */}
        <SaveModal isOpen={saved} />

        {/* Reward Modal */}
        <RewardModal
          isOpen={showReward}
          onClose={handleCloseReward}
          xpResult={rewardData?.xpBreakdown}
          levelUp={rewardData?.levelUp}
          newAchievements={rewardData?.newAchievements}
        />

        {/* Achievement Popup */}
        {newAchievement && (
          <div 
            className="achieve-pop" 
            onClick={clearNewAchievement}
            style={{ cursor: 'pointer' }}
          >
            <span className="achieve-pop-icon">{newAchievement.icon}</span>
            <div>
              <div className="achieve-pop-title">!! НОВОЕ ДОСТИЖЕНИЕ !!</div>
              <div className="achieve-pop-sub" style={{ marginTop: 5 }}>{newAchievement.label}</div>
              <div className="achieve-pop-sub">{newAchievement.desc}</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="app-header">
          <div>
            <div className="app-title">🌸 YOGAQUEST</div>
            <div className="app-sub">
              {user ? `▶ ПРИВЕТ, ${user.first_name.toUpperCase()}!` : "▶ LOADING..."}
            </div>
          </div>
          <div className="header-hearts">
            <PixelHearts filled={stats.streak > 0 ? Math.min(5, stats.streak) : 0} total={5} />
          </div>
        </div>

        {/* Ticker */}
        <div className="ticker">
          <span className="ticker-inner">{tickerContent}</span>
        </div>

        {/* Main Content */}
        <div className="container">
          <div className="main">
            {/* HOME SCREEN */}
            {screen === "home" && (
              <>
                {/* Streak Box */}
                <div className="streak-box">
                  <div className="streak-num">{stats.streak}</div>
                  <div className="streak-label-big">🔥 ДНЕЙ ПОДРЯД 🔥</div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
                    <PixelHearts filled={Math.min(5, stats.streak)} total={5} />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="stat-grid">
                  <div className="stat-block">
                    <div className="stat-num">{workouts.length}</div>
                    <div className="stat-label">ТРЕНИ&shy;РОВОК</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-num">{stats.totalHours}</div>
                    <div className="stat-label">ЧАСОВ НА КОВРИКЕ</div>
                  </div>
                  <div className="stat-block">
                    <div className="stat-num">{progression?.totalXP || 0}</div>
                    <div className="stat-label">XP</div>
                  </div>
                </div>

                {/* Level Card */}
                <LevelCard 
                  totalXP={progression?.totalXP || 0} 
                  workouts={workouts} 
                />

                {/* Today's Workouts */}
                {stats.todayCount > 0 && (
                  <div className="pwin pwin-pink">
                    <div className="pwin-title">
                      <span className="pwin-title-text">СЕГОДНЯ ✓</span>
                      <div className="win-btn" style={{ background: "#ffe0eb", borderColor: "#c9607a", color: "#7c1d36" }}>✕</div>
                    </div>
                    <div className="pwin-body">
                      {stats.todayWorkouts.map((w) => {
                        const pt = PRACTICE_TYPES.find(t => t.id === w.type);
                        const ma = MOODS.find(m => m.id === w.moodAfter);
                        return (
                          <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 20 }}>{pt?.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#7c1d36" }}>{pt?.label}</div>
                              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#c084fc", marginTop: 3 }}>{w.duration} МИН</div>
                            </div>
                            <span style={{ fontSize: 18 }}>{ma?.pixel}</span>
                          </div>
                        );
                      })}
                      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#ff8fab", marginTop: 6, borderTop: "1px dashed #ffb3c6", paddingTop: 6 }}>
                        ИТОГО: {stats.todayMinutes} МИН ♥
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {workouts.length === 0 && (
                  <div className="pwin">
                    <div className="pwin-title"><span className="pwin-title-text">НАЧАЛО.EXE</span></div>
                    <div className="pwin-body empty-win">
                      <div style={{ fontSize: 40, marginBottom: 10 }}>🌿</div>
                      <div>НАЖМИ + ЧТОБЫ</div>
                      <div>НАЧАТЬ ПУТЬ!</div>
                      <div style={{ marginTop: 10 }}><PixelHearts filled={0} total={5} /></div>
                    </div>
                  </div>
                )}

                {/* Week Chart */}
                <div className="pwin">
                  <div className="pwin-title">
                    <span className="pwin-title-text">НЕДЕЛЯ.EXE</span>
                    <div className="win-btn">—</div>
                  </div>
                  <div className="pwin-body">
                    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 56, marginBottom: 4 }}>
                      {weekData.map((d, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                          <div style={{
                            width: "100%",
                            height: d.minutes > 0 ? `${Math.min(100, (d.minutes / 90) * 100)}%` : "4px",
                            background: d.count > 0
                              ? "repeating-linear-gradient(180deg, #ff8fab 0, #ff8fab 3px, #ffb3c6 3px, #ffb3c6 6px)"
                              : "#e8d5ff",
                            border: d.count > 0 ? "1px solid #c9607a" : "1px solid #c9b8ff",
                            imageRendering: "pixelated",
                          }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {weekData.map((d, i) => (
                        <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: "'Press Start 2P', monospace", fontSize: 5, color: d.count > 0 ? "#c9607a" : "#c9b8ff" }}>
                          {d.day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <PixelBtn
                  variant="primary"
                  style={{ width: "100%", padding: "14px", fontSize: "9px" }}
                  onClick={() => setScreen("add")}
                >
                  ♥ ЗАПИСАТЬ ТРЕНИРОВКУ ♥
                </PixelBtn>
              </>
            )}

            {/* ADD SCREEN */}
            {screen === "add" && (
              <PracticeForm
                onSubmit={handleAddWorkout}
                onHaptic={handleHaptic}
              />
            )}

            {/* PROGRESS SCREEN */}
            {screen === "progress" && (
              <>
                {/* Tab Row */}
                <div style={{ display: "flex", gap: 0, marginBottom: 12, border: "2px solid #9b72cf", boxShadow: "2px 2px 0 #7c4dab" }}>
                  {[["chart", "📊 ГРАФИКИ"], ["calendar", "📅 КАЛЕН."], ["list", "📋 ИСТОРИЯ"]].map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setProgressTab(id);
                        handleHaptic('select');
                      }}
                      style={{
                        flex: 1,
                        padding: "7px 4px",
                        border: "none",
                        borderRight: id !== "list" ? "2px solid #9b72cf" : "none",
                        background: progressTab === id ? "#9b72cf" : "#f5e6ff",
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: 6,
                        color: progressTab === id ? "white" : "#9b72cf",
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {progressTab === "chart" && (
                  <StatsChart workouts={workouts} stats={stats} />
                )}

                {progressTab === "calendar" && (
                  <Calendar workouts={workouts} onHaptic={handleHaptic} />
                )}

                {progressTab === "list" && (
                  <PracticeList
                    workouts={workouts}
                    onDelete={handleDeleteWorkout}
                    onHaptic={handleHaptic}
                  />
                )}
              </>
            )}

            {/* ACHIEVEMENTS SCREEN */}
            {screen === "achieve" && (
              <Achievements
                workouts={workouts}
                level={stats.level}
                onExport={handleExport}
                progression={progression}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <Navbar
          activeScreen={screen}
          onNavigate={handleNavigate}
          onHaptic={handleHaptic}
        />

        {/* Export Toast */}
        {exportMsg && <div className="toast">✦ ДАННЫЕ СКОПИРОВАНЫ!</div>}
      </div>
    </>
  );
}
