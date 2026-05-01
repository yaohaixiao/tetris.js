import Engine from '@/lib/engine';
import Sounds from '@/lib/audio/sounds.js';
import Game from '@/lib/game';
import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';

/**
 * # 游戏主循环
 *
 * 控制游戏核心逻辑：
 *
 * - 下落、碰撞检测、锁定方块、消行、生成新方块 游戏结束或暂停时直接中断执行
 * - 每帧执行一次，保证游戏流畅运行
 *
 * @function tick
 * @returns {void}
 */
const tick = () => {
  const mode = Game.store.getMode();

  // 游戏结束 / 暂停 → 停止主循环
  if (
    mode === 'main-menu' ||
    mode === 'game-over' ||
    Engine.Animations.hasBlocking()
  ) {
    return;
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
  }
};

export default tick;
