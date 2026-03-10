/**
 * GardenScene Component for YogaQuest
 * Визуальное отображение сада практики
 */
import { useMemo } from 'react';
import { 
  getGardenStage, 
  getGardenProgress, 
  getStageTimeOfDay,
  GARDEN_STAGES 
} from '../../garden/gardenStages.js';
import { calculateGardenState } from '../../garden/gardenEngine.js';
import './GardenScene.css';

/**
 * Пиксельный элемент сада
 */
function PixelElement({ type, x, y, size = 1, color, opacity = 1, animation }) {
  const style = {
    left: `${x}%`,
    top: `${y}%`,
    transform: `scale(${size})`,
    opacity,
    '--element-color': color,
  };
  
  if (animation) {
    style.animation = animation;
  }
  
  return (
    <div 
      className={`garden-element garden-element--${type}`}
      style={style}
    />
  );
}

/**
 * Рендеринг элементов сада по стадии
 */
function GardenElements({ stage, objects, practiceCount }) {
  const elements = [];
  
  // Базовые элементы в зависимости от стадии
  switch (stage.stage) {
    case 0:
      // Пустой участок
      elements.push(
        <PixelElement key="stone1" type="stone" x={50} y={70} size={0.8} color="#a8a8a8" />
      );
      break;
      
    case 1:
      // Первый мох
      elements.push(
        <PixelElement key="moss1" type="moss" x={30} y={75} size={0.6} color="#9CD67A" />,
        <PixelElement key="moss2" type="moss" x={60} y={78} size={0.5} color="#7FC97F" />,
        <PixelElement key="grass1" type="grass" x={45} y={80} size={0.4} color="#9CD67A" />
      );
      break;
      
    case 2:
      // Ростки внимания
      elements.push(
        <PixelElement key="grass1" type="grass" x={25} y={75} size={0.7} color="#9CD67A" />,
        <PixelElement key="grass2" type="grass" x={40} y={78} size={0.8} color="#7FC97F" />,
        <PixelElement key="grass3" type="grass" x={60} y={76} size={0.6} color="#9CD67A" />,
        <PixelElement key="sprout1" type="sprout" x={35} y={70} size={0.5} color="#7FC97F" />,
        <PixelElement key="sprout2" type="sprout" x={55} y={72} size={0.6} color="#5a8a4a" />
      );
      break;
      
    case 3:
      // Цветение ритма
      elements.push(
        <PixelElement key="grass1" type="grass" x={20} y={75} size={0.8} color="#9CD67A" />,
        <PixelElement key="grass2" type="grass" x={50} y={78} size={0.9} color="#7FC97F" />,
        <PixelElement key="grass3" type="grass" x={75} y={76} size={0.7} color="#9CD67A" />,
        <PixelElement key="flower1" type="flower" x={30} y={68} size={0.6} color="#FF9EC7" />,
        <PixelElement key="flower2" type="flower" x={50} y={65} size={0.7} color="#C9B8FF" />,
        <PixelElement key="flower3" type="flower" x={70} y={70} size={0.5} color="#FF9EC7" />,
        <PixelElement key="stone1" type="stone" x={85} y={80} size={0.6} color="#a8a8a8" />
      );
      break;
      
    case 4:
      // Камни покоя
      elements.push(
        <PixelElement key="stone1" type="stone" x={25} y={75} size={0.9} color="#b8b8b8" />,
        <PixelElement key="stone2" type="stone" x={65} y={78} size={0.7} color="#a8a8a8" />,
        <PixelElement key="stone3" type="stone" x={45} y={82} size={0.5} color="#c8c8c8" />,
        <PixelElement key="path1" type="path" x={35} y={85} size={1} color="#c9b8a8" />,
        <PixelElement key="grass1" type="grass" x={20} y={72} size={0.8} color="#9CD67A" />,
        <PixelElement key="grass2" type="grass" x={75} y={74} size={0.7} color="#7FC97F" />,
        <PixelElement key="plant1" type="plant" x={55} y={68} size={0.6} color="#5a8a4a" />
      );
      break;
      
    case 5:
      // Дерево устойчивости
      elements.push(
        <PixelElement key="tree1" type="tree" x={50} y={45} size={1.2} color="#5a8a4a" />,
        <PixelElement key="grass1" type="grass" x={20} y={78} size={0.8} color="#9CD67A" />,
        <PixelElement key="grass2" type="grass" x={70} y={76} size={0.7} color="#7FC97F" />,
        <PixelElement key="flower1" type="flower" x={30} y={70} size={0.6} color="#FF9EC7" />,
        <PixelElement key="flower2" type="flower" x={65} y={72} size={0.5} color="#C9B8FF" />,
        <PixelElement key="firefly1" type="firefly" x={25} y={30} size={0.3} color="#F7D774" animation="float 3s ease-in-out infinite" />,
        <PixelElement key="firefly2" type="firefly" x={75} y={25} size={0.25} color="#F7D774" animation="float 4s ease-in-out infinite reverse" />
      );
      break;
      
    case 6:
      // Вода внимания
      elements.push(
        <PixelElement key="water" type="water" x={50} y={65} size={1.5} color="#8ED6E8" />,
        <PixelElement key="grass1" type="grass" x={20} y={75} size={0.8} color="#9CD67A" />,
        <PixelElement key="grass2" type="grass" x={75} y={78} size={0.7} color="#7FC97F" />,
        <PixelElement key="flower1" type="flower" x={25} y={68} size={0.6} color="#FF9EC7" />,
        <PixelElement key="flower2" type="flower" x={70} y={70} size={0.5} color="#C9B8FF" />,
        <PixelElement key="reflection" type="reflection" x={50} y={60} size={0.8} color="#6ab8c9" />
      );
      break;
      
    case 7:
      // Лотос и фонари
      elements.push(
        <PixelElement key="water" type="water" x={50} y={70} size={1.3} color="#6ab8c9" />,
        <PixelElement key="lotus1" type="lotus" x={45} y={62} size={0.8} color="#FF9EC7" />,
        <PixelElement key="lotus2" type="lotus" x={60} y={65} size={0.6} color="#FF9EC7" />,
        <PixelElement key="lantern1" type="lantern" x={20} y={50} size={0.7} color="#F7D774" animation="glow 2s ease-in-out infinite" />,
        <PixelElement key="lantern2" type="lantern" x={80} y={55} size={0.6} color="#F7D774" animation="glow 2.5s ease-in-out infinite reverse" />,
        <PixelElement key="grass1" type="grass" x={15} y={78} size={0.7} color="#7FC97F" />,
        <PixelElement key="grass2" type="grass" x={85} y={76} size={0.6} color="#9CD67A" />
      );
      break;
      
    case 8:
      // Сад безмятежности
      elements.push(
        <PixelElement key="tree1" type="tree" x={30} y={40} size={1} color="#4a7a3a" />,
        <PixelElement key="water" type="water" x={60} y={65} size={1.2} color="#6ab8c9" />,
        <PixelElement key="lotus1" type="lotus" x={55} y={60} size={0.9} color="#FF9EC7" />,
        <PixelElement key="lotus2" type="lotus" x={65} y={63} size={0.7} color="#FF9EC7" />,
        <PixelElement key="lantern1" type="lantern" x={15} y={45} size={0.8} color="#F7D774" animation="glow 2s ease-in-out infinite" />,
        <PixelElement key="lantern2" type="lantern" x={85} y={50} size={0.7} color="#F7D774" animation="glow 2.5s ease-in-out infinite reverse" />,
        <PixelElement key="lantern3" type="lantern" x={50} y={30} size={1} color="#ffd700" animation="glow 3s ease-in-out infinite" />,
        <PixelElement key="stone1" type="stone" x={40} y={80} size={0.6} color="#b8b8b8" />,
        <PixelElement key="stone2" type="stone" x={75} y={82} size={0.5} color="#a8a8a8" />,
        <PixelElement key="bridge" type="bridge" x={45} y={75} size={0.8} color="#8a7355" />,
        <PixelElement key="firefly1" type="firefly" x={20} y={25} size={0.3} color="#F7D774" animation="float 3s ease-in-out infinite" />,
        <PixelElement key="firefly2" type="firefly" x={80} y={20} size={0.25} color="#F7D774" animation="float 4s ease-in-out infinite reverse" />,
        <PixelElement key="firefly3" type="firefly" x={35} y={35} size={0.2} color="#F7D774" animation="float 3.5s ease-in-out infinite" />
      );
      break;
  }
  
  // Добавляем объекты из achievements и streak
  objects.forEach((obj, index) => {
    if (obj.id.includes('firefly') && obj.count > 0) {
      for (let i = 0; i < Math.min(obj.count, 5); i++) {
        elements.push(
          <PixelElement 
            key={`dynamic-firefly-${i}`}
            type="firefly" 
            x={20 + i * 15} 
            y={20 + (i % 3) * 10} 
            size={0.2 + (i % 3) * 0.05} 
            color="#F7D774" 
            animation={`float ${3 + i * 0.5}s ease-in-out infinite`}
          />
        );
      }
    }
  });
  
  return elements;
}

