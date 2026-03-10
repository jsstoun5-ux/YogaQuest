/**
 * Утилиты для работы с хранилищем данных
 * Использует Telegram DeviceStorage как основное хранилище
 * Fallback на localStorage если DeviceStorage недоступен
 */

import { STORAGE_KEYS } from '../constants/index.js';

/**
 * Класс для работы с хранилищем данных
 * Приоритет: DeviceStorage > localStorage
 */
export class Storage {
  constructor(tg) {
    this.tg = tg;
    
    // Проверяем доступность хранилищ
    this.hasDeviceStorage = !!(tg && tg.DeviceStorage);
    this.hasLocalStorage = typeof localStorage !== 'undefined';
    
    // Определяем тип хранилища
    this.storageType = this._determineStorageType();
    
    console.log('[Storage] Initialized:', {
      storageType: this.storageType,
      hasDeviceStorage: this.hasDeviceStorage,
      hasLocalStorage: this.hasLocalStorage,
    });
  }

  /**
   * Определить тип хранилища
   */
  _determineStorageType() {
    if (this.hasDeviceStorage) {
      return 'device_storage';
    }
    if (this.hasLocalStorage) {
      return 'local_storage';
    }
    console.warn('[Storage] No storage available!');
    return 'none';
  }

  /**
   * Получить значение
   */
  async get(key) {
    if (this.storageType === 'device_storage') {
      return this._getFromDeviceStorage(key);
    }
    if (this.storageType === 'local_storage') {
      return this._getFromLocalStorage(key);
    }
    return null;
  }

  /**
   * Сохранить значение
   */
  async set(key, value) {
    if (this.storageType === 'device_storage') {
      return this._setToDeviceStorage(key, value);
    }
    if (this.storageType === 'local_storage') {
      return this._setToLocalStorage(key, value);
    }
    throw new Error('No storage available');
  }

  /**
   * Удалить значение
   */
  async remove(key) {
    if (this.storageType === 'device_storage') {
      return this._removeFromDeviceStorage(key);
    }
    if (this.storageType === 'local_storage') {
      return this._removeFromLocalStorage(key);
    }
  }

  /**
   * Получить JSON значение
   */
  async getJSON(key) {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error('[Storage] JSON parse error:', e);
      return null;
    }
  }

  /**
   * Сохранить JSON значение
   */
  async setJSON(key, value) {
    const json = JSON.stringify(value);
    return this.set(key, json);
  }

  // === DeviceStorage методы ===

  async _getFromDeviceStorage(key) {
    return new Promise((resolve, reject) => {
      this.tg.DeviceStorage.getItem(key, (err, value) => {
        if (err) {
          console.error('[Storage] DeviceStorage.getItem error:', err);
          resolve(null); // Возвращаем null вместо reject для стабильности
        } else {
          console.log('[Storage] DeviceStorage.getItem success:', key);
          resolve(value || null);
        }
      });
    });
  }

  async _setToDeviceStorage(key, value) {
    return new Promise((resolve, reject) => {
      this.tg.DeviceStorage.setItem(key, value, (err) => {
        if (err) {
          console.error('[Storage] DeviceStorage.setItem error:', err);
          reject(err);
        } else {
          console.log('[Storage] DeviceStorage.setItem success:', key);
          resolve();
        }
      });
    });
  }

  async _removeFromDeviceStorage(key) {
    return new Promise((resolve, reject) => {
      this.tg.DeviceStorage.removeItem(key, (err) => {
        if (err) {
          console.error('[Storage] DeviceStorage.removeItem error:', err);
          reject(err);
        } else {
          console.log('[Storage] DeviceStorage.removeItem success:', key);
          resolve();
        }
      });
    });
  }

  // === localStorage методы ===

  _getFromLocalStorage(key) {
    try {
      const value = localStorage.getItem(key);
      console.log('[Storage] localStorage.getItem:', key, value ? 'found' : 'not found');
      return Promise.resolve(value || null);
    } catch (e) {
      console.error('[Storage] localStorage.getItem error:', e);
      return Promise.resolve(null);
    }
  }

  _setToLocalStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      console.log('[Storage] localStorage.setItem success:', key);
      return Promise.resolve();
    } catch (e) {
      console.error('[Storage] localStorage.setItem error:', e);
      return Promise.reject(e);
    }
  }

  _removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(key);
      console.log('[Storage] localStorage.removeItem success:', key);
      return Promise.resolve();
    } catch (e) {
      console.error('[Storage] localStorage.removeItem error:', e);
      return Promise.reject(e);
    }
  }
}

// === Функции для работы с тренировками ===

/**
 * Загрузить тренировки
 */
export async function loadWorkouts(storage) {
  const data = await storage.getJSON(STORAGE_KEYS.WORKOUTS);
  return data || [];
}

/**
 * Сохранить тренировки
 */
export async function saveWorkouts(storage, workouts) {
  await storage.setJSON(STORAGE_KEYS.WORKOUTS, workouts);
}

// === Функции для онбординга ===

/**
 * Проверить, пройден ли онбординг
 */
export async function isOnboardingSeen(storage) {
  const seen = await storage.get(STORAGE_KEYS.ONBOARDING);
  return seen === 'true';
}

/**
 * Отметить онбординг как пройденный
 */
export async function markOnboardingSeen(storage) {
  await storage.set(STORAGE_KEYS.ONBOARDING, 'true');
}

// === Миграция из CloudStorage (одноразовая) ===

/**
 * Проверить и выполнить миграцию из CloudStorage в DeviceStorage
 * Вызывается один раз при инициализации
 */
export async function migrateFromCloudStorageIfNeeded(tg, targetStorage) {
  // Проверяем, есть ли CloudStorage
  if (!tg || !tg.CloudStorage) {
    console.log('[Migration] CloudStorage not available, skipping migration');
    return false;
  }

  // Проверяем, была ли уже миграция
  const migrationKey = 'yogaquest_migration_done';
  const alreadyMigrated = await targetStorage.get(migrationKey);
  if (alreadyMigrated === 'true') {
    console.log('[Migration] Already migrated, skipping');
    return false;
  }

  console.log('[Migration] Starting migration from CloudStorage...');

  try {
    // Получаем данные из CloudStorage
    const cloudData = {};
    
    const keys = [
      STORAGE_KEYS.WORKOUTS,
      STORAGE_KEYS.ONBOARDING,
      'yogaquest_profile',
    ];

    for (const key of keys) {
      const value = await new Promise((resolve) => {
        tg.CloudStorage.getItem(key, (err, val) => {
          if (err) {
            console.warn('[Migration] CloudStorage.getItem error for', key, err);
            resolve(null);
          } else {
            resolve(val);
          }
        });
      });

      if (value) {
        cloudData[key] = value;
        console.log('[Migration] Found data in CloudStorage:', key);
      }
    }

    // Сохраняем в целевое хранилище
    for (const [key, value] of Object.entries(cloudData)) {
      await targetStorage.set(key, value);
      console.log('[Migration] Migrated:', key);
    }

    // Отмечаем миграцию как выполненную
    await targetStorage.set(migrationKey, 'true');
    
    console.log('[Migration] Migration completed successfully');
    return true;
  } catch (e) {
    console.error('[Migration] Migration failed:', e);
    return false;
  }
}
