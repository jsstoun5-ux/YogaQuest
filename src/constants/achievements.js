/**
 * Достижения (Achievements)
 * Каждое достижение имеет функцию проверки check(workouts)
 */

/**
 * Проверка серии дней подряд
 * @param {Array} workouts - Массив тренировок
 * @returns {number} Количество дней подряд
 */
export function calcStreak(workouts) {
  if (!workouts || workouts.length === 0) return 0;
  
  // Получаем уникальные даты и сортируем по убыванию
  const dates = [...new Set(workouts.map(w => w.date))].sort().reverse();
  
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  // Проверяем, что последняя тренировка была сегодня или вчера
  const lastDate = new Date(dates[0]);
  lastDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if ((today - lastDate) / 86400000 > 1) {
    return 0;
  }
  
  return streak;
}

/**
 * Список достижений
 * @type {Array<{id: string, icon: string, label: string, desc: string, check: Function}>}
 */
export const ACHIEVEMENTS = [
  {
    id: "first",
    icon: "🌱",
    label: "ПЕРВЫЙ ШАГ",
    desc: "1 тренировка",
    check: (workouts) => workouts.length >= 1,
  },
  {
    id: "week",
    icon: "🌙",
    label: "НЕДЕЛЬКА",
    desc: "7 тренировок",
    check: (workouts) => workouts.length >= 7,
  },
  {
    id: "month",
    icon: "🌟",
    label: "МЕСЯЦ СИЛЫ",
    desc: "30 тренировок",
    check: (workouts) => workouts.length >= 30,
  },
  {
    id: "streak7",
    icon: "🔥",
    label: "7 ДНЕЙ ОГОНЬ",
    desc: "7 дней подряд",
    check: (workouts) => calcStreak(workouts) >= 7,
  },
  {
    id: "hour",
    icon: "⏰",
    label: "ЧАС НА КОВРИК",
    desc: "60+ минут",
    check: (workouts) => workouts.some(w => w.duration >= 60),
  },
  {
    id: "allTypes",
    icon: "💎",
    label: "МАСТЕР",
    desc: "все 6 типов",
    check: (workouts) => {
      const types = new Set(workouts.map(w => w.type));
      // Исключаем "other" из проверки
      const mainTypes = ["power", "soft", "restore", "meditate", "integrate", "stretch"];
      return mainTypes.every(t => types.has(t));
    },
  },
  {
    id: "mood5",
    icon: "💖",
    label: "НА КАЙФЕ",
    desc: "настрой 5 после",
    check: (workouts) => workouts.some(w => w.moodAfter === 5),
  },
  {
    id: "total60",
    icon: "👑",
    label: "КОРОЛЕВА",
    desc: "60 тренировок",
    check: (workouts) => workouts.length >= 60,
  },
];

/**
 * Получить достижение по ID
 * @param {string} id - ID достижения
 * @returns {object|undefined} Объект достижения
 */
export function getAchievementById(id) {
  return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Получить разблокированные достижения
 * @param {Array} workouts - Массив тренировок
 * @returns {Array} Массив разблокированных достижений
 */
export function getUnlockedAchievements(workouts) {
  return ACHIEVEMENTS.filter(a => a.check(workouts));
}

/**
 * Проверить новые достижения (которые были разблокированы с прошлого раза)
 * @param {Array} workouts - Массив тренировок
 * @param {Set} prevUnlocked - Set ID ранее разблокированных достижений
 * @returns {Array} Массив новых достижений
 */
export function getNewAchievements(workouts, prevUnlocked) {
  return ACHIEVEMENTS.filter(a => a.check(workouts) && !prevUnlocked.has(a.id));
}