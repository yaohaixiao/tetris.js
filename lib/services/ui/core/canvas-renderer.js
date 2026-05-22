import Base from '@/lib/core';

/* ---------- 子模块 ---------- */
import Canvas from '@/lib/services/ui/core/canvas.js';
import HudManager from '@/lib/services/ui/hud/hud-manager.js';

/* ---------- 场景绘制 ---------- */
import lazyRenderScene from '@/lib/services/ui/scene-manager/lazy-render-scene.js';
import renderScene from '@/lib/services/ui/scene-manager/render-scene.js';

/* ---------- 画布绘制 ---------- */
import renderNextPiece from '@/lib/services/ui/next/render-next-piece.js';
import resize from '@/lib/services/ui/core/resize.js';

/* ---------- 特效绘制 ---------- */
import renderClearLines from '@/lib/services/ui/board/render-clear-lines.js';
import renderCountdown from '@/lib/services/ui/effects/render-countdown.js';
import renderLevelUp from '@/lib/services/ui/effects/render-level-up.js';

/**
 * # CanvasRenderer（Canvas 渲染器）
 *
 * UI 层的**渲染执行者**，负责所有基于 Canvas 的实际绘制操作。 持有 `Canvas` 画布管理器和 `HudManager` HUD
 * 管理器， 是 UI 调度器与底层渲染函数之间的桥梁。
 *
 * ## 架构定位
 *
 *     UI（调度器）→ CanvasRenderer（本模块）→ Canvas / Hud
 *                    → renderXxx() 渲染函数
 *
 * - **UI**：渲染调度器，只负责协调时机，不关心绘制细节
 * - **CanvasRenderer**：渲染执行者，持有 Canvas 和 Hud，调用底层渲染函数
 * - **可替换性**：未来可创建 `TerminalRenderer` 等实现相同接口的渲染器
 *
 * ## 核心职责
 *
 * | 职责       | 说明                              |
 * | ---------- | --------------------------------- |
 * | 棋盘渲染   | 绘制游戏主棋盘和当前活动方块      |
 * | HUD 管理   | 更新分数、等级、最高分等 DOM 显示 |
 * | 场景渲染   | 主菜单、游戏中、暂停等场景切换    |
 * | 动画特效   | 消行闪烁、倒计时、升级烟花等      |
 * | 画布自适应 | 响应窗口尺寸变化                  |
 * | 预览方块   | 绘制下一个方块的预览              |
 *
 * ## 依赖的底层渲染函数
 *
 * | 函数               | 用途                         |
 * | ------------------ | ---------------------------- |
 * | `renderScene`      | 根据 mode 路由到对应场景渲染 |
 * | `lazyRenderScene`  | 等待字体加载后渲染主菜单     |
 * | `renderNextPiece`  | 绘制预览方块                 |
 * | `resize`           | 自适应画布尺寸               |
 * | `renderClearLines` | 消行闪烁特效                 |
 * | `renderCountdown`  | 倒计时动画                   |
 * | `renderLevelUp`    | 升级烟花特效                 |
 *
 * @augments Base
 * @class CanvasRenderer
 */
class CanvasRenderer extends Base {
  /**
   * ## 构造函数
   *
   * @param {object} options - 配置（依赖的执行上下文）对象
   */
  constructor(options) {
    super(options);

    this.initialize(options);
  }

  /**
   * ## 初始化渲染器
   *
   * 创建 HudManager 和 Canvas 实例。
   *
   * @param {object} options - 配置对象
   * @param {object} options.Elements - UI 元素配置
   * @param {object} options.Elements.Hud - HUD DOM 元素配置
   * @param {object} options.Elements.Main - 主画布配置（board、next、cols、rows）
   * @returns {void}
   */
  initialize(options) {
    const { Elements } = options;
    const { Hud, Main } = Elements;

    /**
     * ## HUD 显示管理器
     *
     * 管理分数、最高分、行数、等级、控制者标识的 DOM 显示和动画。 每个实例维护独立的追踪器，支持多实例（对战模式）。
     *
     * @type {HudManager}
     */
    this.Hud = new HudManager(Hud);

    /**
     * ## Canvas 画布管理器
     *
     * 持有主游戏棋盘和预览方块两个 Canvas 元素及其渲染上下文。
     *
     * @type {Canvas}
     */
    this.Canvas = new Canvas(Main);
  }

