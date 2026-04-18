import move from '@/lib/game/logic/move.js';
import rotate from '@/lib/game/logic/rotate.js';
import drop from '@/lib/game/logic/drop.js';
import renderActiveOnly from '@/lib/ui/render-active-only.js';

// 游戏操控映射
const ACTION_MAP = {
  MOVE_LEFT: () => {
    move(-1, 0);
    renderActiveOnly();
  },
  MOVE_RIGHT: () => {
    move(1, 0);
    renderActiveOnly();
  },
  MOVE_DOWN: () => {
    move(0, 1);
    renderActiveOnly();
  },
  ROTATE: () => {
    rotate();
    renderActiveOnly();
  },
  DROP: () => {
    drop();
    renderActiveOnly();
  },
};

/**
 * # 处理游戏进行中的方向操控按键
 *
 * 方向键移动/旋转、空格快速下落
 *
 * @function gamePlayingActions
 * @param {string} action - 操作名称
 * @returns {void}
 */
const gamePlayingActions = (action) => {
  const handler = ACTION_MAP[action];

  handler?.();
};

export default gamePlayingActions;
