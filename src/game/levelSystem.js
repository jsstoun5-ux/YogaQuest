/**
 * Level System for YogaQuest
 * Система уровней как смысловой путь практики
 */

/**
 * Таблица уровней с названиями и описаниями
 * Основана на XP, а не на количестве тренировок
 */
export const LEVEL_TABLE = [
  {
    level: 1,
    title: "Семя внимания",
    titleEn: "Seed of Attention",
    subtitle: "Каждый путь начинается с первого шага.",
    description: "Ты посадила семя. Оно ещё не видно, но оно уже есть.",
    xpFrom: 0,
    xpTo: 39,
    icon: "🌱",
  },
  {
    level: 2,
    title: "Первый вдох",
    titleEn: "First Breath",
    subtitle: "Ты учишься возвращаться к себе.",
    description: "Первые практики — это первые вдохи осознанности.",
    xpFrom: 40,
    xpTo: 89,
    icon: "🌬️",
  },
  {
    level: 3,
    title: "Идущая по пути",
    titleEn: "Walking the Path",
    subtitle: "Практика становится частью твоего ритма.",
    description: "Ты больше не просто пробуешь. Ты идёшь.",
    xpFrom: 90,
    xpTo: 159,
    icon: "🚶‍♀️",
  },
  {
    level: 4,
    title: "Хранительница ритма",
    titleEn: "Keeper of Rhythm",
    subtitle: "Ты находишь устойчивость в возвращении.",
    description: "Ритм практики начинает держать тебя, когда день держит плохо.",
    xpFrom: 160,
    xpTo: 249,
    icon: "🌙",
  },
  {
    level: 5,
    title: "Слушающая тело",
    titleEn: "Listening to the Body",
    subtitle: "Тело начинает говорить, и ты учишься слышать.",
    description: "Практика перестаёт быть внешней задачей и становится диалогом.",
    xpFrom: 250,
    xpTo: 369,
    icon: "🦢",
  },
  {
    level: 6,
    title: "Собирающая тишину",
    titleEn: "Gathering Silence",
    subtitle: "Ты учишься находить пространство внутри дня.",
    description: "Практика перестаёт быть случайностью и становится местом возвращения.",
    xpFrom: 370,
    xpTo: 519,
    icon: "🤫",
  },
  {
    level: 7,
    title: "Держащая равновесие",
    titleEn: "Holder of Balance",
    subtitle: "Ты находишь опору внутри себя.",
    description: "Равновесие — это не точка, а процесс. Ты это чувствуешь.",
    xpFrom: 520,
    xpTo: 709,
    icon: "⚖️",
  },
  {
    level: 8,
    title: "Несущая свет",
    titleEn: "Bearer of Light",
    subtitle: "Твоя практика начинает светиться.",
    description: "То, что ты выращиваешь внутри, становится заметно снаружи.",
    xpFrom: 710,
    xpTo: 949,
    icon: "✨",
  },
  {
    level: 9,
    title: "Садовница практики",
    titleEn: "Gardener of Practice",
    subtitle: "Ты выращиваешь пространство своей жизни.",
    description: "Практика — это не то, что ты делаешь. Это то, чем ты живёшь.",
    xpFrom: 950,
    xpTo: 1249,
    icon: "🌷",
  },
  {
    level: 10,
    title: "Тихая наставница",
    titleEn: "Quiet Guide",
    subtitle: "Твой путь начинает вдохновлять других.",
    description: "Тишина твоей практики говорит громче слов.",
    xpFrom: 1250,
    xpTo: 1619,
    icon: "🪷",
  },
  {
    level: 11,
    title: "Поток дыхания",
    titleEn: "Breath of Flow",
    subtitle: "Дыхание становится твоим компасом.",
    description: "Ты больше не ищешь практику. Она находит тебя.",
    xpFrom: 1620,
    xpTo: 2069,
    icon: "💨",
  },
  {
    level: 12,
    title: "Лотос рассвета",
    titleEn: "Lotus of Dawn",
    subtitle: "Каждое утро — возможность начать заново.",
    description: "Лотос растёт из ила, но цветёт на свету. Ты это понимаешь.",
    xpFrom: 2070,
    xpTo: 2609,
    icon: "🪷",
  },
  {
    level: 13,
    title: "Лунная устойчивость",
    titleEn: "Moonlit Steadiness",
    subtitle: "Твоя устойчивость не зависит от внешнего света.",
    description: "Даже в темноте ты знаешь, где твоя опора.",
    xpFrom: 2610,
    xpTo: 3249,
    icon: "🌙",
  },
  {
    level: 14,
    title: "Сердце мантры",
    titleEn: "Heart of Mantra",
    subtitle: "Повторение становится глубиной.",
    description: "Ты понимаешь, что возвращение — это не повторение, а углубление.",
    xpFrom: 3250,
    xpTo: 3999,
    icon: "💜",
  },
  {
    level: 15,
    title: "Пространство ясности",
    titleEn: "Space of Clarity",
    subtitle: "Ты видишь вещи такими, какие они есть.",
    description: "Ясность приходит не от усилия, а от пространства, которое ты создаёшь.",
    xpFrom: 4000,
    xpTo: 4879,
    icon: "🔮",
  },
  {
    level: 16,
    title: "Проводница покоя",
    titleEn: "Conductor of Calm",
    subtitle: "Твой покой становится ресурсом для других.",
    description: "Ты не просто хранишь покой — ты делишься им.",
    xpFrom: 4880,
    xpTo: 5899,
    icon: "🕊️",
  },
  {
    level: 17,
    title: "Внутренняя опора",
    titleEn: "Inner Support",
    subtitle: "Ты больше не ищешь опору снаружи.",
    description: "Самая надёжная опора — та, которую ты выращиваешь внутри.",
    xpFrom: 5900,
    xpTo: 7079,
    icon: "🏔️",
  },
  {
    level: 18,
    title: "Сияние присутствия",
    titleEn: "Radiance of Presence",
    subtitle: "Твоё присутствие меняет пространство.",
    description: "Ты не делаешь ничего особенного. Ты просто здесь.",
    xpFrom: 7080,
    xpTo: 8439,
    icon: "🌟",
  },
  {
    level: 19,
    title: "Сад безмятежности",
    titleEn: "Garden of Serenity",
    subtitle: "Ты выращиваешь сад внутри себя.",
    description: "Сад не завершён. Он просто стал домом.",
    xpFrom: 8440,
    xpTo: 9999,
    icon: "🌸",
  },
  {
    level: 20,
    title: "Путь без конца",
    titleEn: "Endless Path",
    subtitle: "Путь не заканчивается. Он только начинается.",
    description: "Нет вершины. Есть только путь. И ты на нём.",
    xpFrom: 10000,
    xpTo: Infinity,
    icon: "♾️",
  },
];

