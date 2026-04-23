import Engine from '@/lib/engine/engine.js';
import resetBoard from '@/lib/engine/state/reset-board.js';
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
 * @function resetToMainMenu
 * @param {object} state - 当前游戏状态对象
 * @param {number} state.score - 当前分数
 * @param {number} state.lines - 已消除行数
 * @param {number} state.level - 当前等级
 * @param {number} state.highScore - 历史最高分
 * @param {object | null} state.next - 下一个方块
 * @returns {void}
 */
const resetToMainMenu = (state) => {
  /** ======== 1. 停止背景音乐 ======== 避免从游戏结束/暂停状态切回菜单时音频继续播放 */
  stopBGM();

  /** ======== 2. 重置游戏主循环 ======== 清理或重启 engine 内部运行状态 （用于确保进入主菜单时不再执行游戏 tick） */
  Engine.start();

  /** ======== 3. 重置棋盘数据 ======== 清空所有已落方块与游戏区域状态 */
  resetBoard();

  /** ======== 4. 切换游戏模式 ======== 将当前状态切换为主菜单模式 */
  Engine.setMode('main-menu');

  /** ======== 5. 重置核心游戏状态 ======== */
  Engine.setHud({
    score: 0,
    lines: 0,
    level: 1,
  });
  state.next = null;

  const { score, lines, level, highScore } = state;

  /** ======== 6. 更新 HUD UI ======== */
  renderHud(score, lines, level, highScore);
};

export default resetToMainMenu;
