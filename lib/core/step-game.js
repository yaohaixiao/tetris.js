import Sounds from '../audio/sounds.js';
import renderActiveOnly from '../ui/render-active-only.js';
import move from '../game/move.js';
import lock from '../game/lock.js';
import clearLines from '../game/clear-lines.js';
import spawn from '../game/spawn.js';
import getGameStateMode from '../state/get-game-state-mode.js';
import { hasBlockingAnimation } from '../animations/system.js';

/**
 * # 游戏主循环
 *
 * 控制游戏核心逻辑：下落、碰撞检测、锁定方块、消行、生成新方块 游戏结束或暂停时直接中断执行 每帧执行一次，保证游戏流畅运行
 *
 * @function stepGame
 * @returns {boolean} 返回是否继续执行主循环
 */
const stepGame = () => {
  const mode = getGameStateMode();

  // 游戏结束 / 暂停 → 停止主循环
  if (mode === 'game-over' || mode === 'main-menu' || hasBlockingAnimation()) {
    return false;
  }

  // 尝试向下移动一格，无法移动时执行锁定逻辑
  if (!move(0, 1)) {
    // 锁定当前方块到棋盘
    lock();
    // 播放落地音效
    Sounds.fall();
    // 执行消行逻辑（包含闪烁3次特效）
    clearLines();
    // 生成新下落方块
    spawn();

    // 生成新方块后游戏结束 → 终止循环
    if (mode === 'game-over') {
      return false;
    }
  }

  // 绘制游戏棋盘 + 当前下落方块
  renderActiveOnly();

  // 正常继续循环
  return true;
};

export default stepGame;
