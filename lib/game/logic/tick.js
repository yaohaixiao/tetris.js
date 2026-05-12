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
 * @param context - 执行上下文对象
 * @param {boolean} isBlocked - 是被阻断
 * @returns {void}
 */
const tick = (context, isBlocked) => {
  const mode = context.Store.getMode();

  // 游戏结束 / 暂停 → 停止主循环
  if ((mode !== 'playing' && mode !== 'replay') || isBlocked) {
    return;
  }

  if (mode === 'playing') {
    context.emit('dispatch:input', {
      device: 'replay',
      action: 'AUTO_TICK',
      payload: {
        Game: context,
      },
    });
  }

  // 尝试向下移动一格，无法移动时执行锁定逻辑
  if (!move(context, 0, 1)) {
    // 锁定当前方块到棋盘
    lock(context);
    // 播放落地音效
    context.emit('audio:play:sound', { sound: 'FALL' });
    // 执行消行逻辑（包含闪烁3次特效）
    clearLines(context);
    // 生成新下落方块
    spawn(context);
  }
};

export default tick;