/**
 * Компонент сцены сада
 */
export default function GardenScene({ workouts, unlockedAchievements = [] }) {
  // Вычисляем состояние сада
  const gardenState = useMemo(() => {
    return calculateGardenState(workouts || [], unlockedAchievements);
  }, [workouts, unlockedAchievements]);
  
  const { stage, progress, activeObjects, practiceCount } = gardenState;
  const timeOfDay = getStageTimeOfDay(stage);
  
  // Стили для фона
  const backgroundStyle = {
    background: timeOfDay.gradient,
  };
  
  return (
    <div className="garden-scene" style={backgroundStyle}>
      {/* Заголовок стадии */}
      <div className="garden-header">
        <div className="garden-stage-icon">{stage.icon}</div>
        <div className="garden-stage-info">
          <div className="garden-stage-title">{stage.title}</div>
          <div className="garden-stage-desc">{stage.description}</div>
        </div>
      </div>
      
      {/* Сцена сада */}
      <div className="garden-canvas">
        {/* Земля */}
        <div className="garden-ground" style={{ background: stage.colors.ground }} />
        
        {/* Элементы сада */}
        <div className="garden-elements">
          <GardenElements 
            stage={stage} 
            objects={activeObjects} 
            practiceCount={practiceCount} 
          />
        </div>
      </div>
      
      {/* Прогресс до следующей стадии */}
      {!progress.isMaxStage && (
        <div className="garden-progress">
          <div className="garden-progress-bar">
            <div 
              className="garden-progress-fill"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
          <div className="garden-progress-text">
            {progress.practicesNeededForNext} практик до {progress.nextStage?.title}
          </div>
        </div>
      )}
      
      {/* Максимальная стадия */}
      {progress.isMaxStage && (
        <div className="garden-max-stage">
          ✨ Сад достиг полной красоты ✨
        </div>
      )}
    </div>
  );
}