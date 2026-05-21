import spawn from '@/lib/game/logic/spawn.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';
import padStart from '@/lib/utils/pad-start.js';
import { AudioEvents, ReplayEvents } from '@/lib/events/event-catalog.js';

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
 * | 4    | 生成初始方块 | 生成第一个可操作的方块                    |
 * | 5    | 播放开始音效 | 播放 GAME_STARTED 音效                    |
 * | 6    | 延迟播放 BGM | 250ms 后播放背景音乐，避免与开始音效重叠  |
 *
 * ## 调用时机
 *
 * - 玩家在主菜单选择等级后点击开始
 * - 从难度选择界面确认开始游戏
 * - 游戏重新开始时
 *
 * @function begin
 * @param {object} runtime - 游戏运行时对象
 * @returns {void}
 */
const begin = (runtime) => {
  const { Store, id, Scheduler } = runtime;
  const AE = AudioEvents();
  const RE = ReplayEvents(id);

  // 1. 更新等级 UI：直接同步 DOM 中的等级显示
  const $level = document.querySelector('#level');
  const level = Store.getLevel();

  if ($level) {
    $level.textContent = padStart(Store.getLevel(), 2);
  }

  // 2. 开始 Replay 录制：通知回放系统开始记录操作
  runtime.emit(RE.START_RECORD);

  // 3. 设置游戏状态为 playing，并生成对应难度的初始棋盘
  Store.resetBoard();
  setBeginningState(runtime, 'playing', level);

  // 4. 生成初始方块：创建游戏中第一个可操作的活动方块
  spawn(runtime);

  // 5. 播放开始音效：强化进入游戏的反馈
  runtime.emit(AE.PLAY_SOUND, { sound: 'GAME_STARTED' });

  // 6. 延迟 250ms 播放背景音乐，避免与开始音效重叠冲突
  Scheduler.delay(() => {
    runtime.emit(AE.RESUME_BGM, { level });
  }, 250);
};

export default begin;
