import Engine from '@/lib/engine/engine.js';
import Sounds from '@/lib/audio/sounds.js';
import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';
import { hasBlockingAnimation } from '@/lib/animations/system.js';

/**
 * # 游戏主循环
 *
 * 控制游戏核心逻辑：下落、碰撞检测、锁定方块、消行、生成新方块 游戏结束或暂停时直接中断执行 每帧执行一次，保证游戏流畅运行
 *
 * @function stepGame
 * @param {object} [state=EngineState] - 游戏状态. Default is `EngineState`
 * @returns {boolean} 返回是否继续执行主循环
 */
const stepGame = (state) => {
  const mode = Engine.getMode();

  // 游戏结束 / 暂停 → 停止主循环
  if (mode === 'main-menu' || mode === 'game-over' || hasBlockingAnimation()) {
    return false;
  }

  // 尝试向下移动一格，无法移动时执行锁定逻辑
  if (!move(0, 1, state)) {
    // 锁定当前方块到棋盘
    lock(state);
    // 播放落地音效
    Sounds.fall();
    // 执行消行逻辑（包含闪烁3次特效）
    clearLines(state);
    // 生成新下落方块
    spawn(state);

    // 生成新方块后游戏结束 → 终止循环
    if (mode === 'game-over') {
      return false;
    }
  }

  // 正常继续循环
  return true;
};

export default stepGame;
