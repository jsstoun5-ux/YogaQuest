# 🌸 YogaQuest — Telegram Mini App

Pixel-art трекер йога-практики в стиле Y2K / Tamagotchi / девчачьи игры 2000-х.

Приложение работает как Telegram Mini App и позволяет:

- записывать практики
- отслеживать настроение
- видеть график прогресса
- получать достижения
- развивать серию дней практики

---

## Структура проекта

```
yogaquest-tma/
├── index.html              # Точка входа, подключает Telegram SDK
├── vite.config.js          # Конфиг сборщика
├── package.json            # Зависимости и скрипты
├── server/                 # Backend сервер
│   ├── server.js           # Express сервер
│   ├── routes/
│   │   ├── user.js         # API пользователей
│   │   └── workouts.js     # API тренировок
│   └── services/
│       └── storage.js      # Файловое хранилище
├── data/                   # Данные пользователей (создаётся автоматически)
│   └── users/
│       └── {telegram_id}/
│           ├── profile.json
│           ├── workouts.json
│           └── achievements.json
└── src/
    ├── main.jsx            # Инициализация Telegram WebApp
    ├── App.jsx             # Основное приложение
    ├── styles/
    │   └── pixel.css       # Стили в пиксельном стиле
    ├── constants/
    │   ├── index.js        # Экспорт всех констант
    │   ├── practiceTypes.js# Типы практик
    │   ├── moods.js        # Настроения
    │   ├── achievements.js # Достижения
    │   └── levels.js       # Уровни пользователя
    ├── utils/
    │   ├── index.js        # Экспорт всех утилит
    │   ├── dateUtils.js    # Работа с датами
    │   └── storage.js      # Работа с хранилищем
    ├── hooks/
    │   ├── index.js        # Экспорт всех хуков
    │   ├── useTelegram.js  # Хук для Telegram API
    │   ├── useWorkouts.js  # Хук для тренировок
    │   └── useAchievements.js # Хук для достижений
    └── components/
        ├── ui/             # UI компоненты
        │   ├── index.js
        │   ├── PixelBtn.jsx
        │   ├── PixelHearts.jsx
        │   └── Modal.jsx
        └── pages/          # Компоненты страниц
            ├── index.js
            ├── Onboarding.jsx
            ├── PracticeForm.jsx
            ├── PracticeList.jsx
            ├── StatsChart.jsx
            ├── Achievements.jsx
            ├── LevelCard.jsx
            ├── Navbar.jsx
            └── Calendar.jsx
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

### 3. Запустить с backend (опционально)

```bash
npm run dev:full
```

Запускает фронтенд и backend сервер одновременно.

### 4. Собрать для деплоя

```bash
npm run build
```

Готовые файлы появятся в папке `dist/`.

---

## Backend API

### Пользователи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/user/:telegram_id` | Получить профиль пользователя |
| POST | `/api/user/:telegram_id` | Обновить профиль |

### Тренировки

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/workouts/:telegram_id` | Получить тренировки |
| POST | `/api/workouts` | Добавить тренировку |
| DELETE | `/api/workouts/:telegram_id/:workout_id` | Удалить тренировку |
| GET | `/api/workouts/:telegram_id/achievements` | Получить достижения |
| POST | `/api/workouts/:telegram_id/achievements` | Обновить достижения |

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
| Облачное хранилище | `CloudStorage.getItem/setItem` | `src/utils/storage.js` |
| Имя пользователя | `initDataUnsafe.user` | `src/hooks/useTelegram.js` |
| Вибрация при сохранении | `HapticFeedback.notificationOccurred('success')` | `src/hooks/useTelegram.js` |
| Вибрация при ошибке | `HapticFeedback.notificationOccurred('error')` | `src/hooks/useTelegram.js` |
| Вибрация навигации | `HapticFeedback.selectionChanged()` | `src/hooks/useTelegram.js` |
| Вибрация удаления | `HapticFeedback.impactOccurred('medium')` | `src/hooks/useTelegram.js` |

---

## Архитектура

### Константы (`src/constants/`)

Все константы вынесены в отдельные файлы:
- `practiceTypes.js` — типы практик (силовая, мягкая, медитативная и т.д.)
- `moods.js` — шкала настроения (1-5)
- `achievements.js` — достижения и функции их проверки
- `levels.js` — уровни пользователя

### Утилиты (`src/utils/`)

- `dateUtils.js` — работа с датами (форматирование, календарь, статистика)
- `storage.js` — абстракция над Telegram CloudStorage и localStorage

### Хуки (`src/hooks/`)

- `useTelegram` — доступ к Telegram WebApp API
- `useWorkouts` — управление тренировками
- `useAchievements` — отслеживание достижений

### Компоненты (`src/components/`)

- `ui/` — переиспользуемые UI компоненты (кнопки, сердечки, модальные окна)
- `pages/` — компоненты страниц (онбординг, форма, список, графики и т.д.)

---

## Возможные улучшения

- [ ] Поделиться достижением в чат (`WebApp.sendData()`)
- [ ] Push-напоминания через бота (требует бэкенд)
- [ ] Тёмная тема через `WebApp.colorScheme`
- [ ] Импорт данных из JSON через `WebApp.showPopup()`
- [ ] TypeScript миграция
- [ ] Unit тесты (Vitest + React Testing Library)
- [ ] Accessibility (aria-label, keyboard navigation)

---

## Иконка для Mini App

Telegram требует квадратное PNG 640×640. Рекомендуемый промпт для генерации:

```
Pixel art app icon, 640x640, pastel pink background #fce4f0,
pink pixel heart in center, Y2K aesthetic, cute game style,
no text, simple, Tamagotchi-like
