/**
 * StorageManager - Centralized singleton for all storage operations
 * 
 * Guarantees:
 * - Single initialization per session
 * - One-time migration from CloudStorage
 * - All operations wait for initialization
 * - Queued saves if storage not ready
 * - No CloudStorage usage after migration
 * - Minimal payload storage
 * - Timeouts to prevent hanging on iPhone
 */

// Storage keys - only essential data
const KEYS = {
  WORKOUTS: 'yq_workouts',        // Raw workout data only
  PROFILE: 'yq_profile',          // XP, unlocked achievement IDs, return bonus date
  ONBOARDING: 'yq_onboard',       // Simple boolean flag
  SEEN_ACHIEVEMENTS: 'yq_seen',   // Array of seen achievement IDs
  MIGRATION: 'yq_migrated',       // Migration completed flag
};

// Timeout for storage operations (ms)
const STORAGE_TIMEOUT = 5000;

// Singleton state
let instance = null;
let initializationPromise = null;
let isInitialized = false;
let migrationPromise = null;
let migrationCompleted = false;

// Save queue for operations before initialization
const saveQueue = [];

// Diagnostic info
const diagnostics = {
  platform: 'unknown',
  tgVersion: 'unknown',
  hasDeviceStorage: false,
  hasLocalStorage: false,
  selectedBackend: 'none',
  migrationStatus: 'pending',
  initTime: null,
  timeoutOccurred: false,
};

/**
 * Log with prefix for easy filtering
 */
function log(...args) {
  console.log('[StorageManager]', ...args);
}

/**
 * Get platform info
 */
function getPlatformInfo() {
  const ua = navigator?.userAgent || 'unknown';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isDesktop = !isIOS && !isAndroid;
  
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  if (isDesktop) return 'desktop';
  return 'other';
}

/**
 * Print startup diagnostics
 */
function printDiagnostics() {
  log('=== STARTUP DIAGNOSTICS ===');
  log('Platform:', diagnostics.platform);
  log('Telegram WebApp version:', diagnostics.tgVersion);
  log('DeviceStorage available:', diagnostics.hasDeviceStorage);
  log('localStorage available:', diagnostics.hasLocalStorage);
  log('Selected backend:', diagnostics.selectedBackend);
  log('Migration status:', diagnostics.migrationStatus);
  log('Init time:', diagnostics.initTime ? `${diagnostics.initTime}ms` : 'not initialized');
  log('Timeout occurred:', diagnostics.timeoutOccurred);
  log('===========================');
}

/**
 * Create a promise that rejects after timeout
 */
function createTimeoutPromise(ms, operation) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operation} timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Race a promise against a timeout
 */
function withTimeout(promise, ms, operation) {
  return Promise.race([
    promise,
    createTimeoutPromise(ms, operation),
  ]);
}

/**
 * StorageManager class - wraps the actual storage backend
 */
class StorageManager {
  constructor(tg) {
    if (instance) {
      log('Returning existing instance');
      return instance;
    }
    
    this.tg = tg;
    
    // Detect available storage
    this.hasDeviceStorage = !!(tg && tg.DeviceStorage);
    this.hasLocalStorage = typeof localStorage !== 'undefined';
    
    // Update diagnostics
    diagnostics.platform = getPlatformInfo();
    diagnostics.tgVersion = tg?.version || 'not-in-telegram';
    diagnostics.hasDeviceStorage = this.hasDeviceStorage;
    diagnostics.hasLocalStorage = this.hasLocalStorage;
    
    // Select backend: DeviceStorage preferred
    if (this.hasDeviceStorage) {
      this.backend = 'device_storage';
      diagnostics.selectedBackend = 'device_storage';
    } else if (this.hasLocalStorage) {
      this.backend = 'local_storage';
      diagnostics.selectedBackend = 'local_storage';
    } else {
      this.backend = 'none';
      diagnostics.selectedBackend = 'none';
      console.error('[StorageManager] No storage backend available!');
    }
    
    instance = this;
    log('Created singleton, backend:', this.backend);
  }
  
