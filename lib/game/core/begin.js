// lib/game/core/begin.js

import spawn from '@/lib/game/logic/spawn.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';
import padStart from '@/lib/utils/pad-start.js';
import {
  AudioEvents,
  ReplayEvents,
  UIEvents,
} from '@/lib/events/event-catalog.js';

/**
 * # 进入游戏进行状态（Begin Playing）
 *
 * 将游戏从非进行状态（主菜单/难度选择）切换到正式游玩状态， 并完成完整的初始化流程。
 *
 * ## 执行流程
 *
 * | 步骤 | 操作         | 说明                                      |
 * | ---- | ------------ | ----------------------------------------- |
 * | 1    | 更新等级 UI  | 同步 DOM 中的等级显示                     |
 * | 2    | 开始录制     | 通知回放系统开始录制操作                  |
 * | 3    | 设置游戏状态 | 重置棋盘、设置 playing 模式、生成初始棋盘 |
 * | 4    | 刷新 HUD     | 更新分数、等级等抬头显示                  |
 * | 5    | 生成初始方块 | 创建第一个可操作的活动方块                |
 * | 6    | 播放开始音效 | 播放 GAME_STARTED 音效                    |
 * | 7    | 延迟播放 BGM | 250ms 后播放背景音乐，避免与音效重叠      |
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
  const RE = ReplayEvents(id);
  const UE = UIEvents(id);

  /**
   * ======== 步骤 1：更新等级 UI ========
   *
   * 直接同步 DOM 中的等级显示元素。
   */
  const $level = document.querySelector('#level');
  const level = Store.getLevel();

  if ($level) {
    $level.textContent = padStart(Store.getLevel(), 2);
  }

  /**
   * ======== 步骤 2：开始 Replay 录制 ========
   *
   * 通知回放系统开始记录玩家的所有操作。
   */
  runtime.emit(RE.START_RECORD);

  /**
   * ======== 步骤 3：设置游戏状态 ========
   *
   * 重置棋盘数据，设置 playing 模式， 生成对应难度等级的初始棋盘（底部有随机垃圾行）。
   */
  Store.resetBoard();
  setBeginningState(runtime, 'playing', level);

  /**
   * ======== 步骤 4：刷新 HUD ========
   *
   * 更新分数、等级、行数等抬头显示数据。
   */
  runtime.emit(UE.UPDATE_HUD);

  /**
   * ======== 步骤 5：生成初始方块 ========
   *
   * 创建游戏中第一个可操作的活动方块。
   */
  spawn(runtime);

  /**
   * ======== 步骤 6：播放开始音效 ========
   *
   * 强化进入游戏的即时反馈。
   */
  runtime.emit(AE.PLAY_SOUND, { sound: 'GAME_STARTED' });

  /**
   * ======== 步骤 7：延迟播放背景音乐 ========
   *
   * 延迟 250ms 播放背景音乐，避免与 GAME_STARTED 音效重叠冲突。
   */
  Scheduler.delay(() => {
    runtime.emit(AE.RESUME_BGM, { level });
  }, 250);
};

export default begin;
