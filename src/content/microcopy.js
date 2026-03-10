/**
 * Microcopy for YogaQuest
 * Тексты для UI: мягкие, поддерживающие, созерцательные
 */

/**
 * Общие сообщения
 */
export const GENERAL_MICROCOPY = {
  // Приветствия
  welcome: 'Добро пожаловать в пространство практики',
  welcomeBack: 'Рада видеть тебя снова',
  goodMorning: 'Доброе утро, практикующая',
  goodDay: 'Прекрасный день для практики',
  goodEvening: 'Вечер — время для возвращения к себе',
  
  // Мотивация
  keepGoing: 'Продолжай, ты на верном пути',
  smallSteps: 'Маленькие шаги меняют пространство жизни',
  rhythmOverIdeal: 'Ритм важнее идеала',
  returnIsKey: 'Возвращение — это и есть практика',
  
  // Поддержка
  noPressure: 'Не дави на себя. Практика умеет ждать.',
  restIsOkay: 'Отдых — тоже часть пути',
  imperfectIsOkay: 'Несовершенная практика лучше идеального непрактикования',
  tomorrowIsNew: 'Завтра — новый день, новый вдох',
};

/**
 * Сообщения о прогрессе
 */
export const PROGRESS_MICROCOPY = {
  // XP
  xpGained: 'Практика завершена',
  xpBreakdown: 'Твой рост',
  
  // Уровни
  levelUp: 'Новый уровень осознанности',
  levelProgress: 'Твой путь продолжается',
  
  // Серии
  streakMaintained: 'Серия продолжается',
  streakBroken: 'Новая серия может начаться сегодня',
  streakMilestone: 'Отметка серии достигнута',
  
  // Возвращение
  returnBonus: 'Возвращение — тоже часть пути',
  welcomeBackAfter: 'Практика умеет ждать. Рада твоему возвращению.',
};

/**
 * Сообщения о достижениях
 */
export const ACHIEVEMENT_MICROCOPY = {
  unlocked: 'Достижение открыто',
  newAchievement: 'Новый шаг на пути',
  progress: 'Твой путь отмечен',
  milestone: 'Важная отметка достигнута',
  
  // Конкретные достижения
  first_bow: 'Первый поклон — начало пути',
  three_returns: 'Три возвращения — ритм зарождается',
  quiet_flame: 'Тихий огонь горит устойчиво',
  seven_dawns: 'Семь рассветов — неделя осознанности',
  lunar_cycle: 'Лунный круг — две недели практики',
  roots_of_steadiness: 'Корни устойчивости глубоки',
};

/**
 * Сообщения об ошибках и предупреждения
 */
export const ERROR_MICROCOPY = {
  // Мягкие предупреждения
  suspiciousPractice: 'Похожая практика уже была записана недавно. Всё верно?',
  dailyLimitReached: 'Сегодня уже много практик. Качество важнее количества.',
  
  // Ошибки
  saveError: 'Не удалось сохранить. Попробуй ещё раз.',
  loadError: 'Не удалось загрузить данные. Обнови страницу.',
  networkError: 'Проблема с соединением. Практика подождёт.',
};

/**
 * Подсказки для форм
 */
export const FORM_MICROCOPY = {
  // Тип практики
  practiceTypeHint: 'Выбери тип практики, который ближе всего к тому, что ты делала',
  
  // Длительность
  durationHint: 'Длительность не важна для "успеха". Важна честность.',
  
  // Настроение
  moodBeforeHint: 'Как ты себя чувствуешь перед практикой?',
  moodAfterHint: 'Как ты себя чувствуешь после?',
  moodNote: 'Настроение может не меняться. Это тоже практика.',
  
  // Заметки
  notePlaceholder: 'Оставь заметку для себя (необязательно)',
};

/**
 * Тексты для пустых состояний
 */
