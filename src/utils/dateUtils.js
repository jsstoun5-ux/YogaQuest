/**
 * Утилиты для работы с датами
 */
import { MONTH_NAMES_SHORT } from '../constants/index.js';

/**
 * Возвращает дату в формате YYYY-MM-DD в локальном часовом поясе
 * @param {Date} date - Объект даты (по умолчанию текущая)
 * @returns {string} Строка даты в формате YYYY-MM-DD
 */
export function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Форматирует дату для отображения
 * @param {string} dateStr - Строка даты в формате YYYY-MM-DD
 * @returns {string} Отформатированная строка (сегодня, вчера, или "дд мес")
 */
export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetDate = new Date(y, m - 1, d);
  const diff = Math.round((todayStart - targetDate) / 86400000);
  
  if (diff === 0) return "сегодня";
  if (diff === 1) return "вчера";
  if (diff === 2) return "позавчера";
  return `${d} ${MONTH_NAMES_SHORT[m - 1]}`;
}

/**
 * Получить дни месяца для календаря
 * @param {number} year - Год
 * @param {number} month - Месяц (1-12)
 * @returns {Array} Массив дней (null для пустых ячеек)
 */
export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Понедельник = 0, Вторник = 1, ..., Воскресенье = 6
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  
  const days = [];
  
  // Пустые ячейки в начале
  for (let i = 0; i < offset; i++) {
    days.push(null);
  }
  
  // Дни месяца
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
}

/**
 * Получить даты последних N дней
 * @param {number} count - Количество дней
 * @returns {Array<string>} Массив строк дат YYYY-MM-DD
 */
export function getLastNDays(count) {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.unshift(getLocalDateStr(date));
  }
  
  return dates;
}

/**
 * Получить статистику по дням недели
 * @param {Array} workouts - Массив тренировок
 * @param {number} daysCount - Количество дней для анализа (по умолчанию 7)
 * @returns {Array} Массив объектов {day, minutes, count}
 */
export function getWeekStats(workouts, daysCount = 7) {
  const days = [];
  const weekdayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  
  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = getLocalDateStr(date);
    const dayWorkouts = workouts.filter(w => w.date === dateStr);
    
    days.push({
      day: weekdayNames[date.getDay()],
      date: dateStr,
      minutes: dayWorkouts.reduce((sum, w) => sum + w.duration, 0),
      count: dayWorkouts.length,
    });
  }
  
  return days;
}

/**
 * Получить данные для графика настроения
 * @param {Array} workouts - Массив тренировок (отсортирован по убыванию даты)
 * @param {number} limit - Максимальное количество записей
 * @returns {Array} Массив объектов {i, before, after}
 */
export function getMoodTrendData(workouts, limit = 14) {
  return workouts
    .slice(0, limit)
    .reverse()
    .map((w, i) => ({
      i: i + 1,
      before: w.moodBefore,
      after: w.moodAfter,
    }));
}

/**
 * Проверить, является ли дата сегодняшней
 * @param {string} dateStr - Строка даты в формате YYYY-MM-DD
 * @returns {boolean}
 */
export function isToday(dateStr) {
  return dateStr === getLocalDateStr();
}

/**
 * Получить строку месяца в формате YYYY-MM
 * @param {Date} date - Объект даты
 * @returns {string} Строка месяца
 */
export function getMonthStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Разобрать строку месяца YYYY-MM
 * @param {string} monthStr - Строка месяца
 * @returns {{year: number, month: number}} Объект с годом и месяцем
 */
export function parseMonthStr(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  return { year, month };
}