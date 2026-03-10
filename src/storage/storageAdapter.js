/**
 * Storage Adapter for YogaQuest
 * Единый интерфейс для работы с хранилищем данных
 * Поддерживает Telegram DeviceStorage, CloudStorage и localStorage
 */

import { STORAGE_KEYS } from '../constants/index.js';

/**
 * Типы хранилища
 */
export const STORAGE_TYPES = {
  DEVICE_STORAGE: 'device_storage',
  CLOUD_STORAGE: 'cloud_storage',
  LOCAL_STORAGE: 'local_storage',
  SERVER_STORAGE: 'server_storage',
};

/**
 * Класс для работы с хранилищем данных
 * Автоматически выбирает лучшее доступное хранилище
 */
export class StorageAdapter {
  constructor(tg = null, telegramId = null) {
    this.tg = tg;
    this.telegramId = telegramId;
    this.storageType = null;
    this.isInitialized = false;
    this.migrationNeeded = false;
    
    // Проверяем доступность различных хранилищ
    this.hasDeviceStorage = !!(tg && tg.DeviceStorage);
    this.hasCloudStorage = !!(tg && tg.CloudStorage);
    this.hasLocalStorage = typeof localStorage !== 'undefined';
    
    console.log('[StorageAdapter] Storage availability:', {
      hasDeviceStorage: this.hasDeviceStorage,
      hasCloudStorage: this.hasCloudStorage,
      hasLocalStorage: this.hasLocalStorage,
      telegramId: this.telegramId,
    });
  }

  /**
   * Инициализировать хранилище
   * Определяет тип хранилища и выполняет миграцию при необходимости
   */
  async initialize() {
    if (this.isInitialized) return this.storageType;
    
    // Приоритет: DeviceStorage > CloudStorage > localStorage
    if (this.hasDeviceStorage) {
      // Проверяем, есть ли данные в DeviceStorage
      try {
        const hasData = await this._checkDeviceStorageData();
        if (hasData) {
          this.storageType = STORAGE_TYPES.DEVICE_STORAGE;
          console.log('[StorageAdapter] Using DeviceStorage (has data)');
        } else {
          // Проверяем CloudStorage для миграции
          if (this.hasCloudStorage) {
            const cloudData = await this._checkCloudStorageData();
            if (cloudData) {
              this.migrationNeeded = true;
              console.log('[StorageAdapter] Migration needed from CloudStorage to DeviceStorage');
            }
          }
          // Используем DeviceStorage как основное
          this.storageType = STORAGE_TYPES.DEVICE_STORAGE;
          console.log('[StorageAdapter] Using DeviceStorage (empty, will migrate if needed)');
        }
      } catch (e) {
        console.warn('[StorageAdapter] DeviceStorage check failed, falling back:', e);
        this.storageType = this._getFallbackStorageType();
      }
    } else {
      this.storageType = this._getFallbackStorageType();
    }
    
    this.isInitialized = true;
    console.log('[StorageAdapter] Initialized with storage type:', this.storageType);
    
    return this.storageType;
  }

  /**
   * Получить fallback тип хранилища
   */
  _getFallbackStorageType() {
    if (this.hasCloudStorage) {
      console.log('[StorageAdapter] Using CloudStorage (fallback)');
      return STORAGE_TYPES.CLOUD_STORAGE;
    }
    console.log('[StorageAdapter] Using localStorage (fallback)');
    return STORAGE_TYPES.LOCAL_STORAGE;
  }

  /**
   * Проверить наличие данных в DeviceStorage
   */
  async _checkDeviceStorageData() {
    if (!this.hasDeviceStorage) return false;
    
    try {
      const keys = await this._getDeviceStorageKeys();
      return keys && keys.length > 0;
    } catch (e) {
      console.warn('[StorageAdapter] Failed to check DeviceStorage:', e);
      return false;
    }
  }

  /**
   * Получить ключи из DeviceStorage
   */
  async _getDeviceStorageKeys() {
    return new Promise((resolve, reject) => {
      this.tg.DeviceStorage.getKeys((error, keys) => {
        if (error) reject(error);
        else resolve(keys || []);
      });
    });
  }

