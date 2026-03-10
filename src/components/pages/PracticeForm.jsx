/**
 * PracticeForm — форма добавления новой практики
 */
import { memo, useState, useCallback } from 'react';
import { PixelBtn } from '../ui/PixelBtn.jsx';
import { PRACTICE_TYPES, MOODS, DURATION_PRESETS } from '../../constants/index.js';
import { getLocalDateStr } from '../../utils/dateUtils.js';

/**
 * Начальное состояние формы
 */
const INITIAL_FORM = {
  date: getLocalDateStr(),
  type: "",
  duration: 30,
  moodBefore: 3,
  moodAfter: 3,
  note: "",
};

/**
 * PracticeForm — форма добавления практики
 * @param {object} props - Свойства компонента
 * @param {Function} props.onSubmit - Callback при отправке формы
 * @param {Function} props.onHaptic - Callback для вибрации
 */
const PracticeForm = memo(function PracticeForm({ onSubmit, onHaptic }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  /**
   * Обработчик изменения поля
   */
  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  /**
   * Валидация формы
   */
  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!form.type) {
      newErrors.type = "Выбери тип практики";
    }
    if (!form.date) {
      newErrors.date = "Выбери дату";
    }
    if (form.duration < 5 || form.duration > 120) {
      newErrors.duration = "Длительность от 5 до 120 минут";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = useCallback(() => {
    if (!validate()) {
      onHaptic?.('error');
      return;
    }

    onHaptic?.('success');
    onSubmit(form);
    setForm(INITIAL_FORM);
  }, [form, validate, onSubmit, onHaptic]);

  return (
    <div
      className="pwin pwin-pink"
      style={{
        background: "#f5e6ff",
        border: "3px solid #c9607a",
        boxShadow: "4px 4px 0 #c9607a",
        marginBottom: 14,
      }}
    >
      {/* Header */}
      <div
        className="pwin-title"
        style={{
          background: "linear-gradient(90deg, #ff8fab, #ffb3c6)",
          padding: "5px 8px",
          borderBottom: "2px solid #c9607a",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "7px",
            color: "white",
            textShadow: "1px 1px 0 #7c1d36",
            flex: 1,
          }}
        >
          НОВАЯ ПРАКТИКА.EXE
        </span>
        <div
          style={{
            width: 14,
            height: 14,
            background: "#ffe0eb",
            border: "2px solid #c9607a",
            fontSize: 7,
            color: "#7c1d36",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Press Start 2P', monospace",
          }}
        >
          ✕
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 12 }}>
        {/* Date */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#9b72cf",
              display: "block",
              marginBottom: 7,
              textShadow: "1px 1px 0 #e8d5ff",
            }}
          >
            ▶ ДАТА
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
            style={{
              width: "100%",
              background: "#fff0f5",
              border: `2px solid ${errors.date ? '#ff6b8a' : '#c9b8ff'}`,
              boxShadow: "2px 2px 0 #9b72cf",
              padding: "8px 10px",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              color: "#5c2d91",
              outline: "none",
            }}
          />
          {errors.date && (
            <div style={{ color: "#ff6b8a", fontSize: 6, marginTop: 4, fontFamily: "'Press Start 2P', monospace" }}>
              {errors.date}
            </div>
          )}
        </div>

        {/* Practice Type */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#9b72cf",
              display: "block",
              marginBottom: 7,
              textShadow: "1px 1px 0 #e8d5ff",
            }}
          >
            ▶ ТИП ПРАКТИКИ
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 7,
            }}
          >
            {PRACTICE_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  handleChange('type', t.id);
                  onHaptic?.('select');
                }}
                style={{
                  background: form.type === t.id ? "#ede0ff" : "#fff0f5",
                  border: `2px solid ${form.type === t.id ? "#9b72cf" : "#ffb3c6"}`,
                  boxShadow: form.type === t.id ? "3px 3px 0 #7c4dab" : "2px 2px 0 #c9607a",
                  padding: "9px 8px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "transform 0.1s",
                  fontFamily: "'Press Start 2P', monospace",
                }}
              >
                <span style={{ fontSize: 18, display: "block", marginBottom: 4 }}>{t.icon}</span>
                <span style={{ fontSize: 6, color: form.type === t.id ? "#5c2d91" : "#7c1d36", display: "block" }}>
                  {t.label}
                </span>
                <span style={{ fontSize: 9, color: "#c084fc", marginTop: 2, display: "block", fontFamily: "'Nunito', sans-serif" }}>
                  {t.desc}
                </span>
              </button>
            ))}
          </div>
          {errors.type && (
            <div style={{ color: "#ff6b8a", fontSize: 6, marginTop: 4, fontFamily: "'Press Start 2P', monospace", animation: "blink 1s infinite" }}>
              ← {errors.type}
            </div>
          )}
        </div>

        {/* Duration */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#9b72cf",
              display: "block",
              marginBottom: 7,
              textShadow: "1px 1px 0 #e8d5ff",
            }}
          >
            ▶ ДЛИТЕЛЬНОСТЬ
          </label>
          <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
            {DURATION_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  handleChange('duration', p);
                  onHaptic?.('light');
                }}
                style={{
                  flex: 1,
                  padding: "6px 3px",
                  border: "2px solid #c9b8ff",
                  background: form.duration === p ? "#9b72cf" : "#ede0ff",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 6,
                  color: form.duration === p ? "white" : "#5c2d91",
                  cursor: "pointer",
                  boxShadow: "2px 2px 0 #9b72cf",
                  transition: "all 0.1s",
                }}
              >
                {p}'
              </button>
            ))}
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 24,
              color: "#ff8fab",
              textAlign: "center",
              textShadow: "2px 2px 0 #c9607a",
              padding: 8,
              background: "#fff0f5",
              border: "2px solid #ffb3c6",
              boxShadow: "2px 2px 0 #c9607a",
              marginBottom: 8,
            }}
          >
            {form.duration} МИН
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={form.duration}
            onChange={(e) => handleChange('duration', Number(e.target.value))}
            style={{
              width: "100%",
              WebkitAppearance: "none",
              height: 8,
              background: "repeating-linear-gradient(90deg, #ff8fab 0px, #ff8fab 4px, #c9607a 4px, #c9607a 8px)",
              border: "2px solid #c9607a",
              imageRendering: "pixelated",
              cursor: "pointer",
              outline: "none",
            }}
          />
        </div>

        {/* Mood Before */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#9b72cf",
              display: "block",
              marginBottom: 7,
              textShadow: "1px 1px 0 #e8d5ff",
            }}
          >
            ▶ НАСТРОЕНИЕ ДО
          </label>
          <div style={{ display: "flex", gap: 5 }}>
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  handleChange('moodBefore', m.id);
                  onHaptic?.('light');
                }}
                style={{
                  flex: 1,
                  border: `2px solid ${form.moodBefore === m.id ? "#ff8fab" : "#e8d5ff"}`,
                  background: form.moodBefore === m.id ? "#ffe0eb" : "#fff0f5",
                  padding: "8px 2px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.1s",
                  boxShadow: form.moodBefore === m.id ? "2px 2px 0 #c9607a" : "2px 2px 0 #c9b8ff",
                  transform: form.moodBefore === m.id ? "scale(1.08)" : "none",
                }}
              >
                <span style={{ fontSize: 18, display: "block" }}>{m.pixel}</span>
                <span style={{ fontSize: 5, color: "#9b72cf", marginTop: 3, display: "block", fontFamily: "'Press Start 2P', monospace", lineHeight: 1.4 }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood After */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#9b72cf",
              display: "block",
              marginBottom: 7,
              textShadow: "1px 1px 0 #e8d5ff",
            }}
          >
            ▶ НАСТРОЕНИЕ ПОСЛЕ
          </label>
          <div style={{ display: "flex", gap: 5 }}>
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  handleChange('moodAfter', m.id);
                  onHaptic?.('light');
                }}
                style={{
                  flex: 1,
                  border: `2px solid ${form.moodAfter === m.id ? "#ff8fab" : "#e8d5ff"}`,
                  background: form.moodAfter === m.id ? "#ffe0eb" : "#fff0f5",
                  padding: "8px 2px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.1s",
                  boxShadow: form.moodAfter === m.id ? "2px 2px 0 #c9607a" : "2px 2px 0 #c9b8ff",
                  transform: form.moodAfter === m.id ? "scale(1.08)" : "none",
                }}
              >
                <span style={{ fontSize: 18, display: "block" }}>{m.pixel}</span>
                <span style={{ fontSize: 5, color: "#9b72cf", marginTop: 3, display: "block", fontFamily: "'Press Start 2P', monospace", lineHeight: 1.4 }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#9b72cf",
              display: "block",
              marginBottom: 7,
              textShadow: "1px 1px 0 #e8d5ff",
            }}
          >
            ▶ ЗАМЕТКА
          </label>
          <textarea
            placeholder="как прошла практика? ✨"
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
            style={{
              width: "100%",
              background: "#fff0f5",
              border: "2px solid #c9b8ff",
              boxShadow: "2px 2px 0 #9b72cf",
              padding: "8px 10px",
              fontFamily: "'Nunito', sans-serif",
              fontSize: 9,
              color: "#5c2d91",
              outline: "none",
              resize: "none",
              minHeight: 70,
            }}
          />
        </div>

        {/* Submit */}
        <PixelBtn
          variant="primary"
          disabled={!form.type}
          style={{ width: "100%", padding: "14px", fontSize: "9px" }}
          onClick={handleSubmit}
        >
          💾 СОХРАНИТЬ
        </PixelBtn>
      </div>
    </div>
  );
});

export { PracticeForm, INITIAL_FORM };