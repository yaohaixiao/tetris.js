import spawn from '@/lib/game/logic/spawn.js';
import setBeginningState from '@/lib/game/actions/set-beginning-state.js';
import padStart from '@/lib/utils/pad-start.js';

/**
 * # 进入游戏进行状态（Begin Playing）
 *
 * 该函数负责将游戏从非进行状态切换到正式游玩状态， 并完成初始化流程，包括 UI 更新、方块生成、音效与主循环启动。
 *
 * 执行流程：
 *
 * 1. 更新 UI（等级显示）
 * 2. 切换 Index 状态为 playing
 * 3. 生成第一个方块
 * 4. 播放等级开始音效
 * 5. 延迟播放背景音乐
 * 6. 启动游戏主循环（requestAnimationFrame）
 *
 * @function begin
 * @param context - 执行上下文对象
 * @returns {void}
 */
const begin = (context) => {
  const { Store, id } = context;
  // 1. 更新等级 UI：DOM 层直接同步当前等级显示
  const $level = document.querySelector('#level');
  const level = Store.getLevel();

  if ($level) {
    $level.textContent = padStart(Store.getLevel(), 2);
  }

  // 2. 开始 Replay 录制
  context.emit(`replay:${id}:start:record`);

  // 3. 设置游戏状态：设置为游戏中 playing，难度为 normal，并生成对应难度层数的方块
  Store.resetBoard();
  setBeginningState(context, 'playing', level);

  // 4. 生成初始方块：初始化游戏开始的第一个 piece
  spawn(context);

  // 5. 播放开始音效：用于强化进入游戏反馈
  context.emit('audio:play:sound', { sound: 'GAME_STARTED' });

  // 6. 延迟播放背景音乐：避免音效与 BGM 同时触发造成冲突
  setTimeout(() => {
    const maxLevel = context.options.Level.max;
    context.emit('audio:play:bgm', { level, maxLevel });
  }, 250);
};

export default begin;
