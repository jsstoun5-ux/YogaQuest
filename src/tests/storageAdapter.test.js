/**
 * Unit Tests for Storage Adapter
 * Тесты для адаптера хранилища
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageAdapter, STORAGE_TYPES, createStorageAdapter } from '../storage/storageAdapter.js';

// === Моки для Telegram API ===

/**
 * Создать мок Telegram WebApp
 */
function createMockTelegram(options = {}) {
  const {
    hasDeviceStorage = false,
    hasCloudStorage = true,
    deviceStorageData = {},
    cloudStorageData = {},
  } = options;

  const deviceStorage = hasDeviceStorage ? {
    getKeys: vi.fn((callback) => callback(null, Object.keys(deviceStorageData))),
    getItem: vi.fn((key, callback) => callback(null, deviceStorageData[key] || null)),
    setItem: vi.fn((key, value, callback) => {
      deviceStorageData[key] = value;
      callback(null);
    }),
    removeItem: vi.fn((key, callback) => {
      delete deviceStorageData[key];
      callback(null);
    }),
  } : undefined;

  const cloudStorage = hasCloudStorage ? {
    getItem: vi.fn((key, callback) => callback(null, cloudStorageData[key] || null)),
    setItem: vi.fn((key, value, callback) => {
      cloudStorageData[key] = value;
      callback(null);
    }),
    removeItem: vi.fn((key, callback) => {
      delete cloudStorageData[key];
      callback(null);
    }),
  } : undefined;

  return {
    DeviceStorage: deviceStorage,
    CloudStorage: cloudStorage,
  };
}

// === Тесты ===