  // ==================== 状态更新方法 ====================

  /**
   * ## 更新游戏模式标识
   *
   * 修改棋盘 Canvas 的 `data-mode` 属性，用于 CSS 样式切换。
   *
   * @param {string} mode - 游戏模式（main-menu / playing / paused / game-over /
   *   replay）
   * @returns {void}
   */
  updateMode(mode) {
    this.Canvas.gameBoard.dataset.mode = mode;
  }

  /**
   * ## 更新控制者标识
   *
   * 在 HUD 上显示当前控制者身份（HUMAN 或 AI）。
   *
   * @param {string} controller - 当前控制者（'human' 或 'ai'），会转为大写显示
   * @returns {void}
   */
  updateController(controller) {
    this.Hud.updateController(controller);
  }

  /**
   * ## 更新 HUD 显示
   *
   * 从 Store 读取最新状态（分数、行数、等级、最高分）， 更新 HUD 的数字显示。主菜单模式下会先重置 HUD 为初始值。
   *
   * @returns {void}
   */
  updateHud() {
    const { Store } = this;
    const state = Store.getState();
    const { mode, score, lines, level, highScore, needReset = false } = state;

    // 主菜单或需要重置时，重置 HUD 为初始值
    if (mode === 'main-menu' || needReset) {
      this.Hud.reset();
    }

    // 更新分数、行数、等级、最高分
    this.Hud.update({ score, lines, level, highScore });
  }

  /**
   * ## 更新 HUD 动画
   *
   * 每帧调用，驱动 HUD 数字（分数、最高分）的平滑过渡动画。
   *
   * @returns {void}
   */
  tickHud() {
    this.Hud.tick();
  }

  // ==================== 场景渲染方法 ====================

  /**
   * ## 延迟渲染场景
   *
   * 等待像素字体 "Press Start 2P" 加载完成后渲染主菜单场景。 通过 `lazyRenderScene` 实现，内部会等待字体就绪。
   *
   * @returns {void}
   */
  lazyRender() {
    const { Store } = this;
    lazyRenderScene(this.Canvas, Store.getState());
  }

  /**
   * ## 渲染游戏场景
   *
   * 每帧调用，根据当前游戏模式（mode）路由到对应场景渲染函数。 通过 `renderScene` 实现，内部根据 `state.mode` 分发。
   *
   * @returns {void}
   */
  render() {
    const { Store } = this;
    renderScene(this.Canvas, Store.getState());
  }

  /**
   * ## 画布自适应
   *
   * 根据窗口尺寸调整棋盘和预览画布的大小。 重新计算 `blockSize` 和 `fontSize` 等全局参数。
   *
   * @returns {void}
   */
  resize() {
    resize(this.Canvas);
  }

  // ==================== 动画特效方法 ====================

  /**
   * ## 渲染下一个方块预览
   *
   * 在预览画布中居中绘制下一个方块的形状。
   *
   * @returns {void}
   */
  renderNextPiece() {
    const { Canvas, Store } = this;
    renderNextPiece(Canvas, Store.getState());
  }

  /**
   * ## 渲染倒计时特效
   *
   * 在游戏开始前显示 3、2、1 的倒计时数字和缩放动画。
   *
   * @param {object} state - 倒计时动画状态
   * @param {number} state.number - 当前倒计时数字（3/2/1）
   * @param {number} state.scale - 数字缩放比例
   * @returns {void}
   */
  renderCountdown(state) {
    renderCountdown(this.Canvas, state);
  }

  /**
   * ## 渲染消行闪烁特效
   *
   * 在消除满行时，将待消除的行以白色高亮闪烁。 闪烁由 `ClearLinesAnimation` 控制，本方法只负责绘制。
   *
   * @param {object} state - 消行动画状态
   * @returns {void}
   */
  renderClearLines(state) {
    renderClearLines(this.Canvas, state);
  }

  /**
   * ## 渲染升级烟花特效
   *
   * 在玩家升级时显示烟花粒子动画和 "LEVEL UP" 文字。
   *
   * @param {number} level - 升级后的新等级
   * @param {object[]} fireworks - 烟花粒子数组
   * @returns {void}
   */
  renderLevelUp(level, fireworks) {
    renderLevelUp(this.Canvas, level, fireworks);
  }
}

export default CanvasRenderer;
