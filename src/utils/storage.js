/**
 * Утилиты для работы с хранилищем данных
 * 
 * DEPRECATED: This file is kept for backward compatibility.
 * All new code should use StorageManager from '../storage/StorageManager.js'
 * 
 * This module now re-exports from the centralized StorageManager.
 */

import { 
  getStorageManager, 
  initializeStorage, 
  isStorageInitialized,
  getStorageDiagnostics,
  STORAGE_KEYS 
} from '../storage/StorageManager.js';

// Re-export STORAGE_KEYS for backward compatibility
export { STORAGE_KEYS };

/**
 * Get the storage manager instance
 * @deprecated Use getStorageManager from '../storage/StorageManager.js'
 */
export function getStorage(tg) {
  return getStorageManager(tg);
}

/**
 * Load workouts from storage
 * @deprecated Use storageManager.loadWorkouts() directly
 */
export async function loadWorkouts(storage) {
  return storage.loadWorkouts();
}

/**
 * Save workouts to storage
 * @deprecated Use storageManager.saveWorkouts() directly
 */
export async function saveWorkouts(storage, workouts) {
  return storage.saveWorkouts(workouts);
}

/**
 * Check if onboarding was seen
 * @deprecated Use storageManager.isOnboardingSeen() directly
 */
export async function isOnboardingSeen(storage) {
  return storage.isOnboardingSeen();
}

/**
 * Mark onboarding as seen
 * @deprecated Use storageManager.markOnboardingSeen() directly
 */
export async function markOnboardingSeen(storage) {
  return storage.markOnboardingSeen();
}

/**
 * Migration function - now handled internally by StorageManager
 * @deprecated Migration is automatic in StorageManager.initialize()
 */
export async function migrateFromCloudStorageIfNeeded(tg, targetStorage) {
  // Migration is now handled internally by StorageManager
  // This function is kept for backward compatibility but does nothing
  console.log('[storage.js] migrateFromCloudStorageIfNeeded is deprecated, migration is automatic');
  return false;
}

/**
 * Storage class - wrapper around StorageManager for backward compatibility
 * @deprecated Use getStorageManager(tg) instead
 */
export class Storage {
  constructor(tg) {
    this._manager = getStorageManager(tg);
    this.storageType = this._manager.backend;
  }
  
  async get(key) {
    return this._manager.get(key);
  }
  
  async set(key, value) {
    return this._manager.set(key, value);
  }
  
  async remove(key) {
    return this._manager.remove(key);
  }
  
  async getJSON(key) {
    return this._manager.getJSON(key);
  }
  
  async setJSON(key, value) {
    return this._manager.setJSON(key, value);
  }
}

// Re-export StorageManager functions
export { 
  getStorageManager, 
  initializeStorage, 
  isStorageInitialized,
  getStorageDiagnostics 
};
