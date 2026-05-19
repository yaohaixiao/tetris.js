/**
 * # 游戏继续（从暂停恢复）
 *
 * 将游戏从 paused 状态恢复到 playing 状态， 停止暂停特效、播放恢复音效、重新播放背景音乐。
 *
 * ## 限制条件
 *
 * 只能在 `paused` 模式下恢复。 以下状态无法继续：
 *
 * - `game-over`：游戏已结束
 * - `main-menu`：主菜单（等级选择界面）
 * - `difficulty`：难度选择界面
 * - `replay`：回放中
 * - `playing`：已在游戏进行中
 *
 * ## 处理流程
 *
 * 1. 检查当前模式是否为 paused
 * 2. 更新 UI 模式为 playing
 * 3. 设置 Store 模式为 playing
 * 4. 停止暂停动画特效
 * 5. 播放恢复音效
 * 6. 重新播放背景音乐（使用暂停前的等级）
 *
 * @function resume
 * @param {object} game - 游戏执行上下文
 * @returns {void}
 */
const resume = (game) => {
  const { id, Store } = game;
  const mode = Store.getMode();

  // 只有 paused 模式可以继续：游戏结束、菜单界面等状态下禁止继续
  if (mode !== 'paused') {
    return;
  }

  // 获取暂停前的等级（用于恢复背景音乐）
  const level = Store.getLevel();

  // 更新 UI 显示为游戏进行状态
  game.emit(`ui:${id}:update:mode`, { mode: 'playing' });

  // 更新 Store 中的游戏模式为 playing
  Store.setMode('playing');

  // 停止暂停动画特效（如画面变暗效果等）
  game.emit(`game:${id}:stop:paused`);

  // 播放恢复音效
  game.emit('audio:resume:sound', { sound: 'RESUME' });

  // 重新播放背景音乐（使用暂停前的等级）
  game.emit('audio:resume:bgm', { level });
};

export default resume;