  /**
   * Проверить наличие данных в CloudStorage
   */
  async _checkCloudStorageData() {
    if (!this.hasCloudStorage) return false;
    
    try {
      const workouts = await this._getFromCloudStorage(STORAGE_KEYS.WORKOUTS);
      return workouts !== null;
    } catch (e) {
      console.warn('[StorageAdapter] Failed to check CloudStorage:', e);
      return false;
    }
  }

  /**
   * Выполнить миграцию из CloudStorage в DeviceStorage
   */
  async migrateFromCloudStorage() {
    if (!this.migrationNeeded || !this.hasDeviceStorage || !this.hasCloudStorage) {
      console.log('[StorageAdapter] Migration not needed or not possible');
      return false;
    }
    
    console.log('[StorageAdapter] Starting migration from CloudStorage to DeviceStorage...');
    
    try {
      // Получаем все данные из CloudStorage
      const workouts = await this._getFromCloudStorage(STORAGE_KEYS.WORKOUTS);
      const profile = await this._getFromCloudStorage('yogaquest_profile');
      const onboarding = await this._getFromCloudStorage(STORAGE_KEYS.ONBOARDING);
      
      // Сохраняем в DeviceStorage
      if (workouts) {
        await this._setToDeviceStorage(STORAGE_KEYS.WORKOUTS, workouts);
      }
      if (profile) {
        await this._setToDeviceStorage('yogaquest_profile', profile);
      }
      if (onboarding) {
        await this._setToDeviceStorage(STORAGE_KEYS.ONBOARDING, onboarding);
      }
      
      console.log('[StorageAdapter] Migration completed successfully');
      this.migrationNeeded = false;
      return true;
    } catch (e) {
      console.error('[StorageAdapter] Migration failed:', e);
      return false;
    }
  }

