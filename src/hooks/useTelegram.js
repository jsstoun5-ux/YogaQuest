/**
 * useTelegram — хук для работы с Telegram WebApp API.
 *
 * Даёт доступ к:
 * - tg         : сам объект WebApp (или null вне Telegram)
 * - user       : данные пользователя { id, first_name, last_name, username, ... }
 * - haptic     : вибрация (impact / notification / selection)
 * - storage    : CloudStorage (get/set/remove) — данные хранятся в Telegram-облаке
 * - isTelegram : boolean, открыто ли внутри Telegram
 */
import { useMemo, useCallback } from 'react';
import { Storage } from '../utils/storage.js';

/**
 * Хук для работы с Telegram WebApp API
 * @returns {object} Объект с методами и данными Telegram
 */
export function useTelegram() {
  const tg = useMemo(() => {
    return typeof window !== 'undefined' ? window.Telegram?.WebApp ?? null : null;
  }, []);

  const isTelegram = !!tg;

  // Данные пользователя
  const user = useMemo(() => {
    return tg?.initDataUnsafe?.user ?? null;
  }, [tg]);

  // Telegram ID пользователя (важно: username может отсутствовать)
  const telegramId = useMemo(() => {
    return user?.id ?? null;
  }, [user]);

  // Haptic Feedback
  const haptic = useMemo(() => ({
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
  }), [tg]);

  // CloudStorage
  const storage = useMemo(() => new Storage(tg), [tg]);

  // Методы для управления WebApp
  const expand = useCallback(() => {
    tg?.expand?.();
  }, [tg]);

  const close = useCallback(() => {
    tg?.close?.();
  }, [tg]);

  const ready = useCallback(() => {
    tg?.ready?.();
  }, [tg]);

  const setHeaderColor = useCallback((color) => {
    tg?.setHeaderColor?.(color);
  }, [tg]);

  const setBackgroundColor = useCallback((color) => {
    tg?.setBackgroundColor?.(color);
  }, [tg]);

  // Информация о теме
  const themeParams = useMemo(() => {
    return tg?.themeParams ?? {};
  }, [tg]);

  const colorScheme = useMemo(() => {
    return tg?.colorScheme ?? 'light';
  }, [tg]);

  return {
    // Основные
    tg,
    isTelegram,
    user,
    telegramId,
    
    // Хранилище
    storage,
    
    // Haptic
    haptic,
    
    // Методы управления
    expand,
    close,
    ready,
    setHeaderColor,
    setBackgroundColor,
    
    // Тема
    themeParams,
    colorScheme,
  };
}