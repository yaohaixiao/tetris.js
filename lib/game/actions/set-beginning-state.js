/**
 * # 设置游戏初始状态
 *
 * 在游戏启动或模式切换时，重置游戏状态到初始值。
 *
 * ## 使用场景
 *
 * | mode        | 说明                           |
 * | ----------- | ------------------------------ |
 * | `main-menu` | 启动时进入主菜单，显示等级选择 |
 * | `playing`   | 开始游戏，初始化棋盘和方块     |
 *
 * ## 处理流程
 *
 * 1. 更新 UI 显示的模式标识
 * 2. 重置 Store 中的核心状态（分数、行数、等级等）
 * 3. 如果是开始游戏（`playing`），根据难度生成初始棋盘并保存
 *
 * @function setBeginningState
 * @param {object} game - 游戏执行上下文
 * @param {string} mode - 要设置的游戏模式（main-menu / playing）
 * @param {number} [level=1] - 初始等级。默认值为 `1`. Default is `1`
 * @returns {void}
 */
const setBeginningState = (game, mode, level = 1) => {
  const { Store, id } = game;

  // 通知 UI 更新模式显示
  game.emit(`ui:${id}:update:mode`, { mode });

  // 重置核心游戏状态
  Store.setState({
    mode,
    score: 0, // 分数归零
    lines: 0, // 消除行数归零
    level, // 设置初始等级
    next: null, // 清空预览方块
  });

  // 开始游戏时，根据选择的难度生成初始棋盘（含垃圾行）
  if (mode === 'playing') {
    Store.setBeginningBoard(Store.generateBoard());
  }
};

export default setBeginningState;
