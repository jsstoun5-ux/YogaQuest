/**
 * GardenPreview Component for YogaQuest
 * Компактный превью-блок сада для главного экрана
 */
import { useMemo } from 'react';
import { getGardenStage, getGardenProgress, getStageTimeOfDay } from '../../garden/gardenStages.js';
import { calculateGardenState, getGardenSummary } from '../../garden/gardenEngine.js';
import './GardenPreview.css';

/**
 * Мини-иконка элемента сада
 */
function MiniElement({ type, color }) {
  return (
    <span 
      className={`garden-preview-mini garden-preview-mini--${type}`}
      style={{ '--mini-color': color }}
    >
      {type === 'flower' && '🌸'}
      {type === 'tree' && '🌳'}
      {type === 'lotus' && '🪷'}
      {type === 'lantern' && '🏮'}
      {type === 'water' && '💧'}
      {type === 'firefly' && '✨'}
      {type === 'stone' && '🪨'}
    </span>
  );
}

/**
 * Компактный превью сада
 */
export default function GardenPreview({ workouts, onClick, style }) {
  // Вычисляем состояние сада
  const gardenData = useMemo(() => {
    const state = calculateGardenState(workouts || []);
    const summary = getGardenSummary(state);
    return { state, summary };
  }, [workouts]);
  
  const { state, summary } = gardenData;
  const { stage, progress } = state;
  const timeOfDay = getStageTimeOfDay(stage);
  
  return (
    <div 
      className="garden-preview" 
      onClick={onClick}
      style={{ 
        background: timeOfDay.gradient,
        ...style 
      }}
    >
      {/* Иконка и название стадии */}
      <div className="garden-preview-header">
        <span className="garden-preview-icon">{stage.icon}</span>
        <div className="garden-preview-info">
          <div className="garden-preview-title">{stage.title}</div>
          <div className="garden-preview-count">
            {summary.practiceCount} {getPracticeWord(summary.practiceCount)}
          </div>
        </div>
      </div>
      
      {/* Мини-сцена */}
      <div className="garden-preview-scene">
        <div 
          className="garden-preview-ground"
          style={{ background: stage.colors.ground }}
        />
        
        {/* Мини-элементы */}
        <div className="garden-preview-elements">
          {stage.stage >= 1 && <MiniElement type="flower" color={stage.colors.accent} />}
          {stage.stage >= 3 && <MiniElement type="flower" color={stage.colors.accent} />}
          {stage.stage >= 5 && <MiniElement type="tree" color={stage.colors.grass} />}
          {stage.stage >= 6 && <MiniElement type="water" color={stage.colors.water} />}
          {stage.stage >= 7 && <MiniElement type="lotus" color={stage.colors.lotus} />}
          {stage.stage >= 7 && <MiniElement type="lantern" color={stage.colors.lantern} />}
        </div>
      </div>
      
      {/* Прогресс */}
      {!progress.isMaxStage && (
        <div className="garden-preview-progress">
          <div className="garden-preview-progress-bar">
            <div 
              className="garden-preview-progress-fill"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
          <div className="garden-preview-progress-text">
            {summary.nextStagePractices} до {progress.nextStage?.title}
          </div>
        </div>
      )}
      
      {/* Максимальная стадия */}
      {progress.isMaxStage && (
        <div className="garden-preview-max">
          ✨ Сад расцвёл
        </div>
      )}
      
      {/* Стрелка для перехода */}
      <div className="garden-preview-arrow">→</div>
    </div>
  );
}

/**
 * Получить правильную форму слова "практика"
 */
function getPracticeWord(count) {
  const lastTwo = count % 100;
  const lastOne = count % 10;
  
  if (lastTwo >= 11 && lastTwo <= 19) {
    return 'практик';
  }
  if (lastOne === 1) {
    return 'практика';
  }
  if (lastOne >= 2 && lastOne <= 4) {
    return 'практики';
  }
  return 'практик';
}

/**
 * Очень компактный превью для тикера
 */
export function GardenMiniPreview({ workouts }) {
  const stage = useMemo(() => {
    const count = (workouts || []).length;
    return getGardenStage(count);
  }, [workouts]);
  
  return (
    <span className="garden-mini-preview">
      <span className="garden-mini-icon">{stage.icon}</span>
      <span className="garden-mini-title">{stage.title}</span>
    </span>
  );
}