/**
 * PracticeList — список тренировок с фильтрацией
 */
import { memo, useState, useMemo } from 'react';
import { PRACTICE_TYPES, MOODS } from '../../constants/index.js';
import { formatDate } from '../../utils/dateUtils.js';
import { DeleteConfirmModal } from '../ui/Modal.jsx';

/**
 * PracticeList — список тренировок
 * @param {object} props - Свойства компонента
 * @param {Array} props.workouts - Массив тренировок
 * @param {Function} props.onDelete - Callback при удалении
 * @param {Function} props.onHaptic - Callback для вибрации
 */
const PracticeList = memo(function PracticeList({ workouts, onDelete, onHaptic }) {
  const [filter, setFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Получить типы тренировок, которые есть у пользователя
  const availableTypes = useMemo(() => {
    const types = new Set(workouts.map(w => w.type));
    return PRACTICE_TYPES.filter(t => types.has(t.id));
  }, [workouts]);

  // Отфильтрованные тренировки
  const filteredWorkouts = useMemo(() => {
    if (filter === "all") return workouts;
    return workouts.filter(w => w.type === filter);
  }, [workouts, filter]);

  /**
   * Обработчик удаления
   */
  const handleDelete = () => {
    if (deleteConfirm) {
      onHaptic?.('medium');
      onDelete(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      {/* Filter buttons */}
      <div
        style={{
          display: "flex",
          gap: 5,
          marginBottom: 10,
          overflowX: "auto",
          paddingBottom: 3,
        }}
      >
        <button
          onClick={() => {
            setFilter("all");
            onHaptic?.('select');
          }}
          style={{
            flexShrink: 0,
            padding: "5px 8px",
            border: "2px solid #c9b8ff",
            background: filter === "all" ? "#9b72cf" : "#f5e6ff",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
            color: filter === "all" ? "white" : "#9b72cf",
            cursor: "pointer",
            boxShadow: "1px 1px 0 #9b72cf",
          }}
        >
          ВСЕ
        </button>
        {availableTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setFilter(t.id);
              onHaptic?.('select');
            }}
            style={{
              flexShrink: 0,
              padding: "5px 8px",
              border: "2px solid #c9b8ff",
              background: filter === t.id ? "#9b72cf" : "#f5e6ff",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 6,
              color: filter === t.id ? "white" : "#9b72cf",
              cursor: "pointer",
              boxShadow: "1px 1px 0 #9b72cf",
            }}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* List */}
      <div
        className="pwin"
        style={{
          background: "#f5e6ff",
          border: "3px solid #9b72cf",
          boxShadow: "4px 4px 0 #7c4dab",
          marginBottom: 14,
        }}
      >
        <div
          className="pwin-title"
          style={{
            background: "linear-gradient(90deg, #9b72cf, #c084fc)",
            padding: "5px 8px",
            borderBottom: "2px solid #9b72cf",
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
              textShadow: "1px 1px 0 #5c2d91",
              flex: 1,
            }}
          >
            ИСТОРИЯ.EXE
          </span>
        </div>

        <div style={{ padding: 12 }}>
          {filteredWorkouts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px 20px",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                color: "#c9b8ff",
                lineHeight: 2,
              }}
            >
              <div>🌸</div>
              <div>НЕТ ЗАПИСЕЙ</div>
            </div>
          ) : (
            filteredWorkouts.map((w) => {
              const pt = PRACTICE_TYPES.find(t => t.id === w.type);
              const ma = MOODS.find(m => m.id === w.moodAfter);

              return (
                <div
                  key={w.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderBottom: "2px dashed #ffb3c6",
                    padding: "8px 0",
                  }}
                >
                  <div style={{ fontSize: 22, flexShrink: 0, width: 32, textAlign: "center" }}>
                    {pt?.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#5c2d91" }}>
                      {pt?.label}
                    </div>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#c084fc", marginTop: 4 }}>
                      {formatDate(w.date)} · {w.duration} МИН
                    </div>
                    {w.note && (
                      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, color: "#9b72cf", marginTop: 3, fontStyle: "italic" }}>
                        "{w.note}"
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 18, marginRight: 4 }}>{ma?.pixel}</span>
                  <button
                    onClick={() => setDeleteConfirm(w.id)}
                    style={{
                      background: "none",
                      border: "2px solid #ffb3c6",
                      color: "#ff8fab",
                      fontSize: 9,
                      padding: "3px 5px",
                      cursor: "pointer",
                      fontFamily: "'Press Start 2P', monospace",
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
});

export { PracticeList };