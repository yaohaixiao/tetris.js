import GameState from '../state/game-state.js';
import Sounds from '../audio/sounds.js';
import drawLevelSelect from '../ui/draw-level-select.js';
import start from '../core/start.js';
import startHiddenMode from '../core/start-hidden-mode.js';

const executeLevelSelectionCommand = (key) => {
  const lowerKey = key.toLowerCase();

  // 数字键 1-9 设置对应等级
  if (key >= '1' && key <= '9') {
    GameState.level = Number.parseInt(key, 10);
    Sounds.levelSelect();
    drawLevelSelect(GameState.level);
  }

  // 按住 P 键开始计时（触发隐藏模式）
  if (lowerKey === 'p') {
    startHiddenMode();
  }

  // Enter 键确认并开始游戏
  if (key === 'Enter') {
    start();
  }
};

export default executeLevelSelectionCommand;
