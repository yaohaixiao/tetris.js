import Base from '@/lib/core';
import getBattleOverlayTemplate from '@/lib/engine/core/utils/get-battle-overlay-template.js';
import getGameInterfaceTemplate from '@/lib/engine/core/utils/get-game-interface-template.js';
import getBattleScoreTemplate from '@/lib/engine/core/utils/get-battle-score-template.js';

/**
 * # EngineRenderer（引擎界面渲染器）
 *
 * 根据 EngineStore 中的全局配置，动态生成完整的游戏 DOM 界面。 替代原来的 drawInterface()
 * 函数，支持根据模式（single / versus） 生成不同的界面结构。
 *
 * ## 核心职责
 *
 * | 职责         | 说明                                           |
 * | ------------ | ---------------------------------------------- |
 * | **模板生成** | 根据 Players 数量和 Mode 生成对应数量的界面    |
 * | **模式适配** | single 模式生成 1 个界面，versus 模式生成 2 个 |
 * | **DOM 注入** | 将所有模板一次性注入根容器                     |
 *
 * ## 生成的 DOM 结构
 *
 *     #tetris-container
 *     ├── [versus 模式] #tetris-battle-overlay（对战结果覆盖层）
 *     │   ├── #tetris-battle-over（胜者展示面板）
 *     │   ├── canvas#human-0-tetris-battle-fly（P1 fly canvas）
 *     │   └── canvas#human-1-tetris-battle-fly（P2 fly canvas）
 *     ├── #human-0-tetris-player（P1 游戏界面）
 *     │   ├── tetris-screen → canvas#human-0-tetris-game-board
 *     │   ├── tetris-screen-aside（NEXT / HUD / HOLD）
 *     │   └── tetris-controls（GAME BOY 布局按钮）
 *     ├── [versus 模式] .tetris-battle-score（1P 记分牌）
 *     ├── #human-1-tetris-player（P2 游戏界面，结构同上）
 *     └── [versus 模式] .tetris-battle-score（2P 记分牌）
 *
 * @augments Base
 * @class EngineRenderer
 */
class EngineRenderer extends Base {
  /**
   * ## 构造函数
   *
   * 接收 Store 依赖，缓存根容器引用，初始化模板数组。
   *
   * @param {object} options - 配置对象
   */
  constructor(options) {
    // 调用父类 Base 的构造函数，将配置注入实例
    super(options);
    // 立即初始化
    this.initialize();
  }

  /**
   * ## 初始化
   *
   * 缓存根容器 DOM 元素引用，并生成所有 HTML 模板。
   *
   * @returns {void}
   */
  initialize() {
    // 解构 Store 引用
    const { Store } = this;
    // 获取完整的引擎状态
    const state = Store.getState();
    // 解构根容器元素 ID
    const { Container } = state.Elements;

    /**
     * 缓存根容器 DOM 元素引用。 所有生成的界面模板最终注入到此容器中。
     *
     * @type {HTMLElement}
     */
    this.$container = document.querySelector(`#${Container}`);

    // 生成所有 HTML 模板
    this._initializeTemplates();
  }

