/**
 * PixelBtn — пиксельная кнопка в стиле Y2K
 */
import { memo } from 'react';

/**
 * Варианты стилей кнопки
 */
const VARIANTS = {
  primary: {
    background: "linear-gradient(180deg, #ffb3c6 0%, #ff8fab 100%)",
    color: "#7c1d36",
    boxShadow: "3px 3px 0 #c9607a, inset 1px 1px 0 #ffd6e0",
    border: "2px solid #c9607a",
  },
  purple: {
    background: "linear-gradient(180deg, #d8b8ff 0%, #b98ef0 100%)",
    color: "#3d1060",
    boxShadow: "3px 3px 0 #7c4dab, inset 1px 1px 0 #ede0ff",
    border: "2px solid #7c4dab",
  },
  ghost: {
    background: "#f5e6ff",
    color: "#9b72cf",
    boxShadow: "2px 2px 0 #9b72cf",
    border: "2px solid #9b72cf",
  },
  danger: {
    background: "linear-gradient(180deg, #ffb3c6 0%, #ff6b8a 100%)",
    color: "#7c1d36",
    boxShadow: "3px 3px 0 #c9607a",
    border: "2px solid #c9607a",
  },
};

/**
 * Базовые стили кнопки
 */
const BASE_STYLES = {
  fontFamily: "'Press Start 2P', monospace",
  fontSize: "8px",
  cursor: "pointer",
  border: "none",
  padding: "10px 14px",
  letterSpacing: 1,
  transition: "transform 0.1s",
  imageRendering: "pixelated",
};

/**
 * PixelBtn — пиксельная кнопка
 * @param {object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое кнопки
 * @param {Function} props.onClick - Обработчик клика
 * @param {object} props.style - Дополнительные стили
 * @param {string} props.variant - Вариант стиля (primary, purple, ghost, danger)
 * @param {boolean} props.disabled - Отключена ли кнопка
 */
const PixelBtn = memo(function PixelBtn({
  children,
  onClick,
  style = {},
  variant = "primary",
  disabled = false,
}) {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;

  const handleMouseDown = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = "translate(2px, 2px)";
    e.currentTarget.style.boxShadow = `1px 1px 0 ${variant === 'primary' || variant === 'danger' ? '#c9607a' : '#7c4dab'}`;
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = "";
    e.currentTarget.style.boxShadow = variantStyles.boxShadow;
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      disabled={disabled}
      style={{
        ...BASE_STYLES,
        ...variantStyles,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
});

export { PixelBtn, VARIANTS };