import reset from '@/lib/game/core/reset.js';
import spawn from '@/lib/game/logic/spawn.js';

/**
 * # 重新开始游戏
 *
 * 在游戏进行中（playing 模式）重置所有游戏数据， 清空棋盘、生成新方块，并重新播放背景音乐。
 *
 * ## 限制条件
 *
 * 只能在 `playing` 模式下重新开始。 其他模式（主菜单、暂停、游戏结束等）下调用无效。
 *
 * ## 执行流程
 *
 * 1. 检查当前模式是否为 playing
 * 2. 保留当前等级，调用 reset 重置状态
 * 3. 生成第一个新方块
 * 4. 重新播放背景音乐
 *
 * ## 与 reset 的区别
 *
 * | 方法        | 目标模式          | 保留等级       | 使用场景         |
 * | ----------- | ----------------- | -------------- | ---------------- |
 * | `reset()`   | main-menu（默认） | 否（重置为 1） | 游戏结束返回菜单 |
 * | `restart()` | playing           | 是             | 游戏中重新开始   |
 *
 * @function restart
 * @param {object} game - 游戏执行上下文
 * @returns {void}
 */
const restart = (game) => {
  const { Store } = game;
  const mode = Store.getMode();

  // 只能在 playing 模式下重新开始
  if (mode !== 'playing') {
    return;
  }

  // 保存当前等级
  const level = Store.getLevel();

  // 重置游戏状态为 playing，保留等级
  reset(game, 'playing');

  // 生成第一个新方块
  spawn(game);

  // 重新播放背景音乐
  game.emit('audio:resume:bgm', { level });
};

export default restart;
