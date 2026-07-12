import { GameEvents } from '@/lib/events/event-catalog.js';

/**
 * ============================================================
 *
 * # 开始游戏（进入倒计时）
 *
 * ============================================================
 *
 * 从等级选择界面进入游戏倒计时阶段。设置基准行数用于后续等级计算，然后触发倒计时动画。
 *
 * ## 基准行数说明
 *
 * 基准行数（baseLines）用于计算游戏过程中的等级提升。 例如选择等级 5 开始，基准行数设为 40（(5-1)×10）， 则游戏从 40
 * 行开始累积，每 10 行升一级。
 *
 * ## 处理流程
 *
 * | 步骤 | 操作           | 说明                          |
 * | :--- | :------------- | :---------------------------- |
 * | 1    | 获取当前等级   | 读取玩家选择的起始等级        |
 * | 2    | 计算基准行数   | (等级 - 1) × 10               |
 * | 3    | 设置基准行数   | 存入 Store 供后续等级计算使用 |
 * | 4    | 触发倒计时动画 | 3 → 2 → 1 倒计时              |
 *
 * ## 后续流程
 *
 * 倒计时结束后，会触发 game:begin 事件， 调用 begin() 进入正式的游戏 playing 状态。
 *
 * @function start
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const start = (runtime) => {
  const { id, Store } = runtime;
  const level = Store.getLevel();

  // 步骤 1-2：计算基准行数 = (等级 - 1) × 10
  const lines = (level - 1) * 10;

  // 步骤 3：设置基准行数
  Store.setBaseLines(lines);

  // 步骤 4：触发倒计时动画
  const GE = GameEvents(id);
  runtime.emit(GE.START_COUNTDOWN);
};

export default start;
