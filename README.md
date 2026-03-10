# 🌸 YogaQuest — Telegram Mini App

Трекер йога-тренировок в стиле Y2K пиксель-арт.  
Работает как Telegram Mini App с облачным хранением данных.

---

## Структура проекта

```
yogaquest-tma/
├── index.html          ← точка входа, подключает Telegram SDK
├── vite.config.js      ← конфиг сборщика
├── package.json
└── src/
    ├── main.jsx        ← инициализация Telegram WebApp
    ├── App.jsx         ← основное приложение
    └── useTelegram.js  ← хук для работы с TG API
```

---

## Быстрый старт

### 1. Установить зависимости

```bash
npm install
```

### 2. Запустить локально

```bash
npm run dev
```

Откроется на `http://localhost:5173`.  
**Важно:** вне Telegram приложение работает в режиме браузера — данные хранятся в `localStorage`.

### 3. Собрать для деплоя

```bash
npm run build
```

Готовые файлы появятся в папке `dist/`.

---

## Деплой

### Вариант A — Vercel (рекомендуется, бесплатно)

1. Залить проект на GitHub
2. Зайти на [vercel.com](https://vercel.com) → New Project → выбрать репо
3. Framework: **Vite** (определится автоматически)
4. Нажать Deploy
5. Скопировать URL вида `https://yogaquest-xxx.vercel.app`

### Вариант B — Netlify

1. `npm run build`
2. Зайти на [app.netlify.com](https://app.netlify.com) → Add new site → Deploy manually
3. Перетащить папку `dist/` в браузер
4. Скопировать выданный URL

### Вариант C — GitHub Pages

```bash
# Установить gh-pages
npm install --save-dev gh-pages

# Добавить в package.json:
# "homepage": "https://ВАШ_ЛОГИН.github.io/yogaquest-tma",
# "scripts": { "deploy": "gh-pages -d dist" }

npm run build
npm run deploy
```

> ⚠️ Telegram требует **HTTPS**. Все три варианта дают HTTPS автоматически.

---

## Подключение к Telegram

### Шаг 1 — Создать бота

Открыть [@BotFather](https://t.me/BotFather) в Telegram:

```
/newbot
→ Ввести имя: YogaQuest Bot
→ Ввести username: yogaquest_your_bot
→ Сохранить токен
```

### Шаг 2 — Создать Mini App

```
/newapp
→ Выбрать своего бота
→ Ввести название: YogaQuest
→ Описание: Трекер йога-практик 🌸
→ Загрузить иконку 640×640px (розовая, пиксельная)
→ Ввести URL: https://ваш-сайт.vercel.app
```

### Шаг 3 — Добавить кнопку в бот (опционально)

```
/mybots → выбрать бота → Bot Settings → Menu Button
→ Configure menu button
→ URL: https://ваш-сайт.vercel.app
→ Button text: 🌸 Открыть YogaQuest
```

### Шаг 4 — Проверить

Найти бота в Telegram → нажать кнопку меню или `/start`.

---

## Что использует TG API

| Фича | API | Где в коде |
|---|---|---|
| Инициализация | `WebApp.ready()` | `src/main.jsx` |
| Полный экран | `WebApp.expand()` | `src/main.jsx` |
| Цвет хедера | `WebApp.setHeaderColor()` | `src/main.jsx` |
| Облачное хранилище | `CloudStorage.getItem/setItem` | `useTelegram.js` |
| Имя пользователя | `initDataUnsafe.user` | `App.jsx`, хедер |
| Вибрация при сохранении | `HapticFeedback.notificationOccurred('success')` | `addWorkout` |
| Вибрация при ошибке | `HapticFeedback.notificationOccurred('error')` | `addWorkout` |
| Вибрация навигации | `HapticFeedback.selectionChanged()` | `nav buttons` |
| Вибрация удаления | `HapticFeedback.impactOccurred('medium')` | `deleteWorkout` |

---

## CloudStorage vs localStorage

| | CloudStorage | localStorage |
|---|---|---|
| Где | Серверы Telegram | Браузер пользователя |
| Синхронизация | ✅ Между устройствами | ❌ Только текущий браузер |
| Лимит | 1024 ключа, 4096 байт/ключ | ~5 МБ |
| Персистентность | ✅ Навсегда | ❌ Очищается при сбросе браузера |
| Доступ | Только внутри Telegram | Любой браузер |

В коде используется автоматический выбор:
- Внутри Telegram → CloudStorage
- В браузере → localStorage (для разработки)

---

## Иконка для Mini App

Telegram требует квадратное PNG 640×640. Рекомендуемый промпт для генерации:

```
Pixel art app icon, 640x640, pastel pink background #fce4f0,
pink pixel heart in center, Y2K aesthetic, cute game style,
no text, simple, Tamagotchi-like
```

---

## Возможные улучшения

- [ ] Поделиться достижением в чат (`WebApp.sendData()`)
- [ ] Push-напоминания через бота (требует бэкенд)
- [ ] Тёмная тема через `WebApp.colorScheme`
- [ ] Импорт данных из JSON через `WebApp.showPopup()`
