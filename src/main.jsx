import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Инициализируем Telegram WebApp
// Объект window.Telegram.WebApp доступен после загрузки SDK из index.html
const tg = window.Telegram?.WebApp

if (tg) {
  // Сообщаем Telegram что приложение готово (убирает лоадер)
  tg.ready()

  // Разворачиваем на весь экран
  tg.expand()

  // Цвет хедера под наш стиль
  tg.setHeaderColor('#a98aee')
  tg.setBackgroundColor('#fce4f0')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
