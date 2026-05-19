import move from '@/lib/game/logic/move.js';
import lock from '@/lib/game/logic/lock.js';
import clearLines from '@/lib/game/logic/clear-lines.js';
import spawn from '@/lib/game/logic/spawn.js';

/**
 * # 快速下落（硬降 / Hard Drop）
 *
 * 将方块瞬间直接落到底部，自动完成锁定、消行和生成新方块。 这是玩家最常用的操作之一（通常绑定空格键）。
 *
 * ## 执行流程
 *
 * | 步骤 | 操作         | 说明                         |
 * | ---- | ------------ | ---------------------------- |
 * | 1    | 循环下移     | 不断向下移动直到碰撞（触底） |
 * | 2    | 锁定方块     | 将方块固化到棋盘上           |
 * | 3    | 播放落地音效 | 触发 FALL 音效               |
 * | 4    | 消行检测     | 检查并消除满行（带动画）     |
 * | 5    | 生成新方块   | 生成下一个活动方块           |
 * | 6    | 播放完成音效 | 触发 DROP 音效               |
 *
 * ## 与普通下落（tick）的区别
 *
 * | 方法     | 行为           | 触发方式                 |
 * | -------- | -------------- | ------------------------ |
 * | `tick()` | 每次只下落一格 | 自动（定时器）或手动按 ↓ |
 * | `drop()` | 直接落到最底部 | 手动按空格键或 AI 决策   |
 *
 * @function drop
 * @param {object} game - 游戏执行上下文
 * @returns {void}
 */
const drop = (game) => {
  // 1. 循环向下移动，直到无法继续移动（触底或碰撞）
  while (true) {
    // move 返回 false 表示无法继续下移
    if (!move(game, 0, 1)) {
      break;
    }
  }

  // 2. 将当前方块锁定到棋盘上
  lock(game);

  // 3. 播放方块落地音效
  game.emit('audio:resume:sound', { sound: 'FALL' });

  // 4. 检测满行并触发消行动画：实际的消行和分数更新在动画完成后执行
  clearLines(game);

  // 5. 生成下一个活动方块
  spawn(game);

  // 6. 播放硬降完成音效
  game.emit('audio:resume:sound', { sound: 'DROP' });
};

export default drop;
