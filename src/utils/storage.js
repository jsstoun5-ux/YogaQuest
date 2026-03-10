/**
 * Утилиты для работы с хранилищем данных
 * Поддерживает как Telegram CloudStorage, так и localStorage
 */
import { STORAGE_KEYS } from '../constants/index.js';

/**
 * Класс для работы с хранилищем данных
 * Автоматически выбирает между Telegram CloudStorage и localStorage
 */
export class Storage {
  constructor(tg = null) {
    this.tg = tg;
    this.isTelegram = !!tg?.CloudStorage;
  }

  /**
   * Получить значение по ключу
   * @param {string} key - Ключ
   * @returns {Promise<string|null>} Значение или null
   */
  async get(key) {
    try {
      if (this.isTelegram) {
        return new Promise((resolve, reject) => {
          this.tg.CloudStorage.getItem(key, (err, value) => {
            if (err) reject(err);
            else resolve(value || null);
          });
        });
      } else {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('Storage.get error:', e);
      return null;
    }
  }

  /**
   * Сохранить значение
   * @param {string} key - Ключ
   * @param {string} value - Значение
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      if (this.isTelegram) {
        return new Promise((resolve, reject) => {
          this.tg.CloudStorage.setItem(key, value, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('Storage.set error:', e);
    }
  }

  /**
   * Удалить ключ
   * @param {string} key - Ключ
   * @returns {Promise<void>}
   */
  async remove(key) {
    try {
      if (this.isTelegram) {
        return new Promise((resolve, reject) => {
          this.tg.CloudStorage.removeItem(key, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Storage.remove error:', e);
    }
  }

  /**
   * Получить JSON-данные
   * @param {string} key - Ключ
   * @returns {Promise<any|null>} Распарсенные данные или null
   */
  async getJSON(key) {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Storage.getJSON parse error:', e);
      return null;
    }
  }

  /**
   * Сохранить JSON-данные
   * @param {string} key - Ключ
   * @param {any} data - Данные для сохранения
   * @returns {Promise<void>}
   */
  async setJSON(key, data) {
    await this.set(key, JSON.stringify(data));
  }
}

/**
 * Создать экземпляр хранилища
 * @param {object} tg - Telegram WebApp объект
 * @returns {Storage}
 */
export function createStorage(tg) {
  return new Storage(tg);
}

/**
 * Сохранить тренировки
 * @param {Storage} storage - Экземпляр хранилища
 * @param {Array} workouts - Массив тренировок
 * @returns {Promise<void>}
 */
export async function saveWorkouts(storage, workouts) {
  await storage.setJSON(STORAGE_KEYS.WORKOUTS, workouts);
}

/**
 * Загрузить тренировки
 * @param {Storage} storage - Экземпляр хранилища
 * @returns {Promise<Array>} Массив тренировок
 */
export async function loadWorkouts(storage) {
  const data = await storage.getJSON(STORAGE_KEYS.WORKOUTS);
  return Array.isArray(data) ? data : [];
}

/**
 * Сохранить флаг онбординга
 * @param {Storage} storage - Экземпляр хранилища
 * @returns {Promise<void>}
 */
export async function markOnboardingSeen(storage) {
  await storage.set(STORAGE_KEYS.ONBOARDING, "1");
}

/**
 * Проверить, пройден ли онбординг
 * @param {Storage} storage - Экземпляр хранилища
 * @returns {Promise<boolean>}
 */
export async function isOnboardingSeen(storage) {
  const value = await storage.get(STORAGE_KEYS.ONBOARDING);
  return !!value;
}

/**
 * Сохранить профиль пользователя
 * @param {Storage} storage - Экземпляр хранилища
 * @param {object} profile - Профиль пользователя
 * @returns {Promise<void>}
 */
export async function saveProfile(storage, profile) {
  await storage.setJSON(STORAGE_KEYS.USER_PROFILE, profile);
}

/**
 * Загрузить профиль пользователя
 * @param {Storage} storage - Экземпляр хранилища
 * @returns {Promise<object|null>} Профиль или null
 */
export async function loadProfile(storage) {
  return await storage.getJSON(STORAGE_KEYS.USER_PROFILE);
}