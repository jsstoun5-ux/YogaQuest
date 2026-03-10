/**
 * Storage Service
 * Сервис для работы с файловым хранилищем данных пользователей
 */
import { mkdir, readFile, writeFile, access } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Базовый путь к данным
const DATA_DIR = join(__dirname, '..', '..', 'data', 'users');

/**
 * Убедиться, что директория пользователя существует
 * @param {string} telegram_id - ID пользователя
 */
async function ensureUserDir(telegram_id) {
  const userDir = join(DATA_DIR, telegram_id.toString());
  await mkdir(userDir, { recursive: true });
  return userDir;
}

/**
 * Прочитать JSON файл
 * @param {string} filePath - Путь к файлу
 * @returns {Promise<object|null>} Данные или null
 */
async function readJsonFile(filePath) {
  try {
    await access(filePath);
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Записать JSON файл
 * @param {string} filePath - Путь к файлу
 * @param {object} data - Данные для записи
 */
async function writeJsonFile(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Получить данные пользователя
 * @param {string} telegram_id - ID пользователя
 * @returns {Promise<object|null>} Профиль пользователя
 */
export async function getUserData(telegram_id) {
  const userDir = await ensureUserDir(telegram_id);
  const profilePath = join(userDir, 'profile.json');
  return await readJsonFile(profilePath);
}

/**
 * Создать или обновить пользователя
 * @param {string} telegram_id - ID пользователя
 * @param {object} updates - Данные для обновления
 * @returns {Promise<object>} Обновлённый профиль
 */
export async function createOrUpdateUser(telegram_id, updates) {
  const userDir = await ensureUserDir(telegram_id);
  const profilePath = join(userDir, 'profile.json');
  
  const existing = await readJsonFile(profilePath) || {};
  const updated = {
    ...existing,
    ...updates,
    telegram_id: parseInt(telegram_id),
    updated_at: new Date().toISOString(),
  };
  
  await writeJsonFile(profilePath, updated);
  return updated;
}

/**
 * Получить тренировки пользователя
 * @param {string} telegram_id - ID пользователя
 * @returns {Promise<Array>} Массив тренировок
 */
export async function getWorkouts(telegram_id) {
  const userDir = await ensureUserDir(telegram_id);
  const workoutsPath = join(userDir, 'workouts.json');
  const data = await readJsonFile(workoutsPath);
  return Array.isArray(data) ? data : [];
}

/**
 * Добавить тренировку
 * @param {string} telegram_id - ID пользователя
 * @param {object} workout - Данные тренировки
 */
export async function addWorkout(telegram_id, workout) {
  const userDir = await ensureUserDir(telegram_id);
  const workoutsPath = join(userDir, 'workouts.json');
  
  const workouts = await getWorkouts(telegram_id);
  workouts.unshift(workout); // Добавляем в начало
  
  await writeJsonFile(workoutsPath, workouts);
}

/**
 * Удалить тренировку
 * @param {string} telegram_id - ID пользователя
 * @param {string} workout_id - ID тренировки
 */
export async function deleteWorkout(telegram_id, workout_id) {
  const userDir = await ensureUserDir(telegram_id);
  const workoutsPath = join(userDir, 'workouts.json');
  
  const workouts = await getWorkouts(telegram_id);
  const filtered = workouts.filter(w => w.id !== workout_id);
  
  await writeJsonFile(workoutsPath, filtered);
}

/**
 * Получить достижения пользователя
 * @param {string} telegram_id - ID пользователя
 * @returns {Promise<object>} Объект достижений
 */
export async function getAchievements(telegram_id) {
  const userDir = await ensureUserDir(telegram_id);
  const achievementsPath = join(userDir, 'achievements.json');
  return await readJsonFile(achievementsPath) || {};
}

/**
 * Обновить достижения пользователя
 * @param {string} telegram_id - ID пользователя
 * @param {object} achievements - Объект достижений
 */
export async function updateAchievements(telegram_id, achievements) {
  const userDir = await ensureUserDir(telegram_id);
  const achievementsPath = join(userDir, 'achievements.json');
  await writeJsonFile(achievementsPath, achievements);
}