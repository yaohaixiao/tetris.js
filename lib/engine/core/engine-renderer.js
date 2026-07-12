import Base from '@/lib/core';
import getBattleOverlayTemplate from '@/lib/engine/core/utils/get-battle-overlay-template.js';
import getGameInterfaceTemplate from '@/lib/engine/core/utils/get-game-interface-template.js';
import getBattleScoreTemplate from '@/lib/engine/core/utils/get-battle-score-template.js';

/**
 * ============================================================
 *
 * # 模块：EngineRenderer 引擎界面渲染器
 *
 * ============================================================
 *
 * 根据 EngineStore 中的全局配置，动态生成完整的游戏 DOM 界面。 支持根据模式（single / versus）生成不同的界面结构。
 *
 * ## 核心职责
 *
 * | 职责     | 说明                                           |
 * | :------- | :--------------------------------------------- |
 * | 模板生成 | 根据 Players 数量和 Mode 生成对应数量的界面    |
 * | 模式适配 | single 模式生成 1 个界面，versus 模式生成 2 个 |
 * | DOM 注入 | 将所有模板一次性注入根容器                     |
 *
 * ## 生成的 DOM 结构
 *
 *     #tetris-container
 *     ├── [versus] #tetris-battle-overlay（对战结果覆盖层）
 *     │   ├── #tetris-battle-over（胜者展示面板）
 *     │   ├── canvas#human-0-tetris-battle-fly（P1 fly canvas）
 *     │   └── canvas#human-1-tetris-battle-fly（P2 fly canvas）
 *     ├── #human-0-tetris-player（P1 游戏界面）
 *     │   ├── tetris-screen → canvas#human-0-tetris-game-board
 *     │   ├── tetris-screen-aside（NEXT / HUD / HOLD）
 *     │   └── tetris-controls（GAME BOY 布局按钮）
 *     ├── [versus] .tetris-battle-score（1P 记分牌）
 *     ├── #human-1-tetris-player（P2 游戏界面，结构同上）
 *     └── [versus] .tetris-battle-score（2P 记分牌）
 *
 * @augments Base
 * @class EngineRenderer
 */
class EngineRenderer extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    super(options);
    this.initialize();
  }

  /**
   * ## initialize：初始化
   *
   * 缓存根容器 DOM 元素引用，并生成所有 HTML 模板。
   *
   * @returns {void}
   */
  initialize() {
    const { Store } = this;
    const state = Store.getState();
    const { Container } = state.Elements;

    /**
     * 根容器 DOM 元素引用。
     *
     * @type {HTMLElement | null}
     */
    this.$container = document.querySelector(`#${Container}`);

    // 生成所有 HTML 模板
    this._initializeTemplates();
  }

  /**
   * ## _initializeTemplates：初始化 HTML 模板
   *
   * 根据 Store 中的 Mode 和 Players 配置， 生成对应数量和结构的 HTML 模板。
   *
   * @private
   * @returns {void}
   */
  _initializeTemplates() {
    const { Store } = this;
    const isVersus = Store.isVersus();

    this.templates = [];

    const { Elements, Players } = Store.getState();

    // 创建玩家数组副本，避免后续 pop() 修改原始数组
    const finalPlayers = [...Players];

    if (isVersus) {
      // 对战模式：插入对战结果覆盖层
      this.templates.push(getBattleOverlayTemplate(Elements, finalPlayers));
    } else if (finalPlayers.length > 0) {
      // 单人模式：只保留第一个玩家
      finalPlayers.pop();
    }

    // 为每个玩家生成独立的游戏界面
    for (const [index, player] of finalPlayers.entries()) {
      this.templates.push(getGameInterfaceTemplate(Elements, player, index));

      // 对战模式：在每个玩家界面下方生成记分牌
      if (isVersus) {
        this.templates.push(getBattleScoreTemplate(player, index));
      }
    }
  }

  /**
   * ## render：渲染界面
   *
   * 一次性将所有 HTML 模板注入根容器。
   *
   * @returns {void}
   */
  render() {
    const { $container, templates, Store } = this;

    // 设置容器 data-mode 属性
    const mode = Store.getMode() || 'single';
    $container.dataset.mode = mode;

    // 一次性将所有 HTML 模板注入容器
    $container.innerHTML = templates.join('');
  }

  /**
   * ## destroy：销毁渲染器
   *
   * 重置 data-mode 属性，清空容器内容和模板缓存。
   *
   * @returns {void}
   */
  destroy() {
    this.$container.dataset.mode = 'single';
    this.$container.innerHTML = '';
    this.templates = [];
  }
}

export default EngineRenderer;