  /**
   * Получить значение по ключу
   * @param {string} key - Ключ
   * @returns {Promise<string|null>} Значение или null
   */
  async get(key) {
    await this.initialize();
    
    try {
      switch (this.storageType) {
        case STORAGE_TYPES.DEVICE_STORAGE:
          return await this._getFromDeviceStorage(key);
        case STORAGE_TYPES.CLOUD_STORAGE:
          return await this._getFromCloudStorage(key);
        case STORAGE_TYPES.LOCAL_STORAGE:
        default:
          return this._getFromLocalStorage(key);
      }
    } catch (e) {
      console.error('[StorageAdapter] Get error:', e);
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
    await this.initialize();
    
    try {
      switch (this.storageType) {
        case STORAGE_TYPES.DEVICE_STORAGE:
          return await this._setToDeviceStorage(key, value);
        case STORAGE_TYPES.CLOUD_STORAGE:
          return await this._setToCloudStorage(key, value);
        case STORAGE_TYPES.LOCAL_STORAGE:
        default:
          return this._setToLocalStorage(key, value);
      }
    } catch (e) {
      console.error('[StorageAdapter] Set error:', e);
      throw e;
    }
  }

  /**
   * Удалить ключ
   * @param {string} key - Ключ
   * @returns {Promise<void>}
   */
  async remove(key) {
    await this.initialize();
    
    try {
      switch (this.storageType) {
        case STORAGE_TYPES.DEVICE_STORAGE:
          return await this._removeFromDeviceStorage(key);
        case STORAGE_TYPES.CLOUD_STORAGE:
          return await this._removeFromCloudStorage(key);
        case STORAGE_TYPES.LOCAL_STORAGE:
        default:
          return this._removeFromLocalStorage(key);
      }
    } catch (e) {
      console.warn('[StorageAdapter] Remove error:', e);
    }
  }

  // === DeviceStorage методы ===

  async _getFromDeviceStorage(key) {
    return new Promise((resolve, reject) => {
      this.tg.DeviceStorage.getItem(key, (error, value) => {
        if (error) {
          console.error('[StorageAdapter] DeviceStorage.getItem error:', error);
          reject(error);
        } else {
          console.log('[StorageAdapter] DeviceStorage.getItem success:', key);
          resolve(value || null);
        }
      });
    });
  }

  async _setToDeviceStorage(key, value) {
    return new Promise((resolve, reject) => {
      this.tg.DeviceStorage.setItem(key, value, (error) => {
        if (error) {
          console.error('[StorageAdapter] DeviceStorage.setItem error:', error);
          reject(error);
        } else {
          console.log('[StorageAdapter] DeviceStorage.setItem success:', key);
          resolve();
        }
      });
    });
  }

  async _removeFromDeviceStorage(key) {
    return new Promise((resolve, reject) => {
      this.tg.DeviceStorage.removeItem(key, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  // === CloudStorage методы ===

  async _getFromCloudStorage(key) {
    return new Promise((resolve, reject) => {
      this.tg.CloudStorage.getItem(key, (error, value) => {
        if (error) {
          console.error('[StorageAdapter] CloudStorage.getItem error:', error);
          reject(error);
        } else {
          console.log('[StorageAdapter] CloudStorage.getItem success:', key);
          resolve(value || null);
        }
      });
    });
  }

  async _setToCloudStorage(key, value) {
    return new Promise((resolve, reject) => {
      this.tg.CloudStorage.setItem(key, value, (error) => {
        if (error) {
          console.error('[StorageAdapter] CloudStorage.setItem error:', error);
          reject(error);
        } else {
          console.log('[StorageAdapter] CloudStorage.setItem success:', key);
          resolve();
        }
      });
    });
  }

  async _removeFromCloudStorage(key) {
    return new Promise((resolve, reject) => {
      this.tg.CloudStorage.removeItem(key, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  // === localStorage методы ===

  _getFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    console.log('[StorageAdapter] localStorage.getItem:', key);
    return value;
  }

  _setToLocalStorage(key, value) {
    localStorage.setItem(key, value);
    console.log('[StorageAdapter] localStorage.setItem:', key);
  }

  _removeFromLocalStorage(key) {
    localStorage.removeItem(key);
  }

  // === JSON методы ===

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
      console.warn('[StorageAdapter] JSON parse error:', e);
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

  // === Специализированные методы ===

  /**
   * Сохранить тренировки
   * @param {Array} workouts - Массив тренировок
   * @returns {Promise<void>}
   */
  async saveWorkouts(workouts) {
    await this.setJSON(STORAGE_KEYS.WORKOUTS, workouts);
  }

  /**
   * Загрузить тренировки
   * @returns {Promise<Array>} Массив тренировок
   */
  async loadWorkouts() {
    const data = await this.getJSON(STORAGE_KEYS.WORKOUTS);
    return Array.isArray(data) ? data : [];
  }

  /**
   * Сохранить профиль пользователя
   * @param {object} profile - Профиль пользователя
   * @returns {Promise<void>}
   */
  async saveProfile(profile) {
    await this.setJSON('yogaquest_profile', profile);
  }

  /**
   * Загрузить профиль пользователя
   * @returns {Promise<object|null>} Профиль или null
   */
  async loadProfile() {
    return await this.getJSON('yogaquest_profile');
  }

  /**
   * Сохранить флаг онбординга
   * @returns {Promise<void>}
   */
  async markOnboardingSeen() {
    await this.set(STORAGE_KEYS.ONBOARDING, "1");
  }

  /**
   * Проверить, пройден ли онбординг
   * @returns {Promise<boolean>}
   */
  async isOnboardingSeen() {
    const value = await this.get(STORAGE_KEYS.ONBOARDING);
    return !!value;
  }

  /**
   * Получить тип используемого хранилища
   * @returns {string|null} Тип хранилища
   */
  getStorageType() {
    return this.storageType;
  }

  /**
   * Проверить, нужна ли миграция
   * @returns {boolean}
   */
  isMigrationNeeded() {
    return this.migrationNeeded;
  }
}

/**
 * Создать экземпляр адаптера хранилища
 * @param {object} tg - Telegram WebApp объект
 * @param {string|number} telegramId - ID пользователя Telegram
 * @returns {StorageAdapter}
 */
export function createStorageAdapter(tg, telegramId) {
  return new StorageAdapter(tg, telegramId);
}

export default StorageAdapter;
