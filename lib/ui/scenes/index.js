import mainMenuScene from '@/lib/ui/scenes/main-menu-scene';
import pausedScene from '@/lib/ui/scenes/paused-scene';
import gameOverScene from '@/lib/ui/scenes/game-over-scene';
import playingScene from '@/lib/ui/scenes/playing-scene';

/**
 * # 场景渲染映射表（Scene Registry）
 *
 * 用于根据当前游戏状态（state.scene）分发对应的场景渲染函数。 每个 key 对应一个场景标识，每个 value 是该场景的渲染入口函数。
 *
 * 使用方式示例：
 *
 * ```js
 * const render = Scenes[state.scene];
 * render?.(state);
 * ```
 *
 * 当前支持的场景：
 *
 * - 'main-menu'：主菜单界面
 * - 'playing'：游戏进行中
 * - 'paused'：暂停界面
 * - 'game-over'：游戏结束界面
 *
 * 设计特点：
 *
 * - 解耦场景逻辑与调度逻辑
 * - 便于扩展新场景（只需新增 key + 引入函数）
 * - 避免大量 if/else 或 switch 判断
 */
const Scenes = {
  /**
   * ## 主菜单场景
   *
   * @param {object} state 游戏状态
   */
  'main-menu': (state) => {
    mainMenuScene(state);
  },

  /**
   * ## 暂停场景
   *
   * @param {object} state 游戏状态
   */
  paused: (state) => {
    pausedScene(state);
  },

  /**
   * ## 游戏结束场景
   *
   * @param {object} state 游戏状态
   */
  'game-over': (state) => {
    gameOverScene(state);
  },

  /**
   * ## 游戏进行中场景
   *
   * @param {object} state 游戏状态
   */
  playing: (state) => {
    playingScene(state);
  },
};

export default Scenes;