  /**
   * ## 初始化 HTML 模板
   *
   * 根据 Store 中的 Mode 和 Players 配置，生成对应数量和结构的 HTML 模板。 收集到 `this.templates`
   * 数组中，供 `render()` 方法统一注入。
   *
   * ### 生成规则
   *
   * - **versus 模式**：
   *
   *   1. 生成对战覆盖层（胜者面板 + fly canvas）
   *   2. 为每个玩家生成完整的游戏界面
   *   3. 为每个玩家生成记分牌
   * - **single 模式**：
   *
   *   1. 移除多余玩家（pop）
   *   2. 为剩余玩家生成完整的游戏界面
   *
   * @private
   * @returns {void}
   */
  _initializeTemplates() {
    // 解构 Store 引用
    const { Store } = this;
    // 判断是否为对战模式
    const isVersus = Store.isVersus();

    // 初始化模板数组
    this.templates = [];

    // 从 Store 中解构界面元素配置和玩家列表
    const { Elements, Players } = Store.getState();

    /**
     * 玩家数组副本。
     *
     * 使用扩展运算符创建浅拷贝，避免后续 pop() 操作修改原始 Players 数组。 与 Engine.initialize
     * 中的处理逻辑对应：single 模式保留第一个玩家。
     *
     * @type {string[]}
     */
    const finalPlayers = [...Players];

    // ======== 模式处理 ========

    if (isVersus) {
      /**
       * 对战模式：在界面最前面插入对战结果覆盖层。
       *
       * GetBattleOverlayTemplate 生成包含以下内容的覆盖层：
       *
       * - 胜者展示面板（$over）：整场对战结束时显示
       * - 每位玩家的 fly canvas（$flies）：垃圾行粒子飞行动画使用
       *
       * 覆盖层默认隐藏（tetris-hidden 类），由 BattleUI.show/hide 控制显示/隐藏。
       */
      this.templates.push(getBattleOverlayTemplate(Elements, finalPlayers));
    } else {
      /**
       * 单人模式：移除最后一个玩家，只保留一个 Game 实例。
       *
       * 例如 Players = ['Player1', 'Player2'] → finalPlayers = ['Player1']。 与
       * Engine.initialize 中 `if (Mode === 'single') { finalPlayers.pop(); }`
       * 逻辑对应。
       */
      finalPlayers.pop();
    }

    // ======== 遍历玩家生成游戏界面 ========

    /**
     * 为每个玩家生成独立的游戏界面 DOM。
     *
     * 每个玩家界面包含：
     *
     * 1. 主屏幕区（tetris-screen）
     *
     *    - 棋盘 Canvas（tetris-screen-main）
     *    - 侧边栏（tetris-screen-aside）
     *
     *         - 预览方块（NEXT）
     *         - 控制者标识（Human/AI）
     *         - 游戏数据（SCORE/LINE/LEVEL/COMBO/HI-SCORE）
     *         - 缓存方块（HOLD）
     * 2. 控制按钮区（tetris-controls）
     *
     *    - 系统按钮（BACK/HOLD/START）
     *    - D-PAD 方向键（↑↓←→）
     *    - ABXY 动作按钮
     *
     * 所有元素 ID 使用 `{player}-{index}-{elementId}` 格式， 确保多玩家场景下元素 ID 唯一。
     */
    for (const [index, player] of finalPlayers.entries()) {
      /** 生成当前玩家的完整游戏界面模板。 包含棋盘 Canvas、HUD 数据面板、预览/缓存 Canvas 和触屏控制按钮。 */
      this.templates.push(getGameInterfaceTemplate(Elements, player, index));

      /**
       * 对战模式记分牌：
       *
       * 在每个玩家界面下方生成记分牌，显示双方胜场数。 由 BattleHUD.updateScores() 动态更新 span 中的数字。
       *
       * DOM 结构：
       *
       * ```html
       * <div class="tetris-battle-score">
       *   <h3 class="tetris-battle-player">1P</h3>
       *   <span id="human-0-tetris-battle-score">0</span>
       * </div>
       * ```
       *
       * Index + 1 用于显示 1P / 2P 标识。
       */
      if (isVersus) {
        this.templates.push(getBattleScoreTemplate(player, index));
      }
    }
  }

  /**
   * ## 渲染界面
   *
   * 一次性将所有 HTML 模板注入根容器。
   *
   * 使用 innerHTML 直接替换容器内容。 这是游戏初始化时的一次性操作，不需要考虑增量更新。 所有后续的 UI 更新都通过 DOM
   * 选择器定位具体元素进行。
   *
   * @returns {void}
   */
  render() {
    // 解构根容器引用和模板数组
    const { $container, templates } = this;

    /**
     * 一次性将所有 HTML 模板注入容器。
     *
     * 使用 innerHTML 直接替换容器内容。 这是游戏初始化时的一次性操作，不需要考虑增量更新。 所有后续的 UI 更新都通过 DOM
     * 选择器定位具体元素进行。
     */
    $container.innerHTML = templates.join('');
  }
}

export default EngineRenderer;
