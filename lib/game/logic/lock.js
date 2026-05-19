/**
 * # 方块落地锁定
 *
 * 将当前活动方块固化到游戏棋盘上，使其成为棋盘的一部分。 锁定后方块无法再移动或旋转。
 *
 * ## 处理流程
 *
 * 1. 深拷贝当前棋盘（避免直接修改原状态）
 * 2. 遍历活动方块的形状矩阵
 * 3. 将每个实心格子的**颜色值**写入棋盘对应位置
 * 4. 更新 Store 中的棋盘状态
 *
 * ## 为什么用颜色值而不是数字？
 *
 * 棋盘存储的是颜色字符串（如 `"#00c8ff"`），而非简单的 0/1。 这样做是为了在渲染时可以直接读取颜色值绘制不同颜色的方块。
 *
 * ## 调用时机
 *
 * - **硬降（drop）**：方块落到底部后
 * - **自动下落（tick）**：方块无法继续下落时
 * - **消行前**：锁定后才检测满行
 *
 * ## 后续流程
 *
 * 锁定后通常会执行：
 *
 * 1. 播放落地音效（FALL）
 * 2. 检测并消除满行（clearLines）
 * 3. 生成新方块（spawn）
 *
 * @function lock
 * @param {object} game - 游戏执行上下文
 * @returns {void}
 */
const lock = (game) => {
  const { Store } = game;
  const state = Store.getState();
  const { curr } = state;

  // 获取当前方块的形状矩阵
  const s = curr.shape;

  // 深拷贝当前棋盘，避免直接修改原状态
  const board = structuredClone(state.board);

  // 遍历方块的每个格子
  for (let y = 0; y < s.length; y++) {
    for (let x = 0; x < s[y].length; x++) {
      // 只处理实心格子（非空格子）
      if (s[y][x]) {
        // 将方块的颜色写入棋盘的对应位置：位置 = 方块左上角坐标 (cx, cy) + 形状内的偏移 (x, y)
        board[state.cy + y][state.cx + x] = curr.color;

        // 更新 Store 中的棋盘状态
        Store.setState({
          board,
        });
      }
    }
  }
};

export default lock;
