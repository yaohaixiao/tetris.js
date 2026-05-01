import Engine from '@/lib/engine';
import Game from '@/lib/game';
import Sounds from '@/lib/audio/sounds.js';
import playBGM from '@/lib/audio/play-bgm.js';
import spawn from '@/lib/game/logic/spawn.js';
import restartGameLoop from '@/lib/engine/restart-game-loop.js';
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
 * @returns {void}
 */
const begin = () => {
  const { store } = Game;
  // 1. 更新等级 UI：DOM 层直接同步当前等级显示
  const $level = document.querySelector('#level');

  if ($level) {
    $level.textContent = padStart(store.getLevel(), 2);
  }

  // 2. 设置游戏状态：设置为游戏中 playing
  store.setMode('playing');

  // 3. 生成初始方块：初始化游戏开始的第一个 piece
  spawn();

  // 4. 播放开始音效：用于强化进入游戏反馈
  Sounds.levelStart();

  // 5. 延迟播放背景音乐：避免音效与 BGM 同时触发造成冲突
  setTimeout(() => {
    playBGM();
  }, 250);

  // 6. 启动游戏主循环：使用 RAF 驱动 game loop
  Engine.rafId = requestAnimationFrame(restartGameLoop);
};

export default begin;
