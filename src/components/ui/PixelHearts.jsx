/**
 * PixelHearts — пиксельные сердечки
 */
import { memo } from 'react';

/**
 * SVG сердечка как CSS background
 */
const HEART_FULL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Crect x='1' y='3' width='3' height='1' fill='%23ff8fab'/%3E%3Crect x='6' y='3' width='3' height='1' fill='%23ff8fab'/%3E%3Crect x='0' y='4' width='4' height='3' fill='%23ff8fab'/%3E%3Crect x='6' y='4' width='4' height='3' fill='%23ff8fab'/%3E%3Crect x='1' y='7' width='8' height='1' fill='%23ff8fab'/%3E%3Crect x='2' y='8' width='6' height='1' fill='%23ff8fab'/%3E%3Crect x='3' y='9' width='4' height='1' fill='%23ff8fab'/%3E%3Crect x='4' y='2' width='2' height='1' fill='%23ff8fab'/%3E%3Crect x='1' y='3' width='2' height='1' fill='%23ffb3c6'/%3E%3C/svg%3E")`;

const HEART_EMPTY = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Crect x='1' y='3' width='3' height='1' fill='%23e8d5ff'/%3E%3Crect x='6' y='3' width='3' height='1' fill='%23e8d5ff'/%3E%3Crect x='0' y='4' width='4' height='3' fill='%23e8d5ff'/%3E%3Crect x='6' y='4' width='4' height='3' fill='%23e8d5ff'/%3E%3Crect x='1' y='7' width='8' height='1' fill='%23e8d5ff'/%3E%3Crect x='2' y='8' width='6' height='1' fill='%23e8d5ff'/%3E%3Crect x='3' y='9' width='4' height='1' fill='%23e8d5ff'/%3E%3Crect x='4' y='2' width='2' height='1' fill='%23e8d5ff'/%3E%3C/svg%3E")`;

/**
 * Стили для сердечка
 */
const HEART_STYLES = {
  width: 18,
  height: 18,
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  imageRendering: "pixelated",
};

/**
 * PixelHearts — ряд пиксельных сердечек
 * @param {object} props - Свойства компонента
 * @param {number} props.filled - Количество заполненных сердечек
 * @param {number} props.total - Общее количество сердечек
 */
const PixelHearts = memo(function PixelHearts({ filled, total = 5 }) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            ...HEART_STYLES,
            backgroundImage: i < filled ? HEART_FULL : HEART_EMPTY,
          }}
        />
      ))}
    </div>
  );
});

/**
 * HeartBar — полоска прогресса из сердечек
 * @param {object} props - Свойства компонента
 * @param {number} props.value - Текущее значение
 * @param {number} props.max - Максимальное значение
 * @param {string} props.width - Ширина компонента
 */
const HeartBar = memo(function HeartBar({ value, max, width = "100%" }) {
  const total = 10;
  const filled = max > 0 ? Math.round((value / max) * total) : 0;

  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", width }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            backgroundImage: i < filled ? HEART_FULL : HEART_EMPTY,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
});

export { PixelHearts, HeartBar, HEART_FULL, HEART_EMPTY };