import Engine from '@/lib/engine';
import Game from '@/lib/game';
import stopBGM from '@/lib/audio/stop-bgm.js';
import renderHud from '@/lib/ui/hud/render-hud.js';

/**
 * # 重置游戏状态并返回主菜单（Reset To Main Menu）
 *
 * 该函数用于将当前游戏从任意状态安全地重置回主菜单状态， 包括音频、引擎状态、棋盘数据以及 UI 数据同步更新。
 *
 * 执行流程：
 *
 * 1. 停止背景音乐
 * 2. 重置游戏主循环/引擎状态
 * 3. 清空游戏棋盘数据
 * 4. 切换游戏模式为 main-menu
 * 5. 重置核心游戏状态数据（score / lines / level / next）
 * 6. 重新渲染 HUD（分数/等级/最高分）
 *
 * @function reset
 * @returns {void}
 */
const reset = () => {
  const { store } = Game;

  // 1. 停止背景音乐：避免从游戏结束/暂停状态切回菜单时音频继续播放
  stopBGM();

  Engine.Animations.clear();

  // 2. 重置游戏主循环：清理或重启内部运行状态 （用于确保进入主菜单时不再执行游戏 tick）
  Engine.start();

  // 3. 重置棋盘数据：清空所有已落方块与游戏区域状态
  store.resetBoard();

  // 4. 更新游戏状态
  store.setState({
    mode: 'main-menu',
    score: 0,
    lines: 0,
    level: 1,
    next: null,
  });

  const state = store.getState();

  /** ======== 6. 更新 HUD UI ======== */
  renderHud(state);
};

export default reset;
