/**
 * Onboarding — компонент онбординга для новых пользователей
 */
import { memo, useState } from 'react';
import { PixelBtn } from '../ui/PixelBtn.jsx';
import { ONBOARD_STEPS } from '../../constants/index.js';

/**
 * Onboarding — модальное окно приветствия
 * @param {object} props - Свойства компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onComplete - Callback при завершении онбординга
 */
const Onboarding = memo(function Onboarding({ isOpen, onComplete }) {
  const [step, setStep] = useState(0);
  const currentStep = ONBOARD_STEPS[step];
  const isLastStep = step === ONBOARD_STEPS.length - 1;

  if (!isOpen) return null;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div
      className="onboard-bg"
      style={{
        position: "fixed",
        inset: 0,
        background: "#ede0ffcc",
        backdropFilter: "blur(3px)",
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="onboard-win"
        style={{
          background: "#f5e6ff",
          border: "4px solid #9b72cf",
          boxShadow: "6px 6px 0 #5c2d91",
          maxWidth: "320px",
          width: "100%",
          animation: "popIn 0.3s ease",
        }}
      >
        {/* Header */}
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
            className="pwin-title-text"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "7px",
              color: "white",
              textShadow: "1px 1px 0 #5c2d91",
              flex: 1,
            }}
          >
            {currentStep.title}
          </span>
          <div
            className="win-btn"
            style={{
              width: 14,
              height: 14,
              background: "#e8d5ff",
              border: "2px solid #9b72cf",
              fontSize: 7,
              color: "#5c2d91",
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
        <div
          className="onboard-body"
          style={{
            padding: "24px 20px 20px",
            textAlign: "center",
          }}
        >
          <span
            className="onboard-icon"
            style={{
              fontSize: 48,
              animation: "pixelFloat 2s ease-in-out infinite",
              display: "block",
              marginBottom: 14,
            }}
          >
            {currentStep.icon}
          </span>

          <div
            className="onboard-sub"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 7,
              color: "#ff8fab",
              animation: "blink 1s infinite",
              marginBottom: 12,
            }}
          >
            {currentStep.sub}_
          </div>

          <div
            className="onboard-text"
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 13,
              color: "#7c4dab",
              lineHeight: 1.6,
              marginBottom: 18,
            }}
          >
            {currentStep.text}
          </div>

          {/* Dots */}
          <div
            className="onboard-dots"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginBottom: 16,
            }}
          >
            {ONBOARD_STEPS.map((_, i) => (
              <div
                key={i}
                className={`onboard-dot${step === i ? " active" : ""}`}
                style={{
                  width: step === i ? 20 : 8,
                  height: 8,
                  background: step === i ? "#ff8fab" : "#e8d5ff",
                  border: `2px solid ${step === i ? "#c9607a" : "#9b72cf"}`,
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>

          <PixelBtn
            variant="primary"
            style={{ width: "100%" }}
            onClick={handleNext}
          >
            {isLastStep ? "НАЧАТЬ !!!" : "ДАЛЬШЕ >>>"}
          </PixelBtn>
        </div>
      </div>
    </div>
  );
});

export { Onboarding };