/**
 * Получить уровень по количеству XP
 * @param {number} totalXP - Общее количество XP
 * @returns {object} Объект уровня
 */
export function getLevelByXP(totalXP) {
  // Ищем уровень, к которому относится XP
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_TABLE[i].xpFrom) {
      return LEVEL_TABLE[i];
    }
  }
  return LEVEL_TABLE[0];
}

/**
 * Получить прогресс до следующего уровня
 * @param {number} totalXP - Общее количество XP
 * @returns {object} Объект с информацией о прогрессе
 */
export function getLevelProgress(totalXP) {
  const currentLevel = getLevelByXP(totalXP);
  const levelIndex = LEVEL_TABLE.findIndex(l => l.level === currentLevel.level);
  const nextLevel = levelIndex < LEVEL_TABLE.length - 1 ? LEVEL_TABLE[levelIndex + 1] : null;
  
  // Если максимальный уровень
  if (!nextLevel || nextLevel.xpTo === Infinity) {
    return {
      currentLevel,
      nextLevel: null,
      currentXP: totalXP,
      xpToNextLevel: 0,
      xpInCurrentLevel: totalXP - currentLevel.xpFrom,
      xpNeededForNext: 0,
      progress: 100,
      progressPercent: 100,
      isMaxLevel: true,
    };
  }
  
  const xpInCurrentLevel = totalXP - currentLevel.xpFrom;
  const xpNeededForNext = nextLevel.xpFrom - currentLevel.xpFrom;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));
  
  return {
    currentLevel,
    nextLevel,
    currentXP: totalXP,
    xpToNextLevel: nextLevel.xpFrom - totalXP,
    xpInCurrentLevel,
    xpNeededForNext,
    progress: xpInCurrentLevel / xpNeededForNext,
    progressPercent,
    isMaxLevel: false,
  };
}

/**
 * Проверить, достигнут ли новый уровень
 * @param {number} previousXP - Предыдущее количество XP
 * @param {number} newXP - Новое количество XP
 * @returns {object|null} Новый уровень или null
 */
export function checkLevelUp(previousXP, newXP) {
  const previousLevel = getLevelByXP(previousXP);
  const newLevel = getLevelByXP(newXP);
  
  if (newLevel.level > previousLevel.level) {
    return {
      previousLevel,
      newLevel,
      levelsGained: newLevel.level - previousLevel.level,
    };
  }
  
  return null;
}

/**
 * Получить все уровни до указанного
 * @param {number} maxLevel - Максимальный уровень
 * @returns {Array} Массив уровней
 */
export function getLevelsUpTo(maxLevel) {
  return LEVEL_TABLE.filter(l => l.level <= maxLevel);
}

/**
 * Получить информацию об уровне по номеру
 * @param {number} levelNumber - Номер уровня (1-20)
 * @returns {object|undefined} Объект уровня
 */
export function getLevelByNumber(levelNumber) {
  return LEVEL_TABLE.find(l => l.level === levelNumber);
}

/**
 * Получить краткое описание уровня для UI
 * @param {object} level - Объект уровня
 * @returns {string} Краткое описание
 */
export function getLevelShortDescription(level) {
  return `Уровень ${level.level} — ${level.title}`;
}

/**
 * Получить полный текст уровня для отображения
 * @param {object} level - Объект уровня
 * @returns {string} Полный текст
 */
export function getLevelFullText(level) {
  return `${level.icon} ${level.level}. ${level.title}\n${level.subtitle}\n\n${level.description}`;
}

/**
 * Рассчитать XP, необходимый для достижения уровня
 * @param {number} targetLevel - Целевой уровень
 * @returns {number} Необходимое количество XP
 */
export function getXPForLevel(targetLevel) {
  const level = LEVEL_TABLE.find(l => l.level === targetLevel);
  return level ? level.xpFrom : Infinity;
}

/**
 * Получить статистику уровней
 * @param {number} totalXP - Общее количество XP
 * @returns {object} Статистика
 */
export function getLevelStats(totalXP) {
  const progress = getLevelProgress(totalXP);
  const levelsCompleted = progress.currentLevel.level - 1;
  const totalLevels = LEVEL_TABLE.length;
  
  return {
    currentLevel: progress.currentLevel,
    nextLevel: progress.nextLevel,
    levelsCompleted,
    totalLevels,
    levelsRemaining: totalLevels - levelsCompleted - 1,
    progress,
  };
}

export default {
  LEVEL_TABLE,
  getLevelByXP,
  getLevelProgress,
  checkLevelUp,
  getLevelsUpTo,
  getLevelByNumber,
  getLevelShortDescription,
  getLevelFullText,
  getXPForLevel,
  getLevelStats,
};
