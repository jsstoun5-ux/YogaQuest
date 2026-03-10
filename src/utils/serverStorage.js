/**
 * Утилиты для работы с серверным API
 * Используются как fallback когда Telegram CloudStorage недоступен или превышен лимит
 */

// Базовый URL API (можно настроить через переменную окружения)
const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Класс для работы с серверным API
 */
export class ServerStorage {
  constructor(telegramId) {
    this.telegramId = telegramId;
  }

  /**
   * Проверить, доступен ли API
   */
  isAvailable() {
    return !!this.telegramId && !!API_BASE;
  }

  /**
   * Получить тренировки
   */
  async getWorkouts() {
    if (!this.isAvailable()) return null;
    
    try {
      const response = await fetch(`${API_BASE}/api/workouts/${this.telegramId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error('[ServerStorage] getWorkouts error:', e);
      return null;
    }
  }

  /**
   * Сохранить тренировки
   */
  async saveWorkouts(workouts) {
    if (!this.isAvailable()) return false;
    
    try {
      // Сервер хранит тренировки по отдельности, поэтому сначала удаляем все, потом добавляем
      // Это не оптимально, но для простоты используем существующий API
      
      // Получаем текущие тренировки с сервера
      const current = await this.getWorkouts() || [];
      
      // Находим новые тренировки (которых нет на сервере)
      const currentIds = new Set(current.map(w => String(w.id)));
      const newWorkouts = workouts.filter(w => !currentIds.has(String(w.id)));
      
      // Добавляем новые тренировки
      for (const workout of newWorkouts) {
        await fetch(`${API_BASE}/api/workout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: this.telegramId,
            ...workout,
          }),
        });
      }
      
      // Находим удалённые тренировки
      const newIds = new Set(workouts.map(w => String(w.id)));
      const deletedIds = current.filter(w => !newIds.has(String(w.id))).map(w => w.id);
      
      // Удаляем удалённые тренировки
      for (const id of deletedIds) {
        await fetch(`${API_BASE}/api/workout/${this.telegramId}/${id}`, {
          method: 'DELETE',
        });
      }
      
      console.log('[ServerStorage] saveWorkouts success:', workouts.length, 'items');
      return true;
    } catch (e) {
      console.error('[ServerStorage] saveWorkouts error:', e);
      return false;
    }
  }

  /**
   * Получить профиль пользователя
   */
  async getProfile() {
    if (!this.isAvailable()) return null;
    
    try {
      const response = await fetch(`${API_BASE}/api/user/${this.telegramId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.error('[ServerStorage] getProfile error:', e);
      return null;
    }
  }

  /**
   * Сохранить профиль пользователя
   */
  async saveProfile(profile) {
    if (!this.isAvailable()) return false;
    
    try {
      const response = await fetch(`${API_BASE}/api/user/${this.telegramId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      console.log('[ServerStorage] saveProfile success');
      return true;
    } catch (e) {
      console.error('[ServerStorage] saveProfile error:', e);
      return false;
    }
  }
}

/**
 * Создать экземпляр серверного хранилища
 * @param {string|number} telegramId - ID пользователя Telegram
 * @returns {ServerStorage}
 */
export function createServerStorage(telegramId) {
  return new ServerStorage(telegramId);
}
