/**
 * # 游戏暂停
 *
 * 将游戏从 playing 状态切换到 paused 状态， 停止背景音乐、播放暂停音效、显示暂停特效。
 *
 * ## 限制条件
 *
 * 只能在 `playing` 模式下暂停。 以下状态无法暂停：
 *
 * - `game-over`：游戏已结束
 * - `main-menu`：主菜单（等级选择界面）
 * - `difficulty`：难度选择界面
 * - `replay`：回放中
 * - `paused`：已在暂停状态
 *
 * ## 处理流程
 *
 * 1. 检查当前模式是否为 playing
 * 2. 更新 UI 模式为 paused
 * 3. 设置 Store 模式为 paused
 * 4. 停止背景音乐
 * 5. 播放暂停音效
 * 6. 启动暂停动画特效
 *
 * @function pause
 * @param {object} game - 游戏执行上下文
 * @returns {void}
 */
const pause = (game) => {
  const { id, Store } = game;
  const mode = Store.getMode();

  // 只有 playing 模式可以暂停：游戏结束、菜单界面等状态下禁止暂停
  if (mode !== 'playing') {
    return;
  }

  // 更新 UI 显示为暂停状态
  game.emit(`ui:${id}:update:mode`, { mode: 'paused' });

  // 更新 Store 中的游戏模式
  Store.setMode('paused');

  // 停止背景音乐
  game.emit('audio:stop:bgm');

  // 播放暂停音效
  game.emit('audio:resume:sound', { sound: 'PAUSED' });

  // 启动暂停动画特效（如画面变暗、暂停图标等）
  game.emit(`game:${id}:start:paused`);
};

export default pause;
