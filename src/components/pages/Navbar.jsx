/**
 * Navbar — навигационная панель
 */
import { memo } from 'react';

/**
 * Элементы навигации
 */
const NAV_ITEMS = [
  { id: "home", icon: "🏠", label: "ГЛАВНАЯ" },
  { id: "add", icon: "➕", label: "ДОБАВИТЬ" },
  { id: "progress", icon: "📊", label: "ПРОГРЕСС" },
  { id: "achieve", icon: "🏆", label: "УСПЕХИ" },
];

/**
 * Navbar — навигационная панель
 * @param {object} props - Свойства компонента
 * @param {string} props.activeScreen - Активный экран
 * @param {Function} props.onNavigate - Callback при навигации
 * @param {Function} props.onHaptic - Callback для вибрации
 */
const Navbar = memo(function Navbar({ activeScreen, onNavigate, onHaptic }) {
  return (
    <nav
      className="nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(180deg, #c9b8ff, #a98aee)",
        borderTop: "3px solid #7c4dab",
        boxShadow: "0 -3px 0 #5c2d91",
        display: "flex",
        zIndex: 100,
      }}
    >
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            onHaptic?.('select');
            onNavigate(item.id);
          }}
          style={{
            flex: 1,
            padding: "10px 4px 8px",
            border: "none",
            background: activeScreen === item.id
              ? "linear-gradient(180deg, #7c4dab, #9b72cf)"
              : "transparent",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            borderRight: item.id !== NAV_ITEMS[NAV_ITEMS.length - 1].id ? "2px solid #9b72cf55" : "none",
            transition: "background 0.15s",
          }}
        >
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 5,
              color: activeScreen === item.id ? "#ffd6e0" : "white",
              textShadow: "1px 1px 0 #5c2d91",
              lineHeight: 1,
            }}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
});

export { Navbar, NAV_ITEMS };