import detectTSpin from '@/lib/game/logic/rotate/t-spin.js';
import { BattleEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 方块落地锁定
 *
 * ============================================================
 *
 * 将当前活动方块固化到游戏棋盘上，使其成为棋盘的一部分。 锁定后方块无法再移动或旋转。
 *
 * ## 处理流程
 *
 * 1. 深拷贝当前棋盘（避免直接修改原状态）
 * 2. 遍历活动方块的形状矩阵
 * 3. 将每个实心格子的颜色值写入棋盘对应位置
 * 4. 检测 T-Spin（T 块旋转后锁定）
 * 5. 更新 Store 中的棋盘状态和 T-Spin 结果
 *
 * ## 为什么用颜色值而不是数字？
 *
 * 棋盘存储的是颜色字符串（如 "#00c8ff"），而非简单的 0/1。 这样做是为了在渲染时可以直接读取颜色值绘制不同颜色的方块。
 *
 * ## T-Spin 检测
 *
 * 在写入棋盘后调用 detectTSpin， 检测 T 块最后一次操作是否为旋转、 4 个对角是否满足条件。 检测结果写入
 * state.tSpin，供后续消行计分使用。
 *
 * ## 调用时机
 *
 * - 硬降（drop）：方块落到底部后
 * - 自动下落（tick）：方块无法继续下落时
 * - 消行前：锁定后才检测满行
 *
 * ## 后续流程
 *
 * 锁定后通常会执行：
 *
 * 1. T-Spin 检测（本函数内完成）
 * 2. 落地高亮动画
 * 3. 播放落地音效
 * 4. 检测并消除满行
 * 5. 生成新方块
 *
 * @function lock
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const lock = (runtime) => {
  const { Store } = runtime;
  const state = Store.getState();
  const { curr } = state;

  if (!curr) {
    return;
  }

  const s = curr.shape;

  // 深拷贝棋盘，避免直接修改原状态
  const board = structuredClone(state.board);

  // 遍历方块的每个格子，将实心格子的颜色值写入棋盘
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      if (s[y][x]) {
        const boardY = state.cy + y;
        const boardX = state.cx + x;

        // 边界保护：跳过棋盘外的格子
        if (
          boardY < 0 ||
          boardY >= board.length ||
          boardX < 0 ||
          boardX >= board[0].length
        ) {
          continue;
        }

        board[boardY][boardX] = curr.color;
      }
    }
  }

  // T-Spin 检测（需读取锁定前的棋盘状态）
  const tSpinResult = detectTSpin(runtime);

  // 更新 Store：写入新棋盘和 T-Spin 检测结果
  Store.setState({
    board,
    tSpin: tSpinResult,
  });

  // 清空操作标记
  curr._lastAction = null;

  if (runtime.isVersus()) {
    const events = BattleEvents();
    runtime.emit(events.FLUSH_GARBAGE, { from: runtime });
  }
};

export default lock;
