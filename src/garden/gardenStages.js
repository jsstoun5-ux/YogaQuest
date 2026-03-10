/**
 * Garden Stages for YogaQuest
 * Стадии развития сада практики
 */

/**
 * Стадии сада
 * Каждая стадия соответствует определённому количеству практик
 */
export const GARDEN_STAGES = [
  {
    stage: 0,
    id: 'empty_plot',
    title: 'Пустой участок',
    titleEn: 'Empty Plot',
    description: 'Каждый путь начинается с места, куда однажды захочется вернуться.',
    minPractices: 0,
    maxPractices: 0,
    icon: '🟫',
    timeOfDay: 'day',
    elements: ['ground', 'single_stone'],
    colors: {
      background: '#FCE7F3',
      ground: '#D6B38A',
      accent: '#e8d5ff',
    },
  },
  {
    stage: 1,
    id: 'first_moss',
    title: 'Первый мох',
    titleEn: 'First Moss',
    description: 'Земля услышала первый шаг.',
    minPractices: 1,
    maxPractices: 2,
    icon: '🌿',
    timeOfDay: 'day',
    elements: ['ground', 'moss', 'small_grass'],
    colors: {
      background: '#FCE7F3',
      ground: '#D6B38A',
      grass: '#9CD67A',
      accent: '#c9b8ff',
    },
  },
  {
    stage: 2,
    id: 'sprouts_of_attention',
    title: 'Ростки внимания',
    titleEn: 'Sprouts of Attention',
    description: 'То, к чему возвращаются, начинает расти.',
    minPractices: 3,
    maxPractices: 6,
    icon: '🌱',
    timeOfDay: 'day',
    elements: ['ground', 'grass', 'sprouts', 'soft_sparks'],
    colors: {
      background: '#FCE7F3',
      ground: '#D6B38A',
      grass: '#9CD67A',
      sprout: '#7FC97F',
      accent: '#FF9EC7',
    },
  },
  {
    stage: 3,
    id: 'blooming_rhythm',
    title: 'Цветение ритма',
    titleEn: 'Blooming Rhythm',
    description: 'Ритм приносит цветение.',
    minPractices: 7,
    maxPractices: 14,
    icon: '🌸',
    timeOfDay: 'day',
    elements: ['ground', 'grass', 'flowers', 'decorative_stone', 'petals'],
    colors: {
      background: '#FCE7F3',
      ground: '#D6B38A',
      grass: '#9CD67A',
      flower: '#FF9EC7',
      stone: '#a8a8a8',
      accent: '#C9B8FF',
    },
  },
  {
    stage: 4,
    id: 'stones_of_peace',
    title: 'Камни покоя',
    titleEn: 'Stones of Peace',
    description: 'Практика начинает держать тебя, когда день держит плохо.',
    minPractices: 15,
    maxPractices: 24,
    icon: '🪨',
    timeOfDay: 'day',
    elements: ['ground', 'stones', 'path', 'stable_plants', 'grass'],
    colors: {
      background: '#FCE7F3',
      ground: '#D6B38A',
      grass: '#9CD67A',
      stone: '#b8b8b8',
      path: '#c9b8a8',
      accent: '#A8D8F0',
    },
  },
  {
    stage: 5,
    id: 'tree_of_steadiness',
    title: 'Дерево устойчивости',
    titleEn: 'Tree of Steadiness',
    description: 'Корни растут в тишине.',
    minPractices: 25,
    maxPractices: 39,
    icon: '🌳',
    timeOfDay: 'sunset',
    elements: ['ground', 'tree', 'grass', 'fireflies', 'flowers'],
    colors: {
      background: '#fde4cf',
      ground: '#D6B38A',
      grass: '#9CD67A',
      tree: '#5a8a4a',
      firefly: '#F7D774',
      accent: '#FF9EC7',
    },
  },
  {
    stage: 6,
    id: 'water_of_attention',
    title: 'Вода внимания',
    titleEn: 'Water of Attention',
    description: 'В неподвижности появляется отражение.',
    minPractices: 40,
    maxPractices: 59,
    icon: '💧',
    timeOfDay: 'evening',
    elements: ['ground', 'pond', 'flowers', 'reflection', 'grass'],
    colors: {
      background: '#e8d5ff',
      ground: '#D6B38A',
      water: '#8ED6E8',
      grass: '#9CD67A',
      flower: '#FF9EC7',
      accent: '#C9B8FF',
    },
  },
  {
    stage: 7,
    id: 'lotus_and_lanterns',
    title: 'Лотос и фонари',
    titleEn: 'Lotus and Lanterns',
    description: 'То, что питалось вниманием, начинает светиться.',
    minPractices: 60,
    maxPractices: 89,
    icon: '🪷',
    timeOfDay: 'night',
    elements: ['ground', 'lotus', 'lanterns', 'pond', 'evening_lights', 'petals'],
    colors: {
      background: '#7E6AA8',
      ground: '#8a7355',
      water: '#6ab8c9',
      lotus: '#FF9EC7',
      lantern: '#F7D774',
      accent: '#ffd700',
    },
  },
  {
    stage: 8,
    id: 'garden_of_serenity',
    title: 'Сад безмятежности',
    titleEn: 'Garden of Serenity',
    description: 'Сад не завершён. Он просто стал домом.',
    minPractices: 90,
    maxPractices: Infinity,
    icon: '🌸',
    timeOfDay: 'night',
    elements: ['ground', 'tree', 'pond', 'lotus', 'stones', 'lanterns', 'petals', 'fireflies', 'bridge'],
    colors: {
      background: '#5D4B8A',
      ground: '#8a7355',
      water: '#6ab8c9',
      tree: '#4a7a3a',
      lotus: '#FF9EC7',
      lantern: '#F7D774',
      stone: '#b8b8b8',
      firefly: '#F7D774',
      accent: '#ffd700',
    },
  },
];

