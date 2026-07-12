import gameModeScene from '@/lib/services/ui/scenes/game-mode-scene/index.js';
import battleModeScene from '@/lib/services/ui/scenes/battle-mode-scene/index.js';
import mainMenuScene from '@/lib/services/ui/scenes/main-menu-scene';
import difficultyScene from '@/lib/services/ui/scenes/difficulty-scene';
import pausedScene from '@/lib/services/ui/scenes/paused-scene';
import gameOverScene from '@/lib/services/ui/scenes/game-over-scene';
import playingScene from '@/lib/services/ui/scenes/playing-scene';
import replayScene from '@/lib/services/ui/scenes/replay-scene';
import exitGameScene from '@/lib/services/ui/scenes/exit-game-scene/index.js';

/**
 * ============================================================
 *
 * # 场景渲染映射表
 *
 * ============================================================
 *
 * 根据当前游戏状态（state.mode）分发对应的场景渲染函数。 每个 key 对应一个游戏模式，value 是该模式的渲染入口。
 *
 * ## 使用方式
 *
 * ```javascript
 * const render = Scenes[state.mode];
 * render?.(canvas, state);
 * ```
 *
 * ## 支持的场景
 *
 * | 模式        | 渲染函数        | 说明                             |
 * | :---------- | :-------------- | :------------------------------- |
 * | game-mode   | gameModeScene   | 游戏模式选择（SINGLE / BATTLE）  |
 * | battle-mode | battleModeScene | 对战类型选择（VS AI / VS HUMAN） |
 * | exit-game   | exitGameScene   | 退出菜单（RESUME / EXIT）        |
 * | main-menu   | mainMenuScene   | 主菜单（等级选择）               |
 * | difficulty  | difficultyScene | 难度选择                         |
 * | playing     | playingScene    | 游戏进行中（棋盘 + 方块）        |
 * | paused      | pausedScene     | 暂停界面                         |
 * | game-over   | gameOverScene   | 游戏结束界面                     |
 * | replay      | replayScene     | 回放界面                         |
 * | battle-over | mainMenuScene   | 对战结束（复用主菜单场景）       |
 *
 * ## 设计特点
 *
 * - 解耦：场景渲染逻辑与调度逻辑分离
 * - 可扩展：新增场景只需添加 key + 渲染函数
 * - 无 switch：通过对象映射避免大量条件判断
 *
 * @constant {object} Scenes
 */
const Scenes = {
  /**
   * ## 游戏模式选择场景
   *
   * 启动后首次进入的界面，选择 SINGLE 或 BATTLE 模式。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  'game-mode': (canvas, state) => {
    gameModeScene(canvas, state);
  },

  /**
   * ## 对战模式选择场景
   *
   * 选择对战类型：VS AI（人机对战）或 VS HUMAN（双人对战）。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  'battle-mode': (canvas, state) => {
    battleModeScene(canvas, state);
  },

  /**
   * ## 退出游戏菜单场景
   *
   * Single 模式下按 ESC 键触发， 显示 RESUME GAME / EXIT GAME 选项。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  'exit-game': (canvas, state) => {
    exitGameScene(canvas, state);
  },

  /**
   * ## 主菜单场景
   *
   * 选择游戏等级（1-10），按 Enter 进入难度选择。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  'main-menu': (canvas, state) => {
    mainMenuScene(canvas, state);
  },

  /**
   * ## 难度选择场景
   *
   * 选择游戏难度：EASY / NORMAL / HARD / EXPERT。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  difficulty: (canvas, state) => {
    difficultyScene(canvas, state);
  },

  /**
   * ## 游戏进行中场景
   *
   * 渲染棋盘、当前方块、Ghost 方块、 预览方块和 Hold 方块。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  playing: (canvas, state) => {
    playingScene(canvas, state);
  },

  /**
   * ## 暂停场景
   *
   * 在棋盘上叠加半透明遮罩 + 时钟 + "PAUSED" 文字。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  paused: (canvas, state) => {
    pausedScene(canvas, state);
  },

  /**
   * ## 游戏结束场景
   *
   * 显示 "GAME OVER" 文字和重新开始提示。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  'game-over': (canvas, state) => {
    gameOverScene(canvas, state);
  },

  /**
   * ## 回放场景
   *
   * 重新播放录制的游戏过程。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  replay: (canvas, state) => {
    replayScene(canvas, state);
  },

  /**
   * ## 对战结束场景
   *
   * 显示胜者名称，按 Enter 重新开始对战。 复用主菜单场景的渲染逻辑。
   *
   * @param {object} canvas - Canvas 画布管理器
   * @param {object} state - 当前游戏状态
   */
  'battle-over': (canvas, state) => {
    mainMenuScene(canvas, state);
  },
};

export default Scenes;