  /**
   * Initialize storage and run migration if needed
   * Returns the same promise if already called
   * Never hangs - will timeout and mark as initialized anyway
   */
  async initialize() {
    // Already initialized - return immediately
    if (isInitialized) {
      log('Already initialized, returning');
      return true;
    }
    
    // Return existing promise if initialization in progress
    if (initializationPromise) {
      log('Initialization in progress, waiting...');
      return initializationPromise;
    }
    
    // Start initialization
    initializationPromise = this._doInitialize();
    return initializationPromise;
  }
  
  /**
   * Internal initialization logic
   */
  async _doInitialize() {
    const startTime = Date.now();
    log('Starting initialization...');
    
    try {
      // Run migration first (one-time only) with timeout
      await withTimeout(
        this._runMigrationIfNeeded(),
        STORAGE_TIMEOUT,
        'Migration'
      );
      
      // Mark as initialized
      isInitialized = true;
      diagnostics.initTime = Date.now() - startTime;
      diagnostics.migrationStatus = migrationCompleted ? 'completed' : 'skipped';
      
      // Process any queued saves
      await this._processQueue();
      
      printDiagnostics();
      log('Initialization complete in', diagnostics.initTime, 'ms');
      return true;
    } catch (e) {
      console.error('[StorageManager] Initialization failed:', e);
      diagnostics.migrationStatus = 'failed: ' + e.message;
      diagnostics.timeoutOccurred = true;
      
      // CRITICAL: Mark as initialized anyway to unblock the app
      isInitialized = true;
      migrationCompleted = true;
      
      printDiagnostics();
      log('Initialization timed out, continuing with degraded storage');
      return true;
    }
  }
  
  /**
   * Run migration from CloudStorage - strictly one-time
   */
  async _runMigrationIfNeeded() {
    // Already migrated
    if (migrationCompleted) {
      log('Migration already completed');
      return;
    }
    
    // Migration in progress - return existing promise
    if (migrationPromise) {
      log('Migration in progress, waiting...');
      return migrationPromise;
    }
    
    // Start migration
    migrationPromise = this._doMigration();
    return migrationPromise;
  }
  
  /**
   * Internal migration logic
   */
  async _doMigration() {
    log('Checking migration status...');
    
    // Check if already migrated
    const migrated = await this._getRaw(KEYS.MIGRATION);
    if (migrated === 'true') {
      log('Migration flag found, skipping');
      migrationCompleted = true;
      return;
    }
    
    // Check if CloudStorage exists
    if (!this.tg || !this.tg.CloudStorage) {
      log('No CloudStorage, marking as migrated');
      await this._setRaw(KEYS.MIGRATION, 'true');
      migrationCompleted = true;
      return;
    }
    
    log('Starting CloudStorage migration...');
    
    try {
      // Migrate each key
      const keysToMigrate = [
        'yogaquest_workouts',   // Old key
        'yogaquest_profile',    // Old key
        'yogaquest_onboard',    // Old key
      ];
      
      for (const oldKey of keysToMigrate) {
        const value = await this._getFromCloudStorage(oldKey);
        if (value !== null) {
          // Map to new key
          let newKey;
          if (oldKey === 'yogaquest_workouts') newKey = KEYS.WORKOUTS;
          else if (oldKey === 'yogaquest_profile') newKey = KEYS.PROFILE;
          else if (oldKey === 'yogaquest_onboard') newKey = KEYS.ONBOARDING;
          else continue;
          
          // Save to new storage
          await this._setRaw(newKey, value);
          log('Migrated:', oldKey, '->', newKey);
        }
      }
      
      // Mark migration complete
      await this._setRaw(KEYS.MIGRATION, 'true');
      migrationCompleted = true;
      log('Migration completed successfully');
    } catch (e) {
      console.error('[StorageManager] Migration failed:', e);
      // Mark as migrated anyway to prevent retry loops
      try {
        await this._setRaw(KEYS.MIGRATION, 'true');
      } catch (e2) {
        // Ignore
      }
      migrationCompleted = true;
    }
  }
  
  /**
   * Get from CloudStorage (only for migration)
   */
  _getFromCloudStorage(key) {
    return withTimeout(
      new Promise((resolve) => {
        this.tg.CloudStorage.getItem(key, (err, value) => {
          if (err) {
            log('CloudStorage error for', key, ':', err);
            resolve(null);
          } else {
            resolve(value || null);
          }
        });
      }),
      STORAGE_TIMEOUT,
      `CloudStorage.get(${key})`
    ).catch(() => null);
  }
  