export const EMPTY_STATE_MICROCOPY = {
  noWorkouts: 'Пока нет практик. Нажми + чтобы начать.',
  noAchievements: 'Достижения появятся по мере практики',
  emptyHistory: 'История практики пуста. Самое время начать.',
};

/**
 * Тексты для кнопок и действий
 */
export const ACTION_MICROCOPY = {
  addPractice: 'Записать практику',
  savePractice: 'Сохранить практику',
  viewAchievements: 'Достижения',
  viewStats: 'Статистика',
  close: 'Закрыть',
  continue: 'Продолжить',
  startJourney: 'Начать путь',
};

/**
 * Тексты для онбординга
 */
export const ONBOARDING_MICROCOPY = {
  step1: {
    title: 'YogaQuest',
    subtitle: 'Пространство практики',
    text: 'Твой личный дневник практики. Отслеживай тренировки, настроение и рост.',
  },
  step2: {
    title: 'Прогресс',
    subtitle: 'Твой путь',
    text: 'Каждая практика откладывается в саду. Наблюдай, как он растёт.',
  },
  step3: {
    title: 'Достижения',
    subtitle: 'Отметки пути',
    text: 'За регулярность и глубину практики — получай достижения.',
  },
  step4: {
    title: 'Готова!',
    subtitle: 'Начало',
    text: 'Нажми + внизу экрана, чтобы записать первую практику.',
  },
};

/**
 * Случайные вдохновляющие сообщения
 */
export const INSPIRATIONAL_QUOTES = [
  'Практика — это возвращение к себе.',
  'Каждый вдох — новая возможность.',
  'Тело помнит то, что ум забывает.',
  'Ритм важнее интенсивности.',
  'Мягкость — это сила.',
  'Присутствие — это практика.',
  'Возвращение — это путь.',
  'Тишина говорит громче слов.',
  'Корни растут в тишине.',
  'Цветение приходит само.',
];

/**
 * Получить случайное вдохновляющее сообщение
 * @returns {string} Случайное сообщение
 */
export function getRandomInspirationalQuote() {
  return INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
}

/**
 * Получить приветствие по времени суток
 * @param {number} hour - Час (0-23)
 * @returns {string} Приветствие
 */
export function getGreetingByTime(hour) {
  if (hour >= 5 && hour < 12) {
    return GENERAL_MICROCOPY.goodMorning;
  } else if (hour >= 12 && hour < 18) {
    return GENERAL_MICROCOPY.goodDay;
  } else {
    return GENERAL_MICROCOPY.goodEvening;
  }
}

/**
 * Получить сообщение о серии
 * @param {number} streak - Текущая серия
 * @returns {string} Сообщение
 */
export function getStreakMessage(streak) {
  if (streak === 0) {
    return 'Новая серия может начаться сегодня.';
  } else if (streak === 1) {
    return 'Первый день серии. Хорошее начало.';
  } else if (streak < 7) {
    return `Серия: ${streak} дней. Продолжай!`;
  } else if (streak < 30) {
    return `Серия: ${streak} дней. Устойчивый ритм.`;
  } else {
    return `Серия: ${streak} дней. Впечатляющая преданность.`;
  }
}

/**
 * Получить сообщение о разрыве серии
 * @returns {string} Сообщение
 */
export function getStreakBrokenMessage() {
  const messages = [
    'Практика умеет ждать.',
    'Новая серия может начаться сегодня.',
    'Возвращение — тоже часть пути.',
    'Каждый день — новое начало.',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export default {
  GENERAL_MICROCOPY,
  PROGRESS_MICROCOPY,
  GARDEN_MICROCOPY,
  ACHIEVEMENT_MICROCOPY,
  ERROR_MICROCOPY,
  FORM_MICROCOPY,
  EMPTY_STATE_MICROCOPY,
  ACTION_MICROCOPY,
  ONBOARDING_MICROCOPY,
  INSPIRATIONAL_QUOTES,
  getRandomInspirationalQuote,
  getGreetingByTime,
  getStreakMessage,
  getStreakBrokenMessage,
};