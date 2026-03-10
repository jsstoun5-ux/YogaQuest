/**
 * useTelegram — хук для работы с Telegram WebApp API.
 *
 * Даёт доступ к:
 * - tg         : сам объект WebApp (или null вне Telegram)
 * - user       : данные пользователя { first_name, last_name, username, ... }
 * - haptic     : вибрация (impact / notification / selection)
 * - storage    : CloudStorage (get/set/remove) — данные хранятся в Telegram-облаке
 * - isTelegram : boolean, открыто ли внутри Telegram
 */
export function useTelegram() {
  const tg = window.Telegram?.WebApp ?? null
  const isTelegram = !!tg

  const user = tg?.initDataUnsafe?.user ?? null

  // ─── Haptic Feedback ───────────────────────────────────────────────────────
  const haptic = {
    /** Лёгкий тап — для нажатий кнопок */
    light: () => tg?.HapticFeedback?.impactOccurred('light'),
    /** Средний — для выбора типа практики */
    medium: () => tg?.HapticFeedback?.impactOccurred('medium'),
    /** Успех — при сохранении тренировки */
    success: () => tg?.HapticFeedback?.notificationOccurred('success'),
    /** Ошибка — при попытке сохранить без типа */
    error: () => tg?.HapticFeedback?.notificationOccurred('error'),
    /** Выбор — при переключении вкладок */
    select: () => tg?.HapticFeedback?.selectionChanged(),
  }

  // ─── CloudStorage ──────────────────────────────────────────────────────────
  // Telegram CloudStorage: до 1024 ключей, до 4096 байт на ключ.
  // Данные привязаны к пользователю и боту — сохраняются между сессиями.
  const storage = {
    /**
     * Получить значение по ключу.
     * @returns {Promise<string|null>}
     */
    get: (key) => new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) return resolve(null)
      tg.CloudStorage.getItem(key, (err, value) => {
        if (err) reject(err)
        else resolve(value || null)
      })
    }),

    /**
     * Сохранить значение.
     * @returns {Promise<void>}
     */
    set: (key, value) => new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) return resolve()
      tg.CloudStorage.setItem(key, value, (err) => {
        if (err) reject(err)
        else resolve()
      })
    }),

    /**
     * Удалить ключ.
     * @returns {Promise<void>}
     */
    remove: (key) => new Promise((resolve, reject) => {
      if (!tg?.CloudStorage) return resolve()
      tg.CloudStorage.removeItem(key, (err) => {
        if (err) reject(err)
        else resolve()
      })
    }),
  }

  return { tg, isTelegram, user, haptic, storage }
}