describe('StorageAdapter', () => {
  describe('Constructor', () => {
    it('should create instance with null tg', () => {
      const adapter = new StorageAdapter(null, null);
      
      expect(adapter.hasDeviceStorage).toBe(false);
      expect(adapter.hasCloudStorage).toBe(false);
      expect(adapter.hasLocalStorage).toBe(true);
    });

    it('should detect DeviceStorage availability', () => {
      const tg = createMockTelegram({ hasDeviceStorage: true });
      const adapter = new StorageAdapter(tg, 'test-user');
      
      expect(adapter.hasDeviceStorage).toBe(true);
    });

    it('should detect CloudStorage availability', () => {
      const tg = createMockTelegram({ hasCloudStorage: true });
      const adapter = new StorageAdapter(tg, 'test-user');
      
      expect(adapter.hasCloudStorage).toBe(true);
    });
  });

  describe('Initialize', () => {
    it('should use localStorage when no Telegram API available', async () => {
      const adapter = new StorageAdapter(null, null);
      const storageType = await adapter.initialize();
      
      expect(storageType).toBe(STORAGE_TYPES.LOCAL_STORAGE);
    });

    it('should use CloudStorage when DeviceStorage not available', async () => {
      const tg = createMockTelegram({ 
        hasDeviceStorage: false, 
        hasCloudStorage: true 
      });
      const adapter = new StorageAdapter(tg, 'test-user');
      const storageType = await adapter.initialize();
      
      expect(storageType).toBe(STORAGE_TYPES.CLOUD_STORAGE);
    });

    it('should use DeviceStorage when available', async () => {
      const tg = createMockTelegram({ 
        hasDeviceStorage: true, 
        hasCloudStorage: true,
        deviceStorageData: { 'yogaquest_workouts': '[]' }
      });
      const adapter = new StorageAdapter(tg, 'test-user');
      const storageType = await adapter.initialize();
      
      expect(storageType).toBe(STORAGE_TYPES.DEVICE_STORAGE);
    });
  });

  describe('localStorage operations', () => {
    let adapter;

    beforeEach(() => {
      adapter = new StorageAdapter(null, null);
      localStorage.clear();
    });

    it('should set and get string value', async () => {
      await adapter.set('test_key', 'test_value');
      const value = await adapter.get('test_key');
      
      expect(value).toBe('test_value');
    });

    it('should return null for non-existent key', async () => {
      const value = await adapter.get('non_existent');
      
      expect(value).toBeNull();
    });

    it('should remove key', async () => {
      await adapter.set('test_key', 'test_value');
      await adapter.remove('test_key');
      const value = await adapter.get('test_key');
      
      expect(value).toBeNull();
    });

    it('should set and get JSON value', async () => {
      const data = { name: 'test', count: 5 };
      await adapter.setJSON('test_json', data);
      const result = await adapter.getJSON('test_json');
      
      expect(result).toEqual(data);
    });

    it('should return null for invalid JSON', async () => {
      await adapter.set('test_json', 'not valid json');
      const result = await adapter.getJSON('test_json');
      
      expect(result).toBeNull();
    });
  });

  describe('CloudStorage operations', () => {
    let tg, adapter, cloudStorageData;

    beforeEach(() => {
      cloudStorageData = {};
      tg = createMockTelegram({ 
        hasDeviceStorage: false, 
        hasCloudStorage: true,
        cloudStorageData 
      });
      adapter = new StorageAdapter(tg, 'test-user');
    });

    it('should set and get value from CloudStorage', async () => {
      await adapter.initialize();
      await adapter.set('test_key', 'test_value');
      const value = await adapter.get('test_key');
      
      expect(value).toBe('test_value');
      expect(tg.CloudStorage.setItem).toHaveBeenCalled();
      expect(tg.CloudStorage.getItem).toHaveBeenCalled();
    });

    it('should handle CloudStorage errors', async () => {
      tg.CloudStorage.getItem = vi.fn((key, callback) => {
        callback(new Error('Storage error'), null);
      });
      
      await adapter.initialize();
      const value = await adapter.get('test_key');
      
      expect(value).toBeNull();
    });
  });

  describe('DeviceStorage operations', () => {
    let tg, adapter, deviceStorageData;

    beforeEach(() => {
      deviceStorageData = { 'yogaquest_workouts': '[]' };
      tg = createMockTelegram({ 
        hasDeviceStorage: true, 
        hasCloudStorage: true,
        deviceStorageData 
      });
      adapter = new StorageAdapter(tg, 'test-user');
    });

    it('should use DeviceStorage when available', async () => {
      const storageType = await adapter.initialize();
      
      expect(storageType).toBe(STORAGE_TYPES.DEVICE_STORAGE);
    });

    it('should set and get value from DeviceStorage', async () => {
      await adapter.initialize();
      await adapter.set('test_key', 'test_value');
      const value = await adapter.get('test_key');
      
      expect(value).toBe('test_value');
      expect(tg.DeviceStorage.setItem).toHaveBeenCalled();
      expect(tg.DeviceStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('Migration', () => {
    it('should detect migration need when DeviceStorage is empty but CloudStorage has data', async () => {
      const cloudStorageData = { 
        'yogaquest_workouts': JSON.stringify([{ id: 1 }]) 
      };
      const deviceStorageData = {};
      
      const tg = createMockTelegram({ 
        hasDeviceStorage: true, 
        hasCloudStorage: true,
        deviceStorageData,
        cloudStorageData 
      });
      
      const adapter = new StorageAdapter(tg, 'test-user');
      await adapter.initialize();
      
      expect(adapter.isMigrationNeeded()).toBe(true);
    });

    it('should migrate data from CloudStorage to DeviceStorage', async () => {
      const cloudStorageData = { 
        'yogaquest_workouts': JSON.stringify([{ id: 1, type: 'power' }]),
        'yogaquest_profile': JSON.stringify({ totalXP: 100 })
      };
      const deviceStorageData = {};
      
      const tg = createMockTelegram({ 
        hasDeviceStorage: true, 
        hasCloudStorage: true,
        deviceStorageData,
        cloudStorageData 
      });
      
      const adapter = new StorageAdapter(tg, 'test-user');
      await adapter.initialize();
      
      const result = await adapter.migrateFromCloudStorage();
      
      expect(result).toBe(true);
      expect(tg.DeviceStorage.setItem).toHaveBeenCalled();
    });

    it('should not migrate when not needed', async () => {
      const deviceStorageData = { 
        'yogaquest_workouts': JSON.stringify([{ id: 1 }]) 
      };
      
      const tg = createMockTelegram({ 
        hasDeviceStorage: true, 
        hasCloudStorage: true,
        deviceStorageData 
      });
      
      const adapter = new StorageAdapter(tg, 'test-user');
      await adapter.initialize();
      
      const result = await adapter.migrateFromCloudStorage();
      
      expect(result).toBe(false);
    });
  });

  describe('Specialized methods', () => {
    let adapter;

    beforeEach(() => {
      adapter = new StorageAdapter(null, null);
      localStorage.clear();
    });

    it('should save and load workouts', async () => {
      const workouts = [
        { id: 1, type: 'power', duration: 30 },
        { id: 2, type: 'soft', duration: 45 },
      ];
      
      await adapter.saveWorkouts(workouts);
      const loaded = await adapter.loadWorkouts();
      
      expect(loaded).toEqual(workouts);
    });

    it('should return empty array for no workouts', async () => {
      const loaded = await adapter.loadWorkouts();
      
      expect(loaded).toEqual([]);
    });

    it('should save and load profile', async () => {
      const profile = {
        totalXP: 100,
        unlockedAchievementIds: ['first_bow'],
      };
      
      await adapter.saveProfile(profile);
      const loaded = await adapter.loadProfile();
      
      expect(loaded).toEqual(profile);
    });

    it('should handle onboarding flag', async () => {
      expect(await adapter.isOnboardingSeen()).toBe(false);
      
      await adapter.markOnboardingSeen();
      
      expect(await adapter.isOnboardingSeen()).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle corrupted JSON gracefully', async () => {
      const adapter = new StorageAdapter(null, null);
      localStorage.clear();
      
      localStorage.setItem('test_key', '{ invalid json }');
      
      const result = await adapter.getJSON('test_key');
      
      expect(result).toBeNull();
    });

    it('should handle empty data', async () => {
      const adapter = new StorageAdapter(null, null);
      localStorage.clear();
      
      const workouts = await adapter.loadWorkouts();
      const profile = await adapter.loadProfile();
      
      expect(workouts).toEqual([]);
      expect(profile).toBeNull();
    });
  });
});

describe('createStorageAdapter', () => {
  it('should create StorageAdapter instance', () => {
    const adapter = createStorageAdapter(null, null);
    
    expect(adapter).toBeInstanceOf(StorageAdapter);
  });

  it('should pass tg and telegramId to constructor', () => {
    const tg = createMockTelegram();
    const adapter = createStorageAdapter(tg, 'user-123');
    
    expect(adapter.tg).toBe(tg);
    expect(adapter.telegramId).toBe('user-123');
  });
});