/**
 * Получить стадию сада по количеству практик
 * @param {number} practiceCount - Количество практик
 * @returns {object} Объект стадии сада
 */
export function getGardenStage(practiceCount) {
  for (let i = GARDEN_STAGES.length - 1; i >= 0; i--) {
    if (practiceCount >= GARDEN_STAGES[i].minPractices) {
      return GARDEN_STAGES[i];
    }
  }
  return GARDEN_STAGES[0];
}

/**
 * Получить прогресс до следующей стадии сада
 * @param {number} practiceCount - Количество практик
 * @returns {object} Объект с прогрессом
 */
export function getGardenProgress(practiceCount) {
  const currentStage = getGardenStage(practiceCount);
  const stageIndex = GARDEN_STAGES.findIndex(s => s.stage === currentStage.stage);
  const nextStage = stageIndex < GARDEN_STAGES.length - 1 ? GARDEN_STAGES[stageIndex + 1] : null;
  
  // Если максимальная стадия
  if (!nextStage || nextStage.maxPractices === Infinity) {
    return {
      currentStage,
      nextStage: null,
      practicesInCurrentStage: practiceCount - currentStage.minPractices,
      practicesNeededForNext: 0,
      progress: 1,
      progressPercent: 100,
      isMaxStage: true,
    };
  }
  
  const practicesInCurrentStage = practiceCount - currentStage.minPractices;
  const practicesNeededForNext = nextStage.minPractices - currentStage.minPractices;
  const progress = practicesInCurrentStage / practicesNeededForNext;
  
  return {
    currentStage,
    nextStage,
    practicesInCurrentStage,
    practicesNeededForNext,
    progress: Math.min(1, Math.max(0, progress)),
    progressPercent: Math.round(Math.min(100, Math.max(0, progress * 100))),
    isMaxStage: false,
  };
}

/**
 * Проверить, достигнута ли новая стадия сада
 * @param {number} previousCount - Предыдущее количество практик
 * @param {number} newCount - Новое количество практик
 * @returns {object|null} Информация о новой стадии или null
 */
export function checkGardenStageUp(previousCount, newCount) {
  const previousStage = getGardenStage(previousCount);
  const newStage = getGardenStage(newCount);
  
  if (newStage.stage > previousStage.stage) {
    return {
      previousStage,
      newStage,
      stagesGained: newStage.stage - previousStage.stage,
    };
  }
  
  return null;
}

/**
 * Получить все стадии до указанной
 * @param {number} maxStage - Максимальная стадия
 * @returns {Array} Массив стадий
 */
export function getStagesUpTo(maxStage) {
  return GARDEN_STAGES.filter(s => s.stage <= maxStage);
}

/**
 * Получить стадию по номеру
 * @param {number} stageNumber - Номер стадии (0-8)
 * @returns {object|undefined} Объект стадии
 */
export function getStageByNumber(stageNumber) {
  return GARDEN_STAGES.find(s => s.stage === stageNumber);
}

/**
 * Получить описание времени суток для стадии
 * @param {object} stage - Объект стадии
 * @returns {object} Описание времени суток
 */
export function getStageTimeOfDay(stage) {
  const timeDescriptions = {
    day: {
      label: 'День',
      icon: '☀️',
      gradient: 'linear-gradient(180deg, #FCE7F3 0%, #FDF2F8 100%)',
    },
    sunset: {
      label: 'Закат',
      icon: '🌅',
      gradient: 'linear-gradient(180deg, #fde4cf 0%, #FCE7F3 100%)',
    },
    evening: {
      label: 'Вечер',
      icon: '🌆',
      gradient: 'linear-gradient(180deg, #e8d5ff 0%, #fde4cf 100%)',
    },
    night: {
      label: 'Ночь',
      icon: '🌙',
      gradient: 'linear-gradient(180deg, #5D4B8A 0%, #7E6AA8 100%)',
    },
  };
  
  return timeDescriptions[stage.timeOfDay] || timeDescriptions.day;
}

/**
 * Получить CSS-переменные для цветов стадии
 * @param {object} stage - Объект стадии
 * @returns {object} CSS-переменные
 */
export function getStageCSSVariables(stage) {
  const colors = stage.colors;
  return {
    '--garden-bg': colors.background,
    '--garden-ground': colors.ground,
    '--garden-accent': colors.accent,
    '--garden-grass': colors.grass || '#9CD67A',
    '--garden-water': colors.water || '#8ED6E8',
    '--garden-lantern': colors.lantern || '#F7D774',
  };
}

/**
 * Получить краткое описание стадии для UI
 * @param {object} stage - Объект стадии
 * @returns {string} Краткое описание
 */
export function getStageShortDescription(stage) {
  return `${stage.icon} ${stage.title}`;
}

/**
 * Получить полный текст стадии для отображения
 * @param {object} stage - Объект стадии
 * @returns {string} Полный текст
 */
export function getStageFullText(stage) {
  return `${stage.icon} ${stage.title}\n${stage.description}`;
}

export default {
  GARDEN_STAGES,
  getGardenStage,
  getGardenProgress,
  checkGardenStageUp,
  getStagesUpTo,
  getStageByNumber,
  getStageTimeOfDay,
  getStageCSSVariables,
  getStageShortDescription,
  getStageFullText,
};