  /**
   * Process queued saves after initialization
   */
  async _processQueue() {
    if (saveQueue.length === 0) return;
    
    log('Processing', saveQueue.length, 'queued saves...');
    
    while (saveQueue.length > 0) {
      const { key, value, resolve, reject } = saveQueue.shift();
      try {
        await this._setRaw(key, value);
        resolve();
      } catch (e) {
        reject(e);
      }
    }
    
    log('Queue processed');
  }
  
  /**
   * Raw get operation - no JSON parsing
   */
  async _getRaw(key) {
    if (this.backend === 'device_storage') {
      return this._getFromDeviceStorage(key);
    } else if (this.backend === 'local_storage') {
      return this._getFromLocalStorage(key);
    }
    return null;
  }
  
  /**
   * Raw set operation - no JSON stringification
   */
  async _setRaw(key, value) {
    if (this.backend === 'device_storage') {
      return this._setToDeviceStorage(key, value);
    } else if (this.backend === 'local_storage') {
      return this._setToLocalStorage(key, value);
    }
    throw new Error('No storage backend');
  }
  
  // === DeviceStorage operations with timeout ===
  
  _getFromDeviceStorage(key) {
    const operation = new Promise((resolve) => {
      this.tg.DeviceStorage.getItem(key, (err, value) => {
        if (err) {
          console.error('[StorageManager] DeviceStorage.get error:', key, err);
          resolve(null);
        } else {
          resolve(value || null);
        }
      });
    });
    
    return withTimeout(operation, STORAGE_TIMEOUT, `DeviceStorage.get(${key})`)
      .catch((e) => {
        console.error('[StorageManager] DeviceStorage.get timeout:', key, e);
        diagnostics.timeoutOccurred = true;
        return null;
      });
  }
  
