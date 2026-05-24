import reset from '@/lib/game/core/reset.js';
import spawn from '@/lib/game/logic/spawn.js';
import { AudioEvents } from '@/lib/events/event-catalog.js';

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
 * | 步骤 | 操作             | 说明                      |
 * | ---- | ---------------- | ------------------------- |
 * | 1    | 模式检查         | 非 playing 模式则直接返回 |
 * | 2    | 保存当前等级     | 重新开始后等级不变        |
 * | 3    | 重置游戏状态     | 清空棋盘、分数归零        |
 * | 4    | 生成新方块       | 创建第一个活动方块        |
 * | 5    | 重新播放背景音乐 | 根据等级播放对应曲目      |
 *
 * ## 与 reset 的区别
 *
 * | 方法        | 目标模式          | 保留等级       | 使用场景         |
 * | ----------- | ----------------- | -------------- | ---------------- |
 * | `reset()`   | main-menu（默认） | 否（重置为 1） | 游戏结束返回菜单 |
 * | `restart()` | playing           | 是             | 游戏中重新开始   |
 *
 * ## 调用时机
 *
 * - 玩家按 R 键（键盘）
 * - 玩家按 X 键（手柄）
 * - 游戏结束界面选择重新开始
 *
 * @function restart
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const restart = (runtime) => {
  const { Store } = runtime;
  const mode = Store.getMode();

  /**
   * ======== 步骤 1：模式检查 ========
   *
   * 只能在 playing 模式下重新开始。
   */
  if (mode !== 'playing') {
    return;
  }

  /**
   * ======== 步骤 2：保存当前等级 ========
   *
   * 重新开始后等级保持不变，不重置为 1。
   */
  const level = Store.getLevel();

  /**
   * ======== 步骤 3：重置游戏状态 ========
   *
   * 清空棋盘、分数归零、行数归零， 但保留当前等级和难度设置。
   */
  reset(runtime, 'playing');

  /**
   * ======== 步骤 4：生成新方块 ========
   *
   * 创建第一个可操作的活动方块。
   */
  spawn(runtime);

  /**
   * ======== 步骤 5：重新播放背景音乐 ========
   *
   * 根据当前等级选取对应的曲目。
   */
  const AE = AudioEvents();
  runtime.emit(AE.RESUME_BGM, { level });
};

export default restart;
