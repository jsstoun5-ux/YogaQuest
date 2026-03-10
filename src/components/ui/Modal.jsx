/**
 * Modal — модальное окно в пиксельном стиле
 */
import { memo, useEffect } from 'react';

/**
 * Modal — модальное окно
 * @param {object} props - Свойства компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onClose - Callback при закрытии
 * @param {React.ReactNode} props.children - Содержимое
 * @param {string} props.variant - Вариант стиля (default, pink, yellow)
 */
const Modal = memo(function Modal({ isOpen, onClose, children, variant = "default" }) {
  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    default: {
      background: "#f5e6ff",
      border: "3px solid #9b72cf",
      boxShadow: "4px 4px 0 #7c4dab",
    },
    pink: {
      background: "#fff0f5",
      border: "4px solid #ff8fab",
      boxShadow: "6px 6px 0 #c9607a",
    },
    yellow: {
      background: "#fff9c4",
      border: "3px solid #ffd166",
      boxShadow: "4px 4px 0 #b8860b",
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className="modal-bg"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "#9b72cf55",
        backdropFilter: "blur(2px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...styles,
          padding: "24px 20px",
          textAlign: "center",
          animation: "popIn 0.3s ease",
          maxWidth: "280px",
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
});

/**
 * SaveModal — модальное окно сохранения
 * @param {object} props - Свойства компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 */
const SaveModal = memo(function SaveModal({ isOpen }) {
  return (
    <Modal isOpen={isOpen} variant="pink">
      <span style={{ fontSize: 40, animation: "pixelFloat 1s ease-in-out infinite", marginBottom: 12, display: "block" }}>
        💾
      </span>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: "#c9607a", textShadow: "2px 2px 0 #ffb3c6" }}>
        СОХРАНЕНО!
      </div>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: "#9b72cf", marginTop: 8 }}>
        ты молодец ♥
      </div>
    </Modal>
  );
});

/**
 * DeleteConfirmModal — модальное окно подтверждения удаления
 * @param {object} props - Свойства компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onConfirm - Callback при подтверждении
 * @param {Function} props.onCancel - Callback при отмене
 */
const DeleteConfirmModal = memo(function DeleteConfirmModal({ isOpen, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} variant="default">
      <span style={{ fontSize: 32, display: "block", marginBottom: 10 }}>🗑️</span>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: "#c9607a", marginBottom: 6 }}>
        УДАЛИТЬ ЗАПИСЬ?
      </div>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: "#9b72cf" }}>
        это нельзя отменить
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
        <button
          onClick={onCancel}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            padding: "8px 12px",
            background: "#f5e6ff",
            border: "2px solid #9b72cf",
            color: "#9b72cf",
            cursor: "pointer",
            boxShadow: "2px 2px 0 #9b72cf",
          }}
        >
          НЕТ
        </button>
        <button
          onClick={onConfirm}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            padding: "8px 12px",
            background: "linear-gradient(180deg, #ffb3c6 0%, #ff6b8a 100%)",
            border: "2px solid #c9607a",
            color: "#7c1d36",
            cursor: "pointer",
            boxShadow: "2px 2px 0 #c9607a",
          }}
        >
          ДА
        </button>
      </div>
    </Modal>
  );
});

export { Modal, SaveModal, DeleteConfirmModal };