  _setToDeviceStorage(key, value) {
    const operation = new Promise((resolve, reject) => {
      this.tg.DeviceStorage.setItem(key, value, (err) => {
        if (err) {
          console.error('[StorageManager] DeviceStorage.set error:', key, err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    return withTimeout(operation, STORAGE_TIMEOUT, `DeviceStorage.set(${key})`)
      .catch((e) => {
        console.error('[StorageManager] DeviceStorage.set timeout:', key, e);
        diagnostics.timeoutOccurred = true;
        throw e;
      });
  }
  
  _removeFromDeviceStorage(key) {
    const operation = new Promise((resolve, reject) => {
      this.tg.DeviceStorage.removeItem(key, (err) => {
        if (err) {
          console.error('[StorageManager] DeviceStorage.remove error:', key, err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    return withTimeout(operation, STORAGE_TIMEOUT, `DeviceStorage.remove(${key})`)
      .catch((e) => {
        console.error('[StorageManager] DeviceStorage.remove timeout:', key, e);
        diagnostics.timeoutOccurred = true;
        throw e;
      });
  }
  
  // === localStorage operations ===
  
  _getFromLocalStorage(key) {
    try {
      return Promise.resolve(localStorage.getItem(key) || null);
    } catch (e) {
      console.error('[StorageManager] localStorage.get error:', key, e);
      return Promise.resolve(null);
    }
  }
  
  _setToLocalStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (e) {
      console.error('[StorageManager] localStorage.set error:', key, e);
      return Promise.reject(e);
    }
  }
  
  _removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (e) {
      console.error('[StorageManager] localStorage.remove error:', key, e);
      return Promise.reject(e);
    }
  }
  
  // === Public API ===
  
  /**
   * Get JSON value - waits for initialization
   */
  async getJSON(key) {
    await this.initialize();
    const value = await this._getRaw(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error('[StorageManager] JSON parse error:', key, e);
      return null;
    }
  }
  
  /**
   * Set JSON value - queues if not initialized
   */
  async setJSON(key, value) {
    const json = JSON.stringify(value);
    
    // If not initialized, queue the save
    if (!isInitialized) {
      log('Queuing save for', key, '(not initialized)');
      return new Promise((resolve, reject) => {
        saveQueue.push({ key, value: json, resolve, reject });
      });
    }
    
    return this._setRaw(key, json);
  }
  
  /**
   * Get raw string value
   */
  async get(key) {
    await this.initialize();
    return this._getRaw(key);
  }
  
  /**
   * Set raw string value
   */
  async set(key, value) {
    // If not initialized, queue the save
    if (!isInitialized) {
      log('Queuing save for', key, '(not initialized)');
      return new Promise((resolve, reject) => {
        saveQueue.push({ key, value, resolve, reject });
      });
    }
    
    return this._setRaw(key, value);
  }
  
  /**
   * Remove value
   */
  async remove(key) {
    await this.initialize();
    
    if (this.backend === 'device_storage') {
      return this._removeFromDeviceStorage(key);
    } else if (this.backend === 'local_storage') {
      return this._removeFromLocalStorage(key);
    }
  }
  
  // === Domain-specific methods ===
  
  /**
   * Load workouts (raw data only)
   */
  async loadWorkouts() {
    const data = await this.getJSON(KEYS.WORKOUTS);
    return Array.isArray(data) ? data : [];
  }
  
  /**
   * Save workouts (raw data only, no derived stats)
   */
  async saveWorkouts(workouts) {
    // Store only essential fields
    const minimalWorkouts = workouts.map(w => ({
      id: w.id,
      date: w.date,
      type: w.type,
      duration: w.duration,
      moodBefore: w.moodBefore,
      moodAfter: w.moodAfter,
      note: w.note || '',
      createdAt: w.createdAt,
    }));
    return this.setJSON(KEYS.WORKOUTS, minimalWorkouts);
  }
  
  /**
   * Load profile (XP, achievements, return bonus)
   */
  async loadProfile() {
    const data = await this.getJSON(KEYS.PROFILE);
    return {
      totalXP: data?.totalXP || 0,
      unlockedAchievementIds: data?.unlockedAchievementIds || [],
      lastReturnBonusDate: data?.lastReturnBonusDate || null,
    };
  }
  
  /**
   * Save profile
   */
  async saveProfile(profile) {
    return this.setJSON(KEYS.PROFILE, {
      totalXP: profile.totalXP || 0,
      unlockedAchievementIds: profile.unlockedAchievementIds || [],
      lastReturnBonusDate: profile.lastReturnBonusDate || null,
    });
  }
  
  /**
   * Check if onboarding seen
   */
  async isOnboardingSeen() {
    const value = await this.get(KEYS.ONBOARDING);
    return value === 'true';
  }
  
  /**
   * Mark onboarding as seen
   */
  async markOnboardingSeen() {
    return this.set(KEYS.ONBOARDING, 'true');
  }
  
  /**
   * Load seen achievement IDs
   */
  async loadSeenAchievements() {
    const data = await this.getJSON(KEYS.SEEN_ACHIEVEMENTS);
    return Array.isArray(data) ? data : [];
  }
  
  /**
   * Save seen achievement IDs
   */
  async saveSeenAchievements(ids) {
    return this.setJSON(KEYS.SEEN_ACHIEVEMENTS, ids);
  }
  
  /**
   * Check if initialized
   */
  isReady() {
    return isInitialized;
  }
  
  /**
   * Get diagnostics
   */
  getDiagnostics() {
    return { ...diagnostics };
  }
  
  /**
   * Get storage keys (for external use)
   */
  static get KEYS() {
    return KEYS;
  }
}

/**
 * Get or create the storage manager singleton
 * This is the only way to get a StorageManager instance
 */
export function getStorageManager(tg) {
  if (!instance) {
    instance = new StorageManager(tg);
  }
  return instance;
}

/**
 * Initialize storage - must be called once at app startup
 * Returns a promise that resolves when storage is ready
 * NEVER hangs - will timeout and resolve anyway
 */
export async function initializeStorage(tg) {
  const manager = getStorageManager(tg);
  return manager.initialize();
}

/**
 * Check if storage is initialized
 */
export function isStorageInitialized() {
  return isInitialized;
}

/**
 * Get diagnostics
 */
export function getStorageDiagnostics() {
  return instance ? instance.getDiagnostics() : { ...diagnostics };
}

// Export the keys for external use
export { KEYS as STORAGE_KEYS };

export default StorageManager;
