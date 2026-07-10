import spawn from '@/lib/game/logic/spawn.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';
import {
  AudioEvents,
  GameEvents,
  ReplayEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/*
 * ============================================================
 * # 模块：begin 进入游戏进行状态
 * ============================================================
 *
 * ## 功能描述
 *
 * 将游戏从非进行状态（主菜单/难度选择）切换到正式游玩状态，
 * 并完成完整的初始化流程。
 *
 * ## 执行流程
 *
 * | 步骤 | 操作 | 说明 |
 * | :--- | :--- | :--- |
 * | 1 | 开始录制 | 通知回放系统开始录制操作 |
 * | 2 | 设置游戏状态 | 重置棋盘、设置 playing 模式、生成初始棋盘 |
 * | 3 | 刷新 HUD | 更新分数、等级等抬头显示 |
 * | 4 | 生成初始方块 | 创建第一个可操作的活动方块 |
 * | 5 | 播放开始音效 | 播放 GAME_STARTED 音效 |
 * | 6 | 延迟播放 BGM | 250ms 后播放背景音乐，避免与音效重叠 |
 *
 * ## 调用时机
 *
 * - 玩家在主菜单选择等级后点击开始
 * - 从难度选择界面确认开始游戏
 * - 倒计时结束后由 `CountdownAnimation.dispose()` 触发
 *
 * @function begin
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const begin = (runtime) => {
  const { Store, id, Scheduler } = runtime;
  const AE = AudioEvents();
  const GE = GameEvents(id);
  const RE = ReplayEvents(id);
  const UE = UIEvents(id);
  const level = Store.getLevel();

  /*
   * ============================================================
   * 步骤 1：开始 Replay 录制
   * ============================================================
   *
   * 通知回放系统开始记录玩家的所有操作。
   */
  runtime.emit(RE.START_RECORD);

  /*
   * ============================================================
   * 步骤 2：设置游戏状态
   * ============================================================
   *
   * 重置棋盘数据，设置 playing 模式，
   * 生成对应难度等级的初始棋盘（底部有随机垃圾行）。
   */
  Store.resetBoard();
  setBeginningState(runtime, 'playing', level);

  /*
   * ============================================================
   * 步骤 3：刷新 HUD
   * ============================================================
   *
   * 1. 更新分数、等级、行数等抬头显示数据。
   * 2. 计时器开始计时。
   */
  runtime.emit(UE.UPDATE_HUD);
  runtime.emit(GE.START_TIMER);

  /*
   * ============================================================
   * 步骤 4：生成初始方块
   * ============================================================
   *
   * 创建游戏中第一个可操作的活动方块。
   */
  spawn(runtime);

  /*
   * ============================================================
   * 步骤 5：播放开始音效
   * ============================================================
   *
   * 强化进入游戏的即时反馈。
   */
  runtime.emit(AE.PLAY_SOUND, { sound: 'GAME_STARTED' });

  /*
   * ============================================================
   * 步骤 6：延迟播放背景音乐
   * ============================================================
   *
   * 延迟 250ms 播放背景音乐，避免与 GAME_STARTED 音效重叠冲突。
   */
  Scheduler.delay(() => {
    runtime.emit(AE.RESUME_BGM, { level });
  }, 250);
};

export default begin;
